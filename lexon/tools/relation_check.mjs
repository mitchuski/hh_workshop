// relation_check.mjs — the mutation-probe falsifiability gate (OT-3).
//
// Problem it closes (CR-12, lexr2.3 critic): the spec-checker validates a
// claim and its structural inverse under identical clause shapes; the
// direction and the structural relation an entry's Notes line claims lived
// only in prose the checker cannot inspect (the T-148 inversion).
//
// This tool makes the claimed relation mechanical. For a Lexon text plus a
// machine-readable relation claim it:
//   1. verifies the text passes the base gate (tools/lexon_check.mjs),
//   2. verifies the claimed relation HOLDS on the text as a clause-graph
//      property (not a string search over names),
//   3. generates a MUTATED TWIN (the claim's minimal structural negation:
//      gate condition removed / action chain reordered / conjunct dropped /
//      forbidden route added),
//   4. verifies the twin still passes the base gate (so the base gate alone
//      cannot tell them apart), and
//   5. verifies the relation is ABSENT on the twin.
//
// RELATION PASS = all five. Anything else names its failure:
//   BASE GATE FAIL      — the text does not pass the base checker
//   RELATION ABSENT     — the claim is not exhibited (mechanical vacuity)
//   MUTATION INFEASIBLE — no legal twin could be built (reported, never hidden)
//   TWIN GATE FAIL      — the twin broke the base gate (mutation too coarse)
//   NOT FALSIFIABLE     — the twin STILL satisfies the claim: the gate
//                         cannot distinguish the relation from its negation
//
// Claim grammar (JSON; one claim = one structural relation):
//   { "type": "gate",        "clause": "<name>", "condition": "<binary name>" }
//       every action in the clause is conditional on the binary
//       twin: the condition is stripped from the clause
//   { "type": "ordering",    "clause": "<name>", "sequence": ["verb:Object", ...] }
//       the clause performs its actions in exactly this order (>= 2 steps)
//       twin: the action order in the clause is reversed
//   { "type": "conjunction", "predicate": "<defined name>", "conjuncts": ["<name>", ...] }
//       the defined predicate requires ALL named conjuncts (>= 2)
//       twin: the first named conjunct is dropped from the definition
//   { "type": "absence",     "to": "<role>", "what": "<amount>" (optional) }
//       NO transfer clause (pay/return/send) routes the amount (or anything,
//       if what is omitted) to the role — impossibility as absence; this is
//       also how DIRECTION is claimed (T-148: absence of a reclaiming route
//       to the Key Holder IS the fortress-falls direction)
//       twin: a probe clause routing the amount to the role is appended
//
// Usage:
//   node tools/relation_check.mjs <file.lex> --claim '<json>' [--json] [--keep-twin <path>]
//   node tools/relation_check.mjs <file.lex> --claims <claims.json>   (array of claims)
//   node tools/relation_check.mjs --selftest
//
// Regime note: like the base checker this is the spec-checker regime; the
// relation is verified over parsed triples and defined-as bodies, never over
// executed semantics (claims_register CR-11 still binds).

import { readFileSync } from 'node:fs'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { check } from './lexon_check.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))

// ---------- relation predicates (over check() results) ----------

const TRANSFER_VERBS = new Set(['pay', 'return', 'send'])

function relationHolds(r, claim) {
  if (claim.type === 'gate') {
    const ts = r.triples.filter(t => t.clause === claim.clause)
    if (!ts.length) return { holds: false, why: `clause "${claim.clause}" has no actions` }
    const bad = ts.filter(t => !t.condition || !t.condition.includes(claim.condition))
    return bad.length
      ? { holds: false, why: `${bad.length} action(s) in "${claim.clause}" not conditional on "${claim.condition}"` }
      : { holds: true, why: `all ${ts.length} action(s) in "${claim.clause}" conditional on "${claim.condition}"` }
  }
  if (claim.type === 'ordering') {
    if (!Array.isArray(claim.sequence) || claim.sequence.length < 2) return { holds: false, why: 'ordering claim needs a sequence of >= 2 steps' }
    const ts = r.triples.filter(t => t.clause === claim.clause).map(t => `${t.verb}:${t.o}`)
    const eq = ts.length === claim.sequence.length && ts.every((x, i) => x === claim.sequence[i])
    return eq
      ? { holds: true, why: `clause "${claim.clause}" performs [${ts.join(', ')}] in claimed order` }
      : { holds: false, why: `clause "${claim.clause}" performs [${ts.join(', ')}], claim says [${claim.sequence.join(', ')}]` }
  }
  if (claim.type === 'conjunction') {
    if (!Array.isArray(claim.conjuncts) || claim.conjuncts.length < 2) return { holds: false, why: 'conjunction claim needs >= 2 conjuncts' }
    const da = r.definedAs.find(d => d.name === claim.predicate)
    if (!da) return { holds: false, why: `no defined predicate "${claim.predicate}"` }
    const segs = da.body.split(/\s+and\s+/i)
    const missing = claim.conjuncts.filter(c => !segs.some(s => s.includes(c)))
    if (missing.length) return { holds: false, why: `definition of "${claim.predicate}" lacks conjunct(s): ${missing.join(', ')}` }
    if (segs.length < claim.conjuncts.length) return { holds: false, why: `definition has ${segs.length} conjunct(s), claim names ${claim.conjuncts.length}` }
    return { holds: true, why: `"${claim.predicate}" requires all of: ${claim.conjuncts.join(' AND ')}` }
  }
  if (claim.type === 'absence') {
    if (!(claim.to in r.defs)) return { holds: false, why: `role "${claim.to}" is not defined in the text (an absence claim over an undefined role is vacuous)` }
    // 'escrow-remainder' is the checker's pseudo-object for REMAINDER_TO routes
    if (claim.what && claim.what !== 'escrow-remainder' && !(claim.what in r.defs)) return { holds: false, why: `amount "${claim.what}" is not defined in the text` }
    // "themselves" aliases the actor: a clause where the forbidden role pays
    // to themselves IS a route to that role
    const routes = r.triples.filter(t =>
      TRANSFER_VERBS.has(t.verb) &&
      (t.io === claim.to || (t.io === 'themselves' && t.s === claim.to)) &&
      (!claim.what || t.o === claim.what))
    return routes.length
      ? { holds: false, why: `route exists: ${routes.map(t => `${t.verb}:${t.o}->${t.io} (clause "${t.clause}")`).join('; ')}` }
      : { holds: true, why: `no transfer clause routes ${claim.what || 'anything'} to "${claim.to}"` }
  }
  return { holds: false, why: `unknown claim type "${claim.type}"` }
}

// ---------- twin generation (minimal structural negation, text-level) ----------

function clauseSection(src, clause) {
  // returns [start, end) of the clause's body text (after its header line)
  const re = new RegExp(`^CLAUSE:\\s*${clause.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\s*$`, 'm')
  const m = re.exec(src)
  if (!m) return null
  const start = m.index + m[0].length
  const next = src.slice(start).search(/^CLAUSE:/m)
  return [start, next === -1 ? src.length : start + next]
}

function mutate(src, claim, r) {
  if (claim.type === 'gate') {
    const sec = clauseSection(src, claim.clause)
    if (!sec) return { twin: null, why: `clause "${claim.clause}" not found` }
    const body = src.slice(sec[0], sec[1])
    const mutated = body.replace(/,\s*if\s+[^:,]+?[:,]\s*/gi, ' ')
    if (mutated === body) return { twin: null, why: 'no condition found to strip' }
    return { twin: src.slice(0, sec[0]) + mutated + src.slice(sec[1]), why: 'condition stripped from clause' }
  }
  if (claim.type === 'ordering') {
    const sec = clauseSection(src, claim.clause)
    if (!sec) return { twin: null, why: `clause "${claim.clause}" not found` }
    const body = src.slice(sec[0], sec[1])
    // find the multi-action sentence: head (actor + modal + optional condition) then comma-separated actions
    const sm = body.match(/(The\s+[^.]*?(?:may|must)\b(?:,\s*if\s+[^:,]+?[:,])?\s*)([^.]+)\./s)
    if (!sm) return { twin: null, why: 'no modal action sentence found in clause' }
    const chunks = sm[2].split(/,\s*/)
    if (chunks.length < 2) return { twin: null, why: 'fewer than 2 actions; nothing to reorder' }
    // strip connector prefixes to get cores, reverse cores, reattach connectors in place
    const CONN = /^((?:and|or)\s+)?((?:afterwards|then)\s+)?/i
    const conns = chunks.map(c => c.match(CONN)[0])
    const cores = chunks.map(c => c.replace(CONN, ''))
    cores.reverse()
    const rebuilt = chunks.map((_, i) => conns[i] + cores[i]).join(', ')
    const mutatedSentence = sm[1] + rebuilt + '.'
    const mutated = body.replace(sm[0], mutatedSentence)
    return { twin: src.slice(0, sec[0]) + mutated + src.slice(sec[1]), why: 'action order reversed in clause' }
  }
  if (claim.type === 'conjunction') {
    const esc = claim.predicate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`("${esc}"\\s+is\\s+defined\\s+as:?\\s+)(.+?)(\\.)`, 'is')
    const m = re.exec(src)
    if (!m) return { twin: null, why: `defined-as statement for "${claim.predicate}" not found` }
    const segs = m[2].split(/\s+and\s+/i)
    const dropIdx = segs.findIndex(s => s.includes(claim.conjuncts[0]))
    if (dropIdx === -1) return { twin: null, why: `conjunct "${claim.conjuncts[0]}" not found in definition` }
    if (segs.length < 2) return { twin: null, why: 'definition has a single conjunct; nothing to drop' }
    const rest = segs.filter((_, i) => i !== dropIdx).join(' and ')
    return { twin: src.replace(m[0], m[1] + rest + m[3]), why: `conjunct "${claim.conjuncts[0]}" dropped from definition` }
  }
  if (claim.type === 'absence') {
    const persons = Object.entries(r.defs).filter(([, t]) => t === 'person').map(([n]) => n)
    const amounts = Object.entries(r.defs).filter(([, t]) => t === 'amount').map(([n]) => n)
    const texts = Object.entries(r.defs).filter(([, t]) => t === 'text' || t === 'data').map(([n]) => n)
    const actor = persons.find(p => p !== claim.to)
    const what = claim.what || amounts[0] || texts[0]
    if (!actor) return { twin: null, why: 'no person other than the forbidden role to act in the probe clause' }
    if (!what) return { twin: null, why: 'no transferable object defined to route in the probe clause' }
    // probe verb follows the object's TYPE (CR-20 fix): amounts pay, texts/data
    // send. No more typing a secret as an amount just so the twin can pay it.
    const whatType = what === 'escrow-remainder' ? 'amount' : r.defs[what]
    const escrow = /into escrow|from escrow/i.test(src)
    let core
    if (what === 'escrow-remainder') core = `pay the remainder of the escrow to the ${claim.to}`
    else if (whatType === 'amount') core = `pay ${escrow ? 'from escrow ' : ''}the ${what} to the ${claim.to}`
    else core = `send the ${what} to the ${claim.to}`
    const probe = `\nCLAUSE: Mutation Probe.\nThe ${actor} may ${core}.\n`
    return { twin: src.trimEnd() + '\n' + probe, why: `probe clause appended routing ${what} to ${claim.to} (${whatType === 'amount' ? 'pay' : 'send'} probe)` }
  }
  return { twin: null, why: `unknown claim type "${claim.type}"` }
}

// ---------- one claim, full pipeline ----------

export function probeRelation(src, claim, label = 'input') {
  const base = check(src, label)
  if (!base.ok) return { claim, status: 'BASE GATE FAIL', detail: base.errors[0] || 'base checker rejected the text' }

  const orig = relationHolds(base, claim)
  if (!orig.holds) return { claim, status: 'RELATION ABSENT', detail: orig.why }

  const mut = mutate(src, claim, base)
  if (!mut.twin) return { claim, status: 'MUTATION INFEASIBLE', detail: mut.why }

  const twinCheck = check(mut.twin, label + ':twin')
  if (!twinCheck.ok) return { claim, status: 'TWIN GATE FAIL', detail: (twinCheck.errors[0] || 'twin rejected') + ` (mutation: ${mut.why})` }

  const twinRel = relationHolds(twinCheck, claim)
  if (twinRel.holds) return { claim, status: 'NOT FALSIFIABLE', detail: `twin still satisfies the claim after: ${mut.why}` }

  return {
    claim, status: 'RELATION PASS',
    detail: `holds on original (${orig.why}); twin gate-passes yet relation absent (${twinRel.why})`,
    twin: mut.twin, mutation: mut.why,
  }
}

// ---------- selftest ----------

function selftest() {
  const dir = join(HERE, 'golden', 'relations')
  const src = readFileSync(join(dir, 'relation_fixture.lex'), 'utf8')
  const spec = JSON.parse(readFileSync(join(dir, 'claims.json'), 'utf8'))
  let pass = 0, fail = 0
  const rows = []
  for (const { expect, claim } of spec) {
    const res = probeRelation(src, claim, 'relation_fixture.lex')
    const good = res.status === expect
    rows.push(`${good ? 'PASS' : 'FAIL'}  ${claim.type.padEnd(11)} expect ${expect.padEnd(16)} got ${res.status}  (${res.detail.slice(0, 90)})`)
    good ? pass++ : fail++
  }
  // the escrow golden (real attested text): the Fee never reaches the Payer
  // (RELATION PASS), and the themselves-alias route to the Arbiter is caught
  // (RELATION ABSENT — the Arbiter pays the Fee to themselves)
  const escrow = readFileSync(join(HERE, 'golden', 'escrow.lex'), 'utf8')
  for (const [claim, expect] of [
    [{ type: 'absence', to: 'Payer', what: 'Fee' }, 'RELATION PASS'],
    [{ type: 'absence', to: 'Arbiter', what: 'Fee' }, 'RELATION ABSENT'],
  ]) {
    const eres = probeRelation(escrow, claim, 'escrow.lex')
    const egood = eres.status === expect
    rows.push(`${egood ? 'PASS' : 'FAIL'}  escrow-golden ${JSON.stringify(claim)} expect ${expect} got ${eres.status}`)
    egood ? pass++ : fail++
  }
  console.log(rows.join('\n'))
  console.log(`\nrelation selftest: ${pass} pass, ${fail} fail -> ${fail === 0 ? 'SELFTEST PASS' : 'SELFTEST FAIL'}`)
  process.exit(fail === 0 ? 0 : 1)
}

// ---------- CLI ----------

const isMain = process.argv[1] && import.meta.url === new URL('file:///' + process.argv[1].replace(/\\/g, '/')).href
const argv = isMain ? process.argv.slice(2) : []
if (argv.includes('--selftest')) selftest()
else if (argv.length) {
  const file = argv.find(a => !a.startsWith('--'))
  const src = readFileSync(file, 'utf8')
  let claims = []
  const ci = argv.indexOf('--claim')
  const cfi = argv.indexOf('--claims')
  const stripBom = s => s.replace(/^﻿/, '')
  if (ci !== -1) claims = [JSON.parse(stripBom(argv[ci + 1]))]
  else if (cfi !== -1) claims = JSON.parse(stripBom(readFileSync(argv[cfi + 1], 'utf8')))
  else { console.log('need --claim <json> or --claims <file>'); process.exit(2) }

  let allPass = true
  for (const claim of claims) {
    const res = probeRelation(src, claim, file)
    if (res.status !== 'RELATION PASS') allPass = false
    if (argv.includes('--json')) console.log(JSON.stringify({ ...res, twin: undefined }, null, 2))
    else console.log(`${res.status}  ${file}  ${JSON.stringify(claim)}\n  ${res.detail}`)
    const ki = argv.indexOf('--keep-twin')
    if (ki !== -1 && res.twin) writeFileSync(argv[ki + 1], res.twin)
  }
  process.exit(allPass ? 0 : 1)
} else if (isMain) {
  console.log('usage: node tools/relation_check.mjs <file.lex> --claim \'<json>\' [--json] [--keep-twin <path>] | --claims <claims.json> | --selftest')
}
