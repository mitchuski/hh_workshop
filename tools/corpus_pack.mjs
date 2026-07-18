#!/usr/bin/env node
// corpus_pack.mjs — the training loop, v1 (claim C13: ship the good).
//
//   node tools/corpus_pack.mjs             build mage/context_pack.md + refresh mage/Modelfile
//   node tools/corpus_pack.mjs --verify    re-derive the pack hash; compare to the latest
//                                          steward_log.md entry; exit 1 on mismatch
//
// Packs every CONSENTED corpus/*.md into one deterministic context pack the
// mage is grounded in (retrieval/context — weight fine-tuning is the parked
// "perfect", MACHINE_SETUP.md option B). CONSENT IS ENFORCED HERE: a corpus
// file with no covering line in CONSENT_LEDGER.md (scope corpus|both) fails
// the pack — the hard constraint reaches the pipe, not just the prose.
//
// The pack hash is the provenance link: the steward logs it per fold in
// mage/steward_log.md, and --verify replays it, so "who trained the mage on
// what, when" is a re-derivable chain, not a story.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { sha256Hex } from './kappa.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const verify = process.argv.includes('--verify')

// ---- 1. the ledger ----------------------------------------------------------
const ledgerPath = join(repo, 'corpus', 'CONSENT_LEDGER.md')
const ledger = readFileSync(ledgerPath, 'utf8')
const consented = new Map()   // corpus path (posix, repo-relative) -> scope
for (const line of ledger.split('\n')) {
  if (/^\s*~~.*~~\s*$/.test(line)) continue              // struck row = withdrawn
  const m = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|[^|]+\|\s*(corpus\/[^|\s]+)\s*\|\s*(corpus|export|both)\s*\|/.exec(line)
  if (m) consented.set(m[1].trim(), m[2].trim())
}

// ---- 2. the corpus ----------------------------------------------------------
const corpusDir = join(repo, 'corpus')
const files = readdirSync(corpusDir).filter(f => f.endsWith('.md') && f !== 'CONSENT_LEDGER.md').sort()
const errs = []
const parts = []
for (const f of files) {
  const rel = `corpus/${f}`
  const scope = consented.get(rel)
  if (!scope || (scope !== 'corpus' && scope !== 'both')) {
    errs.push(`${rel}: NO covering consent line (scope corpus|both) in CONSENT_LEDGER.md — refused (hard constraint b)`)
    continue
  }
  parts.push({ rel, text: readFileSync(join(corpusDir, f), 'utf8').replace(/\r\n/g, '\n') })
}
if (errs.length) {
  for (const e of errs) console.error('consent: ' + e)
  process.exit(1)
}

// ---- 3. the pack (deterministic bytes → deterministic hash) -----------------
const body = parts.map(p => `<!-- ${p.rel} -->\n\n${p.text.trim()}\n`).join('\n---\n\n')
const pack = [
  '# context_pack.md — the room, packed for the mage',
  '',
  `built from ${parts.length} consented corpus file(s); rebuilt by the weekly steward`,
  '(mage/STEWARD.md); refused without consent (corpus/CONSENT_LEDGER.md).',
  '',
  '---',
  '',
  body,
].join('\n')
const packHash = sha256Hex(pack)

if (verify) {
  const logPath = join(repo, 'mage', 'steward_log.md')
  const log = existsSync(logPath) ? readFileSync(logPath, 'utf8') : ''
  const hashes = [...log.matchAll(/pack sha256: `([0-9a-f]{64})`/g)].map(m => m[1])
  const latest = hashes[hashes.length - 1] || null
  if (!latest) { console.error('verify: no pack hash recorded in mage/steward_log.md yet'); process.exit(1) }
  if (latest !== packHash) {
    console.error(`verify: MISMATCH — steward_log latest ${latest}\n        re-derived            ${packHash}\nThe corpus has moved since the last logged fold: run corpus_pack and log the new hash, or find what changed.`)
    process.exit(1)
  }
  console.log(`verify: pack hash re-derives — ${packHash} (matches latest steward_log entry)`)
  process.exit(0)
}

writeFileSync(join(repo, 'mage', 'context_pack.md'), pack)

// ---- 4. refresh the Modelfile (keeps FACILITATOR.md + pack in one artefact) --
const facPath = join(repo, 'mage', 'FACILITATOR.md')
if (existsSync(facPath)) {
  const persona = readFileSync(facPath, 'utf8').replace(/\r\n/g, '\n')
  const modelfile = [
    '# Modelfile — regenerate with: node tools/corpus_pack.mjs',
    '# Build the room-grounded mage:  ollama create hh-mage -f mage/Modelfile',
    '# Base model: set FROM to what the box carries (ollama list).',
    'FROM gemma3:12b',
    'PARAMETER temperature 0.7',
    'SYSTEM """',
    persona.trim(),
    '',
    '--- THE ROOM (context pack, consent-gated; pack sha256 ' + packHash + ') ---',
    '',
    pack.trim().replace(/"""/g, '\\"\\"\\"'),
    '"""',
    '',
  ].join('\n')
  writeFileSync(join(repo, 'mage', 'Modelfile'), modelfile)
}

console.log(JSON.stringify({ files: parts.map(p => p.rel), packHash, wrote: ['mage/context_pack.md', existsSync(facPath) ? 'mage/Modelfile' : null].filter(Boolean) }, null, 2))
console.log('\nsteward: log this fold in mage/steward_log.md —  pack sha256: `' + packHash + '`')
