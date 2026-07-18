# 2026-07-17 — The Fitting

**Verdict first:** hh_workshop exists, conforms, and runs. The babblefish
recursion (sci-fi → poem → white paper → recurse) is now a mechanically
fitted harness instance: 31-claim register, seed-triptych canary, baseline
translation-debt **32** (= 3·31 − 61, `frontier.json`), census gate with the
probe *form* drawn Fiat-Shamir, pure-data seats, and a local-model driver.
Every gate green: `node tools/check.mjs` → 8/8, including offline replay of
every recorded run.

## What was built (one session)

- **Scaffold + vendor** — `new_instance.mjs` scaffold; engine/tools/seats/
  TRUSTS/GROUND_RULES vendored verbatim from `dual-agent-harness` @ `c4443c7`
  (VENDOR.md names the two adapted files: check.mjs discovery, one console id
  line). Standalone proven: all tests pass with no framework path referenced.
- **Canon** — `canon/UNDERSTANDING.md` (31 claims, each traced to the
  2026-06-28 LAN-ceremony chronicle) + the seed triptych ("The Name That
  Died" / "Carry Your Own Names" / the ceremony spec paper) + `carry.json`.
- **The five answers** — `harness.config.mjs`: translation-debt ↓ · babblefish
  census (the census gates the claims; the draw gates the tongue) · no-drift +
  consent-first hard constraint · the seed triptych as canary.
- **Drivers** — `stub_rt` (deterministic; smoke run verified), `ollama_rt`
  (loopback HTTP, schema-forced, repair-retry, dead-seat honest), `run_round`
  (measures, salts, mounts a triptych, persists the full audit trail).
  `runs/smoke` VERIFIED offline. First live round (`runs/live1`, gemma3:12b
  holding all seats, seed triptych mounted): round 1 assay VALIDATED both
  levers; critic held them from folding — the discipline worked on round one.
- **The course machinery** — ingest (local whisper.cpp → candidate → consent
  → corpus), `corpus_pack` (consent enforced in the pipe; pack hash = the
  provenance link; `--verify` replays), `steward_log` week-0 entry,
  `bind_book` (Book of Poems / Collected Papers / Story Anthology, steward
  chain printed into every copy), PROVENANCE.md.
- **The Oasis bridge** — `export_page` (page shape matched to a live farm
  page; cross-site links as `reference` items; export consent enforced),
  `sync_spool` (local-farm copy only; refuses surprise overwrites), OASIS_LOOP
  (legs 3–4 named as the First Person's). Seed triptych + steward chain
  spooled.
- **The docs** — CEREMONY (the 8 sections, filled) · CURRICULUM (10-week arc,
  trust ladder → mechanics, steward rotation orthogonal) · UNDERSTANDING_KEY
  (an auditor, and says so) · PREFLIGHT · UNIVERSITY_ONEPAGER (the two
  threads, joined) · consent ×3 registers · MACHINE_SETUP · FACILITATOR ·
  STEWARD · README · SOURCES.

## Reversals / near-misses

- The assay prompt initially omitted the proposal object — the smoke round's
  verdicts couldn't match leverIds and verify_run said UNVERIFIABLE. Caught by
  the verifier, exactly as designed. Fixed; re-run VERIFIED.
- **The first live run was UNVERIFIABLE — and the verifier was right.** The
  12B model returned VALIDATED verdicts without `gateResult` (optional in the
  template schema, so Ollama's format enforcement never demanded it), and
  verify_run refused a VALIDATED with no recorded pass ratio. Lesson folded
  into the config: with schema-forced local models, *an optional field is a
  field the model may omit* — `gateResult` and `metric` are now REQUIRED in
  the verdict schema (divergence from the template, noted in place). Run
  re-driven bounded to one round.
- The vendored console gave the root-instance the empty id; one-line
  adaptation, named in VENDOR.md.

## Addendum (same day) — the law compiles

Per the First Person's mid-session direction, the work now syncs into **Lexon legal-
language compiling**. `lexon/` lane added: the spec-checker regime vendored
from `lexon_pvm` @ `4d9a3ad` (no public Lexon compiler exists for this
platform; "compiles" = base grammar gate + relation claims with
falsifiability twins). Three workshop laws authored in the attested subset
and green — **26/26 checks** (`node lexon/check.mjs`, wired into the main
suite as gate "lexon laws compile"):

- `consent_agreement.lex` — the 7012 bilateral as law; `Consented =
  Proffered ∧ Accepted`; Admit/Export/Withdraw gated; **absence: no
  transfer clause routes anything to the Workshop Holder** (extraction
  structurally impossible; the mutated twin that adds the route is caught).
- `steward_fold.lex` — STEWARD.md as law; admit-gated-on-consent,
  fold-complete conjunction, handover gated on public verify.
- `babblefish_gate.lex` — the harness's own discipline as law: Draw gated
  on Committed (grind-proofing D1 in legal language), Validate on
  Recovered (T5), Fold on Validated; absence to Proposer AND Assayer.

Consent layer now has a fourth register that is two at once (legal prose +
parseable structure) — plain-language, legal-stub, and machine.json all
cross-reference it. Named for the First Person: the three laws are ready-made draft
expressions if lexon_pvm's keystone ever wants workshop terms (babblefish
recursion, understanding-as-key, steward, translation-debt) as census
candidates; and Lexon is a staged **fourth tongue** for advanced cohorts.

## Standing notes

- Φ_inference = 0 on the mage box (one model, all seats) — legible by design;
  a cross-model prover is available any week the room has two boxes.
- Framework repo's universe audit fails on a PRE-EXISTING stale frontier
  (8319 vs 8441 words) from another session's uncommitted universe/ edits —
  not this instance's doing; reported to the First Person, not touched.

## Handoff

Door items (First Person's, never opened here): university partner ·
commits/pushes (both repos uncommitted) · `sync_spool --copy` into the live
farm + the cast toward `mitch.fm.ide.earth` · mage-box model choice + pulls ·
counsel review of the legal consent stub · the optional Act 18 re-mint.
Next lead on the frontier: **the poem tongue** (10/31 carried — OT-1).
