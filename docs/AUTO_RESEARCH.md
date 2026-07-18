# AUTO_RESEARCH.md — the workshop as a public-goods research instrument

*The frame the First Person named: this build is, in theory, a public-goods donation to
a university in an auto-research pattern. This doc says what that means
mechanically, which patterns from the wider work are woven in, and which are
staged next. It is the bridge between the course (CURRICULUM.md) and the
letters in `letters/`.*

## 1 · The donation, precisely

What the university receives is not a syllabus. It is a **self-improving
research instrument** with its provenance attached:

- **the instrument** — this repository: a verification harness whose gate is
  blind and replayable, a local mage whose training corpus is consent-gated
  at the pipe, a law lane that compiles, and a control surface (the Towel)
  that can only do what the repo's own scripts do;
- **the method** — the babblefish recursion as a research protocol:
  understanding is only counted when it survives translation across tongues,
  checked by an assayer who never sees the canon;
- **the record** — everything the instrument produces is a citable artifact:
  the amended claim register, validated triptychs with offline-replayable
  verdicts, the steward chain, the bound books, each cohort's mage.

Public-goods properties, by construction: zero marginal dependency (no
cloud, no subscription, no API key — the machine in the flight case is the
whole stack); **non-extractive** (the absence claims in `lexon/` make
extraction *structurally impossible*, not merely forbidden); forkable (the
engine's upstream is public; a sister department copies the directory and
owns its own instrument); and **the students are not the product — they are
the provenance** (artifact/PROVENANCE.md).

## 2 · The auto-research pattern

The loop research runs on its own; humans hold the folds and the doors.

```
        ┌─ measure (the counting rule, code) ──────────────┐
        │                                                   ▼
   the mage proposes translation levers        the blind census assays them
   (story-forward ⊥ spec-forward finders)      (probe tongue drawn by hash)
        ▲                                                   │
        └─ keystone folds VALIDATED+structural ◄── critic ──┘
                     │
        the register grows (cohort-proposed claims)
                     │
        the ceiling MOVES: debt is re-measured against a larger N
```

Three patterns from the wider work are load-bearing here:

- **The moving ceiling (V6's R(t))** — research never "completes." When the
  cohort folds new claims into the register, 3·N grows, debt jumps, and the
  frontier advances against a *raised* target. An honest instrument reports
  the ceiling's motion, not just the score. `frontier.json` is the sole
  authority; OT-numbered open targets carry the "next number to beat."
- **The dream cycle (measure-only upkeep)** — between sessions the
  instrument can run unattended in the safest posture: `measure` +
  `verify_run --all` + `corpus_pack --verify` + `lexon/check` on a schedule.
  A standing watch that surfaces gaps and drift, folds nothing, opens no
  door. (The lexon_pvm runtime-01 "standing watch" and the fleet's dream
  cycle are the precedents.) Proposal rounds can also run unattended —
  verdicts queue as *candidates*; folding stays a human act at the next
  session. That split — **automate the measuring and the proposing, never
  the folding or the door** — is the whole pattern.
- **Chronicles as the research record** — every session ends in a chronicle
  (GR-7). For a university this is the lab notebook, pre-formatted:
  verdict-first, reversals at win-prominence, a handoff naming the next
  lead.

## 3 · Weaving the fine-tuning inference system

The mage is one Ollama endpoint wearing three hats, and the weave is that
the hats share provenance:

1. **Facilitator** (inference) — `hh-mage`, the base model grounded in the
   consent-gated context pack; the mirror the room talks to.
2. **The seats** (inference-as-verification) — the same endpoint holds
   measure/propose/gap/assay/critic/chronicle in the harness rounds. Φ_inference
   = 0 on a one-box room and is *declared*, never hidden; a second box (or a
   visiting model) raises it — a pre-registered experiment any cohort can run.
3. **The trained lineage** (fine-tuning) — each steward fold advances the
   mage's grounding; each cohort's endpoint state is reproducible from
   `steward_log.md` + the corpus at that hash. When option B (LoRA) lands,
   each cohort mints a **generation**: `hh-mage-c1`, `hh-mage-c2`… — and the
   lineage itself becomes the research object:
   - *ablation across generations* — does cohort-2's mage assay cohort-1's
     triptychs differently? (a measurable claim about what the room's words
     did to the weights);
   - *cross-cohort Φ* — cohort-N's proposer assayed by cohort-M's prover is
     a genuinely distinct-prior pair: the separation term the PVM wants,
     grown organically;
   - *the erasmus weave* — sister universities exchange **methods and
     probes, never corpora**: a visiting mage assays the local triptychs
     (blind, offline-verifiable) and goes home. The corpus never travels;
     the verdicts do. That is the "global erasmus" with sovereignty intact.

## 4 · The Game of 42 lane — persona → geometry → trust graph

The chain the First Person named, now wired (`tools/workshop_ui.mjs`, `/game/`):

1. **Persona + skill matching** — students join the roster (consent-gated:
   no ledger row, no seat) declaring a persona and their tongues. Pair
   matching is deterministic and hash-drawn — the Gap's idiom applied
   socially: nobody tunes who they're paired with, and complementary
   tongues pair first (the finder pair, in human form).
2. **Geometry** — the vendored Game of 42 board (6 axes × 7 stations; the
   City of Mages seed preset "meets you where you're up to"). Each node is
   a trust task: assign an agent or yourself. The cohort's weekly seal is
   the fold — the room's state made one star-form, κ-addressed, dated.
3. **The trust graph** — earned, never declared: workshop events mint
   ed25519 `did:key` edges over κ-addressed persona holons (`tools/vrc.mjs`)
   — mentor-assay, steward-fold, pair-swap, keystone-fold, seal-witness.
   No self-edges (C30: a trust that certifies itself). Every edge verifies
   offline. By course end the cohort holds a small, real, replayable trust
   graph *that grew out of verified work* — the 🪢 VRC pattern at seminar
   scale, and the on-ramp to the wider graph (hitchhikers.earth's Proof of
   Understanding; the agentprivacy trust communities) — federated later,
   at the door, by the bearer.

The sci-fi carries all of it: the canon claims are taught through "The Name
That Died" before they are ever stated formally; the game's personas give
the room its cast; the serious iterations (PVM, IEEE 7012, Lexon, the
harness trusts T1–T6) stand behind every mechanic the students touch. Story
first, spec always underneath — that ordering *is* the babblefish thesis.

## 5 · Staged next (named, not built)

- **scheduled dream cycle** — a cron/loop invoking the measure-only watch;
  trivial once the mage box has a clock discipline (the scripts exist; the
  schedule is a venue decision).
- **cohort LoRA generations** (MACHINE_SETUP.md option B) — hardware-gated.
- **cross-university probe exchange** — needs one sister instance to exist.
- **seal → City-Key bridge** — the game's sealed PNG already carries a
  cityKey projection; binding cohort seals into the wider identity surface
  is the bearer's outward act.
- **Lexon as the fourth tongue** — advanced cohorts render a triptych claim
  as a compiling law; the checker lane is already green and waiting.
