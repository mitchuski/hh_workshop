#!/usr/bin/env node
// bind_brief.mjs — render docs/BRIEF.md into the deliverable: a print-ready,
// self-contained page in the books' serif hand (File → Print → PDF).
//
//   node tools/bind_brief.mjs      → artifact/brief.html

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const md = readFileSync(join(repo, 'docs', 'BRIEF.md'), 'utf8').replace(/\r\n/g, '\n')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = (s) => esc(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')

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
  if (/^(#{1,3}) /.test(l)) { flush(); const m = l.match(/^(#{1,3}) (.*)$/); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue }
  if (/^---+$/.test(l.trim())) { flush(); out.push('<hr>'); i++; continue }
  if (/^[-*] /.test(l)) { flush(); const buf = []; while (i < lines.length && (/^[-*] /.test(lines[i]) || /^  \S/.test(lines[i]))) { if (/^[-*] /.test(lines[i])) buf.push(lines[i].slice(2)); else buf[buf.length - 1] += ' ' + lines[i].trim(); i++ } out.push(`<ul>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</ul>`); continue }
  if (/^\d+\. /.test(l)) { flush(); const buf = []; while (i < lines.length && (/^\d+\. /.test(lines[i]) || /^   \S/.test(lines[i]))) { if (/^\d+\. /.test(lines[i])) buf.push(lines[i].replace(/^\d+\. /, '')); else buf[buf.length - 1] += ' ' + lines[i].trim(); i++ } out.push(`<ol>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</ol>`); continue }
  if (l.trim() === '') { flush(); i++; continue }
  para.push(l.trim()); i++
}
flush()

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Hitchhikers Workshop — Brief</title>
<style>
  @page { margin: 24mm }
  body { font-family: Georgia, 'Times New Roman', serif; color:#1a1a1a; max-width:38em; margin:3em auto; line-height:1.65; padding:0 1em }
  h1 { font-size:1.8em; line-height:1.25; margin:0 0 .3em } h2 { font-size:1.25em; margin-top:2.4em } h3 { font-size:1.05em }
  hr { border:0; border-top:1px solid #ccc; margin:2.5em auto; width:38% }
  blockquote { margin:1.4em 1.6em; font-style:italic; color:#333 }
  pre { font-family:Consolas, monospace; font-size:.8em; background:#f6f5f2; padding:1em; border-radius:4px; overflow-x:auto }
  code { font-family:Consolas, monospace; font-size:.88em; background:#f4f2ee; padding:0 .25em }
  table { border-collapse:collapse; width:100%; font-size:.9em; margin:1.2em 0 }
  th,td { border-bottom:1px solid #ddd; text-align:left; padding:.45em .6em; vertical-align:top } th { color:#555 }
  em { color:#222 } ol li, ul li { margin:.45em 0 }
  @media print { body { margin:0 auto } h2 { page-break-after: avoid } }
</style></head><body>
${out.join('\n')}
</body></html>
`
writeFileSync(join(repo, 'artifact', 'brief.html'), html)
console.log('bound: artifact/brief.html — print to PDF for delivery')
