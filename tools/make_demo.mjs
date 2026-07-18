#!/usr/bin/env node
// make_demo.mjs — generate the SAMPLE COHORT: a fictional workshop at week
// five, rendered through the same generative templates as the live system,
// so a professor sees populated boards instead of week-zero emptiness.
//
//   node tools/make_demo.mjs      → demo/site/{index,board,graph}.html
//
// HONESTY RULES: every page carries a banner naming the data as fictional;
// nothing here touches the real ledgers (roster, corpus, steward log, runs
// are all untouched); the demo is a static snapshot — copy demo/site/
// anywhere. The cast are the characters of the seed story ("The Name That
// Died") plus friends; the numbers are a plausible week-5 trajectory, not
// measurements. Deterministic: fold "hashes" are sha256 of their own
// labels, stamped (sample).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { sha256Hex, kappaOf } from './kappa.mjs'
import { graphPage } from '../web/graph_page.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const out = join(repo, 'demo', 'site')
mkdirSync(out, { recursive: true })

const BANNER = 'SAMPLE COHORT — fictional data, week 5 of 10, generated for demonstration · the live workshop derives everything from real ledgers'
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// ---- the fictional cohort ---------------------------------------------------
const CAST = [
  { name: 'Ilse', persona: 'the Cartographer', tongues: ['paper', 'narrative'] },
  { name: 'Tomas', persona: 'the Bellringer', tongues: ['narrative'] },
  { name: 'Priya', persona: 'the Chronicler', tongues: ['poem', 'paper'] },
  { name: 'Marta', persona: 'the Lampwright', tongues: ['poem'] },
  { name: 'Joon', persona: 'the Gatekeeper', tongues: ['paper'] },
  { name: 'Amara', persona: 'the Wayfinder', tongues: ['narrative', 'poem'] },
  { name: 'Dev', persona: 'the Tidewalker', tongues: ['paper', 'poem'] },
  { name: 'Sofia', persona: 'the Archivist', tongues: ['narrative', 'paper'] },
].map(p => ({ ...p, slug: slug(p.name), kappa: kappaOf({ holon: 'hh.demo.player.v1', ...p }) }))

const TRIPTYCHS = [
  { t: 'The Resolver in the Snow', by: 'Tomas', week: 2, status: 'validated', n: 7, p: 4, f: 8 },
  { t: 'Consent Is a Door', by: 'Priya', week: 3, status: 'validated', n: 6, p: 5, f: 7 },
  { t: 'The Mirror Fold', by: 'Amara', week: 3, status: 'validated', n: 8, p: 3, f: 6 },
  { t: 'One Good Name', by: 'Ilse', week: 4, status: 'validated', n: 6, p: 6, f: 9 },
  { t: 'The Blind Reader', by: 'Joon', week: 4, status: 'validated', n: 5, p: 4, f: 8 },
  { t: 'The Bowl Too Wide', by: 'Marta', week: 5, status: 'validated', n: 4, p: 7, f: 5 },
  { t: 'The Seventh Station', by: 'Dev', week: 5, status: 'submitted', n: 6, p: 4, f: 7 },
  { t: 'Erasmus of the Probes', by: 'Sofia', week: 5, status: 'submitted', n: 5, p: 3, f: 8 },
]
const FOLDS = [0, 1, 2, 3, 4, 5].map(w => ({
  week: w, steward: w === 0 ? 'the First Person (seed)' : CAST[w - 1].name,
  hash: sha256Hex(`sample fold week ${w}`),
  note: w === 0 ? 'the seed' : `${1 + w} expression(s) folded, ${w} audio note(s) transcribed`,
}))
const EDGES = [
  ...CAST.slice(0, 6).map((p, i) => ({ s: p.name, t: CAST[(i + 3) % 8].name, r: 'mentor_assay', w: 2 + (i % 4) })),
  ...FOLDS.slice(1).map(f => ({ s: f.steward, t: 'Ilse', r: 'steward_fold', w: f.week })),
  ...[[0, 5], [1, 6], [2, 7], [3, 4]].map(([a, b], i) => ({ s: CAST[a].name, t: CAST[b].name, r: 'pair_swap', w: 4 })),
  { s: 'Ilse', t: 'Priya', r: 'keystone_fold', w: 4 }, { s: 'Joon', t: 'Marta', r: 'keystone_fold', w: 5 },
  ...CAST.slice(0, 3).map(p => ({ s: p.name, t: CAST[7].name, r: 'seal_witness', w: 5 })),
]
const CARRIED = 78, N = 31, DEBT = 3 * N - CARRIED   // week-5 trajectory: 32 → 15

// ---- the demo graph (spellweb dialect, through the shared template) ---------
const nodes = [], edges = []
const seen = new Set()
const node = (n) => { if (!seen.has(n.id)) { seen.add(n.id); nodes.push(n) } return n.id }
const edge = (s, t, type) => edges.push({ source: s, target: t, type })
const register = readFileSync(join(repo, 'canon', 'UNDERSTANDING.md'), 'utf8')
let band = ''
for (const line of register.split('\n')) {
  const b = /^## ([A-F]) · (.+)$/.exec(line); if (b) band = `${b[1]} · ${b[2]}`
  const m = /^- \*\*(C\d+)\*\* · (.+)$/.exec(line)
  if (m) node({ id: `claim-${m[1].toLowerCase()}`, type: 'claim', label: m[1], domain: 'shared', layer: 'knowledge', desc: m[2].trim(), category: band })
}
for (const p of CAST) node({ id: `player-${p.slug}`, type: 'player', label: p.name, domain: 'first_person', layer: 'narrative', desc: `persona ${p.persona} · tongues ${p.tongues.join(', ')} (sample)`, kappa: p.kappa })
const claimIds = nodes.filter(n => n.type === 'claim').map(n => n.id)
TRIPTYCHS.forEach((t, ti) => {
  const tid = `triptych-${slug(t.t)}`
  node({ id: tid, type: 'triptych', label: t.t, domain: 'first_person', layer: 'narrative', desc: `by ${t.by} · week ${t.week} · ${t.status} (sample)`, status: t.status })
  edge(`player-${slug(t.by)}`, tid, 'authored')
  const forms = [['narrative', t.n], ['poem', t.p], ['paper', t.f]]
  forms.forEach(([form, count], fi) => {
    const fid = `form-${slug(t.t)}-${form}`
    node({ id: fid, type: 'form', label: `${t.t} · ${form}`, domain: form === 'paper' ? 'swordsman' : 'mage', layer: 'narrative', desc: `${form} tongue (sample)`, form })
    edge(tid, fid, 'renders')
    for (let k = 0; k < count; k++) edge(fid, claimIds[(ti * 7 + fi * 11 + k * 3) % claimIds.length], 'carries')
  })
})
for (const f of FOLDS) {
  const fid = `fold-week-${f.week}`
  node({ id: fid, type: 'fold', label: `Week ${f.week} fold`, domain: 'first_person', layer: 'chronicle', desc: `steward ${f.steward} · ${f.note} (sample)` })
  if (f.week > 0) edge(`player-${slug(f.steward)}`, fid, 'stewarded')
}
for (const e of EDGES) edge(`player-${slug(e.s)}`, `player-${slug(e.t)}`, e.r)
const ids = new Set(nodes.map(n => n.id))
const demoGraph = {
  name: 'hh_workshop — sample cohort', nodeTypes: [...new Set(nodes.map(n => n.type))].sort(),
  edgeTypes: [...new Set(edges.map(e => e.type))].sort(),
  nodes, edges: edges.filter(e => ids.has(e.source) && ids.has(e.target)),
}
writeFileSync(join(out, 'graph.html'), graphPage(demoGraph, { banner: BANNER }))

// ---- the demo board (through the live board template, data inlined) ---------
const AXFILL = {
  protection: ['law compiles: consent agreement', 'law compiles: steward fold', 'law compiles: babblefish gate', '11 consent lines signed', 'withdrawal honoured (week 3)', 'preflight clean at the venue'],
  delegation: ['run w1: the mage held the seats', 'run w2 · 2 validated', 'run w3 · 3 validated', 'run w4 · 2 validated', 'run w5 · 1 validated + 2 at the gate', '20 earned trust edges'],
  memory: ['fold: week 0 (seed)', 'fold: week 1 · Ilse', 'fold: week 2 · Tomas', 'fold: week 3 · Priya', 'fold: week 4 · Marta', 'fold: week 5 · Joon'],
  connection: ['19 pages spooled toward the oasis', 'the knowledge web derived', 'first cast returned with seeds', 'sister-cohort probe exchanged', 'visiting assayer week (Φ raised)'],
  compute: ['every run re-derives offline', 'gates green all five weeks', 'chain verified in public ×5', 'canary walks the census', 'salt never seen by a seat', 'the twin caught a drift', 'measure twice, same number'],
  value: ['6 triptychs validated', '2 at the gate', 'book of poems (draft binding)', 'collected papers (draft binding)', 'story anthology (draft binding)', 'debt 32 → 15'],
}
const AXES = [
  { id: 'protection', glyph: '⚔️', color: '#e0a526', what: 'guardrails signed and compiled' },
  { id: 'delegation', glyph: '🧙', color: '#5b8def', what: 'seats trusted to hold work' },
  { id: 'memory', glyph: '🪞', color: '#fb923c', what: 'the chain of what the room keeps' },
  { id: 'connection', glyph: '🤝', color: '#38bdf8', what: 'reach toward the federation' },
  { id: 'compute', glyph: '⚙️', color: '#94a3b8', what: 'work proven, replayable' },
  { id: 'value', glyph: '🪙', color: '#4caf7d', what: 'artefacts that leave with people' },
].map(a => ({ ...a, stations: AXFILL[a.id].slice(0, 7).map(label => ({ label, kind: 'sample' })) }))
const filled = AXES.reduce((n, a) => n + a.stations.length, 0)
const B = {
  axes: AXES, cast: CAST.map(p => ({ name: p.name, persona: p.persona, tongues: p.tongues, kappa: p.kappa })),
  filled, total: 42, p: +(filled / 42).toFixed(4),
}
B.kappa = kappaOf({ holon: 'hh.demo.board.v1', axes: B.axes, cast: B.cast, filled })
// the LIVE board page is the template — the demo stays in sync with it
let board = readFileSync(join(repo, 'game', 'board.html'), 'utf8')
board = board.replace(
  /async function load\(\) \{[\s\S]*?\n\}/,
  `function load() { B = ${JSON.stringify(B)}; draw(); side() }`)
board = board.replace('<div id="stage">',
  `<div style="position:fixed;inset:auto 0 0 0;z-index:8;text-align:center;padding:6px 12px;background:#3a2b0a;color:#e0a526;font-size:12px;border-top:1px solid #5a4310">${esc(BANNER)}</div><div id="stage">`)
board = board.replace('<a href="/game/full/"', '<a href="graph.html"').replace('the full game ↗', 'the sample web ↗')
writeFileSync(join(out, 'board.html'), board)

// ---- the demo index ---------------------------------------------------------
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>hh_workshop — sample cohort</title><style>
:root { --bg:#0e1116; --panel:#161b22; --line:#2a3038; --ink:#d7dde6; --dim:#8b949e; --amber:#e0a526; --sapphire:#5b8def; --green:#4caf7d }
* { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:14.5px/1.6 ui-monospace,Consolas,monospace }
.banner { text-align:center; padding:7px 12px; background:#3a2b0a; color:var(--amber); font-size:12.5px; border-bottom:1px solid #5a4310 }
main { max-width:880px; margin:0 auto; padding:28px 22px }
h1 { font-size:19px } h1 em { color:var(--amber); font-style:normal }
.card { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:16px 18px; margin:0 0 16px }
.card h3 { margin:0 0 8px; font-size:13px; color:var(--sapphire) }
.num { font-size:32px; color:var(--amber) } .dim { color:var(--dim) }
.row { display:flex; gap:16px; flex-wrap:wrap } .row .card { flex:1; min-width:200px; margin:0 }
.row { margin-bottom:16px } a { color:var(--sapphire) }
table { border-collapse:collapse; width:100% } td,th { border-bottom:1px solid var(--line); padding:6px 9px; font-size:13px; text-align:left } th { color:var(--dim) }
.ok { color:var(--green) }
</style></head><body>
<div class="banner">${esc(BANNER)}</div>
<main>
<h1>hh_workshop · <em>a sample cohort, week 5</em></h1>
<p class="dim">What the workshop looks like mid-course: eight students, six weekly folds, six validated triptychs and two at the gate, a trust graph grown from real events. Every page here is generated by the same pipeline as the live system — only the data is invented.</p>
<div class="row">
  <div class="card"><h3>translation-debt</h3><div class="num">${DEBT}</div><div class="dim">was 32 at week 0 · ${CARRIED}/${3 * N} pairs carried</div></div>
  <div class="card"><h3>the board</h3><div class="num">${filled}/42</div><div class="dim">p = ${B.p} · <a href="board.html">open the 42 →</a></div></div>
  <div class="card"><h3>the web</h3><div class="num">${demoGraph.nodes.length}</div><div class="dim">${demoGraph.edges.length} edges · <a href="graph.html">open the web →</a></div></div>
</div>
<div class="card"><h3>the cast</h3>
<table><tr><th>student</th><th>persona</th><th>tongues</th><th>steward week</th></tr>
${CAST.map((p, i) => `<tr><td>${esc(p.name)}</td><td>${esc(p.persona)}</td><td>${p.tongues.join(' · ')}</td><td class="dim">${i < 5 ? 'week ' + (i + 1) : 'upcoming'}</td></tr>`).join('')}</table></div>
<div class="card"><h3>the triptychs</h3>
<table><tr><th>title</th><th>author</th><th>week</th><th>status</th></tr>
${TRIPTYCHS.map(t => `<tr><td>${esc(t.t)}</td><td>${esc(t.by)}</td><td class="dim">w${t.week}</td><td class="${t.status === 'validated' ? 'ok' : 'dim'}">${t.status}</td></tr>`).join('')}</table></div>
<div class="card"><h3>the chain of hands (sample)</h3>
${FOLDS.map(f => `<div class="dim">week ${f.week} · steward ${esc(f.steward)} · <code style="font-size:11px">${f.hash.slice(0, 20)}…</code> · ${esc(f.note)}</div>`).join('')}</div>
<p class="dim">The live workshop: <a href="/">the Towel</a> · everything there derives from real ledgers and refuses what consent does not cover.</p>
</main></body></html>`)

console.log(`sample cohort generated → demo/site/ (index · board · graph)`)
console.log(`  fictional & labeled: ${CAST.length} students · ${TRIPTYCHS.length} triptychs · board ${filled}/42 · debt 32→${DEBT} · real ledgers untouched`)
