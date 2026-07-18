# 2026-07-18 (the line) — The First Inputs: 0→1

**Verdict first:** the system is hosted locally and every input type a
first person can bring — voice, poem, story, formal note — has now walked
the pipes end to end, and the generative expressions visibly evolved while
the frontier honestly did not move. This chronicle is the line drawn before
the test run.

## Hosted

The Towel is live at `127.0.0.1:4245` (dashboard, actions, `/game/`,
`/web/`), serving throughout this pass — the roster re-mint below went
through the running server, not the filesystem. The Window remains
`:4242`. Nothing hosted leaves the machine.

## The 0→1, by input type

1. **Voice** — a spoken first-person note (synthesized to wav) → ffmpeg →
   local whisper large-v3-turbo → clean transcript candidate in
   `ingest/out/` → consent row signed → admitted to
   `corpus/audio-note-poem-scarcity.md`. The note's content: *the poem is
   the scarcest tongue because compression is the hardest translation* —
   and it asked for a steward triptych, which then got written. The input
   steered the work: the loop's first real turn.
2. **Story + poem + formal note** — the three tongues arrived as
   `artifact/t1-the-stewards-week/` ("The Second Fold" / "The Fold, Read
   Aloud" / "The Steward Protocol"), carry.json declaring narrative 8 ·
   poem 5 · paper 9 claims from bands B–D, **status `submitted`**.
3. **The fold** — steward fold 2: pack rebuilt on 2 consented files, hash
   `e0db8cd7…` read into the log, `corpus_pack --verify` green. The mage's
   context now contains the room's first non-seed words.
4. **The name removed** — per the First Person: all workshop artifacts now
   say *the First Person*, never the personal name (letters keep their
   signature — they are correspondence). Roster re-minted under the new
   name: fresh did:key + κ, derived outputs regenerated clean.

## The evolution, measured

| | before | after |
|---|---|---|
| knowledge web | 95 nodes · 146 edges | **101 nodes · 175 edges** |
| triptychs in the graph | seed (canary) | seed (canary) + **t1 (submitted)** |
| corpus | 1 file | **2 files** (one born as sound) |
| steward chain | 1 fold | **2 folds**, chain re-derives |
| translation-debt | 32 | **32 — unchanged, correctly** |

That last row is the design speaking: the graph shows the submitted work
immediately (the room can see it), but the frontier does not move until
the blind gate validates it. Visibility is generative; *credit* is gated.

## The line

Everything above this line is input and infrastructure. Below it, the
gate speaks: the test run mounts `artifact/t1-the-stewards-week` and the
probe tongue is drawn where no one — including the author — can choose it.

---

## Below the line — the test run (run `w0-test`)

The draw chose the **paper** tongue for both proposals. The blind assayer
(gemma3:12b, all seats) recovered the steward protocol's claims from the
formal text alone and returned **VALIDATED, 8/8** on each; the round
COMPLETE; `verify_run` re-derives every byte offline; all 9 gates green
after.

**The keystone item the round surfaced (held, not folded):** the paper
tongue *declares 9* claims in carry.json; the seat's full pass counted 8.
A full pass by the seat's own count is not yet a full pass of the declared
census — exactly the judgment the keystone exists for, so nothing was
folded and debt stands at 32. The driver now stamps `probeDeclared`
(probe form + declared count) into every persisted verdict so this
comparison never needs digging again. t1's promotion to `validated` — and
the debt drop it would bring — waits on that human review, as it should.

**Also legible:** both lenses proposed the same leverId this round —
one model, two hats, Φ_inference = 0, declared. A second box raises it.
