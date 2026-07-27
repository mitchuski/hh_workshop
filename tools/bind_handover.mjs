#!/usr/bin/env node
// bind_handover.mjs — render the hh_workshop handover package:
// one HTML per manifest document (same serif hand as bind_brief.mjs),
// a cover-and-contents page, and a combined dossier.
//   node tools/bind_handover.mjs  → artifact/handover/html/*.html
//   (print each to PDF for delivery — headless Edge/Chrome --print-to-pdf works)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const outDir = join(repo, 'artifact', 'handover', 'html')
mkdirSync(outDir, { recursive: true })

// --- markdown renderer (verbatim logic from tools/bind_brief.mjs) ---
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) => esc(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')

function renderMd(md) {
  md = md.replace(/\r\n/g, '\n')
  const lines = md.split('\n')
  const out = []
  let i = 0, para = []
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = [] } }
  while (i < lines.length) {
    const l = lines[i]
    if (/^```/.test(l)) { flush(); const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre>${esc(buf.join('\n'))}</pre>`); continue }
    if (/^\|/.test(l)) {
      flush(); const rows = []
      while (i < lines.length && /^\|/.test(lines[i])) { if (!/^\|[\s:|-]+\|$/.test(lines[i])) rows.push(lines[i].slice(1, -1).split('|').map(c => inline(c.trim()))); i++ }
      const [head, ...body] = rows
      out.push(`<table><tr>${head.map(c => `<th>${c}</th>`).join('')}</tr>${body.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`)
      continue
    }
    if (/^> /.test(l)) { flush(); const buf = []; while (i < lines.length && /^> ?/.test(lines[i])) buf.push(lines[i++].replace(/^> ?/, '')); out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`); continue }
    if (/^(#{1,4}) /.test(l)) { flush(); const m = l.match(/^(#{1,4}) (.*)$/); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue }
    if (/^---+$/.test(l.trim())) { flush(); out.push('<hr>'); i++; continue }
    if (/^[-*] /.test(l)) { flush(); const buf = []; while (i < lines.length && (/^[-*] /.test(lines[i]) || /^  \S/.test(lines[i]))) { if (/^[-*] /.test(lines[i])) buf.push(lines[i].slice(2)); else buf[buf.length - 1] += ' ' + lines[i].trim(); i++ } out.push(`<ul>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</ul>`); continue }
    if (/^\d+\. /.test(l)) { flush(); const buf = []; while (i < lines.length && (/^\d+\. /.test(lines[i]) || /^   \S/.test(lines[i]))) { if (/^\d+\. /.test(lines[i])) buf.push(lines[i].replace(/^\d+\. /, '')); else buf[buf.length - 1] += ' ' + lines[i].trim(); i++ } out.push(`<ol>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</ol>`); continue }
    if (l.trim() === '') { flush(); i++; continue }
    para.push(l.trim()); i++
  }
  flush()
  return out.join('\n')
}

const STYLE = `
  @page { margin: 22mm }
  body { font-family: Georgia, 'Times New Roman', serif; color:#1a1a1a; max-width:38em; margin:3em auto; line-height:1.65; padding:0 1em }
  h1 { font-size:1.8em; line-height:1.25; margin:0 0 .3em } h2 { font-size:1.25em; margin-top:2.4em } h3 { font-size:1.05em } h4 { font-size:1em }
  hr { border:0; border-top:1px solid #ccc; margin:2.5em auto; width:38% }
  blockquote { margin:1.4em 1.6em; font-style:italic; color:#333 }
  pre { font-family:Consolas, monospace; font-size:.8em; background:#f6f5f2; padding:1em; border-radius:4px; overflow-x:auto; white-space:pre-wrap }
  code { font-family:Consolas, monospace; font-size:.88em; background:#f4f2ee; padding:0 .25em }
  table { border-collapse:collapse; width:100%; font-size:.9em; margin:1.2em 0 }
  th,td { border-bottom:1px solid #ddd; text-align:left; padding:.45em .6em; vertical-align:top } th { color:#555 }
  em { color:#222 } ol li, ul li { margin:.45em 0 }
  .docnum { color:#888; font-size:.85em; letter-spacing:.12em; text-transform:uppercase; margin-bottom:.4em }
  .section-break { page-break-before: always }
  @media print { body { margin:0 auto } h2 { page-break-after: avoid } }
`
const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${STYLE}</style></head><body>
${body}
</body></html>
`

const read = (rel) => readFileSync(join(repo, rel), 'utf8')

// --- the manifest ---
const docs = [
  { n: '01', out: 'brief',               title: 'The Delivery Brief',            src: 'docs/BRIEF.md',
    carries: 'the whole work and how a cohort plays out, week 0 to the leaving' },
  { n: '02', out: 'university_onepager', title: 'The University One-Pager',      src: 'workshop/UNIVERSITY_ONEPAGER.md',
    carries: 'the one-page pitch — read this first if time is short' },
  { n: '03', out: 'curriculum',          title: 'The Curriculum',                src: 'workshop/CURRICULUM.md',
    carries: 'the ten-week arc, week by week' },
  { n: '04', out: 'ceremony',            title: 'The Opening Ceremony',          src: 'workshop/CEREMONY.md',
    carries: 'the week-one rite, run-of-show' },
  { n: '05', out: 'understanding_key',   title: 'Understanding as Key',          src: 'workshop/UNDERSTANDING_KEY.md',
    carries: 'the access ladder — how access deepens with demonstrated understanding' },
  { n: '06', out: 'preflight',           title: 'The Pre-Flight Checklist',      src: 'workshop/PREFLIGHT.md',
    carries: 'venue day: everything checked before the room arrives' },
  { n: '07', out: 'consent_registers',   title: 'The Consent Architecture',      src: null,
    carries: 'one agreement in four registers: plain language, legal, machine-readable, and Lexon',
    compose: () => [
      renderMd(read('workshop/consent/plain-language.md')),
      '<hr>',
      renderMd(read('workshop/consent/legal-stub.md')),
      '<hr>',
      renderMd(read('lexon/README.md')),
      '<h3>The laws, verbatim (.lex sources)</h3>',
      `<h4>consent_agreement.lex</h4><pre>${esc(read('lexon/consent_agreement.lex'))}</pre>`,
      `<h4>steward_fold.lex</h4><pre>${esc(read('lexon/steward_fold.lex'))}</pre>`,
      `<h4>babblefish_gate.lex</h4><pre>${esc(read('lexon/babblefish_gate.lex'))}</pre>`,
    ].join('\n') },
  { n: '08', out: 'letter_international_law', title: 'Letter — to the International-Law Chair', src: 'letters/letter-international-law-professor.md',
    carries: 'draft letter; sending remains a human act' },
  { n: '09', out: 'letter_cryptography', title: 'Letter — to the Cryptography Chair', src: 'letters/letter-cryptography-professor.md',
    carries: 'draft letter; sending remains a human act' },
  { n: '10', out: 'auto_research',       title: 'The Auto-Research Pattern',     src: 'docs/AUTO_RESEARCH.md',
    carries: 'the public-goods auto-research pattern: the moving ceiling, the dream cycle, the mage lineage' },
  { n: '11', out: 'suite_mapping',       title: 'The Suite Mapping',             src: 'docs/SUITE_MAPPING.md',
    carries: 'how these methods seat into the wider agentprivacy suite' },
  { n: '12', out: 'provenance',          title: 'Provenance — What the Students Keep', src: 'artifact/PROVENANCE.md',
    carries: 'the students\u2019 verifiable record as the mage\u2019s first trainers' },
  { n: '13', out: 'machine_setup',       title: 'Machine Setup',                 src: 'mage/MACHINE_SETUP.md',
    carries: 'a fresh machine from zero — no internet, no framework checkout' },
  { n: '14', out: 'readme_front_door',   title: 'The Front Door (README)',       src: 'README.md',
    carries: 'the instrument\u2019s front door: quickstart, the five answers, the map' },
]

// --- render each document ---
const rendered = []
for (const d of docs) {
  const body = `<p class="docnum">The Hitchhikers Workshop · handover package · document ${d.n} of ${String(docs.length).padStart(2, '0')}</p>\n`
    + (d.compose ? `<h1>${esc(d.title)}</h1>\n` + d.compose() : renderMd(read(d.src)))
  rendered.push({ ...d, body })
  writeFileSync(join(outDir, `${d.n}_${d.out}.html`), page(`${d.n} · ${d.title}`, body))
}

// --- cover and contents ---
const coverBody = `
<div style="margin-top:6em; text-align:center">
  <p class="docnum">handover package</p>
  <h1 style="font-size:2.2em">The Hitchhikers Workshop</h1>
  <p style="font-style:italic; font-size:1.1em; margin-top:.6em">the babblefish recursion — one understanding, three tongues,<br>a blind gate that checks it survives translation</p>
  <hr>
  <p>A public-goods research instrument for a masters cohort and a shared,<br>air-gapped local mage. Everything described is built, verified, and<br>replayable offline on one commodity machine.</p>
</div>
<h2>Contents</h2>
<table>
<tr><th></th><th>document</th><th>what it carries</th></tr>
${rendered.map(d => `<tr><td>${d.n}</td><td><strong>${esc(d.title)}</strong></td><td>${esc(d.carries)}</td></tr>`).join('\n')}
</table>
<h2>How a skeptic checks</h2>
<pre>node tools/check.mjs                 # nine gates: axioms → laws → every run re-derives
node tools/verify_run.mjs . &lt;run&gt;    # replay any verdict from saved bytes, no model, no net
node tools/corpus_pack.mjs --verify  # the training chain re-derives to the signed hash
node lexon/check.mjs                 # the law compiles; the absence claims hold
node tools/dream_cycle.mjs           # the standing watch — measure everything, fold nothing</pre>
<p>The full instrument (code, canon, runs, interfaces) travels as the
<code>hh_workshop</code> repository: <code>github.com/mitchuski/hh_workshop</code> —
the public upstream harness is <code>github.com/mitchuski/agentprivacy-harness</code>.</p>
<hr>
<p style="text-align:center"><em>Mitchell Travers · mitchell@soulbis.com · bound 2026-07-27</em></p>
<p style="text-align:center"><em>"This document travels at the speed of trust."</em></p>
`
writeFileSync(join(outDir, '00_cover_and_contents.html'), page('The Hitchhikers Workshop — Handover Package', coverBody))

// --- combined dossier ---
const dossier = coverBody + rendered.map(d => `<div class="section-break"></div>\n${d.body}`).join('\n')
writeFileSync(join(outDir, 'dossier.html'), page('The Hitchhikers Workshop — Handover Dossier', dossier))

console.log(`bound: ${docs.length + 1} pages + dossier → ${outDir}`)
