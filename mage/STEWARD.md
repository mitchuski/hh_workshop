# STEWARD.md — the rotating weekly steward

Each week one student holds the mage's training. The rotation is the design,
not a chore-wheel: by the end of the course **every name is in the chain**
(mage/steward_log.md), which is what makes the cohort's provenance
structural instead of ceremonial (artifact/PROVENANCE.md). The steward holds
the *training*; they are not the boss of the mage — it stays co-held (C11).

## Duties (one week)

1. **Ingest** — run the week's audio notes and drafts through
   `node ingest/transcribe.mjs <file>`; chase the consent lines (the
   *speaker* signs, never you on their behalf — INGEST.md).
2. **Admit** — move consented candidates from `ingest/out/` into `corpus/`.
3. **Fold** — `node tools/corpus_pack.mjs` → new context pack + Modelfile;
   rebuild the mage's grounding:
   - option A (default, any hardware): `ollama create hh-mage -f mage/Modelfile`
   - option B (capable hardware): the LoRA path — MACHINE_SETUP.md; the duty
     is identical, only the depth of the fold changes (C13).
4. **Log** — append your entry to `mage/steward_log.md`: week · your name ·
   files folded (with their consent rows) · `pack sha256` from the packer's
   output · mage state note.
5. **Verify in public** — at the next session's opening, run
   `node tools/corpus_pack.mjs --verify` in front of the room. Green means
   the chain held through your hands.
6. **Hand over** — read your entry aloud; pass the flight-case key.

## The handover rite (CEREMONY.md §7)

Short on purpose: verify green → entry read aloud → key passed. The room
witnesses every link — a chain nobody watches is a story, not provenance.

## What the steward never does

- admit anything without its consent line (the packer will refuse you
  anyway — hard constraint b);
- touch `frontier.json`, `claims_register.md`, or the register (keystone-only
  writes, GR-10);
- push, cast, or publish anything outward (the First Person's door, T6).
