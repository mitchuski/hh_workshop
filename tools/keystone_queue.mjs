#!/usr/bin/env node
// keystone_queue.mjs — everything waiting on a human, in one document.
//
//   node tools/keystone_queue.mjs     → KEYSTONE_QUEUE.md (repo root) + stdout
//
// The auto-research split is: the instrument measures and proposes; a human
// folds and opens doors. This walks the ledgers and derives the human's
// worklist — submitted triptychs with their declared-vs-reported counts,
// VALIDATED verdicts no one has folded, chronicle drafts unfiled, and the
// standing doors — so review starts from one page instead of a dig.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const readJson = (p, d = null) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return d } }

const frontier = readJson(join(repo, 'frontier.json'), {})
const foldedLevers = new Set((frontier.best?.leverIds) || [])

// ---- submitted triptychs ----------------------------------------------------
const submitted = []
if (existsSync(join(repo, 'artifact'))) for (const d of readdirSync(join(repo, 'artifact'))) {
  const p = join(repo, 'artifact', d)
  try {
    if (!statSync(p).isDirectory()) continue
    const c = readJson(join(p, 'carry.json'))
    if (c?.status === 'submitted') submitted.push({ dir: `artifact/${d}`, ...c })
  } catch {}
}

// ---- unfolded VALIDATED verdicts + chronicle drafts ------------------------
const candidates = []
const drafts = []
if (existsSync(join(repo, 'runs'))) for (const rid of readdirSync(join(repo, 'runs'))) {
  // stub rounds exercise the loop; their drafts are not keystone work
  const summary = readJson(join(repo, 'runs', rid, 'run.json'))
  if (summary?.models?.proposer === 'stub') continue
  const walk = (dir, round) => {
    let es = []; try { es = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of es) {
      if (!e.isDirectory()) {
        if (e.name === 'CHRONICLE_DRAFT.md') drafts.push(join(dir, e.name).split('hh_workshop')[1].replace(/\\/g, '/').slice(1))
        continue
      }
      const p = join(dir, e.name)
      if (!/^p\d+-/.test(e.name)) { walk(p, e.name); continue }
      const v = readJson(join(p, 'verdict.json'))
      const prop = readJson(join(p, 'proposal_canon.json'))
      if (v?.status === 'VALIDATED' && !foldedLevers.has(v.leverId)) {
        candidates.push({
          run: rid, round, leverId: v.leverId, lens: prop?.lens, title: prop?.title,
          gateResult: v.gateResult, metric: v.metric,
          probeDeclared: v.probeDeclared || null,
          mismatch: v.probeDeclared && /^(\d+)\/(\d+)$/.test(String(v.gateResult || '')) &&
            Number(String(v.gateResult).split('/')[1]) !== v.probeDeclared.declaredClaims,
        })
      }
    }
  }
  walk(join(repo, 'runs', rid), null)
}

// ---- assemble ---------------------------------------------------------------
const doors = [
  'university partner selection + sending the letters (letters/)',
  'git commits / pushes — hh_workshop (no repo yet), dual-agent-harness (modified)',
  'sync_spool --copy into the live farm; the cast toward the oasis (OASIS_LOOP.md)',
  'mage-box hardware + model choice; LoRA option B decision',
  'counsel review of workshop/consent/legal-stub.md',
  'lexon_pvm census fold of workshop terms (docs/SUITE_MAPPING.md)',
]
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
const lines = [
  `# KEYSTONE QUEUE — derived ${stamp}`,
  '',
  '*Everything waiting on a human. The instrument measured and proposed;*',
  '*nothing below happens until the First Person (or the keystone pair) acts.*',
  `*Regenerate: \`node tools/keystone_queue.mjs\`.*`,
  '',
  `## 1 · Triptychs at the gate (${submitted.length})`,
  '',
  ...(submitted.length ? submitted.flatMap(t => [
    `### ${t.triptych} — \`${t.dir}\``,
    `- declares: narrative ${t.narrative?.length ?? 0} · poem ${t.poem?.length ?? 0} · paper ${t.paper?.length ?? 0}`,
    `- decision: promote \`status\` to \`validated\` (debt falls on next measure) · or send back for revision · or leave at the gate`,
    '',
  ]) : ['nothing at the gate.', '']),
  `## 2 · VALIDATED, unfolded (${candidates.length})`,
  '',
  candidates.length
    ? '| run | lever | lens | gate | declared | flag |\n|---|---|---|---|---|---|\n' +
      candidates.map(c => `| ${c.run} | ${c.leverId} | ${c.lens || ''} | ${c.gateResult || ''} | ${c.probeDeclared ? `${c.probeDeclared.declaredClaims} (${c.probeDeclared.form})` : '—'} | ${c.mismatch ? '**COUNT MISMATCH — review before fold**' : ''} |`).join('\n')
    : 'no unfolded VALIDATED verdicts.',
  '',
  'Folding is the keystone pair\'s act: frontier.json first, prose second (GR-1); conform green before and after (G0).',
  '',
  `## 3 · Chronicle drafts to review + file (${drafts.length})`,
  '',
  ...(drafts.length ? drafts.map(d => `- \`${d}\``) : ['none.']),
  '',
  `## 4 · The standing doors`,
  '',
  ...doors.map(d => `- 🚪 ${d}`),
  '',
]
const doc = lines.join('\n')
writeFileSync(join(repo, 'KEYSTONE_QUEUE.md'), doc + '\n')
console.log(doc)
console.log('\nwritten: KEYSTONE_QUEUE.md')
