# 2026-07-18 (night) — The Cycles

**Verdict first:** the autonomous layer is running. The workshop now has
its dream cycle (measure everything, fold nothing), its keystone queue
(everything waiting on a human, derived to one page), a labeled **sample
cohort** for demos, and auto-research rounds cycling in the background —
all inside the split that keeps it honest: *automate the measuring and the
proposing; never the folding or the door.*

## Built and run

- **`tools/dream_cycle.mjs`** — the standing watch AUTO_RESEARCH §2 named:
  counting rule → offline replay of every run → steward chain → laws →
  knowledge web → full gates, then a dated report to `chronicles/watch/`.
  First watch: **GREEN, 4.6s** — "nothing to wake anyone for." Exit 1 on
  any red names the exact command. Scheduling it nightly is a one-line
  venue decision; the tool is the cycle.
- **`tools/keystone_queue.mjs`** — derives `KEYSTONE_QUEUE.md`: triptychs
  at the gate (t1, with declared counts per tongue and the three possible
  decisions), **4 VALIDATED-unfolded candidates** across live1/w0-test
  (with the declared-vs-reported flag wired for post-fix runs), 6
  chronicle drafts to review, the standing doors. Review starts from one
  page, not a dig.
- **`tools/make_demo.mjs`** — the sample cohort, per the First Person:
  a fictional week 5 (8 students — the cast of "The Name That Died" plus
  friends; 6 validated + 2 submitted triptychs; 6 folds; 20 earned edges;
  board 36/42 p=0.857; debt trajectory 32→15) rendered through the SAME
  templates as the live system — the board page is literally the live
  `board.html` with data inlined, the graph through the shared
  `graph_page.mjs` (extracted this session so live and demo share one
  code path). **Every page carries the fiction banner**; the real ledgers
  are untouched. Served at `/demo/`, linked from the professor's role
  card.
- **auto-research rounds** — `auto1` (2 rounds on the canary, gemma3:12b)
  cycling in the background as this chronicle is written; verdicts land
  as candidates in the queue, never as folds.
- **The Towel** gained the cycles card on start (dream · queue · demo)
  and the `/demo/` route; restarted; all routes 200.

## The shape

The instrument now runs three loops at three speeds: the **round** (an
hour — propose and assay), the **watch** (a night — measure and report),
the **course** (a week — fold and seal, humans only). Each loop writes
its own record; none can advance the frontier alone.

## Addendum — the graph bug and the forge

- **The embed error, fixed at the root**: the graph inside the Towel's
  hidden tab measured a 0×0 iframe, so centering pulled everything to the
  origin, `fitView` computed scale 0, and the zoom math divided by it —
  SVG rejected the degenerate transforms (the console errors the First
  Person saw). The shared template now guards dimensions (0 → sane
  defaults), re-measures per frame so becoming-visible acts as the resize
  the iframe never reports (then re-fits), floors the fit scale, and
  formats every emitted coordinate finite-fixed. Fixed once in
  `web/graph_page.mjs` — live site and demo both inherit.
- **The constellation forge** (per the First Person: spellweb's
  constellation-tracking that makes artefacts, in this interface):
  ⭐ mode on the web board — click nodes into an ORDERED path (amber
  rings, numbered, dashed polyline), name it, pick a bearer, **forge**.
  Server side: canonical κ over the path holon, signed with the bearer's
  roster ed25519 key (the trust-edge machinery reused), appended to
  `game/constellations.jsonl`. The walker then gives the artefact its
  node with `composed_of` → each star and `forged_by` → the bearer —
  spellweb's deviation layer, EARNED into the derived graph instead of
  authored. The board's value axis counts forgings. The tray hides
  itself on static copies (no signer, no forge — snapshots stay honest).
- **First forging**: "The Proverb Chain" — C29 → C30 → C31, the Gödel
  spine, bearer the First Person; verified=true; visible in the web
  (114 nodes / 203 edges) and on the board (23/42).
- Ops note: one orphan server (from a foreground `&`) briefly held :4245;
  killed; exactly one tracked Towel runs.

## Handoff

The queue is the handoff: `KEYSTONE_QUEUE.md` at the repo root,
regenerated on demand. Doors unchanged.
