#!/usr/bin/env node
// sync_spool.mjs — carry the offline spool into the local wiki farm.
//
//   node fedwiki/sync_spool.mjs                     dry: list what would move
//   node fedwiki/sync_spool.mjs --copy <siteDir>    copy spool pages into a farm
//                                                   site's pages/ (local files)
//
// SCOPE, deliberately narrow: this script moves files on the facilitator's own
// machine (e.g. --copy C:/Users/mitch/.wiki/hh.workshop.localhost). It never
// pushes over HTTP, never touches a cookie, never crosses to another owner's
// site. The two outward legs beyond it are the First Person's door (T6/GR-8):
//
//   1. serving/pushing the site with owner credentials — use the existing
//      cookie-broker flow (fedwiki-cohere-sync skill; ~/.wiki/.creds/, raw
//      cookie never in an agent's context, push-audit.log appended);
//   2. casting toward the oasis (mitch.fm.ide.earth / hitchhikers.earth) —
//      the fork→cast→transmit loop walked by the bearer (OASIS_LOOP.md).
//
// It refuses to overwrite a page that differs on the far side unless --force:
// a concurrent farm session deleting or replacing fresh work is a documented
// hazard (the Act 18 loss) — surprise overwrites are how it happens.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'out')

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null }
const siteDir = opt('--copy')
const force = argv.includes('--force')

const spooled = existsSync(outDir) ? readdirSync(outDir).filter(f => f.endsWith('.json')).sort() : []
if (!spooled.length) { console.log('spool empty — nothing exported yet (fedwiki/export_page.mjs)'); process.exit(0) }

if (!siteDir) {
  console.log(`spool holds ${spooled.length} page(s):`)
  for (const f of spooled) {
    const p = JSON.parse(readFileSync(join(outDir, f), 'utf8'))
    console.log(`  ${f}  — "${p.title}" · ${p.story.length} items · ${p.story.filter(i => i.type === 'reference').length} reference(s)`)
  }
  console.log('\ndry run. To place into a local farm site:  node fedwiki/sync_spool.mjs --copy <siteDir>')
  console.log('(serving/pushing the site and casting to the oasis stay the First Person\'s — OASIS_LOOP.md)')
  process.exit(0)
}

const pagesDir = join(resolve(siteDir), 'pages')
if (!existsSync(resolve(siteDir))) { console.error(`sync_spool: site dir not found: ${siteDir} — create the farm site first (agentprivacy-wiki-sync skill scaffolds one)`); process.exit(1) }
mkdirSync(pagesDir, { recursive: true })

let placed = 0, skipped = 0
for (const f of spooled) {
  const slug = basename(f, '.json')
  const src = readFileSync(join(outDir, f), 'utf8')
  const dst = join(pagesDir, slug)
  if (existsSync(dst) && !force) {
    const cur = readFileSync(dst, 'utf8')
    if (cur !== src) { console.log(`  skip ${slug} — exists and DIFFERS on the far side (use --force to overwrite)`); skipped++; continue }
  }
  writeFileSync(dst, src)
  console.log(`  placed ${slug}`)
  placed++
}
console.log(`\n${placed} page(s) placed into ${pagesDir}${skipped ? `, ${skipped} skipped (differs — not overwritten)` : ''}.`)
