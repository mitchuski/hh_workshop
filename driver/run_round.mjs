#!/usr/bin/env node
// run_round.mjs — the standalone round runner: measure → salt → run → persist.
//
//   node driver/run_round.mjs --stub --run smoke
//   node driver/run_round.mjs --model <name> --run r1 [--triptych artifact/t1] [--host http://127.0.0.1:11434]
//
// What the Claude Code Workflow tool does for the framework, this does for a
// mage box with nothing but Node: it drives engine/dual_agent_loop.mjs with a
// local rt (stub or Ollama), then PERSISTS the audit trail the seats cannot
// write themselves (pure-data seats — see harness.config.mjs header):
//
//   runs/<runId>/<roundId>/p<i>-<leverId>/proposal_canon.json   exact canonical bytes
//   runs/<runId>/<roundId>/p<i>-<leverId>/gap.json              salted seed + census draw (engine-derived)
//   runs/<runId>/<roundId>/p<i>-<leverId>/verdict.json          the assay's verdict (+ coverage stanza)
//   runs/<runId>/<roundId>/CHRONICLE_DRAFT.md                   the chronicle seat's full draft
//   runs/<runId>/run.json                                       round summary (never the salt secret)
//
// tools/verify_run.mjs replays every seed and draw from these bytes offline;
// tools/check.mjs runs it over all recorded runs on every check.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { runHarness } from '../engine/dual_agent_loop.mjs'
import { canonicalize, sha256Hex } from '../engine/gap.mjs'
import { makeStubRt } from './stub_rt.mjs'
import { makeOllamaRt } from './ollama_rt.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))

// ---- args -------------------------------------------------------------------
const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null }
const stub = argv.includes('--stub')
const model = opt('--model') || process.env.HH_MODEL || null
const host = opt('--host') || 'http://127.0.0.1:11434'
const runId = opt('--run')
const triptychDir = opt('--triptych')
const maxRounds = opt('--max-rounds') ? Number(opt('--max-rounds')) : null
if (!runId) { console.error('usage: node driver/run_round.mjs [--stub | --model <name>] --run <runId> [--triptych <dir>] [--host <url>]'); process.exit(2) }
if (!stub && !model) { console.error('run_round: pick a driver — --stub for the deterministic smoke driver, or --model <name> (or $HH_MODEL) for the mage'); process.exit(2) }

// ---- 1. measure (the counting rule, code-side) ------------------------------
const m = spawnSync(process.execPath, [join(repo, 'tools', 'measure_debt.mjs')], { encoding: 'utf8' })
if (m.status !== 0) { console.error('run_round: measure_debt failed:\n' + (m.stderr || m.stdout)); process.exit(1) }
const measured = JSON.parse(m.stdout)
console.log(`measured: debt=${measured.debt} over N=${measured.claims} claims × 3 forms`)

// ---- 2. the run secret + source binding (D1: after-commit, grind-proof) -----
const saltSecret = randomBytes(32).toString('hex')                       // never written anywhere
const sourceHash = sha256Hex(readFileSync(join(repo, 'canon', 'UNDERSTANDING.md'), 'utf8'))

// ---- 3. optional triptych mount --------------------------------------------
let triptych = null
if (triptychDir) {
  const d = resolve(repo, triptychDir)
  const carry = JSON.parse(readFileSync(join(d, 'carry.json'), 'utf8'))
  triptych = {
    dir: d.replace(/\\/g, '/'),
    title: carry.title || carry.triptych || triptychDir,
    carry: { narrative: carry.narrative || [], poem: carry.poem || [], paper: carry.paper || [] },
    texts: {
      narrative: readFileSync(join(d, 'sci-fi.md'), 'utf8'),
      poem: readFileSync(join(d, 'poem.md'), 'utf8'),
      paper: readFileSync(join(d, 'white-paper.md'), 'utf8'),
    },
  }
  console.log(`mounted triptych: ${triptych.title}`)
}

// ---- 4. the rt, with a tap that records full seat outputs -------------------
const base = stub ? makeStubRt() : makeOllamaRt({ model, host })
const taps = []
const rt = {
  ...base,
  agent: async (prompt, opts = {}) => {
    const r = await base.agent(prompt, opts)
    taps.push({ label: opts.label || '(unlabelled)', ok: r != null, result: r })
    return r
  },
}

// ---- 5. run -----------------------------------------------------------------
const baseConfig = (await import(pathToFileURL(join(repo, 'harness.config.mjs')).href)).default
// --max-rounds bounds a session (e.g. one live round per workshop week); the
// config's stop rule is otherwise untouched.
const config = maxRounds ? { ...baseConfig, stop: { ...baseConfig.stop, maxRounds } } : baseConfig
const result = await runHarness(config, rt, { repo, root: repo, runId, saltSecret, sourceHash, measured, triptych })

// ---- 6. persist the audit trail --------------------------------------------
const tapFor = (prefix, key) => taps.find(t => t.label === `${prefix}:${key}`)?.result || null
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n')

for (const round of result.detail || []) {
  const roundDir = join(repo, 'runs', runId, round.roundId)
  mkdirSync(roundDir, { recursive: true })
  ;(round.proposals || []).forEach((p, i) => {
    const d = (round.holdApart || [])[i]
    if (!d) return   // legacy mode — nothing engine-derived to persist
    const pdir = join(roundDir, `p${i + 1}-${p.leverId}`)
    mkdirSync(pdir, { recursive: true })
    // exact canonical bytes, no trailing newline — the auditor's route to the seed (CR-7)
    writeFileSync(join(pdir, 'proposal_canon.json'), canonicalize(p))
    const gapSeat = tapFor('gap', p.leverId)
    writeJson(join(pdir, 'gap.json'), {
      hSource: d.hSource, hProposal: d.hProposal, salt: d.salt, seedHex: d.seedHex,
      mode: d.mode, N: d.N, count: d.count, drawIndices: d.drawIndices,
      draw: gapSeat?.draw || null, transcript: gapSeat?.transcript || null,
    })
    const verdict = (round.verdicts || []).find(v => v.leverId === p.leverId) || null
    if (verdict) {
      // Keystone-facing cross-check: stamp what the probed tongue actually
      // DECLARES next to what the seat reported. A "full pass" whose
      // denominator differs from the declared census is for the keystone to
      // judge, and should never require digging to notice (learned from run
      // w0-test: paper declared 9, the seat reported 8/8).
      let probeDeclared = null
      if (triptych && d.seedHex) {
        const probeForm = ['narrative', 'poem', 'paper'][parseInt(d.seedHex.slice(0, 8), 16) % 3]
        probeDeclared = { form: probeForm, declaredClaims: (triptych.carry[probeForm] || []).length }
      }
      writeJson(join(pdir, 'verdict.json'), verdict.status === 'VALIDATED'
        ? { ...verdict, coverage: { mode: d.mode, detection: d.mode === 'census' ? 'always — every claim probed' : `${d.count}/${d.N}` }, ...(probeDeclared ? { probeDeclared } : {}) }
        : verdict)
    }
  })
  const chronicle = tapFor('chronicle', round.roundId)
  if (typeof chronicle === 'string' && chronicle.trim()) writeFileSync(join(roundDir, 'CHRONICLE_DRAFT.md'), chronicle + '\n')
}

const summary = {
  name: result.name, runId, status: result.status, rounds: result.rounds, tally: result.tally,
  confirmed: result.confirmed, models: stub ? { proposer: 'stub', prover: 'stub' } : { proposer: model, prover: model },
  phiInference: stub ? 0 : result.phiInference,
  measured: { debt: measured.debt, claims: measured.claims }, sourceHash,
  triptych: triptych ? triptych.title : null,
  keystoneTodo: result.keystoneTodo,
}
mkdirSync(join(repo, 'runs', runId), { recursive: true })
writeJson(join(repo, 'runs', runId, 'run.json'), summary)

// ---- 7. report --------------------------------------------------------------
console.log('\n' + JSON.stringify(summary, null, 2))
console.log(`\nverify:  node tools/verify_run.mjs . ${runId}`)
console.log(`render:  node tools/render_run.mjs . ${runId}`)
if (result.status !== 'COMPLETE') process.exit(1)
