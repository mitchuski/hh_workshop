#!/usr/bin/env node
// lexon/check.mjs — the legal-language compiling gate for hh_workshop.
//
//   node lexon/check.mjs [--json]
//
// "Compiling" here is the lexon_pvm SPEC-CHECKER REGIME (no public Lexon
// compiler exists for this platform — see lexon/README.md): every workshop
// law written in the attested Lexon subset must
//
//   1. pass the base grammar gate (parse → noun binding → triple round-trip
//      → promise typing): tools/lexon_check.mjs
//   2. satisfy every relation claim in its .claims.json — including the
//      falsifiability twin (a minimally mutated contract must still
//      gate-pass yet FAIL the claim, or the claim proves nothing), and
//      including the NEGATIVE expectations (a claim that must come back
//      RELATION ABSENT — a gate that cannot fail is worth less than none)
//
// Both tools run their own selftests first (the canary: three lexon.org
// goldens pass, mutants fail). Exit 0 only if everything holds.

import { readFileSync, readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const asJson = process.argv.includes('--json')
const results = []
const run = (args) => spawnSync(process.execPath, args, { cwd: here, encoding: 'utf8' })

// ---- 0. selftests (the canary) ---------------------------------------------
for (const [label, script] of [['lexon selftest', 'lexon_check.mjs'], ['relation selftest', 'relation_check.mjs']]) {
  const r = run([join('tools', script), '--selftest'])
  results.push({ label, ok: r.status === 0, detail: (r.stdout || '').trim().split('\n').pop() })
}

// ---- 1. every law: base gate + claims --------------------------------------
const laws = readdirSync(here).filter(f => f.endsWith('.lex')).sort()
for (const law of laws) {
  const base = run([join('tools', 'lexon_check.mjs'), law])
  results.push({ label: `gate: ${law}`, ok: base.status === 0, detail: (base.stdout || base.stderr || '').trim().split('\n')[0] })
  if (base.status !== 0) continue

  const claimsFile = law.replace(/\.lex$/, '.claims.json')
  let claims
  try { claims = JSON.parse(readFileSync(join(here, claimsFile), 'utf8')) } catch {
    results.push({ label: `claims: ${law}`, ok: false, detail: `${claimsFile} missing or unparseable — a law with no falsifiable claims is prose` })
    continue
  }
  for (const { expect, claim } of claims) {
    const r = run([join('tools', 'relation_check.mjs'), law, '--claim', JSON.stringify(claim)])
    const verdict = /RELATION PASS/.test(r.stdout || '') ? 'RELATION PASS' : 'RELATION ABSENT'
    const ok = verdict === expect
    results.push({
      label: `claim: ${basename(law, '.lex')} ${claim.type}${claim.clause ? `:${claim.clause}` : claim.predicate ? `:${claim.predicate}` : claim.to ? `→${claim.to}` : ''}`,
      ok,
      detail: ok ? `${verdict} (expected)` : `got ${verdict}, expected ${expect}: ${JSON.stringify(claim)}`,
    })
  }
}

// ---- report -----------------------------------------------------------------
const failed = results.filter(r => !r.ok)
if (asJson) { console.log(JSON.stringify({ pass: !failed.length, results }, null, 2)) }
else {
  const width = Math.max(...results.map(r => r.label.length))
  for (const r of results) console.log(`${r.ok ? '  ok  ' : ' FAIL '} ${r.label.padEnd(width)}  ${r.ok ? '' : r.detail}`)
  if (failed.length) console.error(`\nLEXON GATE FAIL — ${failed.length} of ${results.length} checks. The law and the code are not one voice.`)
  else console.log(`\nLEXON GATE PASS — ${laws.length} law(s), ${results.length} checks: grammar, round-trip, promise typing, every relation claim with its falsifiability twin.`)
}
process.exit(failed.length ? 1 : 0)
