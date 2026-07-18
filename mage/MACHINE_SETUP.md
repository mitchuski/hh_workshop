# MACHINE_SETUP.md — a fresh mage box, from zero

The standalone claim, as a runnable list. Target: one commodity machine
(the "mage box") that will sit air-gapped in the workshop room. Everything
below is offline-safe except the two marked **pull-before-you-travel** steps.

## 1 · Install

1. **Copy this directory** (`hh_workshop/`) onto the box. That is the whole
   install — zero npm dependencies; the engine, tools, canon, and docs are
   all inside (VENDOR.md records their provenance).
2. **Node ≥ 18** — offline: carry the installer
   (nodejs.org/dist, the `.msi`/`.pkg`/tarball for the box's OS).
3. **Ollama** — install, then **pull-before-you-travel**:
   `ollama pull <model>` while still online. Default class: an 8–14B
   instruct model (e.g. `gemma3:12b`, `llama3.1:8b-instruct`,
   `qwen2.5:14b-instruct`). Final choice is the First Person's, on the box.
   Verify: `curl http://127.0.0.1:11434/api/tags` lists it.
4. *(optional, for audio ingestion)* **ffmpeg + whisper.cpp** — carry a
   built `whisper-cli` and a ggml model (**pull-before-you-travel**; the
   large-v3-turbo q5 model file is ~550 MB). Point the pipeline at them via
   `$HH_WHISPER`, `$HH_WHISPER_MODEL`, `$HH_FFMPEG` (ingest/transcribe.mjs).

## 2 · Prove it (no model needed)

```
node tools/check.mjs                      # all gates: axioms → instance → runs re-derive
node driver/run_round.mjs --stub --run smoke    # full six-phase round, deterministic
node tools/verify_run.mjs . smoke         # the round replays from its own bytes
```

All green on Node alone — the loop, the salted Gap, and the audit trail are
proven before the model ever wakes.

## 3 · Wake the mage

```
node tools/corpus_pack.mjs                          # pack the consented corpus; refresh Modelfile
ollama create hh-mage -f mage/Modelfile             # the room-grounded mage (option A)
node driver/run_round.mjs --model gemma3:12b --run r1 --triptych canon/seed-triptych
node tools/console.mjs                              # the WINDOW — GET-only, 127.0.0.1:4242
node tools/workshop_ui.mjs                          # the TOWEL — control surface + game + web, 127.0.0.1:4245
node web/site.mjs                                   # derive the generative site (graph + pages)
```

The Towel (`--lan` to serve the workshop room) can only invoke the repo's own
scripts; push/cast/publish do not exist there — the door stays a human act.

**Two hats, two invocations — never confuse them:** `hh-mage` (the base
wearing FACILITATOR.md + the room's context pack) is for *conversation* —
the mirror the room talks to. **Rounds run on the BASE model** (`gemma3:12b`
or whatever the box pulled): FACILITATOR.md rule 4 says the mage does not
grade, and seating the persona'd facilitator as the blind assayer would
contradict the workshop's own law. The drivers and the Towel default to the
base for rounds.

## 4 · Training depth (C13: ship the good, grow into the perfect)

- **Option A — context grounding (default, any hardware).** The weekly fold
  rebuilds `mage/context_pack.md` + `mage/Modelfile`; the mage *reads* the
  room live. Fully offline, seconds to rebuild, trivially reversible
  (withdrawal = repack).
- **Option B — LoRA fine-tune (capable hardware; the parked "perfect").**
  When the box carries a suitable GPU: train a LoRA on the consented corpus
  (unsloth/axolotl-class tooling; pull-before-you-travel), convert to GGUF,
  layer it in the Modelfile. The steward duty is unchanged — fold, hash,
  log — only the depth changes. Named as an open build item in SOURCES.md;
  decide it once the real box exists.

## 5 · Venue day

Run `workshop/PREFLIGHT.md` before participants enter. The naming rules it
enforces (one good name · carried resolver · no `.localhost` · catch-all)
are claims C24–C28 — the lesson the whole rig was built around.
