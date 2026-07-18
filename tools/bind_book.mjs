#!/usr/bin/env node
// bind_book.mjs — bind the course's validated renderings into leave-with-it
// artefacts: a Book of Poems, the Collected Papers, and the Story Anthology.
//
//   node tools/bind_book.mjs        → artifact/book_of_poems.html
//                                     artifact/collected_papers.html
//                                     artifact/story_anthology.html
//
// Sources: canon/seed-triptych/ + artifact/*/ whose carry.json status is
// "canary" or "validated" — the same population measure_debt.mjs counts, so
// the books never bind what the gate has not seen. Print-ready, single-file
// HTML (File → Print → PDF); no external assets, air-gap safe.
//
// EXPORT CONSENT IS ENFORCED: a book is an export. The seed triptych rides on
// the First Person's ledger line; any other triptych needs a CONSENT_LEDGER
// row covering its artifact/<dir> path with scope export|both, or the bind
// refuses (hard constraint b).
//
// Each book ends with the PROVENANCE page: the steward chain from
// mage/steward_log.md — the record that these authors began this mage's
// training.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))

// ---- sources ----------------------------------------------------------------
const triptychs = []
const consider = (dir, rel, isSeed) => {
  const cj = join(dir, 'carry.json')
  if (!existsSync(cj)) return
  const carry = JSON.parse(readFileSync(cj, 'utf8'))
  if (!['canary', 'validated'].includes(carry.status)) return
  triptychs.push({ dir, rel, isSeed, carry })
}
consider(join(repo, 'canon', 'seed-triptych'), 'canon/seed-triptych', true)
const artDir = join(repo, 'artifact')
if (existsSync(artDir)) {
  for (const name of readdirSync(artDir)) {
    const p = join(artDir, name)
    try { if (statSync(p).isDirectory()) consider(p, `artifact/${name}`, false) } catch {}
  }
}

// ---- export consent ---------------------------------------------------------
const ledger = readFileSync(join(repo, 'corpus', 'CONSENT_LEDGER.md'), 'utf8')
const exportable = new Set()
for (const line of ledger.split('\n')) {
  if (/^\s*~~.*~~\s*$/.test(line)) continue
  const m = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|[^|]+\|\s*((?:corpus|artifact|canon)\/[^|\s]+)\s*\|\s*(export|both)\s*\|/.exec(line)
  if (m) exportable.add(m[1].trim().replace(/\/$/, ''))
}
const refused = triptychs.filter(t => !t.isSeed && !exportable.has(t.rel))
if (refused.length) {
  for (const t of refused) console.error(`consent: ${t.rel} has no export-scope CONSENT_LEDGER row — a book is an export; refused (hard constraint b)`)
  process.exit(1)
}

// ---- markdown → minimal html (headings, em, hr, paragraphs) -----------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let para = []
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = [] } }
  const inline = (s) => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (/^#{1,3} /.test(line)) { flush(); const h = line.match(/^(#{1,3}) (.*)$/); out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`) }
    else if (/^---+$/.test(line.trim())) { flush(); out.push('<hr>') }
    else if (line.trim() === '') flush()
    else para.push(line.trim())
  }
  flush()
  return out.join('\n')
}

// poems keep their line breaks — verse is not prose
function poemToHtml(md) {
  const body = md.replace(/\r\n/g, '\n')
    .replace(/^# .*$/m, '').replace(/^\*[^*]+\*$/m, '').replace(/^---+$/mg, '')
  const stanzas = body.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  return stanzas.map(s => `<p class="stanza">${s.split('\n').map(l => esc(l)).join('<br>')}</p>`).join('\n')
}

// ---- provenance page --------------------------------------------------------
const logPath = join(repo, 'mage', 'steward_log.md')
const stewardLog = existsSync(logPath) ? readFileSync(logPath, 'utf8') : ''
const provenance = `
<section class="provenance">
<h2>Provenance</h2>
<p>These pages were rendered inside a facilitated workshop around a shared,
air-gapped local model — the mage — and every rendering here passed, or seeds,
a blind translation gate (<code>harness.config.mjs</code>, the babblefish
census). The authors of these pages are the mage's first trainers: their
consented expressions are its corpus, and the steward chain below is the
re-derivable record of every fold (<code>node tools/corpus_pack.mjs --verify</code>).</p>
<pre class="log">${esc(stewardLog.trim())}</pre>
</section>`

// ---- bind -------------------------------------------------------------------
const CSS = `
  @page { margin: 22mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 34em; margin: 3em auto; line-height: 1.6; padding: 0 1em; }
  h1 { font-size: 1.9em; letter-spacing: .01em; margin: 0 0 .2em; }
  h2 { font-size: 1.35em; margin-top: 2.2em; page-break-before: always; }
  h2:first-of-type { page-break-before: avoid; }
  h3 { font-size: 1.05em; }
  .subtitle { color: #666; font-style: italic; margin-bottom: 3em; }
  .piece-meta { color: #777; font-size: .85em; margin: -0.4em 0 1.6em; }
  .stanza { white-space: normal; margin: 1.1em 0; }
  hr { border: 0; border-top: 1px solid #ccc; margin: 2.5em auto; width: 38%; }
  .provenance { margin-top: 4em; page-break-before: always; }
  .log { font-family: Consolas, monospace; font-size: .72em; white-space: pre-wrap; background: #f6f5f2; padding: 1em; border-radius: 4px; }
  code { font-family: Consolas, monospace; font-size: .9em; background: #f4f2ee; padding: 0 .25em; }
  @media print { body { margin: 0 auto; } }
`
const page = (title, subtitle, bodyHtml) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head>
<body>
<h1>${esc(title)}</h1>
<p class="subtitle">${esc(subtitle)}</p>
${bodyHtml}
${provenance}
</body></html>
`

const titleOf = (md, fallback) => (md.match(/^# (.+)$/m) || [null, fallback])[1]
const forms = [
  { file: 'poem.md', out: 'book_of_poems.html', title: 'The Book of Poems', sub: 'the compressed tongue of the babblefish recursion — one understanding, made sayable', render: poemToHtml },
  { file: 'white-paper.md', out: 'collected_papers.html', title: 'The Collected Papers', sub: 'the formal tongue — the same understanding, made checkable', render: mdToHtml },
  { file: 'sci-fi.md', out: 'story_anthology.html', title: 'The Story Anthology', sub: 'the cast-forward tongue — the same understanding, made habitable', render: mdToHtml },
]

const wrote = []
for (const f of forms) {
  const pieces = []
  for (const t of triptychs) {
    const p = join(t.dir, f.file)
    if (!existsSync(p)) continue
    const md = readFileSync(p, 'utf8')
    pieces.push(`<h2>${esc(titleOf(md, t.carry.triptych || t.rel))}</h2>
<p class="piece-meta">${esc(t.rel)} · ${esc(t.carry.status)}${t.isSeed ? ' · the canary' : ''}</p>
${f.render(md)}`)
  }
  const out = join(repo, 'artifact', f.out)
  writeFileSync(out, page(f.title, f.sub, pieces.join('\n<hr>\n')))
  wrote.push({ out: `artifact/${f.out}`, pieces: pieces.length })
}

console.log(JSON.stringify({ triptychsBound: triptychs.map(t => `${t.rel} (${t.carry.status})`), wrote }, null, 2))
