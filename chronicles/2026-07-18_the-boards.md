# 2026-07-18 (latest) — The Boards

**Verdict first:** both boards the First Person flagged are rebuilt. The
web screen is now a real board (full-viewport stage, filters, search,
neighborhood light-up) instead of a hairball in a letterbox; and the Game
of 42 is **reset for this use case** — the workshop's own derived 42 at
`/game/`, with the hosted always-on game demoted to `/game/full/` as the
elder sibling. All routes live on the running Towel.

## The web screen, remade

`web/site.mjs` now emits `graph.html` as a standalone board, not a shell
page: full-viewport SVG stage; floating toolbar (search-with-datalist ·
fit-to-view · **type-filter chips** with counts — `term` nodes, the laws'
object nouns, are off by default so the first sight is structure, not
confetti); labels only where they earn them (major types + high-degree,
everything on selection); **click a node → its neighborhood lights and the
rest dims to 18%**, edges of the selection go sapphire; floating inspector
with clickable edge rows (walk the graph from the panel); zoom at the
cursor; per-edge-type link distances; `?embed` strips the chrome for the
Towel's iframe (now 66vh, embed mode).

## The 42, reset for the workshop

Per the First Person: "reset for this use case … rather than linking
forward to my hosted game 42."

- `boardState()` (tools/workshop_ui.mjs) DERIVES the board: 6 axes in the
  A1 spirit (⚔️ protection · 🧙 delegation · 🪞 memory · 🤝 connection ·
  ⚙️ compute · 🪙 value), 7 stations each, and a station lights only when
  the ledgers record its trust task — laws compiling, consent lines
  signed, live runs where the mage held the seats, earned edges, steward
  folds, chronicles, spooled pages, the derived web, offline-verified
  runs, gates green, triptychs at/through the gate, bound books. Nothing
  is placed by hand. κ over the canonical board state re-derives per load.
- `game/board.html` renders it: six heptads (center + ring of six) around
  a seal disc showing filled/42, p, and the board κ; click an axis for its
  stations; the cast (consent-gated roster) and the seal in the side
  panel. `?embed` for the Towel's game tab, which now shows the board
  itself with the lane cards beside it.
- **First derivation: 20/42, p = 0.4762** — an honest reading of exactly
  where the workshop stands tonight.
- The vendored dist stays fully playable at `/game/full/` — the elder
  sibling, linked from the board's header, no longer the front door.

## Addendum — the newcomer pass (UX round 2)

Per the First Person: intuitive to the professor and students. Diagnosis:
the Towel spoke canon before English and had no front door. Applied
(UX_REVIEW.md §4): **start tab** as default — "don't panic" + three role
cards (student / steward / professor) with step-links into the right
tabs; **task-first tab names** (the gate, the fold, the books, the wiki,
progress…) with canon intact inside; **"? words" glossary** (mage,
triptych, tongue, gate, fold, steward, debt, κ, seal, oasis, door — one
newcomer sentence each); **live mage dot** in the header (server pings
the local endpoint, 800ms budget, 10s cache); refusal paths now point at
the remedy. Towel restarted; all checks serve. The audit that outranks
this one: three real newcomers at the screen.

## Handoff

Doors unchanged. The board's station taxonomy (which ledger events feed
which axis, the 7-cap per axis) is a First-Person tuning surface — one
function, plainly written. When a real cohort seals a week, the seal-disc
moment (p rising, κ read aloud) is the rite CEREMONY.md §7 already names.
