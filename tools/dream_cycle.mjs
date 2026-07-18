#!/usr/bin/env node
// dream_cycle.mjs — the measure-only standing watch (AUTO_RESEARCH §2).
//
//   node tools/dream_cycle.mjs        run the watch once; write a dated report
//
// The safest autonomous posture: measure everything, fold nothing, open no
// door. Runs the counting rule, replays every recorded run offline, verifies
// the steward chain, compiles the laws, walks the full gate suite, re-derives
// the knowledge web, and snapshots the board — then files a dated watch
// report under chronicles/watch/. Exit 0 only if the whole watch is green;
// a red watch names the command that failed so a human can re-run it.
//
// Schedule it (venue's call): a cron/loop invoking this nightly gives the
// instrument its dream cycle — surfacing drift while the room sleeps,
// changing nothing. Proposal rounds (driver/run_round.mjs) can also run
// unattended; their verdicts queue as candidates in the keystone queue
// (tools/keystone_queue.mjs) — folding stays a human act.

import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))
const watchDir = join(repo, 'chronicles', 'watch')
mkdirSync(watchDir, { recursive: true })

const steps = []
const run = (label, args) => {
  const t0 = Date.now()
  const r = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8' })
  const out = ((r.stdout || '') + (r.stderr || '')).trim()
  steps.push({ label, cmd: `node ${args.join(' ')}`, ok: r.status === 0, ms: Date.now() - t0, tail: out.split('\n').slice(-3).join('\n') })
  return { ok: r.status === 0, out }
}

const measure = run('the counting rule', ['tools/measure_debt.mjs'])
run('every run replays offline', ['tools/verify_run.mjs', '.', '--all'])
run('the steward chain holds', ['tools/corpus_pack.mjs', '--verify'])
run('the laws compile', ['lexon/check.mjs'])
run('the knowledge web re-derives', ['web/graph.mjs'])
run('all gates', ['tools/check.mjs'])

let debt = null, graphStats = null
try { debt = JSON.parse(measure.out) } catch {}
try { const g = JSON.parse(readFileSync(join(repo, 'web', 'out', 'graph.json'), 'utf8')); graphStats = { nodes: g.nodes.length, edges: g.edges.length } } catch {}
const submitted = []
if (existsSync(join(repo, 'artifact'))) {
  for (const d of readdirSync(join(repo, 'artifact'))) {
    try {
      const c = JSON.parse(readFileSync(join(repo, 'artifact', d, 'carry.json'), 'utf8'))
      if (c.status === 'submitted') submitted.push(c.triptych)
    } catch {}
  }
}

const green = steps.every(s => s.ok)
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
const report = [
  `# Watch — ${stamp}`,
  '',
  `**${green ? 'GREEN' : 'RED'}.** The standing watch: measured everything, folded nothing, opened no door.`,
  '',
  '| check | result | took |',
  '|---|---|---|',
  ...steps.map(s => `| ${s.label} | ${s.ok ? 'ok' : `**FAIL** — \`${s.cmd}\``} | ${(s.ms / 1000).toFixed(1)}s |`),
  '',
  `- translation-debt: **${debt?.debt ?? '?'}** (${debt?.carried ?? '?'}/${(debt?.claims ?? 0) * 3} carried)`,
  `- the web: ${graphStats ? `${graphStats.nodes} nodes · ${graphStats.edges} edges` : '(not derived)'}`,
  submitted.length ? `- at the gate, awaiting the keystone: ${submitted.join(' · ')}` : '- nothing waiting at the gate',
  '',
  green ? '_Nothing to wake anyone for._' : '_A red watch wakes the facilitator: re-run the named command._',
  '',
].join('\n')

const file = join(watchDir, `${new Date().toISOString().slice(0, 10)}_watch.md`)
writeFileSync(file, report)
console.log(report)
console.log(`filed: chronicles/watch/${file.split(/[\\/]/).pop()}`)
process.exit(green ? 0 : 1)
