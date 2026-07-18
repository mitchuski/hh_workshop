// lexon_check.mjs — spec-checker for the lexon_pvm gate (spec-checker regime).
//
// Validates a Lexon text against the attested controlled-grammar subset derived
// from lexon.org samples (escrow.lex, license.lex, statement.lex; vocabulary 0.3
// page). It is NOT the Lexon compiler (macOS-only binary, source unpublished);
// see SOURCES.md slug lexon-compiler-status.
//
// Checks, in order:
//   1. parse      — every statement classifies and parses under the subset grammar
//   2. binding    — every noun reference resolves to a definition or clause name;
//                   definitions are immutable (no rebinding)
//   3. roundTrip  — action triples serialize to canonical sentences that re-parse
//                   to identical triples (grammar-to-graph, losslessness)
//   4. promises   — every action edge carries a promise type (promise|commitment)
//                   and polarity (+), per promise_theory_reference polarity rules
//
// Usage:
//   node tools/lexon_check.mjs <file.lex> [--json]
//   node tools/lexon_check.mjs --selftest      (goldens must pass, mutants must fail)

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

// ---------- grammar tables (attested subset) ----------

// number, account: 0.7-attested (oversimplicated.lex DEFINITIONS, SOURCES.md
// slug lexon-example-oversimplicated); folded 2026-07-12 with the numeric layer
const TYPES = ['person', 'amount', 'text', 'time', 'binary', 'data', 'contract', 'number', 'account']

// verb → { base, patterns: ordered list of arg templates }
// templates: FROM_ESCROW_TO, OBJ_TO, OBJ_INTO_ESCROW, REMAINDER_TO, OBJ_AS, OBJ, THIS_CONTRACT
const VERBS = {
  pay: ['FROM_ESCROW_TO', 'REMAINDER_TO', 'OBJ_INTO_ESCROW', 'OBJ_TO', 'OBJ'],
  return: ['REMAINDER_TO', 'OBJ_TO'],
  appoint: ['OBJ'],
  fix: ['OBJ_AS_TIME', 'OBJ_AS', 'OBJ'],
  certify: ['OBJ_AS_TIME', 'OBJ_AS', 'OBJ'],
  register: ['OBJ'],
  grant: ['OBJ'],
  declare: ['BARE'],
  file: ['OBJ'],
  send: ['OBJ_TO'],
  terminate: ['THIS_CONTRACT', 'OBJ'],
  set: ['OBJ'], // 0.7-attested: "sets the Trader Rate" (oversimplicated recital)
}
const VERB_FORMS = {}
for (const v of Object.keys(VERBS)) {
  VERB_FORMS[v] = v
  VERB_FORMS[v + 's'] = v
  if (v === 'certify') VERB_FORMS['certifies'] = v
  if (v === 'fix') VERB_FORMS['fixes'] = v
}

const ART = '(?:the|a|an)'

// ---------- statement splitting ----------

function splitStatements(src) {
  const lines = src.split(/\r?\n/)
  const stmts = []
  let buf = []
  const flush = () => { if (buf.length) { stmts.push(buf.join(' ').replace(/\s+/g, ' ').trim()); buf = [] } }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    buf.push(line)
    const isMarker = /^TERMS(\s+PER\s+.+)?:$/i.test(line)
    const isMeta = buf.length === 1 && /^(LEXON|AUTHORS?|REVISION|LICENSE):/i.test(line)
    if (line.endsWith('.') || isMarker || isMeta) flush()
  }
  flush()
  return stmts
}

// ---------- document parse ----------

function parseDoc(src) {
  const errors = []
  const stmts = splitStatements(src)
  const doc = { title: null, defs: new Map(), clauses: new Map(), sentences: [], definedAs: [], stateAssigns: [] }
  if (!stmts.length) return { doc, errors: ['empty document'] }

  const head = stmts[0].match(/^LEX:?\s+(.+)\.$/)
  if (head) doc.title = head[1]
  else errors.push(`missing LEX header: first statement is "${stmts[0].slice(0, 60)}"`)

  let currentClause = null // null = recital
  for (let i = 1; i < stmts.length; i++) {
    const s = stmts[i]
    if (/^(LEXON|AUTHORS?|REVISION|LICENSE|PREAMBLE|COMMENTS?):/i.test(s)) continue
    if (/^TERMS(\s+PER\s+.+)?:$/i.test(s)) continue

    const clause = s.match(/^CLAUSE:\s*(.+)\.$/i)
    if (clause) {
      currentClause = clause[1].trim()
      if (doc.clauses.has(currentClause)) errors.push(`duplicate clause name: ${currentClause}`)
      doc.clauses.set(currentClause, [])
      continue
    }

    const defAs = s.match(/^"([^"]+)"\s+is\s+defined\s+as:?\s+(.+)\.$/i)
    if (defAs) { doc.definedAs.push({ name: defAs[1], body: defAs[2], clause: currentClause }); continue }

    // optional initial numeric literal: "X" is a number, initially 99.
    // (0.7-attested: oversimplicated "Maximum Members Count" is a number, initially 99.)
    const def = s.match(/^"([^"]+)"\s+is\s+(?:(a|an|this)\s+)?([a-z]+)(?:,\s+initially\s+(\d+(?:\.\d+)?))?\.$/i)
    if (def) {
      const [, name, , typeRaw, initial] = def
      const type = typeRaw.toLowerCase()
      if (!TYPES.includes(type)) { errors.push(`unknown definition type "${typeRaw}" for "${name}"`); continue }
      if (initial !== undefined && type !== 'number' && type !== 'amount') { errors.push(`initial literal on non-numeric type "${type}" for "${name}"`); continue }
      if (doc.defs.has(name)) { errors.push(`rebinding of "${name}" (definitions are immutable)`); continue }
      doc.defs.set(name, type)
      continue
    }

    if (/^(This|The)\s+.+\s+is\s+(therefore\s+)?[A-Z].*\.$/.test(s) && !/^The\s+\S+.*\b(may|must|pays?|appoints?|fix(es)?|certif|registers?|grants?|declares?|files?|sends?|terminates?|returns?)\b/.test(s)) {
      doc.stateAssigns.push({ text: s, clause: currentClause })
      continue
    }

    if (/^The\s+/.test(s)) { doc.sentences.push({ text: s, clause: currentClause }); continue }

    errors.push(`unclassifiable statement: "${s.slice(0, 80)}"`)
  }
  return { doc, errors }
}

// ---------- noun resolution ----------

function nounMatcher(doc) {
  // longest-first list of referable names: definitions + clause names + builtins
  const names = [...doc.defs.keys(), ...doc.clauses.keys(), ...doc.definedAs.map(d => d.name)]
  names.sort((a, b) => b.length - a.length)
  return {
    names,
    // match a defined name at the START of fragment; returns [name, rest] or null
    eat(fragment) {
      for (const n of names) {
        if (fragment === n) return [n, '']
        if (fragment.startsWith(n) && /^\W/.test(fragment.slice(n.length))) return [n, fragment.slice(n.length).trim()]
      }
      return null
    },
  }
}

// ---------- sentence parse → action triples ----------

function parseActionPhrase(phrase, nouns, errors, where) {
  let p = phrase.replace(/^(and|or)\s+/i, '').replace(/^(afterwards|then)\s+/i, '').trim()
  const vm = p.match(/^([a-z]+)\b/i)
  if (!vm) { errors.push(`${where}: no verb in "${phrase}"`); return null }
  const verb = VERB_FORMS[vm[1].toLowerCase()]
  if (!verb) { errors.push(`${where}: unknown verb "${vm[1]}" in "${phrase}"`); return null }
  let rest = p.slice(vm[1].length).trim()

  const eatNoun = (frag) => {
    const stripped = frag.replace(new RegExp(`^${ART}\\s+`, 'i'), '')
    return nouns.eat(stripped)
  }

  for (const pat of VERBS[verb]) {
    if (pat === 'FROM_ESCROW_TO') {
      const m = rest.match(/^from escrow\s+(.+?)\s+to\s+(themselves|.+)$/i)
      if (m) {
        const o = eatNoun(m[1]); if (!o || o[1]) continue
        const io = m[2].toLowerCase() === 'themselves' ? ['themselves', ''] : eatNoun(m[2])
        if (!io || io[1]) continue
        return { verb, mode: pat, o: o[0], io: io[0] }
      }
    } else if (pat === 'REMAINDER_TO') {
      const m = rest.match(/^the remainder of the escrow\s+to\s+(.+)$/i)
      if (m) { const io = eatNoun(m[1]); if (io && !io[1]) return { verb, mode: pat, o: 'escrow-remainder', io: io[0] } }
    } else if (pat === 'OBJ_INTO_ESCROW') {
      const m = rest.match(/^(.+?)\s+into escrow$/i)
      if (m) { const o = eatNoun(m[1]); if (o && !o[1]) return { verb, mode: pat, o: o[0] } }
    } else if (pat === 'OBJ_TO') {
      const m = rest.match(/^(.+?)\s+to\s+(themselves|.+)$/i)
      if (m) {
        const o = eatNoun(m[1]); if (!o || o[1]) continue
        const io = m[2].toLowerCase() === 'themselves' ? ['themselves', ''] : eatNoun(m[2])
        if (!io || io[1]) continue
        return { verb, mode: pat, o: o[0], io: io[0] }
      }
    } else if (pat === 'OBJ_AS_TIME') {
      const m = rest.match(/^(.+?)\s+as the (?:respective |then )?current time$/i)
      if (m) { const o = eatNoun(m[1]); if (o && !o[1]) return { verb, mode: pat, o: o[0], as: 'current-time' } }
    } else if (pat === 'OBJ_AS') {
      const m = rest.match(/^(this\s+)?(.+?)\s+as\s+(.+)$/i)
      if (m) {
        const o = nouns.eat(m[2]) || eatNoun(m[2]); if (!o || o[1]) continue
        const as = nouns.eat(m[3]); if (!as || as[1]) continue
        return { verb, mode: pat, o: o[0], as: as[0] }
      }
    } else if (pat === 'THIS_CONTRACT') {
      if (/^this contract$/i.test(rest)) return { verb, mode: pat, o: 'this-contract' }
      const m = rest.match(/^this\s+(.+)$/i)
      if (m) { const o = nouns.eat(m[1]); if (o && !o[1]) return { verb, mode: pat, o: o[0] } }
    } else if (pat === 'BARE') {
      const o = nouns.eat(rest)
      if (o && !o[1]) return { verb, mode: pat, o: o[0] }
    } else if (pat === 'OBJ') {
      const m = rest.match(/^(this\s+)?(.+)$/i)
      if (m) { const o = m[1] ? nouns.eat(m[2]) : eatNoun(rest); if (o && !o[1]) return { verb, mode: pat, o: o[0] } }
    }
  }
  errors.push(`${where}: verb "${verb}" but no pattern matched rest: "${rest}"`)
  return null
}

function parseSentence(sentence, doc, nouns, errors) {
  let s = sentence.text.replace(/\.$/, '')
  const where = sentence.clause ? `clause "${sentence.clause}"` : 'recital'

  // actor(s): The X [or the Y] ...
  const am = s.match(/^The\s+(.+?)\s+(may|must)\b(.*)$/) || s.match(/^The\s+(.+)$/)
  let actors = [], modal = null, rest = ''
  if (am && am[2]) {
    modal = am[2]; rest = am[3].trim()
    for (const part of am[1].split(/\s+or\s+(?:the\s+)?/i)) {
      const a = nouns.eat(part.trim())
      if (!a || a[1]) { errors.push(`${where}: unbound actor "${part.trim()}"`); return [] }
      actors.push(a[0])
    }
  } else {
    // recital-style: The X <verbphrase...>
    const first = nouns.eat(s.replace(/^The\s+/, ''))
    if (!first) { errors.push(`${where}: unbound actor in "${s.slice(0, 60)}"`); return [] }
    actors = [first[0]]
    rest = first[1]
  }

  // optional condition: , if <cond> [:,]
  let condition = null
  const cm = rest.match(/^,\s*if\s+(.+?)\s*[:,]\s*(.+)$/i)
  if (cm) { condition = cm[1]; rest = cm[2] }
  if (condition) checkConditionBinding(condition, nouns, errors, where)

  // action list: split on commas; strip leading and/or/afterwards
  const triples = []
  for (const chunk of rest.split(/\s*,\s*/)) {
    if (!chunk) continue
    const act = parseActionPhrase(chunk, nouns, errors, where)
    if (!act) return []
    for (const actor of actors) {
      if (doc.defs.get(actor) && doc.defs.get(actor) !== 'person') errors.push(`${where}: actor "${actor}" is ${doc.defs.get(actor)}, not person`)
      if (act.verb === 'pay' && act.o !== 'escrow-remainder' && doc.defs.get(act.o) && doc.defs.get(act.o) !== 'amount') errors.push(`${where}: pay object "${act.o}" is ${doc.defs.get(act.o)}, not amount`)
      if (act.verb === 'appoint' && !['person', 'account'].includes(doc.defs.get(act.o))) errors.push(`${where}: appoint object "${act.o}" is not a person or account`) // account: 0.7-attested ("appoints the Maintenance Account")
      triples.push({ s: actor, verb: act.verb, mode: act.mode, o: act.o, io: act.io || null, as: act.as || null, modal, condition, clause: sentence.clause })
    }
  }
  return triples
}

const COND_SCAFFOLD = new Set(['this', 'the', 'is', 'are', 'not', 'and', 'or', 'there', 'no', 'has', 'have', 'passed', 'fixed', 'filed', 'declared', 'lies', 'at', 'least', 'in', 'past', 'being', 'a', 'an', 'after', 'day', 'days', 'hour', 'hours', 'then', 'current', 'time', 'if',
  // comparative scaffold, 0.7-attested (oversimplicated: "greater than zero",
  // "greater than or equal to half of", "being zero", "sum of", "divided by",
  // "difference between", "times"); numeric layer folded 2026-07-12
  'greater', 'less', 'than', 'equal', 'equals', 'to', 'zero', 'one', 'half', 'sum', 'of', 'times', 'divided', 'by', 'minus', 'plus', 'difference', 'between'])

function checkConditionBinding(cond, nouns, errors, where) {
  // scan left to right: eat a bound noun (longest match wins, so multi-word
  // nouns containing scaffold words survive), else drop one scaffold word or
  // number, else the name is unbound.
  let frag = cond.replace(/[,:;]/g, ' ').replace(/\s+/g, ' ').trim()
  while (frag.length) {
    const hit = nouns.eat(frag)
    if (hit) { frag = hit[1]; continue }
    const w = frag.split(' ')[0]
    if (COND_SCAFFOLD.has(w.toLowerCase()) || /^\d+(\.\d+)?$/.test(w)) { frag = frag.slice(w.length).trim(); continue }
    errors.push(`${where}: unbound name in condition: "${frag.split(' ').slice(0, 4).join(' ')}"`)
    return
  }
}

// ---------- round trip ----------

function serializeAction(t) {
  const V = { pay: 'pays', return: 'returns', appoint: 'appoints', fix: 'fixes', certify: 'certifies', register: 'registers', grant: 'grants', declare: 'declares', file: 'files', send: 'sends', terminate: 'terminates', set: 'sets' }[t.verb]
  let core
  switch (t.mode) {
    case 'FROM_ESCROW_TO': core = `pays from escrow the ${t.o} to ${t.io === 'themselves' ? 'themselves' : 'the ' + t.io}`; break
    case 'REMAINDER_TO': core = `${V} the remainder of the escrow to the ${t.io}`; break
    case 'OBJ_INTO_ESCROW': core = `pays the ${t.o} into escrow`; break
    case 'OBJ_TO': core = `${V} the ${t.o} to ${t.io === 'themselves' ? 'themselves' : 'the ' + t.io}`; break
    case 'OBJ_AS_TIME': core = `${V} the ${t.o} as the current time`; break
    case 'OBJ_AS': core = `certifies this ${t.o} as ${t.as}`.replace(/^certifies/, V); break
    case 'THIS_CONTRACT': core = t.o === 'this-contract' ? `${V} this contract` : `${V} this ${t.o}`; break
    case 'BARE': core = `${V} ${t.o}`; break
    default: core = `${V} the ${t.o}`
  }
  return `The ${t.s} ${core}.`
}

function roundTrip(triples, doc, nouns) {
  const failures = []
  for (const t of triples) {
    const text = serializeAction(t)
    const errs = []
    const re = parseSentence({ text, clause: t.clause }, doc, nouns, errs)
    if (errs.length || re.length !== 1) { failures.push({ triple: t, serialized: text, errors: errs }); continue }
    const r = re[0]
    if (r.s !== t.s || r.verb !== t.verb || r.o !== t.o || (r.io || null) !== (t.io || null) || (r.as || null) !== (t.as || null)) {
      failures.push({ triple: t, serialized: text, reparsed: r, errors: ['triple mismatch after round trip'] })
    }
  }
  return failures
}

// ---------- promise typing ----------

function typePromises(triples) {
  const edges = []
  const untyped = []
  for (const t of triples) {
    let type = null
    if (t.modal === 'may') type = 'promise'            // voluntary permission: +give when exercised
    else if (t.modal === 'must') type = 'commitment'   // bound obligation
    else if (!t.clause) type = 'commitment'            // recital: performed at instantiation
    else type = 'commitment'                           // clause body without modal: performed act
    if (!type) { untyped.push(t); continue }
    edges.push({ promiser: t.s, type, polarity: '+', body: `${t.verb}:${t.o}${t.io ? '->' + t.io : ''}`, conditional: !!t.condition, clause: t.clause })
  }
  return { edges, untyped }
}

// ---------- check one document ----------

export function check(src, label = 'input') {
  const { doc, errors: parseErrors } = parseDoc(src)
  const nouns = nounMatcher(doc)
  const errors = [...parseErrors]

  const triples = []
  for (const sen of doc.sentences) triples.push(...parseSentence(sen, doc, nouns, errors))
  for (const sa of doc.stateAssigns) {
    // "This License is therefore Paid." — subject and state must both resolve
    const m = sa.text.match(/^(?:This|The)\s+(.+?)\s+is\s+(?:therefore\s+)?(.+)\.$/)
    if (m) {
      if (!nouns.eat(m[1]) || nouns.eat(m[1])[1]) errors.push(`state assignment: unbound subject "${m[1]}"`)
      if (!nouns.eat(m[2]) || nouns.eat(m[2])[1]) errors.push(`state assignment: unbound state "${m[2]}"`)
    }
  }
  for (const da of doc.definedAs) checkConditionBinding(da.body, nouns, errors, `defined-as "${da.name}"`)

  const rt = errors.length ? [] : roundTrip(triples, doc, nouns)
  const promises = typePromises(triples)

  const ok = errors.length === 0 && rt.length === 0 && promises.untyped.length === 0 && doc.title !== null
  return {
    label, ok,
    title: doc.title,
    counts: { definitions: doc.defs.size, clauses: doc.clauses.size, sentences: doc.sentences.length, triples: triples.length, promiseEdges: promises.edges.length },
    errors, roundTripFailures: rt, untypedActions: promises.untyped,
    triples, promiseEdges: promises.edges,
    // structural views for tools/relation_check.mjs (additive; gate semantics unchanged)
    defs: Object.fromEntries(doc.defs),
    clauseNames: [...doc.clauses.keys()],
    definedAs: doc.definedAs.map(d => ({ name: d.name, body: d.body, clause: d.clause })),
  }
}

// ---------- selftest ----------

function selftest() {
  const goldenDir = join(HERE, 'golden')
  const mutantDir = join(HERE, 'golden', 'mutants')
  let pass = 0, fail = 0
  const rows = []
  for (const f of readdirSync(goldenDir).filter(f => f.endsWith('.lex'))) {
    const r = check(readFileSync(join(goldenDir, f), 'utf8'), f)
    const good = r.ok
    rows.push(`${good ? 'PASS' : 'FAIL'}  golden  ${f}  (${r.counts.triples} triples, ${r.counts.promiseEdges} promise edges)${good ? '' : '\n        ' + r.errors.concat(r.roundTripFailures.map(x => x.errors.join(';'))).join('\n        ')}`)
    good ? pass++ : fail++
  }
  for (const f of readdirSync(mutantDir).filter(f => f.endsWith('.lex'))) {
    const r = check(readFileSync(join(mutantDir, f), 'utf8'), f)
    const good = !r.ok // mutants must FAIL
    rows.push(`${good ? 'PASS' : 'FAIL'}  mutant  ${f}  (${good ? 'correctly rejected: ' + (r.errors[0] || 'structural') : 'WRONGLY ACCEPTED'})`)
    good ? pass++ : fail++
  }
  console.log(rows.join('\n'))
  console.log(`\nselftest: ${pass} pass, ${fail} fail → ${fail === 0 ? 'SELFTEST PASS' : 'SELFTEST FAIL'}`)
  process.exit(fail === 0 ? 0 : 1)
}

// ---------- CLI ----------

const isMain = process.argv[1] && import.meta.url === new URL('file:///' + process.argv[1].replace(/\\/g, '/')).href
const argv = isMain ? process.argv.slice(2) : []
if (argv.includes('--selftest')) selftest()
else if (argv.length) {
  const file = argv.find(a => !a.startsWith('--'))
  const r = check(readFileSync(file, 'utf8'), file)
  if (argv.includes('--json')) console.log(JSON.stringify(r, null, 2))
  else {
    console.log(`${r.ok ? 'GATE PASS' : 'GATE FAIL'}  ${file}`)
    console.log(`  definitions=${r.counts.definitions} clauses=${r.counts.clauses} triples=${r.counts.triples} promiseEdges=${r.counts.promiseEdges}`)
    for (const e of r.errors) console.log(`  ERROR ${e}`)
    for (const x of r.roundTripFailures) console.log(`  ROUNDTRIP ${x.serialized} :: ${x.errors.join(';')}`)
  }
  process.exit(r.ok ? 0 : 1)
} else if (isMain) {
  console.log('usage: node tools/lexon_check.mjs <file.lex> [--json] | --selftest')
}
