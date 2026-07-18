#!/usr/bin/env node
// check.mjs — one command. Run this first, and after every change.
//
//   node tools/check.mjs
//
// ADAPTED from dual-agent-harness/tools/check.mjs (see VENDOR.md): in the
// framework repo the instances are subdirectories; here the instance IS the
// repo root (hh_workshop carries its own vendored engine — T3). So the
// discovery step is replaced by a direct gate on the root instance. Everything
// else keeps the framework's order and discipline:
//
//   1. the axioms             — neg(bnot(x)) = succ(x), computed on all of Z/64Z
//   2. the engine's own tests — an outage must never be reported as exhaustion
//   3. this instance          — config + frontier coherent (conform.mjs .)
//   3a. every recorded run    — seeds and draws re-derive offline (verify_run)
//   4. the template refuses   — the blank must FAIL, for the right reasons
//
// Zero dependencies. Exit 0 only if everything passes. It prints what it ran,
// so a failure names the command you can re-run yourself.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const steps = []
const run = (label, args) => {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' })
  const out = ((r.stdout || '') + (r.stderr || '')).trim()
  const passed = r.status === 0
  steps.push({ label, cmd: `node ${args.join(' ')}`, passed, out })
  return passed
}

// ---- 1. the axioms -------------------------------------------------------
run('the axioms', ['engine/conform.mjs'])

// ---- 2. the engine's own tests -------------------------------------------
run('engine tests', ['engine/loop.test.mjs'])
run('gap tool tests', ['engine/gap.test.mjs'])
run('salt-mode tests', ['engine/loop.salt.test.mjs'])
run('claims register (enforced-by gate)', ['tools/check_claims.mjs'])

// ---- 3. this instance ----------------------------------------------------
run('instance: . (hh_workshop)', ['engine/conform.mjs', '.'])

// ---- 3a. verify every run offline — the chain re-derives (D5) -------------
if (existsSync(join(root, 'runs'))) run('verify runs', ['tools/verify_run.mjs', '.', '--all'])

// ---- 3b. the legal-language lane — law and code held to one voice ----------
if (existsSync(join(root, 'lexon', 'check.mjs'))) run('lexon laws compile', ['lexon/check.mjs'])

// ---- 4. the template refuses (negative test) ------------------------------
// templates/ is the blank a newcomer copies, and it is REQUIRED to fail —
// AND to fail for the right reasons (TODOs live, null-baseline check live).
{
  const r = spawnSync(process.execPath, ['engine/conform.mjs', 'templates'], { cwd: root, encoding: 'utf8' })
  const out = ((r.stdout || '') + (r.stderr || ''))
  const refused = r.status !== 0
  const citesTodo = /still contains "TODO"/.test(out)
  const citesBaseline = /baseline\.metric is null/.test(out)
  const passed = refused && citesTodo && citesBaseline
  steps.push({
    label: 'template refuses (negative test)',
    cmd: 'node engine/conform.mjs templates  # must FAIL, on TODOs *and* the null baseline',
    passed,
    out: passed
      ? 'the unfilled template is refused, and names both reasons'
      : !refused
        ? 'THE TEMPLATE CONFORMS. A newcomer would copy it, see PASS, and run a harness that grades nothing.'
        : `refused, but not for the required reasons — TODO detection: ${citesTodo ? 'live' : 'DEAD'}, null-baseline: ${citesBaseline ? 'live' : 'DEAD'}.`,
  })
}

// ---- report --------------------------------------------------------------
const failed = steps.filter(s => !s.passed)
const width = Math.max(...steps.map(s => s.label.length))

console.log('')
for (const s of steps) {
  const mark = s.passed ? '  ok  ' : ' FAIL '
  console.log(`${mark} ${s.label.padEnd(width)}  ${s.cmd}`)
}

if (failed.length) {
  for (const s of failed) {
    console.error(`\n──── ${s.label} ────`)
    console.error(s.out || '(no output)')
  }
  console.error(`\n${failed.length} of ${steps.length} gates FAILED. Nothing here is trustworthy until they pass.`)
  process.exit(1)
}
console.log(`\nALL ${steps.length} GATES PASS.`)
console.log('The algebra holds, an outage cannot masquerade as exhaustion, the instance conforms, every recorded run re-derives.')
