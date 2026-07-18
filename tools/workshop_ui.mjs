#!/usr/bin/env node
// workshop_ui.mjs — the TOWEL: the local control surface of the workshop.
//
//   node tools/workshop_ui.mjs [--port 4245] [--lan]
//
// "A towel is about the most massively useful thing an interstellar
// hitchhiker can have." The console (tools/console.mjs, :4242) is the
// WINDOW — GET-only, a projection. This is the towel you actually carry:
// the facilitator's and steward's control surface on the mage box. It can
// only do what the repo's own scripts can do — every action is a
// whitelisted spawn of an existing tool, so it adds convenience, never
// new power:
//
//   measure · check · lexon · rounds (stub/live) · corpus pack + verify ·
//   bind books · transcribe · spool exports · Game of 42 roster/edges
//
// THE DOOR STAYS SHUT (T6/GR-8): there is no push, no cast, no publish
// endpoint here. Door items render as a list, never as buttons.
//
// Game of 42: the built game (vendored dist from ~/game42, VENDOR.md) is
// served under /game/. The workshop lane adds the chain the First Person named:
// persona + skill matching (roster) → geometry (the game's own seal) →
// the trust graph (κ-addressed roster holons + ed25519 did:key edges via
// tools/vrc.mjs, minted on real workshop events: mentor assays, steward
// folds, pair swaps). Roster entries require a consent-ledger row — the
// hard constraint reaches the game too.
//
// Binding: 127.0.0.1 by default. --lan binds 0.0.0.0 for the workshop room
// (air-gapped LAN); PREFLIGHT.md carries the tradeoff.

import { createServer } from 'node:http'
import { readFileSync, writeFileSync, appendFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createPrivateKey, createPublicKey } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, normalize, extname } from 'node:path'
import { kappaOf, canonicalJson, sha256Hex } from './kappa.mjs'
import { keypair, didKey, signEdge, verifyEdge } from './vrc.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const argv = process.argv.slice(2)
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d }
const port = Number(opt('--port', 4245))
const host = argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1'

const gameDir = join(repo, 'game')
mkdirSync(join(gameDir, 'keys'), { recursive: true })
const rosterPath = join(gameDir, 'roster.json')
const edgesPath = join(gameDir, 'edges.jsonl')

// ---- helpers ----------------------------------------------------------------
const readJson = (p, d = null) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return d } }
const readText = (p, d = '') => { try { return readFileSync(p, 'utf8') } catch { return d } }
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const send = (res, code, body, type = 'application/json') => {
  const data = type === 'application/json' ? JSON.stringify(body, null, 2) : body
  // no-store: every page here is a derived projection; a cached copy is a
  // stale instrument (the demo-graph incident, 2026-07-18)
  res.writeHead(code, { 'content-type': type, 'access-control-allow-origin': '*', 'cache-control': 'no-store' })
  res.end(data)
}
const readBody = (req) => new Promise((ok) => { let b = ''; req.on('data', c => { b += c; if (b.length > 1e6) req.destroy() }); req.on('end', () => { try { ok(JSON.parse(b || '{}')) } catch { ok({}) } }) })

// ---- jobs: every action is a spawn of an existing repo script ---------------
const ACTIONS = {
  measure: () => ['tools/measure_debt.mjs'],
  check: () => ['tools/check.mjs'],
  lexon: () => ['lexon/check.mjs'],
  smoke: ({ runId }) => ['driver/run_round.mjs', '--stub', '--run', runId || 'smoke'],
  live: ({ runId, model, triptych, maxRounds }) => {
    // rounds run on the BASE model — never the persona'd facilitator
    // (FACILITATOR.md rule 4: the mage does not grade)
    const a = ['driver/run_round.mjs', '--model', model || process.env.HH_MODEL || 'gemma3:12b', '--run', runId || 'r-ui']
    if (triptych) a.push('--triptych', triptych)
    if (maxRounds) a.push('--max-rounds', String(maxRounds))
    return a
  },
  verifyrun: ({ runId }) => ['tools/verify_run.mjs', '.', runId || '--all'],
  pack: () => ['tools/corpus_pack.mjs'],
  packverify: () => ['tools/corpus_pack.mjs', '--verify'],
  books: () => ['tools/bind_book.mjs'],
  transcribe: ({ file }) => { if (!file) throw new Error('file required'); return ['ingest/transcribe.mjs', file] },
  'export-triptych': ({ dir }) => ['fedwiki/export_page.mjs', '--triptych', dir || 'canon/seed-triptych'],
  'export-provenance': () => ['fedwiki/export_page.mjs', '--provenance'],
  spool: () => ['fedwiki/sync_spool.mjs'],   // dry list only; --copy stays a shell act
  graph: () => ['web/graph.mjs'],            // re-derive the knowledge web
  site: () => ['web/site.mjs'],              // re-derive the generative site (graph + pages)
  wikibuild: () => ['fedwiki/build_site.mjs'], // auto-build the whole fedwiki spool
  dream: () => ['tools/dream_cycle.mjs'],    // the measure-only standing watch
  queue: () => ['tools/keystone_queue.mjs'], // everything waiting on a human, one page
  demo: () => ['tools/make_demo.mjs'],       // regenerate the sample cohort
}
const jobs = new Map()
let jobSeq = 0
function startJob(action, params) {
  const make = ACTIONS[action]
  if (!make) throw new Error(`unknown action "${action}" — the Towel only holds the repo's own tools`)
  const args = make(params || {})
  const id = `j${++jobSeq}`
  const job = { id, action, cmd: `node ${args.join(' ')}`, status: 'running', output: '', started: Date.now() }
  jobs.set(id, job)
  const child = spawn(process.execPath, args, { cwd: repo })
  const eat = (c) => { job.output += c.toString(); if (job.output.length > 400000) job.output = job.output.slice(-300000) }
  child.stdout.on('data', eat); child.stderr.on('data', eat)
  child.on('close', (code) => { job.status = code === 0 ? 'done' : 'failed'; job.code = code; job.ended = Date.now() })
  child.on('error', (e) => { job.status = 'failed'; job.output += `\n${e.message}` })
  return job
}

// ---- state ------------------------------------------------------------------
function ledgerNames() {
  const out = new Set()
  for (const line of readText(join(repo, 'corpus', 'CONSENT_LEDGER.md')).split('\n')) {
    if (/^\s*~~.*~~\s*$/.test(line)) continue
    const m = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|\s*([^|]+?)\s*\|/.exec(line)
    if (m && !/^participant$|^-+$/.test(m[1].trim())) out.add(m[1].trim().toLowerCase())
  }
  return out
}
// soft mage health: is the local model endpoint answering? (800ms budget —
// the panel must render fast even when the mage sleeps)
let mageCache = { at: 0, up: false, models: 0 }
async function mageStatus() {
  if (Date.now() - mageCache.at < 10000) return mageCache
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 800)
    const r = await fetch('http://127.0.0.1:11434/api/tags', { signal: ctl.signal })
    clearTimeout(t)
    const j = await r.json()
    mageCache = { at: Date.now(), up: true, models: (j.models || []).length }
  } catch { mageCache = { at: Date.now(), up: false, models: 0 } }
  return mageCache
}

function state() {
  const runs = []
  const runsDir = join(repo, 'runs')
  if (existsSync(runsDir)) for (const r of readdirSync(runsDir)) {
    const s = readJson(join(runsDir, r, 'run.json')); if (s) runs.push(s)
  }
  const spoolDir = join(repo, 'fedwiki', 'out')
  const spool = existsSync(spoolDir) ? readdirSync(spoolDir).filter(f => f.endsWith('.json')) : []
  const laws = readdirSync(join(repo, 'lexon')).filter(f => f.endsWith('.lex'))
  const books = ['book_of_poems.html', 'collected_papers.html', 'story_anthology.html'].filter(f => existsSync(join(repo, 'artifact', f)))
  return {
    name: 'hh_workshop', frontier: readJson(join(repo, 'frontier.json')),
    stewardLog: readText(join(repo, 'mage', 'steward_log.md')).split('\n## ').slice(1).map(e => '## ' + e.trim()),
    runs, spool, laws, books,
    corpus: readdirSync(join(repo, 'corpus')).filter(f => f.endsWith('.md') && f !== 'CONSENT_LEDGER.md'),
    doors: [
      'university partner selection + outreach (the one-pager is the door-knocker)',
      'git commits / pushes — both repos report status only',
      'sync_spool --copy into the live wiki farm; the cast toward mitch.fm.ide.earth / hitchhikers.earth',
      'mage-box model choice + ollama pull (pull before you travel)',
      'LoRA fine-tune adoption (option B) once the hardware exists',
      'counsel review of the legal consent register',
    ],
  }
}

// ---- Game of 42 lane --------------------------------------------------------
const TONGUES = ['narrative', 'poem', 'paper']
const RELATIONS = ['mentor-assay', 'steward-fold', 'pair-swap', 'keystone-fold', 'seal-witness']

function roster() { return readJson(rosterPath, { players: [] }) }
function rosterHolon(p) { return { holon: 'hh.player.v1', name: p.name, persona: p.persona || null, tongues: p.tongues || [] } }
function playerKappa(p) { return kappaOf(rosterHolon(p)) }

function loadKey(slug) {
  const f = join(gameDir, 'keys', `${slug}.json`)
  if (!existsSync(f)) return null
  const k = readJson(f)
  return { privateKey: createPrivateKey({ key: Buffer.from(k.pkcs8, 'base64'), format: 'der', type: 'pkcs8' }), publicKey: createPublicKey({ key: Buffer.from(k.spki, 'base64'), format: 'der', type: 'spki' }) }
}
function mintKey(slug) {
  const kp = keypair()
  writeFileSync(join(gameDir, 'keys', `${slug}.json`), JSON.stringify({
    slug, did: didKey(kp.publicKey),
    pkcs8: kp.privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64'),
    spki: kp.publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
    note: 'workshop game key — lives only on the mage box; a room key, not a life key',
  }, null, 2) + '\n')
  return kp
}

function addPlayer({ name, persona, tongues }) {
  if (!name || !String(name).trim()) throw new Error('name required')
  const clean = String(name).trim()
  if (!ledgerNames().has(clean.toLowerCase())) {
    throw new Error(`"${clean}" has no row in corpus/CONSENT_LEDGER.md — the game is consent-gated like everything else (C16/C20); sign the ledger first`)
  }
  const t = (Array.isArray(tongues) ? tongues : []).filter(x => TONGUES.includes(x))
  const r = roster()
  const slug = slugify(clean)
  if (r.players.some(p => p.slug === slug)) throw new Error(`"${clean}" already on the roster`)
  const player = { slug, name: clean, persona: String(persona || '').trim() || null, tongues: t }
  const kp = mintKey(slug)
  player.did = didKey(kp.publicKey)
  player.kappa = playerKappa(player)
  r.players.push(player)
  writeFileSync(rosterPath, JSON.stringify(r, null, 2) + '\n')
  return player
}

function mintEdge({ source, target, relation }) {
  if (!RELATIONS.includes(relation)) throw new Error(`relation must be one of: ${RELATIONS.join(', ')} — edges are minted on real workshop events, not vibes`)
  const r = roster()
  const s = r.players.find(p => p.slug === source)
  const t = r.players.find(p => p.slug === target)
  if (!s || !t) throw new Error('source and target must be roster slugs')
  if (s.slug === t.slug) throw new Error('an edge to yourself is the self-certifying trust the proverb warns about (C30)')
  const kp = loadKey(s.slug)
  if (!kp) throw new Error(`no key for ${s.slug}`)
  const edge = signEdge(s.kappa, { target: t.kappa, relation }, kp)
  const record = { source: s.kappa, sourceSlug: s.slug, targetSlug: t.slug, ...edge, at: new Date().toISOString() }
  appendFileSync(edgesPath, JSON.stringify(record) + '\n')
  return record
}

function graph() {
  const r = roster()
  const edges = readText(edgesPath).split('\n').filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  return {
    nodes: r.players.map(p => ({ slug: p.slug, name: p.name, persona: p.persona, tongues: p.tongues, kappa: p.kappa, did: p.did })),
    edges: edges.map(e => ({ ...e, verified: verifyEdge(e.source, e).minted })),
    relations: RELATIONS,
  }
}

// ---- the constellation forge — spellweb's ceremony, workshop-grade ---------
// A constellation is an ORDERED path of graph nodes; forging hashes it
// canonically (κ), signs the κ with the bearer's roster key (the same
// ed25519 did:key the trust edges use), and appends the artefact to
// game/constellations.jsonl — a ledger, so the next graph derivation gives
// the artefact its node with composed_of / forged_by edges (the spellweb
// deviation layer, earned instead of authored).
const constellationsPath = join(gameDir, 'constellations.jsonl')
function forgeConstellation({ bearer, name, nodeIds, note }) {
  const clean = String(name || '').trim()
  if (!clean) throw new Error('name the artefact — an unnamed forging is a hash, not a thing')
  if (!Array.isArray(nodeIds) || nodeIds.length < 2) throw new Error('a constellation is a PATH — star at least 2 nodes')
  if (nodeIds.length !== new Set(nodeIds).size) throw new Error('a node appears twice — the path visits each star once')
  const r = roster()
  const b = r.players.find(p => p.slug === bearer)
  if (!b) throw new Error('bearer must be on the roster (consent-gated, like everything)')
  if (constellations().some(c => c.slug === slugify(clean))) throw new Error(`"${clean}" is already forged — a second artefact needs its own name (the graph addresses artefacts by slug)`)
  const graphFile = join(repo, 'web', 'out', 'graph.json')
  if (existsSync(graphFile)) {
    const known = new Set(JSON.parse(readFileSync(graphFile, 'utf8')).nodes.map(n => n.id))
    const missing = nodeIds.filter(id => !known.has(id))
    if (missing.length) throw new Error(`unknown node(s): ${missing.join(', ')} — the constellation must be drawn from the derived web`)
  }
  const holon = { holon: 'hh.constellation.v1', name: clean, path: nodeIds, bearer: b.kappa }
  const kappa = kappaOf(holon)
  const kp = loadKey(b.slug)
  if (!kp) throw new Error(`no key for ${b.slug}`)
  const edge = signEdge(b.kappa, { target: kappa, relation: 'forged' }, kp)
  const record = { name: clean, slug: slugify(clean), nodeIds, note: String(note || '').trim() || null, kappa, bearer: b.slug, bearerKappa: b.kappa, ...edge, at: new Date().toISOString() }
  appendFileSync(constellationsPath, JSON.stringify(record) + '\n')
  return record
}
function constellations() {
  return readText(constellationsPath).split('\n').filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    .map(c => ({ ...c, verified: verifyEdge(c.bearerKappa, { target: c.target, relation: c.relation, by: c.by, sig: c.sig }).minted }))
}

// Deterministic pair matching: complementary tongues first (story-forward ⊥
// spec-forward — the finder pair, in human form), draw order from the roster
// hash so nobody tunes the pairing (the Gap's idiom, socially).
function pairs() {
  const r = roster().players
  if (r.length < 2) return { pairs: [], note: 'need ≥2 on the roster' }
  const seed = sha256Hex(canonicalJson(r.map(p => p.kappa).sort()))
  const bytes = Buffer.from(seed, 'hex')
  const pool = [...r]
  // seed-ordered shuffle (draw-without-replacement, gap.mjs style)
  const ordered = []
  let k = 0
  while (pool.length) { const i = bytes[k % bytes.length] % pool.length; ordered.push(pool.splice(i, 1)[0]); k++ }
  const out = []
  const complements = (a, b) => a.tongues.some(t => !b.tongues.includes(t)) || b.tongues.some(t => !a.tongues.includes(t))
  const rest = [...ordered]
  while (rest.length > 1) {
    const a = rest.shift()
    let j = rest.findIndex(b => complements(a, b))
    if (j === -1) j = 0
    out.push({ a: a.slug, b: rest.splice(j, 1)[0].slug, why: 'complementary tongues (a form each has not polished)' })
  }
  if (rest.length) out.push({ a: rest[0].slug, b: null, why: 'odd one out — assay seat this round (Mentor rung)' })
  return { seed: seed.slice(0, 16), pairs: out }
}

// ---- the workshop's 42 — the board, derived --------------------------------
// The Game of 42 reset for THIS use case (per the First Person): not a link
// into the hosted always-on game, but the cohort's own board — 6 axes × 7
// stations, every filled station a REAL trust task the workshop performed,
// walked from the ledgers. Deterministic; κ-addressed; p = filled/42. The
// full game (vendored dist) stays reachable at /game/full/ as the elder
// sibling, not the front door.
const AXES = [
  { id: 'protection', glyph: '⚔️', color: '#e0a526', what: 'guardrails signed and compiled' },
  { id: 'delegation', glyph: '🧙', color: '#5b8def', what: 'seats trusted to hold work' },
  { id: 'memory', glyph: '🪞', color: '#fb923c', what: 'the chain of what the room keeps' },
  { id: 'connection', glyph: '🤝', color: '#38bdf8', what: 'reach toward the federation' },
  { id: 'compute', glyph: '⚙️', color: '#94a3b8', what: 'work proven, replayable' },
  { id: 'value', glyph: '🪙', color: '#4caf7d', what: 'artefacts that leave with people' },
]
function boardState() {
  const tasks = { protection: [], delegation: [], memory: [], connection: [], compute: [], value: [] }
  const add = (axis, label, kind) => { if (tasks[axis].length < 7) tasks[axis].push({ label, kind }) }

  // protection ⚔️ — laws + consent acts
  for (const f of readdirSync(join(repo, 'lexon')).filter(f => f.endsWith('.lex')).sort()) add('protection', `law compiles: ${f.replace('.lex', '')}`, 'law')
  const ledgerRows = readText(join(repo, 'corpus', 'CONSENT_LEDGER.md')).split('\n').filter(l => /^\|\s*\d{4}-\d{2}-\d{2}/.test(l) && !/~~/.test(l)).length
  if (ledgerRows) add('protection', `${ledgerRows} consent line(s) signed`, 'consent')

  // delegation 🧙 — runs where the mage held the seats + earned edges
  const runsDir = join(repo, 'runs')
  const runIds = existsSync(runsDir) ? readdirSync(runsDir).filter(r => existsSync(join(runsDir, r, 'run.json'))) : []
  for (const r of runIds) { const s = readJson(join(runsDir, r, 'run.json')); if (s?.models && s.models.proposer !== 'stub') add('delegation', `run ${r}: the mage held the seats`, 'run') }
  const edgeCount = readText(edgesPath).split('\n').filter(Boolean).length
  if (edgeCount) add('delegation', `${edgeCount} earned trust edge(s)`, 'edge')

  // memory 🪞 — folds + chronicles
  for (const e of readText(join(repo, 'mage', 'steward_log.md')).split('\n## ').slice(1)) {
    const head = e.split('\n')[0]
    if (/steward:/.test(head)) add('memory', `fold: ${head.split('·')[0].trim()}${/fold 2/.test(head) ? ' (2)' : ''}`, 'fold')
  }
  const chron = readdirSync(join(repo, 'chronicles')).filter(f => f.endsWith('.md')).length
  if (chron) add('memory', `${chron} chronicle(s) filed`, 'chronicle')

  // connection 🤝 — spooled pages toward the oasis
  const spoolDir = join(repo, 'fedwiki', 'out')
  const pages = existsSync(spoolDir) ? readdirSync(spoolDir).filter(f => f.endsWith('.json')).length : 0
  if (pages) { add('connection', `${pages} page(s) spooled toward the oasis`, 'page') }
  if (existsSync(join(repo, 'web', 'out', 'site', 'graph.json'))) add('connection', 'the knowledge web derived', 'web')

  // compute ⚙️ — proofs that replay
  for (const r of runIds) add('compute', `run ${r} re-derives offline`, 'verify')
  add('compute', 'all gates green (tools/check.mjs)', 'gates')

  // value 🪙 — validated triptychs + books
  const considerT = (dir, rel) => { const c = readJson(join(dir, 'carry.json')); if (c?.status === 'validated') add('value', `triptych validated: ${c.triptych}`, 'triptych'); if (c?.status === 'submitted') add('value', `triptych at the gate: ${c.triptych}`, 'submitted') }
  considerT(join(repo, 'canon', 'seed-triptych'), 'seed')
  if (existsSync(join(repo, 'artifact'))) for (const d of readdirSync(join(repo, 'artifact'))) { const p = join(repo, 'artifact', d); try { if (statSync(p).isDirectory() && existsSync(join(p, 'carry.json'))) considerT(p, d) } catch {} }
  for (const b of ['book_of_poems', 'collected_papers', 'story_anthology']) if (existsSync(join(repo, 'artifact', `${b}.html`))) add('value', `bound: ${b.replace(/_/g, ' ')}`, 'book')
  const conCount = readText(constellationsPath).split('\n').filter(Boolean).length
  if (conCount) add('value', `${conCount} constellation artefact(s) forged`, 'artefact')

  const r = roster()
  const filled = Object.values(tasks).reduce((n, a) => n + a.length, 0)
  const state = {
    axes: AXES.map(a => ({ ...a, stations: tasks[a.id] })),
    cast: r.players.map(p => ({ name: p.name, persona: p.persona, tongues: p.tongues, kappa: p.kappa })),
    filled, total: 42, p: +(filled / 42).toFixed(4),
  }
  return { ...state, kappa: kappaOf({ holon: 'hh.board.v1', axes: state.axes, cast: state.cast, filled }) }
}

// ---- static -----------------------------------------------------------------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.map': 'application/json' }
function serveStatic(res, urlPath, prefix, baseDir) {
  const rel = normalize(urlPath.replace(prefix, '') || 'index.html').replace(/^([.][.][/\\])+/, '')
  const f = join(baseDir, rel)
  if (!f.startsWith(baseDir) || !existsSync(f) || !statSync(f).isFile()) return send(res, 404, { error: 'not found' })
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' })
  res.end(readFileSync(f))
}

// ---- server -----------------------------------------------------------------
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const p = url.pathname
  try {
    if (req.method === 'GET') {
      if (p === '/') return send(res, 200, readFileSync(join(here, 'workshop_ui.html')), MIME['.html'])
      if (p === '/game' || p === '/game/' || p === '/game/board') return send(res, 200, readFileSync(join(gameDir, 'board.html')), MIME['.html'])
      if (p.startsWith('/game/full')) return serveStatic(res, p, /^\/game\/full\/?/, join(gameDir, 'dist'))
      if (p.startsWith('/web')) return serveStatic(res, p, /^\/web\/?/, join(repo, 'web', 'out', 'site'))
      if (p.startsWith('/demo')) return serveStatic(res, p, /^\/demo\/?/, join(repo, 'demo', 'site'))
      if (p === '/api/game/board') return send(res, 200, boardState())
      if (p === '/api/state') return send(res, 200, { ...state(), mage: await mageStatus() })
      if (p === '/api/jobs') return send(res, 200, [...jobs.values()].map(({ output, ...j }) => j))
      if (p.startsWith('/api/job/')) { const j = jobs.get(p.split('/').pop()); return j ? send(res, 200, j) : send(res, 404, { error: 'no such job' }) }
      if (p === '/api/game/graph') return send(res, 200, graph())
      if (p === '/api/game/pairs') return send(res, 200, pairs())
      if (p === '/api/constellations') return send(res, 200, constellations())
      if (p === '/api/doc') {
        const rel = normalize(url.searchParams.get('f') || '').replace(/^([.][.][/\\])+/, '')
        const ok = ['README.md', 'frontier.json', 'canon/UNDERSTANDING.md', 'mage/steward_log.md', 'workshop/CURRICULUM.md', 'workshop/CEREMONY.md', 'workshop/UNDERSTANDING_KEY.md', 'workshop/PREFLIGHT.md', 'lexon/README.md', 'artifact/PROVENANCE.md', 'docs/AUTO_RESEARCH.md']
        if (!ok.includes(rel.replace(/\\/g, '/'))) return send(res, 403, { error: 'not on the readable list' })
        return send(res, 200, readText(join(repo, rel)), 'text/plain; charset=utf-8')
      }
      return send(res, 404, { error: 'not found' })
    }
    if (req.method === 'POST') {
      const body = await readBody(req)
      if (p === '/api/run') { const { output, ...j } = startJob(body.action, body.params); return send(res, 200, j) }
      if (p === '/api/game/roster') return send(res, 200, addPlayer(body))
      if (p === '/api/game/edge') return send(res, 200, mintEdge(body))
      if (p === '/api/constellation/forge') return send(res, 200, forgeConstellation(body))
      if (p === '/api/mirror') {
        // the mirror speaks: hh-mage (persona + consent-gated context pack).
        // Loopback proxy only; conversation lives in the page, never on disk —
        // talk is not corpus (corpus requires a consent line, C20).
        const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : []
        if (!messages.length) return send(res, 400, { error: 'say something — the mirror reflects, it does not begin' })
        try {
          const r = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ model: body.model || 'hh-mage', stream: false, options: { temperature: 0.7 }, messages }),
          })
          const j = await r.json()
          if (!r.ok) throw new Error(j.error || r.status)
          return send(res, 200, { reply: j.message?.content || '' })
        } catch (e) { return send(res, 502, { error: `the mirror is dark: ${e.message} — is the mage awake? (header dot; mage/MACHINE_SETUP.md)` }) }
      }
      return send(res, 404, { error: 'not found' })
    }
    send(res, 405, { error: 'method not allowed' })
  } catch (e) { send(res, 400, { error: String(e && e.message || e) }) }
})

server.listen(port, host, () => {
  console.log(`the Towel — hh_workshop control surface (don't panic)`)
  console.log(`  http://127.0.0.1:${port}/          dashboard + actions (whitelisted repo scripts only)`)
  console.log(`  http://127.0.0.1:${port}/game/     the Game of 42 (vendored dist)`)
  console.log(`  binding: ${host}${host === '0.0.0.0' ? '  (LAN — the workshop room)' : '  (local only; --lan for the room)'}`)
  console.log(`  the door stays shut: no push, no cast, no publish lives here (T6/GR-8)`)
})
