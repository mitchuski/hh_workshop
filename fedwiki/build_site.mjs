#!/usr/bin/env node
// build_site.mjs — the fedwiki auto-build: the whole workshop wiki, derived
// in one command.
//
//   node fedwiki/build_site.mjs
//
// Where export_page.mjs spools one page at a time, this walks the repo and
// spools the complete site into fedwiki/out/ — the generative-website
// pattern applied to the federation lane. Re-run any time; the spool is
// always a fresh projection of the ledgers. sync_spool.mjs still owns the
// copy to the local farm, and legs 3–4 (serve/push, cast to the oasis)
// stay the First Person's (OASIS_LOOP.md).
//
// Pages built:
//   hh-workshop            the hub (welcome) — [[links]] within the site,
//                          `reference` items across sites (never [[ ]])
//   the-claim-register     the 31 claims, by band
//   triptych-*             one per counted triptych (via export_page.mjs —
//                          its export-consent gate stays in the path)
//   the-steward-chain      provenance (via export_page.mjs)
//   the-workshop-law       the lexon lane (via export_page.mjs --md)
//   law-*                  one per .lex — full text in a fenced block
//   the-knowledge-web      the derived graph as a fenced ```hhgraph JSON
//                          block (the game42 ```game42 bridge pattern: the
//                          page IS the data; any consumer can eat the block)
//   the-roster             players (already consent-gated at join)
//   the-chronicles         index of session records
//
// Consent: participant material still passes export_page's ledger gate;
// everything else here is the workshop's own process record.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'
import { sha256Hex } from '../tools/kappa.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const out = join(here, 'out')
mkdirSync(out, { recursive: true })

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const itemId = (t) => sha256Hex(t).slice(0, 16)
const md = (text) => ({ type: 'markdown', id: itemId(text), text })
const ref = (site, slugName, title, text) => ({ type: 'reference', id: itemId(site + slugName + title), site, slug: slugName, title, text })
const OASIS_REFS = [
  ref('fm.ide.earth', 'the-three-mice', 'The Three Mice', 'the first circle of Hitchhiker FM — the oasis this workshop federates toward.'),
  ref('skill.localhost', 'agentprivacy-hitchhiker-fm', 'Hitchhiker FM', 'the kindred catalogue; Proof of Understanding ↔ understanding-as-key.'),
]
const page = (slugName, title, story) => {
  writeFileSync(join(out, `${slugName}.json`), JSON.stringify({ title, story, journal: [{ type: 'create', item: { title, story }, date: Date.now() }] }, null, 2) + '\n')
  built.push(slugName)
}
const spawnExport = (args) => {
  const r = spawnSync(process.execPath, [join(here, 'export_page.mjs'), ...args], { cwd: repo, encoding: 'utf8' })
  if (r.status !== 0) console.error(`  export refused: ${args.join(' ')}\n  ${(r.stderr || r.stdout).trim()}`)
  return r.status === 0
}
const built = []

// ---- ensure the derived graph is fresh --------------------------------------
spawnSync(process.execPath, [join(repo, 'web', 'graph.mjs')], { cwd: repo })
const graph = JSON.parse(readFileSync(join(repo, 'web', 'out', 'graph.json'), 'utf8'))
const measured = JSON.parse(spawnSync(process.execPath, [join(repo, 'tools', 'measure_debt.mjs')], { cwd: repo, encoding: 'utf8' }).stdout)

// ---- delegated pages (consent gates stay in export_page) --------------------
const triptychDirs = ['canon/seed-triptych']
if (existsSync(join(repo, 'artifact'))) for (const d of readdirSync(join(repo, 'artifact'))) {
  const p = join(repo, 'artifact', d)
  try { if (statSync(p).isDirectory() && existsSync(join(p, 'carry.json'))) triptychDirs.push(`artifact/${d}`) } catch {}
}
for (const t of triptychDirs) if (spawnExport(['--triptych', t])) built.push(`triptych (${t})`)
if (spawnExport(['--provenance'])) built.push('the-steward-chain')
if (spawnExport(['--md', 'lexon/README.md', '--slug', 'the-workshop-law'])) built.push('the-workshop-law')

// ---- the claim register -----------------------------------------------------
{
  const reg = readFileSync(join(repo, 'canon', 'UNDERSTANDING.md'), 'utf8')
  const story = [md(`# The Claim Register\n\nThe frozen census the babblefish gate probes — N=${measured.claims}, debt ${measured.debt} of ${measured.claims * 3} (claim, form) pairs. Grows only by keystone-accepted addition; the cohort graduates owning this file. See [[hh-workshop]] and [[the-knowledge-web]].`)]
  for (const section of reg.split('\n## ').slice(1)) {
    const lines = section.split('\n')
    if (!/^[A-F] · /.test(lines[0])) continue
    story.push(md(`## ${lines[0]}\n\n${lines.slice(1).join('\n').split('\n---')[0].trim()}`))
  }
  story.push(...OASIS_REFS)
  page('the-claim-register', 'The Claim Register', story)
}

// ---- one page per law -------------------------------------------------------
for (const f of readdirSync(join(repo, 'lexon')).filter(f => f.endsWith('.lex')).sort()) {
  const lex = readFileSync(join(repo, 'lexon', f), 'utf8').replace(/\r\n/g, '\n').trim()
  const title = (lex.match(/^LEX (.+)\.$/m) || [null, f])[1]
  const claims = existsSync(join(repo, 'lexon', f.replace(/\.lex$/, '.claims.json')))
    ? JSON.parse(readFileSync(join(repo, 'lexon', f.replace(/\.lex$/, '.claims.json')), 'utf8')) : []
  page(`law-${slug(title)}`, `Law — ${title}`, [
    md(`# Law — ${title}\n\nA workshop law in Lexon: prose a lawyer reads, structure a machine parses. Compiles under the spec-checker regime (\`node lexon/check.mjs\`). See [[the-workshop-law]].`),
    md('```lex\n' + lex + '\n```'),
    md(`## Relation claims\n\n${claims.map(c => `- \`${JSON.stringify(c.claim)}\` — must come back **${c.expect.replace('RELATION ', '')}**`).join('\n')}\n\nEvery PASS claim is verified with a falsifiability twin; every ABSENT claim proves the gate can refuse.`),
    ...OASIS_REFS,
  ])
}

// ---- the knowledge web (the game42 fenced-block bridge pattern) -------------
page('the-knowledge-web', 'The Knowledge Web', [
  md(`# The Knowledge Web\n\nThe workshop as a knowledge graph — ${graph.nodes.length} nodes, ${graph.edges.length} edges, DERIVED from the repo's ledgers by \`web/graph.mjs\` (never hand-authored; re-run = re-true). Spellweb dialect: typed nodes, snake_case verb edges. The fenced block below IS the data — any consumer can eat it, the way the Game of 42 eats \`\`\`game42 blocks.\n\nNode types: ${graph.nodeTypes.join(' · ')}\n\nEdge verbs: ${graph.edgeTypes.join(' · ')}`),
  md('```hhgraph\n' + JSON.stringify({ name: graph.name, nodes: graph.nodes, edges: graph.edges }) + '\n```'),
  ...OASIS_REFS,
])

// ---- the roster -------------------------------------------------------------
{
  const roster = existsSync(join(repo, 'game', 'roster.json')) ? JSON.parse(readFileSync(join(repo, 'game', 'roster.json'), 'utf8')) : { players: [] }
  const edges = existsSync(join(repo, 'game', 'edges.jsonl')) ? readFileSync(join(repo, 'game', 'edges.jsonl'), 'utf8').split('\n').filter(Boolean).length : 0
  page('the-roster', 'The Roster', [
    md(`# The Roster\n\nThe cohort's personas — consent-gated at join (no ledger row, no seat); each entry carries a room-scoped did:key and a κ-address. ${edges} earned trust edge(s) minted so far (mentor-assay · steward-fold · pair-swap · keystone-fold · seal-witness). See [[hh-workshop]].`),
    md(roster.players.map(p => `- **${p.name}** · persona ${p.persona || '—'} · tongues ${(p.tongues || []).join(', ') || '—'}\n  - \`${p.did}\`\n  - κ \`${p.kappa}\``).join('\n') || '(the roster opens with the first cohort)'),
    ...OASIS_REFS,
  ])
}

// ---- the chronicles index ---------------------------------------------------
{
  const items = [md(`# The Chronicles\n\nThe workshop's session records — verdict-first, reversals at win-prominence (GR-7). The lab notebook, pre-formatted.`)]
  for (const f of readdirSync(join(repo, 'chronicles')).filter(f => f.endsWith('.md')).sort()) {
    const text = readFileSync(join(repo, 'chronicles', f), 'utf8').replace(/\r\n/g, '\n')
    const title = (text.match(/^# (.+)$/m) || [null, f])[1]
    const verdict = (text.match(/\*\*Verdict first:\*\* ([\s\S]*?)(?:\n\n|\n##)/) || [null, ''])[1].replace(/\n/g, ' ').trim()
    items.push(md(`## ${title}\n\n${verdict}\n\n*(${f})*`))
  }
  items.push(...OASIS_REFS)
  page('the-chronicles', 'The Chronicles', items)
}

// ---- the hub ---------------------------------------------------------------
page('hh-workshop', 'HH Workshop', [
  md(`# HH Workshop\n\nA facilitated masters-cohort course around a shared, air-gapped local mage: the **babblefish recursion** — sci-fi narrative → poem → white paper → recurse — with a blind, hash-drawn gate checking that understanding survives translation. Understanding is the key; expressions are both key and food; a rotating steward trains the room's own mage; the cohort graduates owning its evaluation harness, three bound books, and verifiable provenance as the mage's first trainers.\n\ntranslation-debt: **${measured.debt}** of ${measured.claims * 3} (claim, form) pairs · ${graph.nodes.length}-node knowledge web`),
  md(`## The pages\n\n- [[the-claim-register]] — the frozen census the gate probes\n- [[the-knowledge-web]] — the workshop as a derived graph (the data rides in the page)\n- [[the-steward-chain]] — provenance: who trained the mage on what, when\n- [[the-workshop-law]] — the law, compiling (Lexon) · ${readdirSync(join(repo, 'lexon')).filter(f => f.endsWith('.lex')).map(f => `[[law-${slug((readFileSync(join(repo, 'lexon', f), 'utf8').match(/^LEX (.+)\.$/m) || [null, f])[1])}]]`).join(' · ')}\n- [[the-roster]] — the cohort's personas and earned trust edges\n- [[the-chronicles]] — the session records\n- triptych pages — one per counted rendering`),
  md(`## The rite\n\nOne good name per mage; carry your own resolver; consent is the first stake; the seal says *this room reached the shared mind together*. A trust that certifies itself is the one you cannot trust — so the doors stay human and the witnesses stay outside.`),
  ...OASIS_REFS,
])

console.log(`fedwiki site auto-built → fedwiki/out/ (${built.length} build steps)`)
console.log('  ' + built.join('\n  '))
console.log(`\nnext: node fedwiki/sync_spool.mjs [--copy <siteDir>]  ·  legs 3-4 = the First Person's (OASIS_LOOP.md)`)
