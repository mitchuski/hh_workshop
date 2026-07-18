# UX_REVIEW.md — the Towel, reviewed against its real uses

*2026-07-18. Review method: use-case walk (who stands in front of each tab,
on what screen, under what pressure), then per-tab findings, then the
layout system that fixes them. Chrome extension was offline — findings are
from the markup/CSS; the First Person's eyes are the final gate.*

## 1 · Who actually uses this, and when

| moment | person | screen | what they need |
|---|---|---|---|
| **pre-flight** (before the room enters) | facilitator | laptop | run-all-gates + result readable at a glance; doors list as a checklist |
| **the Friday fold** (room watching) | steward | laptop, sometimes mirrored | the chain as a *timeline read aloud*; fold + verify buttons unmissable; big legible output |
| **a round** (weekly exercise) | facilitator/steward | laptop | the run form as a *form* (labels!), the streaming output the hero of the tab |
| **student glance** | participant | own laptop via `--lan` | game tab: join form obvious, refusals loud; the graph/web pages full-bleed |
| **the room's shared screen** | everyone | projector | mostly the Window (:4242) and `/web/graph.html` — the Towel's iframe view should be viewport-sized, not a fixed 520px letterbox |

The Towel is a *control panel with one narrator*: on every action tab the
real protagonist is the output stream. The current layout treats outputs as
footnotes (420px capped `<pre>` sitting in whatever space is left) and
inputs as inline confetti. That inversion is most of what feels wrong.

## 2 · Findings, per section

- **Global** — no spacing scale: margins are 6/8/10/14 ad hoc, so sections
  have different visual rhythm and nothing lines up. One `max-width:1080px`
  for every tab: too wide for reading tabs (doors), too narrow for
  board-like tabs (game, web). Base font 14px is small for a mirrored
  laptop.
- **frontier** — the two-card row gives the stat tile and the open-target
  text equal flex, so the number floats in emptiness while the sentence
  squeezes. The whole claim register dumps into one capped `<pre>`:
  cramped, double-scrolling. (Dataviz rules: a stat tile is a fixed, small
  thing; long text is a reading column.)
- **rounds** — the form is bare text + inputs inline (`run id <input>
  model <input>…`) with a manual `<br>`: wraps mid-pair, labels don't
  attach to fields, tab-order visually scrambled. The runs table prints raw
  tally JSON (`{"VALIDATED":2,…}`) — overflow + noise; should read `2 ✓ ·
  0 mirage`.
- **steward** — the chain renders each log entry inside a nested `<pre>`
  inside a card: boxes in boxes, lumpy gaps, reads as code instead of as a
  *ledger of hands*. This is the tab most often read aloud; it deserves a
  timeline treatment (accent rule, entry title, meta line, hash as code).
- **artefacts / laws / oasis** — fine structurally, but each has a
  half-empty output `<pre>` consuming vertical rhythm before anything ran;
  outputs should start collapsed (one hint line) and grow when live.
- **game** — three stacked cards each with a table; the join form mixes a
  multi-select (3 rows tall) against single-line inputs with no baseline
  alignment; selects unlabeled ("—select→" pattern is cute but illegible
  to a newcomer). Refusals (consent!) land in the same quiet gray pre as
  routine output — the one message that should be loud.
- **web** — the embedded graph iframe is a fixed 520px letterbox: wasteful
  on a tall screen, overflowing on a short one. Should be viewport-based
  (~66vh). This tab and game earn full width.
- **doors** — good as a list; just inherits the global rhythm problems.

## 3 · The system applied (what changed)

1. **Spacing scale** — `--s1..--s5` (6/10/16/24/36px); cards, rows, form
   gaps, and section padding all draw from it. One rhythm everywhere.
2. **Per-section width** — reading tabs (frontier text, doors) at 880px;
   working tabs at 1100px; board tabs (game, web) `wide` at 1400px.
3. **Forms are forms** — `.field` = small muted label *above* its input;
   fields flow in a flex row with even gaps; buttons grouped in an
   `.actions` row, never orphaned mid-text.
4. **Stat tiles are tiles** — fixed-basis stat cards (number + label),
   text cards take the remaining flex. (dataviz stat-tile shape.)
5. **Outputs are the protagonist** — `.out` starts one line tall, grows to
   `min(46vh, …)` when running, `aria-live="polite"`; error/refusal text
   gets the red accent + heavier border (consent refusals now *look*
   like refusals).
6. **The chain is a timeline** — steward entries render as `.entry` blocks
   with an amber left rule, title/meta/body hierarchy, hashes in `<code>`.
7. **Tables tidied** — tally JSON formatted (`2 ✓ · 0 ✗`); long cells
   truncate with tooltips; numeric columns right-aligned.
8. **The iframe breathes** — `height: 66vh` with a min.
9. **Type** — base 14.5px/1.55, nav targets taller, header subtitle clamps
   to one line on wide screens.

## 4 · Round 2 — the newcomer lens (same day, later)

*Audience shift per the First Person: it must feel intuitive to the
professor and the students — people who have never met the canon.*

**Diagnosis:** the Towel spoke canon before it spoke English, and had no
front door. A professor's first thirty seconds contained a dozen
unexplained coinages (frontier, translation-debt, spool, oasis, lever,
MIRAGE); the default tab was the most abstract one; tabs were system
nouns where newcomers navigate by task; the panel never showed whether
the mage was even awake; and refusals taught the rule without pointing at
the remedy. The mythic names are pedagogy — story first — so the fix is
never to delete them, but to give every one a plain-language shadow
within eyeshot.

**Applied:**

1. **A front door** — `start` is now the default tab: one "don't panic"
   paragraph saying what the machine is, then three role cards (🎒
   student · 🔑 steward of the week · 🎓 professor/facilitator) with
   numbered first steps, each step a link that jumps to the right tab.
   The professor card states the assessment posture in two sentences.
2. **Task-first tab names** — start · the 42 · the gate · the fold · the
   books · the laws · the wiki · the web · progress · the doors. (Ids and
   canon vocabulary unchanged inside the tabs.)
3. **A glossary one click away** — "? words" in the nav opens a card
   defining mage, triptych, tongue, gate, fold, steward, debt, κ, seal,
   oasis, door — each in one newcomer sentence.
4. **System health at a glance** — the header carries a live mage dot
   (● with model count / ○ asleep, with a pointer to MACHINE_SETUP);
   trust grows when a panel shows its own state.
5. **Refusals now point at the remedy** — the roster card says where step
   1 lives and that you sign for yourself; progress carries a one-line
   explanation of why the number only moves when the gate validates.

**Still open for a live-cohort iteration:** watch three real newcomers
use it (the only audit that outranks this one); a student view split from
steward controls; keyboard focus order.

## 5 · Not done here (named)

- Visual QA on a real screen (extension offline) — the First Person's
  pass; anything that still sits wrong is a one-line CSS scale tweak.
- A participant-facing split (student view vs steward controls) — worth
  doing when the first real cohort exists; today the ladder is enforced in
  the pipes, not the chrome.
- The generative site pages share the aesthetic but have their own simpler
  shells; graph.html inherited the viewport fix pattern. A full pass on
  them rides on the same variables when wanted.
