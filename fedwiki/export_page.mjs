#!/usr/bin/env node
// export_page.mjs — workshop output → FedWiki page JSON, into the offline spool.
//
//   node fedwiki/export_page.mjs --triptych <dir>            one page per triptych
//   node fedwiki/export_page.mjs --md <file> [--slug s]      any workshop markdown
//   node fedwiki/export_page.mjs --provenance                the steward-chain page
//
// Pages land in fedwiki/out/<slug>.json — the SPOOL. In air-gapped mode this
// is the whole story: the workshop is complete without a network. Back home,
// sync_spool.mjs copies the spool into a local farm site; casting toward
// fm.ide.earth / hitchhikers.earth is the bearer's outward act — the door
// (T6), never this script's.
//
// Shape matched against a live farm page (skill.localhost/pages/
// agentprivacy-hitchhiker-fm): story items {type:'markdown', id:<16-hex>,
// text}; cross-site links are {type:'reference', id, site, slug, title, text}
// — NEVER [[ ]] across sites (the 2026-07-07 chronicle's open item). [[ ]]
// stays legal only between this workshop's own pages.
//
// EXPORT CONSENT IS ENFORCED (hard constraint b): participant material
// (corpus/, non-seed artifact/) needs a CONSENT_LEDGER row with scope
// export|both, or the export refuses. Course-process records (canon/, runs/,
// chronicles/, mage/steward_log.md) are the workshop's own.
//
// Item ids are sha256-derived from content (deterministic — same input, same
// page bytes; only the journal date moves).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'
import { sha256Hex } from '../tools/kappa.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const outDir = join(here, 'out')
mkdirSync(outDir, { recursive: true })

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null }

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const itemId = (text) => sha256Hex(text).slice(0, 16)
const md = (text) => ({ type: 'markdown', id: itemId(text), text })
const ref = (site, slug, title, text) => ({ type: 'reference', id: itemId(site + slug + title), site, slug, title, text })

// the standing cross-site anchors of the hitchhiker federation (reference
// items, never [[ ]] — they live on other sites)
const OASIS_REFS = [
  ref('fm.ide.earth', 'the-three-mice', 'The Three Mice', 'the first circle of Hitchhiker FM; the oasis this workshop federates toward.'),
  ref('skill.localhost', 'agentprivacy-hitchhiker-fm', 'Hitchhiker FM', 'the kindred catalogue binding the FM specs to the agentprivacy corpus; Proof of Understanding ↔ understanding-as-key.'),
]

// ---- export consent ---------------------------------------------------------
function exportableSet() {
  const ledger = readFileSync(join(repo, 'corpus', 'CONSENT_LEDGER.md'), 'utf8')
  const ok = new Set()
  for (const line of ledger.split('\n')) {
    if (/^\s*~~.*~~\s*$/.test(line)) continue
    const m = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|[^|]+\|\s*((?:corpus|artifact|canon)\/[^|\s]+)\s*\|\s*(export|both)\s*\|/.exec(line)
    if (m) ok.add(m[1].trim().replace(/\/$/, ''))
  }
  return ok
}
function requireExportConsent(relPath, isSeed) {
  const needsConsent = /^(corpus|artifact)\//.test(relPath) && !isSeed
  if (!needsConsent) return
  if (!exportableSet().has(relPath.replace(/\/$/, ''))) {
    console.error(`consent: ${relPath} has no export-scope CONSENT_LEDGER row — an export needs the author's export|both consent; refused (hard constraint b)`)
    process.exit(1)
  }
}

const writePage = (slug, page) => {
  const p = join(outDir, `${slug}.json`)
  writeFileSync(p, JSON.stringify(page, null, 2) + '\n')
  console.log(`spooled: fedwiki/out/${slug}.json  (${page.story.length} items)`)
}
const journal = (title, story) => [{ type: 'create', item: { title, story }, date: Date.now() }]
const page = (title, story) => ({ title, story, journal: journal(title, story) })

// ---- modes ------------------------------------------------------------------
const triptychDir = opt('--triptych')
const mdFile = opt('--md')

if (triptychDir) {
  const d = resolve(repo, triptychDir)
  const rel = d.replace(/\\/g, '/').split('hh_workshop/')[1] || triptychDir
  const carry = JSON.parse(readFileSync(join(d, 'carry.json'), 'utf8'))
  const isSeed = rel === 'canon/seed-triptych'
  requireExportConsent(rel, isSeed)
  const forms = [
    ['sci-fi.md', 'narrative', 'the cast-forward tongue'],
    ['poem.md', 'poem', 'the compressed tongue'],
    ['white-paper.md', 'paper', 'the formal tongue'],
  ]
  const name = carry.triptych || basename(d)
  const slug = slugify(`triptych-${name}`)
  const story = [
    md(`# Triptych — ${name}\n\nstatus **${carry.status}** · one understanding, three tongues (the babblefish recursion). Carried claims per form are declared in carry.json and probed by a blind census gate — see [[hh-workshop]] for the harness.`),
  ]
  for (const [file, form, tag] of forms) {
    const p = join(d, file)
    if (!existsSync(p)) continue
    story.push(md(`## ${form} — ${tag}\n\ncarries: ${(carry[form] || []).join(', ') || '(none declared)'}\n\n---\n\n${readFileSync(p, 'utf8').replace(/\r\n/g, '\n').trim()}`))
  }
  story.push(...OASIS_REFS)
  writePage(slug, page(`Triptych — ${name}`, story))
} else if (mdFile) {
  const p = resolve(repo, mdFile)
  const rel = p.replace(/\\/g, '/').split('hh_workshop/')[1] || mdFile
  requireExportConsent(rel, false)
  const text = readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
  const title = (text.match(/^# (.+)$/m) || [null, basename(p, '.md')])[1]
  const slug = opt('--slug') || slugify(title)
  // split on H2s so the page forks into readable paragraphs, not one slab
  const chunks = text.split(/\n(?=## )/).map(s => s.trim()).filter(Boolean)
  const story = [...chunks.map(md), ...OASIS_REFS]
  writePage(slug, page(title, story))
} else if (argv.includes('--provenance')) {
  const log = readFileSync(join(repo, 'mage', 'steward_log.md'), 'utf8').replace(/\r\n/g, '\n')
  const story = [
    md(`# The Steward Chain\n\nThe re-derivable record of who trained this workshop's mage on what, when — the cohort's provenance as its first trainers. Verified offline with \`node tools/corpus_pack.mjs --verify\`. See [[hh-workshop]].`),
    md(log.trim()),
    ...OASIS_REFS,
  ]
  writePage('the-steward-chain', page('The Steward Chain', story))
} else {
  console.error('usage: node fedwiki/export_page.mjs --triptych <dir> | --md <file> [--slug s] | --provenance')
  process.exit(2)
}
