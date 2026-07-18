#!/usr/bin/env node
// measure_debt.mjs — the counting rule (GR-1). Deterministic: two strangers
// running it on the same tree get the same number.
//
//   node tools/measure_debt.mjs           → JSON {claims, carried, debt, pairs}
//   node tools/measure_debt.mjs --check   → exit 1 if any carry.json cites an
//                                           unknown claim or form (drift guard)
//
// translation-debt = (claim, form) pairs NOT yet carried, lower is better:
//
//   debt = 3·N − |union of declared (claim, form) pairs across counted triptychs|
//
// where N = claims in canon/UNDERSTANDING.md, forms = narrative | poem | paper.
// A triptych is COUNTED when its carry.json status is "canary" or "validated"
// — a declaration alone never counts; the babblefish gate is what promotes a
// submitted triptych to "validated" (the assay's verdict, folded by the
// keystone). Directories scanned: canon/seed-triptych/ and artifact/*/.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const FORMS = ['narrative', 'poem', 'paper']
const COUNTED = new Set(['canary', 'validated'])

// ---- N: the register --------------------------------------------------------
const registerPath = join(root, 'canon', 'UNDERSTANDING.md')
const register = readFileSync(registerPath, 'utf8')
const claims = [...register.matchAll(/^- \*\*(C\d+)\*\*/gm)].map(m => m[1])
if (claims.length === 0) { console.error('measure_debt: no claims found in canon/UNDERSTANDING.md'); process.exit(1) }
const claimSet = new Set(claims)

// ---- carry declarations -----------------------------------------------------
const carryFiles = []
const seed = join(root, 'canon', 'seed-triptych', 'carry.json')
if (existsSync(seed)) carryFiles.push(seed)
const artDir = join(root, 'artifact')
if (existsSync(artDir)) {
  for (const name of readdirSync(artDir)) {
    const p = join(artDir, name)
    try { if (statSync(p).isDirectory() && existsSync(join(p, 'carry.json'))) carryFiles.push(join(p, 'carry.json')) } catch {}
  }
}

const errs = []
const covered = new Set()   // "C7|poem"
const counted = []
for (const f of carryFiles) {
  let c
  try { c = JSON.parse(readFileSync(f, 'utf8')) } catch (e) { errs.push(`${f}: unparseable (${e.message})`); continue }
  if (!COUNTED.has(c.status)) continue
  counted.push({ file: f.replace(/\\/g, '/'), triptych: c.triptych || '(unnamed)', status: c.status })
  for (const form of FORMS) {
    for (const id of c[form] || []) {
      if (!claimSet.has(id)) { errs.push(`${f}: ${form} declares unknown claim ${id}`); continue }
      covered.add(`${id}|${form}`)
    }
  }
  for (const k of Object.keys(c)) {
    if (!FORMS.includes(k) && !['triptych', 'title', 'status', 'authoredWith'].includes(k)) {
      errs.push(`${f}: unknown field "${k}" (forms are narrative|poem|paper)`)
    }
  }
}

const N = claims.length
const carried = covered.size
const debt = 3 * N - carried

if (process.argv.includes('--check') && errs.length) {
  for (const e of errs) console.error('drift: ' + e)
  process.exit(1)
}

console.log(JSON.stringify({
  metric: 'translation-debt',
  claims: N,
  forms: FORMS.length,
  carried,
  debt,
  countedTriptychs: counted,
  how: 'debt = 3*N - |union of (claim,form) pairs declared by carry.json files with status canary|validated| under canon/seed-triptych and artifact/*',
  ...(errs.length ? { driftWarnings: errs } : {}),
}, null, 2))
