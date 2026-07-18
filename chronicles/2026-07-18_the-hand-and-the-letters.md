# 2026-07-18 — The Hand, the Game, and the Letters

**Verdict first:** the workshop now has its control surface, its game, its
public-goods framing, and its door-knockers. All gates stay green (9/9).

## Built this session

- **The Hand** (`tools/workshop_ui.mjs` + `workshop_ui.html`, :4245) — the
  local control surface beside the GET-only Window (:4242). Zero-dep Node.
  Tabs: frontier · rounds · steward · artefacts · laws · oasis · game ·
  doors. Every action is a **whitelisted spawn of an existing repo script**
  (measure, check, lexon, stub/live rounds, verify, pack + chain-verify,
  transcribe, bind books, spool exports) — the UI adds convenience, never
  power. **No push/cast/publish endpoint exists**; door items render as a
  list, never buttons (T6/GR-8). Binds 127.0.0.1; `--lan` for the room.
  Smoke-tested: state, jobs, consent refusal, game serving — all green.
- **The Game of 42 lane** — the built game vendored whole (`game/dist/`
  from `~/game42` @ `2dc4255`; its own conform gate + 21 tests + vite run
  fresh at vendor time; VENDOR.md third source) and served air-gapped at
  `/game/`. On top, the chain the First Person named: **persona + skill matching**
  (consent-gated roster — no ledger row, no seat; joining mints a
  room-scoped ed25519 `did:key` + κ-address for the persona holon) →
  **geometry** (the game's own seal/fold) → **the trust graph** (earned
  edges only: mentor-assay · steward-fold · pair-swap · keystone-fold ·
  seal-witness, signed via the vendored `vrc.mjs`, no self-edges per C30,
  every signature verifies offline). Deterministic pair matching drawn
  from the roster hash — the Gap's idiom applied socially. First roster
  entry: the First Person, seeded like the corpus.
- **`docs/AUTO_RESEARCH.md`** — the public-goods auto-research pattern:
  what the university receives (instrument + method + record), the split
  that governs automation (**automate measuring and proposing; never
  folding or the door**), the moving ceiling (register growth raises 3·N),
  the dream-cycle standing watch, and the fine-tuning weave (one endpoint,
  three hats; cohort LoRA generations as citable lineage; cross-cohort Φ;
  the erasmus rule: **methods and probes travel, corpora never do**).
- **The letters** (`letters/`) — drafts to the two professors, essay-form,
  hitchhikers voice over the serious iterations:
  - *international law*: Lexon as law that compiles; IEEE 7012 inversion;
    absence claims (extraction structurally impossible, twin-tested); the
    Gödel proverb as jurisprudence; withdrawal as part of the record.
  - *cryptography/cybersecurity*: the Fiat–Shamir hold-apart with
    commit-then-salt; census-over-sampling and its refusal arithmetic;
    fail-closed offline replay (including the live1 UNVERIFIABLE story as
    a teaching artifact); declared Φ_inference; κ-addressing; the earned
    trust graph; the venue-network threat model.
  Sending is the door — both marked as drafts for the First Person's hand.

## Standing notes

- game42 rebuilt clean before vendoring (conform + 21 vitest + build).
- The Hand's readable-docs endpoint is allowlisted; static serving is
  path-normalized under `game/dist` only.
- UI server is interactive, so it has no automated gate; its smoke test is
  recorded in this chronicle and repeatable by hand in one minute.

## Handoff

Doors as before, plus: professor names/addresses for the letters ·
`--lan` posture decision per venue · scheduled dream cycle (venue clock
discipline) · sister-instance for the probe exchange. Next lead on the
frontier remains the poem tongue (OT-1).
