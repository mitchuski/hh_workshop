#!/usr/bin/env node
// graph.mjs — the spellweb lane's generator: the workshop, as a knowledge
// graph, derived rather than declared.
//
//   node web/graph.mjs [--json]      → web/out/graph.json (+ stats to stdout)
//
// Spellweb (the agentprivacy knowledge-graph site) is hand-curated: NODES
// and EDGES authored in TS, audited for coherence. This lane is the
// GENERATIVE sibling: nothing here is authored — every node and edge is
// WALKED out of the repo's own ledgers, so the graph is re-derivable by
// anyone and never drifts from the thing it describes (re-run = re-true).
//
// Conventions follow spellweb's schema (src/types/graph.ts upstream):
//   node: { id, type, label, domain, layer, desc, ...extras }
//   edge: { source, target, type }        — verb-form snake_case types
//   ids:  prefix-slug ("claim-c7", "law-workshop-consent", "player-…")
//   domain: swordsman | mage | first_person | shared
//   layer:  knowledge | narrative | chronicle
//
// Sources walked:
//   canon/UNDERSTANDING.md            → claim nodes (band = category)
//   canon/seed-triptych + artifact/*  → triptych + form nodes; carries edges
//   lexon/*.lex (via the vendored checker's parser) → law + role nodes;
//                                        modal-verb edges (may_register, …)
//   lexon/*.claims.json               → guards edges (law → claim? no —
//                                        gate/absence relations as edge notes)
//   game/roster.json + edges.jsonl    → player nodes; earned trust edges
//   runs/*/run.json (+ round dirs)    → run + lever nodes; verdict edges
//   mage/steward_log.md               → fold nodes; folds edges to corpus
//   corpus/*.md + CONSENT_LEDGER.md   → corpus nodes (consent state)
//   fedwiki/out/*.json                → page nodes; spooled_from edges
//   artifact/*.html                   → book nodes; binds edges
//   chronicles/*.md                   → chronicle nodes

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const { check } = await import(pathToFileURL(join(repo, 'lexon', 'tools', 'lexon_check.mjs')).href)

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const read = (p, d = '') => { try { return readFileSync(p, 'utf8') } catch { return d } }
const readJson = (p, d = null) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return d } }

const nodes = []
const edges = []
const seen = new Set()
const node = (n) => { if (!seen.has(n.id)) { seen.add(n.id); nodes.push(n) } return n.id }
const edge = (source, target, type, extra = {}) => { edges.push({ source, target, type, ...extra }) }

// ---- claims (the register) --------------------------------------------------
const register = read(join(repo, 'canon', 'UNDERSTANDING.md'))
let band = ''
for (const line of register.split('\n')) {
  const b = /^## ([A-F]) · (.+)$/.exec(line)
  if (b) { band = `${b[1]} · ${b[2]}` }
  const m = /^- \*\*(C\d+)\*\* · (.+)$/.exec(line)
  if (m) {
    node({ id: `claim-${m[1].toLowerCase()}`, type: 'claim', label: m[1], domain: 'shared', layer: 'knowledge', desc: m[2].trim(), category: band })
  }
}
// claim statements can span lines; desc above is the first line — enough for a card.

// ---- triptychs + forms + carries -------------------------------------------
const FORMS = { narrative: 'sci-fi.md', poem: 'poem.md', paper: 'white-paper.md' }
function walkTriptych(dir, rel) {
  const carry = readJson(join(dir, 'carry.json'))
  if (!carry) return
  const tid = `triptych-${slug(carry.triptych || basename(dir))}`
  node({ id: tid, type: 'triptych', label: carry.triptych || basename(dir), domain: 'first_person', layer: 'narrative', desc: `${carry.title || rel} · status ${carry.status}`, status: carry.status, href: rel })
  for (const [form, file] of Object.entries(FORMS)) {
    if (!existsSync(join(dir, file))) continue
    const text = read(join(dir, file))
    const title = (text.match(/^# (.+)$/m) || [null, form])[1]
    const fid = `form-${slug(carry.triptych || basename(dir))}-${form}`
    node({ id: fid, type: 'form', label: title, domain: form === 'paper' ? 'swordsman' : 'mage', layer: 'narrative', desc: `${form} tongue of ${carry.triptych || rel}`, form })
    edge(tid, fid, 'renders')
    for (const c of carry[form] || []) edge(fid, `claim-${String(c).toLowerCase()}`, 'carries')
  }
}
walkTriptych(join(repo, 'canon', 'seed-triptych'), 'canon/seed-triptych')
if (existsSync(join(repo, 'artifact'))) for (const d of readdirSync(join(repo, 'artifact'))) {
  const p = join(repo, 'artifact', d)
  try { if (statSync(p).isDirectory()) walkTriptych(p, `artifact/${d}`) } catch {}
}

// ---- laws (lexon) — roles + modal-verb edges from the parser's own triples --
for (const f of readdirSync(join(repo, 'lexon')).filter(f => f.endsWith('.lex')).sort()) {
  const src = read(join(repo, 'lexon', f))
  const r = check(src, f)
  const lid = `law-${slug(r.title || f)}`
  node({ id: lid, type: 'law', label: `LEX ${r.title || f}`, domain: 'shared', layer: 'knowledge', desc: `${f} — compiles: ${r.ok} (${(r.triples || []).length} triples)`, href: `lexon/${f}` })
  for (const t of r.triples || []) {
    const rid = `role-${slug(t.s)}`
    node({ id: rid, type: 'role', label: t.s, domain: /swordsman|assayer|steward/i.test(t.s) ? 'swordsman' : /mage|proposer/i.test(t.s) ? 'mage' : /first person/i.test(t.s) ? 'first_person' : 'shared', layer: 'knowledge', desc: `a party/role bound in ${r.title || f}` })
    edge(rid, lid, 'bound_in')
    const verb = `${t.modal ? t.modal + '_' : ''}${t.verb}`.toLowerCase()
    if (t.o) {
      const oid = `term-${slug(t.o)}`
      node({ id: oid, type: 'term', label: t.o, domain: 'shared', layer: 'knowledge', desc: `an object of ${r.title || f}` })
      edge(rid, oid, verb, { law: lid, clause: t.clause || null, condition: t.condition || null })
    }
    if (t.io) {
      const ioid = `role-${slug(t.io)}`
      node({ id: ioid, type: 'role', label: t.io, domain: 'shared', layer: 'knowledge', desc: `a recipient in ${r.title || f}` })
      edge(rid, ioid, `${verb}_to`, { law: lid, clause: t.clause || null })
    }
  }
}

// ---- players + earned trust edges ------------------------------------------
const roster = readJson(join(repo, 'game', 'roster.json'), { players: [] })
for (const p of roster.players) {
  node({ id: `player-${p.slug}`, type: 'player', label: p.name, domain: 'first_person', layer: 'narrative', desc: `persona ${p.persona || '—'} · tongues ${(p.tongues || []).join(', ') || '—'}`, kappa: p.kappa, did: p.did, persona: p.persona })
}
for (const line of read(join(repo, 'game', 'edges.jsonl')).split('\n').filter(Boolean)) {
  try { const e = JSON.parse(line); edge(`player-${e.sourceSlug}`, `player-${e.targetSlug}`, e.relation.replace(/-/g, '_'), { signed: !!e.sig, at: e.at || null }) } catch {}
}

// ---- runs + levers ----------------------------------------------------------
if (existsSync(join(repo, 'runs'))) for (const rid of readdirSync(join(repo, 'runs'))) {
  const s = readJson(join(repo, 'runs', rid, 'run.json'))
  if (!s) continue
  const rnode = `run-${slug(rid)}`
  node({ id: rnode, type: 'run', label: `run ${rid}`, domain: 'shared', layer: 'chronicle', desc: `${s.status} · ${s.rounds} round(s) · ${JSON.stringify(s.tally)} · ${s.models?.proposer || ''}`, status: s.status })
  if (s.triptych) {
    const t = nodes.find(n => n.type === 'triptych' && s.triptych.includes(n.label)) || nodes.find(n => n.type === 'triptych')
    if (t) edge(rnode, t.id, 'probed')
  }
  // levers from the persisted proposal dirs
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (!e.isDirectory()) continue
      const p = join(d, e.name)
      if (!/^p\d+-/.test(e.name)) { walk(p); continue }
      const prop = readJson(join(p, 'proposal_canon.json'))
      const verdict = readJson(join(p, 'verdict.json'))
      if (!prop) continue
      const lid = `lever-${slug(rid)}-${slug(prop.leverId)}`
      node({ id: lid, type: 'lever', label: prop.leverId, domain: prop.lens === 'story-forward' ? 'mage' : 'swordsman', layer: 'chronicle', desc: `${prop.title || ''} · ${verdict ? verdict.status : 'unassayed'}`, status: verdict?.status || null, lens: prop.lens })
      edge(lid, rnode, 'proposed_in')
      if (verdict) edge(lid, rnode, verdict.status === 'VALIDATED' ? 'validated_in' : verdict.status === 'MIRAGE' ? 'mirage_in' : 'blocked_in')
    }
  }
  walk(join(repo, 'runs', rid))
}

// ---- steward folds + corpus -------------------------------------------------
const ledger = read(join(repo, 'corpus', 'CONSENT_LEDGER.md'))
const consented = new Set()
for (const line of ledger.split('\n')) {
  const m = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|[^|]+\|\s*(corpus\/[^|\s]+)\s*\|/.exec(line)
  if (m && !/^\s*~~/.test(line)) consented.add(m[1].trim())
}
for (const f of readdirSync(join(repo, 'corpus')).filter(f => f.endsWith('.md') && f !== 'CONSENT_LEDGER.md')) {
  node({ id: `corpus-${slug(f)}`, type: 'corpus', label: f, domain: 'first_person', layer: 'knowledge', desc: consented.has(`corpus/${f}`) ? 'consented' : 'UNCONSENTED (will be refused)', consented: consented.has(`corpus/${f}`) })
}
const stewardLog = read(join(repo, 'mage', 'steward_log.md'))
for (const entry of stewardLog.split('\n## ').slice(1)) {
  const head = entry.split('\n')[0]
  const m = /Week (\d+)(?: · fold (\d+))? · ([\d-]+) · steward: ([^\n(]+)/.exec(head)
  if (!m) continue
  const fid = `fold-week-${m[1]}${m[2] ? `-${m[2]}` : ''}`
  node({ id: fid, type: 'fold', label: `Week ${m[1]} fold${m[2] ? ` ${m[2]}` : ''}`, domain: 'first_person', layer: 'chronicle', desc: `steward ${m[4].trim()} · ${m[3]}`, steward: m[4].trim() })
  for (const fm of entry.matchAll(/`(corpus\/[^`]+)`/g)) edge(fid, `corpus-${slug(basename(fm[1]))}`, 'folds')
  const ps = roster.players.find(p => m[4].toLowerCase().includes(p.name.split(' ')[0].toLowerCase()))
  if (ps) edge(`player-${ps.slug}`, fid, 'stewarded')
}

// ---- forged constellation artefacts (the spellweb deviation layer, earned) --
for (const line of read(join(repo, 'game', 'constellations.jsonl')).split('\n').filter(Boolean)) {
  let c; try { c = JSON.parse(line) } catch { continue }
  const aid = `artefact-${c.slug || slug(c.name)}`
  node({ id: aid, type: 'artefact', label: c.name, domain: 'first_person', layer: 'narrative', desc: `forged constellation · ${c.nodeIds.length} stars · by ${c.bearer}${c.note ? ' · ' + c.note : ''}`, kappa: c.kappa })
  for (const nid of c.nodeIds) edge(aid, nid, 'composed_of')
  edge(aid, `player-${c.bearer}`, 'forged_by')
}

// ---- spool pages + books + chronicles ---------------------------------------
if (existsSync(join(repo, 'fedwiki', 'out'))) for (const f of readdirSync(join(repo, 'fedwiki', 'out')).filter(f => f.endsWith('.json'))) {
  const p = readJson(join(repo, 'fedwiki', 'out', f))
  const pid = `page-${slug(basename(f, '.json'))}`
  node({ id: pid, type: 'page', label: p?.title || f, domain: 'shared', layer: 'narrative', desc: `spooled fedwiki page · ${p?.story?.length || 0} items`, href: `fedwiki/out/${f}` })
  if (/^triptych-/.test(basename(f, '.json'))) { const t = nodes.find(n => n.type === 'triptych'); if (t) edge(pid, t.id, 'spooled_from') }
  if (f === 'the-steward-chain.json') { const anyFold = nodes.find(n => n.type === 'fold'); if (anyFold) edge(pid, anyFold.id, 'spooled_from') }
}
for (const b of ['book_of_poems.html', 'collected_papers.html', 'story_anthology.html']) {
  if (!existsSync(join(repo, 'artifact', b))) continue
  const bid = `book-${slug(basename(b, '.html'))}`
  node({ id: bid, type: 'book', label: b.replace(/_/g, ' ').replace('.html', ''), domain: 'first_person', layer: 'narrative', desc: 'bound artefact — carries the steward chain', href: `artifact/${b}` })
  for (const t of nodes.filter(n => n.type === 'triptych')) edge(bid, t.id, 'binds')
}
for (const f of readdirSync(join(repo, 'chronicles')).filter(f => f.endsWith('.md'))) {
  const title = (read(join(repo, 'chronicles', f)).match(/^# (.+)$/m) || [null, f])[1]
  node({ id: `chronicle-${slug(basename(f, '.md'))}`, type: 'chronicle', label: title, domain: 'shared', layer: 'chronicle', desc: f, href: `chronicles/${f}` })
}

// ---- tours: presets-as-guided-tours, DERIVED (the spellweb pattern) ---------
// Spellweb's crown consumability asset is the hand-authored preset walk —
// marks with notes, a proverb, a reflection. Here the tours derive from the
// ledgers like everything else: membership is queried from the graph just
// built; narration is templated from what the nodes themselves say.
function tour(id, emoji, name, proverb, reflection, markSpecs) {
  const marks = markSpecs
    .map(([nid, note]) => ({ nodeId: nid, note }))
    .filter(m => seen.has(m.nodeId))
  return marks.length >= 3 ? { id, emoji, name, proverb, reflection, marks } : null
}
const byType = (t) => nodes.filter(n => n.type === t).map(n => n.id)
const tours = [
  tour('babblefish', '🐟', 'The Babblefish Walk',
    'One truth, many tongues — the tongue you didn\'t polish is the lesson.',
    'The seed understanding renders three ways, faces the blind gate, and the frontier only moves when translation survives.',
    [
      ['claim-c1', 'A claim: one understanding, renderable across three tongues.'],
      ['triptych-seed', 'The seed triptych — the canary that proves the exam is passable.'],
      ['form-seed-narrative', 'The story tongue: the mechanism hidden in furniture.'],
      ['form-seed-poem', 'The poem tongue: the scarcest carrier — compression is the hardest translation.'],
      ['form-seed-paper', 'The paper tongue: the same truth, made checkable.'],
      ['run-live1', 'A live round: the mage held every seat; the draw picked the tongue.'],
      ['triptych-t1-the-stewards-week', 'A submitted triptych waits at the gate — visible at once, credited only when validated.'],
    ]),
  tour('consent', '📜', 'The Consent Path',
    'Nothing is taken; everything is offered; the law proves what it makes impossible.',
    'From the compiling law through the roles it binds, to the corpus nothing enters without a signed line, to the fold that feeds the mirror.',
    [
      ['law-workshop-consent', 'The consent agreement as Lexon — prose a lawyer reads, structure a machine parses.'],
      ['role-first-person', 'The First Person: the one who proffers; the agreement is bilateral.'],
      ['role-workshop-holder', 'The Workshop Holder — to whom, provably, no clause routes anything (the absence claim).'],
      ['term-expression', 'The expression: simultaneously a key and food.'],
      ...byType('corpus').slice(0, 2).map(id => [id, 'A consented expression — no ledger line, no admission; the pipes refuse.']),
      ['fold-week-0', 'The fold: the steward feeds the mirror; the hash is read aloud.'],
    ]),
  tour('steward', '🔑', 'The Steward\'s Week',
    'A chain nobody watches is a story; this one re-derives.',
    'The rotating steward holds the training for one week: admit, fold, verify in public, hand over the key. Every name ends up in the chain.',
    [
      ...byType('player').slice(0, 1).map(id => [id, 'The bearer of the week — every student takes exactly one.']),
      ['fold-week-0', 'The zeroth fold: everything before the cohort is seed, and says so.'],
      ['fold-week-0-2', 'The second fold: the first spoken note, transcribed, consented, eaten.'],
      ...byType('corpus').slice(0, 2).map(id => [id, 'What the mage is made of: the room\'s own words.']),
      ['law-fold', 'The steward\'s duties, as a law that compiles.'],
    ]),
  tour('trust', '🪢', 'The Earned Graph',
    'A trust that certifies itself is the one you cannot trust.',
    'Persona holons with room-scoped keys; edges minted only on verifiable events; artefacts forged from starred paths — nothing here is declared, everything is earned.',
    [
      ...byType('player').slice(0, 2).map(id => [id, 'A persona holon: κ-addressed, did:key-signed, consent-gated at join.']),
      ...byType('artefact').slice(0, 2).map(id => [id, 'A forged constellation: an ordered path through the web, named and signed by its bearer.']),
      ...byType('book').slice(0, 2).map(id => [id, 'A bound book — the steward chain printed in its endpapers.']),
    ]),
  tour('gate', '⚖️', 'The Gate\'s Verdicts',
    'A VALIDATED without a replayable trail is not a win.',
    'Rounds propose levers; the blind census assays; verdicts queue for the keystone. Every link re-derives from saved bytes, offline, forever.',
    [
      ...byType('run').slice(0, 3).map(id => [id, 'A recorded round — replay it: node tools/verify_run.mjs.']),
      ...byType('lever').slice(0, 3).map(id => [id, 'A proposed lever with its verdict — VALIDATED queues as a candidate; only humans fold.']),
    ]),
].filter(Boolean)

// ---- drop dangling edges (an edge to a node that isn't there lies) ----------
const ids = new Set(nodes.map(n => n.id))
const kept = edges.filter(e => ids.has(e.source) && ids.has(e.target))
const dropped = edges.length - kept.length

// ---- emit -------------------------------------------------------------------
mkdirSync(join(here, 'out'), { recursive: true })
const graph = {
  name: 'hh_workshop',
  derived: 'every node and edge walked from the repo ledgers — re-run web/graph.mjs to re-derive; never hand-edit',
  conventions: 'spellweb dialect: {id,type,label,domain,layer,desc} nodes · {source,target,type} snake_case verb edges',
  nodeTypes: [...new Set(nodes.map(n => n.type))].sort(),
  edgeTypes: [...new Set(kept.map(e => e.type))].sort(),
  tours,
  nodes, edges: kept,
}
writeFileSync(join(here, 'out', 'graph.json'), JSON.stringify(graph, null, 2) + '\n')
const stats = { nodes: nodes.length, edges: kept.length, dropped, nodeTypes: graph.nodeTypes.length, edgeTypes: graph.edgeTypes.length }
console.log(process.argv.includes('--json') ? JSON.stringify({ ...stats, out: 'web/out/graph.json' }, null, 2) : `graph derived: ${stats.nodes} nodes · ${stats.edges} edges (${stats.dropped} dangling dropped) · ${stats.nodeTypes} node types · ${stats.edgeTypes} edge types → web/out/graph.json`)
