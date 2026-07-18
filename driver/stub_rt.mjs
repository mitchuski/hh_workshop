// stub_rt.mjs — a deterministic rt driver. No model, no network, no clock.
//
// Exists so the full six-phase loop, the file layout, conform, and
// verify_run.mjs can be proven green on any machine with Node alone —
// including a fresh mage box before Ollama is installed (MACHINE_SETUP.md
// step 5). Every seat answer is a pure function of the prompt text, so two
// runs of the same round produce byte-identical artifacts.
//
// The stub assay always returns MIRAGE ("no triptych is mounted in a smoke
// round"), so a smoke run exercises the whole loop, writes a full audit
// trail, and folds nothing — which is the truthful verdict for a round that
// graded no real rendering.

const grab = (re, s, fallback = null) => { const m = re.exec(s); return m ? m[1] : fallback }
const FORMS = ['narrative', 'poem', 'paper']

export function makeStubRt() {
  const rt = {
    async agent(prompt, opts = {}) {
      const label = opts.label || ''
      const p = String(prompt)

      if (label.startsWith('measure:')) {
        const debt = Number(grab(/"debt":\s*(\d+)/, p, '0'))
        return {
          metric: debt, stale: false,
          leverCosts: [
            { lever: 'extend-a-tongue', cost: 'one rendering pass on one form', ceiling: 'the gap between that form and N' },
            { lever: 'new-triptych', cost: 'three renderings + carry declaration', ceiling: 'up to 3N fresh pairs on new claims' },
            { lever: 'revise-for-fidelity', cost: 'one repair pass', ceiling: 'restores pairs a probe disproved' },
          ],
          notes: 'stub measure: restates the driver-injected count only',
        }
      }

      if (label.startsWith('propose:')) {
        const lens = label.slice('propose:'.length)
        const debt = Number(grab(/"metric":\s*(\d+)/, p, '1'))
        return {
          proposals: [{
            leverId: `stub-${lens}`,
            title: `stub lever through ${lens}`,
            lens,
            rationale: 'deterministic smoke proposal — exercises the loop, proposes no real rendering',
            expectedMetric: Math.max(0, debt - 1),
            hardConstraintNote: 'no canon assertion is made; no corpus material is touched (consent moot)',
            diffPlan: 'none — smoke round. A real lever names the triptych dir, the form file, and the (claim,form) pairs added to carry.json.',
          }],
        }
      }

      if (label.startsWith('gap:')) {
        const seedHex = grab(/"seedHex":"([0-9a-f]{64})"/, p, '0'.repeat(64))
        const N = Number(grab(/census C1\.\.C(\d+)/, p, '31'))
        const probe = FORMS[parseInt(seedHex.slice(0, 8), 16) % 3]
        return {
          seedHex,
          draw: `census C1..C${N} through probe form ${probe}`,
          transcript:
            `Engine-derived (SALTED): canonical JSON of the committed proposal (recursive sorted keys, no whitespace), sha256 → hProposal; ` +
            `seed = sha256(hSource || hProposal || salt) with the per-proposal salt derived from the run secret no seat sees; ` +
            `census over N=${N} (drawIndices = 1..${N}); probe form = parseInt("${seedHex.slice(0, 8)}",16) % 3 → ${probe}. ` +
            `Third party replays via tools/verify_run.mjs on the saved bytes.`,
        }
      }

      if (label.startsWith('assay:')) {
        const leverId = grab(/"leverId":"([^"]+)"/, p, 'unknown-lever')
        const debt = Number(grab(/"metric":\s*(\d+)/, p, '0'))
        return {
          leverId,
          status: 'MIRAGE',
          metric: debt,
          gateResult: '0/31',
          failingCheck: 'no triptych mounted — a smoke round has no probe text, so no declared claim can be recovered (T5: the gate is zero)',
          evidence: 'stub deterministic assay: the probe form was named by the Gap but carries no mounted text in a smoke round; nothing recoverable, nothing validated.',
        }
      }

      if (label.startsWith('critic:')) {
        const leverIds = [...p.matchAll(/"leverId":"([^"]+)"/g)].map(m => m[1])
        return {
          classifications: [...new Set(leverIds)].map(leverId => ({
            leverId, class: 'noise',
            why: 'smoke-round stub lever: exercises the loop, proposes no real rendering — correctly folds nothing',
          })),
          nextLead: 'mount a real triptych (--triptych <dir>) and run a live round: the poem tongue carries the least (see frontier OT-1)',
          killedLeverDrafts: [],
        }
      }

      if (label.startsWith('chronicle:')) {
        const roundId = grab(/"roundId":"([^"]+)"/, p, '?')
        return [
          `# Chronicle draft — smoke round ${roundId}`,
          '',
          '**Verdict first:** every stub lever returned MIRAGE (0/31 — no probe text mounted), and that is the correct verdict for a round that graded no real rendering. The loop, the salted Gap, and the audit trail all exercised end-to-end.',
          '',
          '**Reversals:** none — nothing was folded, so nothing can be unfolded.',
          '',
          '**Handoff:** mount a real triptych (`node driver/run_round.mjs --triptych <dir> ...`) and run a live round; the critic\'s next lead: the poem tongue carries the least.',
        ].join('\n')
      }

      throw new Error(`stub_rt: unrecognized seat label "${label}"`)
    },

    async parallel(thunks) {
      const out = []
      for (const t of thunks) { try { out.push(await t()) } catch { out.push(null) } }
      return out
    },

    async pipeline(items, ...stages) {
      const out = []
      for (let i = 0; i < items.length; i++) {
        let r = items[i]
        try {
          for (const stage of stages) r = await stage(r, items[i], i)
          out.push(r)
        } catch { out.push(null) }
      }
      return out
    },

    phase(title) { rt.onPhase && rt.onPhase(title); console.log(`── ${title}`) },
    log(msg) { console.log('   ' + msg) },
  }
  return rt
}
