#!/usr/bin/env node
// site.mjs — the generative website builder: the workshop, as a site,
// derived rather than authored.
//
//   node web/site.mjs        → re-derives the graph, then emits web/out/site/
//
// Emits a fully self-contained static site (works from file://, from the
// Towel at /web/, or copied to any static host — the SNAPSHOT pattern of
// guide.agentprivacy.ai applied to the workshop):
//
//   index.html   the workshop's front page — live state, the expressions
//   graph.html   the spellweb lane — force-layout knowledge graph, graph
//                data INLINED, zero dependencies (hand-rolled physics: the
//                pattern of spellweb's d3-force, reimplemented in ~90 lines
//                because the air gap doesn't take npm)
//   claims.html  the register as a carried-matrix — every (claim, form)
//                pair, carried or debt, the frontier made visible
//
// Regenerate any time; nothing here is hand-edited (re-run = re-true).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { graphPage } from './graph_page.mjs'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const out = join(here, 'out', 'site')
mkdirSync(out, { recursive: true })

// ---- 1. re-derive the graph (the generator is the source of truth) ----------
const g = spawnSync(process.execPath, [join(here, 'graph.mjs')], { encoding: 'utf8' })
if (g.status !== 0) { console.error(g.stderr || g.stdout); process.exit(1) }
const graph = JSON.parse(readFileSync(join(here, 'out', 'graph.json'), 'utf8'))
const frontier = JSON.parse(readFileSync(join(repo, 'frontier.json'), 'utf8'))
const measured = JSON.parse(spawnSync(process.execPath, [join(repo, 'tools', 'measure_debt.mjs')], { encoding: 'utf8' }).stdout)

// carried matrix for claims.html
const carried = new Map()   // 'C7|poem' -> [triptych labels]
for (const e of graph.edges.filter(e => e.type === 'carries')) {
  const form = graph.nodes.find(n => n.id === e.source)
  const claim = graph.nodes.find(n => n.id === e.target)
  if (!form || !claim) continue
  const key = `${claim.label}|${form.form}`
  if (!carried.has(key)) carried.set(key, [])
  carried.get(key).push(form.label)
}
const claims = graph.nodes.filter(n => n.type === 'claim')

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const CSS = `
  :root { --bg:#0e1116; --panel:#161b22; --line:#2a3038; --ink:#d7dde6; --dim:#8b949e; --amber:#e0a526; --sapphire:#5b8def; --green:#4caf7d; --red:#e05252 }
  * { box-sizing:border-box } body { margin:0; background:var(--bg); color:var(--ink); font:14px/1.55 ui-monospace,Consolas,monospace }
  header { padding:16px 22px; border-bottom:1px solid var(--line) } header h1 { margin:0; font-size:17px } header h1 em { color:var(--amber); font-style:normal }
  header .sub { color:var(--dim); font-size:12px } nav a { color:var(--sapphire); margin-right:14px; text-decoration:none }
  main { padding:20px 22px; max-width:1100px } .card { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:14px 16px; margin:0 0 14px }
  .card h3 { margin:0 0 8px; font-size:13px; color:var(--sapphire) } .num { font-size:30px; color:var(--amber) } .dim { color:var(--dim) }
  .row { display:flex; gap:14px; flex-wrap:wrap } .row .card { flex:1; min-width:200px }
  table { border-collapse:collapse; width:100% } td,th { border-bottom:1px solid var(--line); padding:4px 7px; font-size:12.5px; text-align:left } th { color:var(--dim) }
  .pill { display:inline-block; border:1px solid var(--line); border-radius:99px; padding:1px 9px; margin:2px 4px 2px 0; font-size:12px; color:var(--dim) }
  .ok { color:var(--green) } .bad { color:var(--red) } a { color:var(--sapphire) }`
const shell = (title, body, extraHead = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style>${extraHead}</head><body>
<header><h1>hh_workshop · <em>${esc(title)}</em></h1>
<div class="sub">a generative site — derived from the repo's ledgers by web/site.mjs; re-run to re-true · don't panic</div>
<nav><a href="index.html">home</a><a href="graph.html">the web</a><a href="claims.html">the register</a></nav></header>
<main>${body}</main></body></html>`

// ---- index.html -------------------------------------------------------------
const tally = (t) => Object.entries(t || {}).map(([k, v]) => `${k} ${v}`).join(' · ')
const runs = graph.nodes.filter(n => n.type === 'run')
writeFileSync(join(out, 'index.html'), shell('the workshop', `
<div class="row">
  <div class="card"><h3>translation-debt</h3><div class="num">${measured.debt}</div><div class="dim">${measured.carried}/${measured.claims * 3} (claim,form) pairs carried · N=${measured.claims}</div></div>
  <div class="card"><h3>the web</h3><div class="num">${graph.nodes.length}<span class="dim" style="font-size:14px"> nodes</span></div><div class="dim">${graph.edges.length} edges · ${graph.nodeTypes.length} node types · ${graph.edgeTypes.length} verbs — <a href="graph.html">open</a></div></div>
  <div class="card"><h3>open target</h3><div class="dim">${esc(frontier.openTarget?.id)} · ${esc(frontier.openTarget?.statement)}</div></div>
</div>
<div class="card"><h3>the babblefish recursion</h3><div class="dim">sci-fi narrative → poem → white paper → recurse. One understanding, three tongues; a blind census gate; the tongue you didn't polish is the lesson. This site is derived from that work: nothing on it is authored by hand.</div></div>
<div class="card"><h3>expressions of the workshop</h3>
  <span class="pill"><a href="graph.html">knowledge web (spellweb lane)</a></span>
  <span class="pill"><a href="claims.html">claim register + carried matrix</a></span>
  <span class="pill">the Game of 42 — /game/ on the Towel</span>
  <span class="pill">bound books — artifact/*.html</span>
  <span class="pill">fedwiki spool — ${graph.nodes.filter(n => n.type === 'page').length} page(s) toward the oasis</span>
  <span class="pill">laws — ${graph.nodes.filter(n => n.type === 'law').length} compiling (lexon/)</span></div>
<div class="card"><h3>runs</h3><table><tr><th>run</th><th>state</th></tr>${runs.map(r => `<tr><td>${esc(r.label)}</td><td class="dim">${esc(r.desc)}</td></tr>`).join('')}</table></div>
<div class="card"><h3>provenance</h3><div class="dim">${graph.nodes.filter(n => n.type === 'fold').map(f => `${esc(f.label)} — ${esc(f.desc)}`).join('<br>')}<br>every fold re-derivable: <code>node tools/corpus_pack.mjs --verify</code></div></div>`))

writeFileSync(join(out, 'graph.html'), graphPage(graph))

// ---- claims.html — the carried matrix ---------------------------------------
const FORM_COLS = ['narrative', 'poem', 'paper']
const matrix = claims.map(c => {
  const cells = FORM_COLS.map(f => {
    const who = carried.get(`${c.label}|${f}`)
    return who ? `<td class="ok" title="${esc(who.join(', '))}">●</td>` : `<td class="bad">·</td>`
  }).join('')
  return `<tr><td><b>${esc(c.label)}</b></td><td class="dim">${esc(c.desc)}</td>${cells}</tr>`
}).join('')
writeFileSync(join(out, 'claims.html'), shell('the register', `
<div class="card"><h3>the carried matrix — debt made visible</h3>
<div class="dim">● = a counted triptych declares that tongue carries the claim (hover for which). · = debt. ${measured.carried} carried of ${measured.claims * 3}; debt ${measured.debt}. The poem column is the scarcest tongue — that is the open target.</div></div>
<div class="card"><table><tr><th>claim</th><th>statement (first line)</th><th>narrative</th><th>poem</th><th>paper</th></tr>${matrix}</table></div>`))

// the snapshot carries its own data file (graph.html inlines it too, but a
// consumer — including the Towel's stat tile — can eat graph.json directly)
writeFileSync(join(out, 'graph.json'), JSON.stringify(graph, null, 2) + '\n')

console.log(`site derived → web/out/site/  (index.html · graph.html · claims.html · graph.json)`)
console.log(`  graph inlined: ${graph.nodes.length} nodes · ${graph.edges.length} edges — works from file://, the Towel at /web/, or any static host (the snapshot)`)
