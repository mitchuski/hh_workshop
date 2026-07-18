// harness.config.mjs — hh_workshop: the Hitchhikers Workshop harness.
//
// Domain: the babblefish recursion (sci-fi narrative → poem → white paper →
// recurse) run as a facilitated course around a shared air-gapped local mage.
// The harness guards TRANSLATION FIDELITY: the domain's mirage is a beautiful
// rendering that no longer carries the mechanism. The access ladder
// (workshop/UNDERSTANDING_KEY.md) is deliberately NOT this harness — it is an
// enumerable auditor plus a human door.
//
// Seats are PURE-DATA (a divergence from the template, named in VENDOR.md):
// every seat returns JSON matching its schema and never runs shell commands —
// an Ollama chat endpoint cannot sha256sum. The DRIVER (driver/run_round.mjs)
// persists proposal_canon.json / gap.json / verdict.json and computes all
// hashes code-side via engine deriveHoldApart (SALTED mode), which holds T2
// harder: the seat physically cannot see the salt.
//
// Contract: SEAT_CONTRACT.md (upstream). Constitution: TRUSTS.md (vendored
// verbatim). Gate definition first — see heldApartRule.

export default {
  name: 'hh_workshop',

  objective: {
    metric:
      'translation-debt — the count of (claim, form) pairs not yet carried ' +
      'across the babblefish recursion; counting rule: node tools/measure_debt.mjs ' +
      '(debt = 3·N − |union of declared (claim,form) pairs in counted carry.json ' +
      'files|). Lower is better; 0 = every claim carried in every tongue.',
    gate:
      'the babblefish gate — a CENSUS over the frozen claim register ' +
      'canon/UNDERSTANDING.md (N=31). The probe form is drawn Fiat-Shamir from ' +
      'the committed triptych: parseInt(seedHex.slice(0,8),16) % 3 → 0=narrative, ' +
      '1=poem, 2=paper. A blind assayer who has NEVER seen the canon receives the ' +
      'probe form text alone and must recover every claim that form declares in ' +
      'its carry.json; the keystone compares recovered statements against the ' +
      'register. Any declared claim the assayer cannot recover = zero (T5: the ' +
      'gate is a factor in a product).',
    hardConstraint:
      '(a) NO CANON DRIFT — a triptych may not assert anything the register ' +
      'contradicts; new understanding lands only as keystone-accepted numbered ' +
      'claims, additive-only (GR-3). (b) CONSENT-FIRST — no participant ' +
      'expression enters corpus/ or any export without a recorded line in ' +
      'corpus/CONSENT_LEDGER.md; a violated consent makes the result not exist, ' +
      'whatever the debt says (T4 as a hard constraint).',
    canary:
      'canon/seed-triptych/ — three renderings authored WITH the register in the ' +
      'same session (both distilled from the 2026-06-28 LAN-ceremony chronicle), ' +
      'so every claim a form declares in carry.json is recoverable from that ' +
      'form by construction. Probe any tongue: the declared set survives. ' +
      'Without it, a round of zeros could not tell a bad triptych from an ' +
      'impossible gate.',
  },

  door: 'first-person', // T6 — the literal; conform.mjs checks it

  // Census, forced and honest: N=31 << censusThreshold, so every claim is
  // probed every round. The Fiat-Shamir randomness the proposer cannot tune
  // gates WHICH FORM is interrogated — only a triptych that carries its
  // declarations in all three tongues survives, which is the babblefish thesis
  // made mechanical. The census gates the claims; the draw gates the form.
  gate: { N: 31, count: 31, mode: 'census', censusThreshold: 200 },

  heldApartRule:
    'You are BLIND to verification witnesses (T2/GR-4). The witnesses are the ' +
    'numbered claims of canon/UNDERSTANDING.md interrogated through ONE probe ' +
    'form (narrative | poem | paper) selected by hashing your committed ' +
    'proposal with a run salt you never see — you cannot know which of your ' +
    'three tongues will be interrogated, so do not tune one. Do not suggest ' +
    'probe forms, claim orderings, questions, or assayers.',

  keystoneOnlyWrites: ['frontier.json', 'claims_register.md', 'manifest.yaml', 'canon/UNDERSTANDING.md'],

  finders: [
    {
      lens: 'story-forward',
      hint:
        'enter at the narrative: where does the myth fail to carry the ' +
        'mechanism? Find (claim, form) pairs the story could carry but does ' +
        'not, and propose the rendering move that would carry them without ' +
        'breaking the tale.',
    },
    {
      lens: 'spec-forward',
      hint:
        'enter at the white paper: where does the mechanism fail to carry the ' +
        'myth? Find claims stated formally that the poem or narrative drops, ' +
        'and propose the translation move that would carry them without ' +
        'canon drift.',
    },
  ],

  prompts: {
    // The DRIVER measures (node tools/measure_debt.mjs) and injects the result
    // as ctx.args.measured; the seat restates it as schema data and flags
    // staleness against frontier.json. Numbers only, no advocacy.
    measure: (ctx) =>
      `Seat MEASURE. The counting rule (tools/measure_debt.mjs) has already run; its output:
${JSON.stringify(ctx.args.measured || null)}
Compare metric (the "debt" field) against the frontier you read at boot: stale=true if frontier.json best.metric differs from this measured debt. leverCosts: price the lever families 'extend-a-tongue' (add declared claims to one form of an existing triptych), 'new-triptych' (a fresh three-form rendering), 'revise-for-fidelity' (repair a form that failed its probe). cost = rough effort, ceiling = how much debt that family could remove. Return JSON only.`,

    propose: (finder, measure, ctx) =>
      `Seat PROPOSE — soulbae 🧙 (bnot), lens = ${finder.lens}: ${finder.hint}
Frontier context: ${JSON.stringify(measure)}.
Triptych under work (if any): ${JSON.stringify(ctx.args.triptych ? { title: ctx.args.triptych.title, carry: ctx.args.triptych.carry } : null)}.
You read notes/KILLED_LEVERS.md at boot; never re-propose a K-id without new cited evidence.
Propose exactly 1 lever through YOUR lens: a concrete translation move that reduces translation-debt. diffPlan must name the triptych directory, the form file(s) to change, and the exact (claim, form) pairs the move would add to carry.json. expectedMetric = the debt after your move if validated. Plan only — never implement, never render the text yourself. Return JSON only.`,

    // SALTED mode: the engine has already code-derived this proposal's seed,
    // salt, and census draw (4th argument). The seat narrates and returns the
    // gap AS DATA; the driver persists proposal_canon.json and gap.json and
    // the auditor replays the same engine function (verify_run.mjs).
    holdApart: (proposal, i, ctx, derived) =>
      `Seat HOLD-APART — the Gap ⿻ (xor). The engine has code-derived the hold-apart for this committed proposal (you never see the salt secret):
${JSON.stringify(derived ? { hProposal: derived.hProposal, seedHex: derived.seedHex, mode: derived.mode, N: derived.N } : null)}
Probe-form rule (state it in your transcript): parseInt(seedHex.slice(0,8),16) % 3 → 0=narrative, 1=poem, 2=paper. Return JSON: seedHex = the derived seedHex verbatim; draw = "census C1..C${ctx.config.gate.N} through probe form <name>"; transcript = one paragraph a third party can re-derive from — canonical JSON of the proposal, sha256 → hProposal, salted seed, census over N=${ctx.config.gate.N}, probe-form arithmetic shown. Never accept proposer-suggested witnesses (T2). Return JSON only.`,

    // The assayer is BLIND to the canon: it receives the PROBE FORM's text and
    // that form's declared claim IDS (not their statements) — the prompt
    // builder slices out the one probed tongue, so the seat never sees the
    // other two forms either. It must state, for each declared id, the claim
    // it recovers from the text — the keystone compares those statements
    // against the register it alone holds.
    assay: (proposal, gap, i, ctx) => {
      const t = ctx.args && ctx.args.triptych
      let probeBlock = { note: 'dry run — no triptych mounted; grade the proposal plan structurally instead (BLOCKED unless the plan itself is assayable)' }
      if (t && gap && gap.seedHex) {
        const FORMS = ['narrative', 'poem', 'paper']
        const probe = FORMS[parseInt(gap.seedHex.slice(0, 8), 16) % 3]
        probeBlock = {
          probeForm: probe,
          declaredClaims: (t.carry || {})[probe] || [],
          text: (t.texts || {})[probe] || '(missing form text)',
        }
      }
      return `Seat ASSAY — soulbis ⚔️ (neg), the prover. You are BLIND to canon/UNDERSTANDING.md — do not open it; your boot list does not include it (T3).
Proposal under assay: ${JSON.stringify(proposal)}
Gap: ${JSON.stringify({ seedHex: gap.seedHex, draw: gap.draw })}
Probe-form arithmetic: parseInt(seedHex.slice(0,8),16) % 3 → 0=narrative, 1=poem, 2=paper.
Probe materials (driver-mounted; canon and the other two tongues withheld): ${JSON.stringify(probeBlock)}
For EACH claim id the probe form declares: recover from the probe text alone a one-sentence statement of that claim. If any declared id yields nothing recoverable, the gate is ZERO (T5). status: VALIDATED only if every declared id recovers AND the hard constraint holds (no assertion contradicting the recovered set's own logic; consent line present for any corpus material) AND expectedMetric beats the frontier. Otherwise MIRAGE (name the failing check: which claim id failed on which form) or BLOCKED (name what is missing). gateResult = "<recovered>/<declared>". metric = the proposal's expectedMetric if validated, else the current debt. evidence = your per-claim recovered statements, numbered. Return JSON only.`
    },

    critic: (proposals, verdicts, ctx) =>
      `Seat CRITIC. Proposals: ${JSON.stringify(proposals)}
Verdicts: ${JSON.stringify(verdicts)}
Classify each closed lever structural / probe-limited / noise / mis-gated. Red-team the PROPOSER's rationale, never the prover's verdict: a MIRAGE on the poem tongue usually means the poem was tuned for beauty over carriage — say so plainly. Draft KILLED_LEVERS entries for structural kills. Name exactly ONE next lead (the single most debt-reducing translation move left open). Return JSON only.`,

    chronicle: (round, ctx) =>
      `Seat CHRONICLE. Draft the round chronicle following ${ctx.root}/templates/chronicle.md: verdict-first, reversals at win-prominence, handoff block ending in the critic's nextLead. Round data: ${JSON.stringify(round)}. Return ONLY the chronicle markdown body as text (the driver writes it to ${ctx.runDir}/CHRONICLE_DRAFT.md).`,
  },

  schemas: {
    measure: {
      type: 'object', required: ['metric', 'stale', 'leverCosts'],
      properties: {
        metric: { type: 'number' },
        stale: { type: 'boolean' },
        leverCosts: { type: 'array', items: { type: 'object', required: ['lever', 'cost', 'ceiling'], properties: { lever: { type: 'string' }, cost: { type: 'string' }, ceiling: { type: 'string' } } } },
        notes: { type: 'string' },
      },
    },
    proposal: {
      type: 'object', required: ['proposals'],
      properties: {
        proposals: {
          type: 'array', minItems: 1,
          items: {
            type: 'object',
            required: ['leverId', 'title', 'lens', 'rationale', 'expectedMetric', 'hardConstraintNote', 'diffPlan'],
            properties: {
              leverId: { type: 'string' }, title: { type: 'string' }, lens: { type: 'string' },
              rationale: { type: 'string' }, expectedMetric: { type: 'number' },
              hardConstraintNote: { type: 'string' }, diffPlan: { type: 'string' },
              killedLeverCitations: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    gap: {
      type: 'object', required: ['seedHex', 'draw', 'transcript'],
      properties: {
        seedHex: { type: 'string' },
        draw: { type: 'string', description: 'the witnesses drawn, as data (census + probe form)' },
        transcript: { type: 'string', description: 'serialization + hash + draw rule, third-party re-derivable' },
      },
    },
    verdict: {
      // gateResult and metric are REQUIRED here (a divergence from the
      // template): with a schema-forced local model, an optional field is a
      // field the model may omit — and verify_run refuses a VALIDATED with no
      // recorded pass ratio. Required-ness is what makes the driver's format
      // enforcement produce it (learned from run live1, 2026-07-17).
      type: 'object', required: ['leverId', 'status', 'gateResult', 'metric', 'evidence'],
      properties: {
        leverId: { type: 'string' },
        status: { type: 'string', enum: ['VALIDATED', 'MIRAGE', 'BLOCKED'] },
        metric: { type: 'number' }, gateResult: { type: 'string' },
        failingCheck: { type: 'string' }, evidence: { type: 'string' }, scratchDir: { type: 'string' },
      },
    },
    critic: {
      type: 'object', required: ['classifications', 'nextLead'],
      properties: {
        classifications: { type: 'array', items: { type: 'object', required: ['leverId', 'class', 'why'], properties: { leverId: { type: 'string' }, class: { type: 'string', enum: ['structural', 'probe-limited', 'noise', 'mis-gated'] }, why: { type: 'string' } } } },
        nextLead: { type: 'string' },
        killedLeverDrafts: { type: 'array', items: { type: 'string' } },
      },
    },
  },

  stop: { dryRounds: 2, maxRounds: 5 },

  isValidated: (v) => v.status === 'VALIDATED',
  isStructural: (critic, leverId) =>
    (critic.classifications || []).some(c => c.leverId === leverId && c.class === 'structural'),

  // instance checks conform.mjs runs on frontier.json: the debt is a count.
  conformChecks: [
    (f) => {
      const errs = []
      if (!Number.isInteger(f.baseline?.metric) || f.baseline.metric < 0) errs.push('baseline.metric must be a non-negative integer (a count of (claim,form) pairs)')
      if (!Number.isInteger(f.best?.metric) || f.best.metric < 0) errs.push('best.metric must be a non-negative integer')
      return errs
    },
  ],
}
