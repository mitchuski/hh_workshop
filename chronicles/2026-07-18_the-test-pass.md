# 2026-07-18 (the test pass) — Issues Found, Fixed, and Named

**Verdict first:** the system holds under adversarial testing — every abuse
case refuses with a teaching error, nothing writes without consent, all
traversals bounce — but the pass found **one conceptual incoherence, one
missing core surface, and five real traps**, all now fixed, plus a set of
honestly-named open items. This chronicle is the findings record.

## Functional — found and FIXED

1. **The default model didn't exist.** The Towel's rounds form, the ACTIONS
   fallback, and MACHINE_SETUP all pointed at `hh-mage` — never created.
   A professor's first click would have produced a round of dead seats.
   `ollama create hh-mage -f mage/Modelfile` run; and see #2 for why the
   default *changed anyway*.
2. **The facilitator was seated as the judge.** Conceptual incoherence
   caught by the test: rounds defaulted to `hh-mage`, whose own persona
   (FACILITATOR.md rule 4) says *the mage does not grade — the blind gate
   grades*. Seating the persona'd facilitator as assayer contradicts the
   workshop's law. **Two hats, two invocations**: `hh-mage` for
   conversation; rounds run the BASE model. Defaults + docs corrected.
3. **The mirror had no mouth.** We built the persona, the context pack,
   the whole express→reflect loop — and no UI to talk to the mage. Added
   **the mirror** tab (+ `/api/mirror`, loopback-only proxy; conversation
   lives in the page — talk is not corpus, C20). First live exchange
   answered with a near-quote of the folded voice note ("compression is
   the hardest translation") — **the context grounding provably works**.
4. **Forge slug collision** — two artefacts named alike would share a slug
   and the second would silently vanish from the derived graph. Refused
   now, with the reason.
5. **Queue noise** — stub-run chronicle drafts listed as keystone work;
   filtered (drafts to review: 6 → 4, all real).
6. "the Hand" survived in one error message; renamed.
7. Ops: an orphan server (foreground `&` mistake) held :4245 beside the
   tracked one; killed. One Towel, tracked, serves.

## Functional — verified GOOD

Twelve abuse cases (forge ×5, edge ×2, roster dup, doc/static traversal,
unknown action, empty transcribe) all refuse cleanly, ledgers untouched.
Duplicate-forge refusal confirmed live. Drift check clean; bundle fresh;
chain verifies; ALL 9 GATES; the UI-path live round (the professor's
literal click) launched through `/api/run` with corrected defaults.

## UX — open items, named honestly

- **No "new triptych" flow** — students must hand-make `artifact/<dir>/`
  with three files + carry.json; the gate form takes a path. The single
  biggest missing student affordance. (Scaffold action = the natural next
  build.)
- Pairs draw sits under the trust-edge card; it belongs beside the roster.
- The progress tab shows the raw register markdown while claims.html
  renders it better; link or embed the matrix instead.
- Role-card `href="#"` links jump-scroll (cosmetic).
- The header no longer advertises a Window that isn't lit (copy fixed:
  says how to light it).

## "Why is this even here" — the coherence audit

- **`mint_artefact.mjs`, `emit_feed.mjs`, `workshop.html`, `frontier.html`**
  — vendored, wired to nothing in this instance. Kept (VENDOR verbatim
  discipline; the Window needs its pages if lit) but named. mint_artefact
  is a candidate to WIRE — sealing validated triptychs into κ-addressed
  artefacts is exactly its job — rather than dead weight.
- **`hh.workflow.mjs`** — the Claude-Code portability bundle, noise to a
  student reading an air-gapped repo root. Justified (the framework
  bridge), documented, kept.
- **`templates/`** — earns its place: the negative gate test requires a
  blank that must fail.
- **The Window vs the Towel** — overlap is real but the roles differ (a
  GET-only projection the room can trust precisely because it has no
  hands). Candidate: a Towel action to light it, so the copy is never
  aspirational.
- **runs/ debris** — smoke/test runs accumulate and every check re-verifies
  them (cost grows slowly). Fine today; a prune-or-archive policy is a
  future steward chore, noted.

## Addendum — the brief

The delivery package is bound: **`docs/BRIEF.md`** — premise · what exists
(verified, with the checking commands named) · the course walked week 0 →
the leaving · what the university receives · how a skeptic checks ("nothing
in this brief asks to be believed") · the path from here · the package
manifest. Print-ready twin at `artifact/brief.html` via
`tools/bind_brief.mjs` (whose first draft hung on an unincremented
blockquote loop — caught by the OOM, fixed, bound clean). README carries
the row.

## Addendum — the graph errors, actually killed + the spellweb port

The persisting console errors were near-zero coordinates in scientific
notation from **stale copies**: the demo graph had been generated pre-fix
(a regeneration gap, closed), and old tabs keep their pre-fix animation
loops erroring every frame until closed. Fixes: both graphs regenerated
through the guarded template; **`cache-control: no-store`** on everything
the Towel serves; a **visible build stamp** (`hh-graph v4 …` logs amber in
the console) so which-build-is-running is checkable, never arguable; the
framework's `tools/spellweb.mjs` got the same finite-fixed guard.

Then, per the First Person ("review spellweb again — it shouldn't be hard
to make this interface more consumable"), the consumability re-review
found spellweb's grammar lives in four portable patterns — presets-as-
guided-tours (its crown asset), the type→color+icon theme, the inspector-
as-hub, path lighting — and its known first-load weakness (the whole
hairball at once). All four ported, and the weakness fixed the generative
way: **five TOURS now DERIVE from the ledgers** (🐟 the Babblefish Walk ·
📜 the Consent Path · 🔑 the Steward's Week · 🪢 the Earned Graph · ⚖️
the Gate's Verdicts — each an ordered walk with per-stop notes, a proverb,
step navigation, and non-members dimmed to 14%). **The page now opens ON
a walk, not the hairball** (`?tour=none` for the whole web); node types
carry glyphs; tour chips sit above the filters. Both pages syntax-checked;
gates green.

## Handoff

Queue regenerated (4 real drafts, 10 candidates incl. ux-click, t1 at the
gate). Open UX items above are the next build menu — the "new triptych"
scaffold first. **The brief + letters + one-pager + /demo/ are the
complete outreach kit.** Demo graph has no tours yet (hides gracefully) —
a sample-cohort tour set is a small follow-on.
