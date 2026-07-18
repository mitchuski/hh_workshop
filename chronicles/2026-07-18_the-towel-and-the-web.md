# 2026-07-18 (later) — The Towel and the Web

**Verdict first:** the workshop's expressions are now generative websites —
a spellweb-lane knowledge graph DERIVED from the ledgers (never authored),
a self-contained generative site, and a one-command fedwiki auto-build —
all served by the control surface, which the First Person renamed: **the Hand is now
the Towel** 🧣 (the most massively useful thing an interstellar hitchhiker
can have). Gates stay green.

## Built this session

- **The rename** — workshop_ui.mjs/html, README, MACHINE_SETUP,
  AUTO_RESEARCH now say the Towel. The Window (:4242) is unchanged.
- **`web/graph.mjs` — the spellweb lane's generator.** Spellweb upstream is
  hand-curated TS + d3 (386KB of authored nodes); this lane is the
  generative sibling: **86 nodes · 146 edges · 14 node types · 23 verb
  edge-types, every one walked from the repo's ledgers** (claims by band,
  triptychs → forms → carries, the lexon laws parsed into role/term nodes
  with modal-verb edges — may_register, must_return_to — straight from the
  vendored checker's triples, players + earned trust edges, runs + levers
  with verdict edges, steward folds, corpus consent state, spool pages,
  books, chronicles). Spellweb dialect honored: `{id,type,label,domain,
  layer,desc}` nodes, `{source,target,type}` snake_case edges, prefix-slug
  ids, swordsman/mage/first_person/shared domains. Dangling edges dropped;
  re-run = re-true.
- **`web/site.mjs` — the generative site** → `web/out/site/`: index (live
  state + expressions), **graph.html** (the web: hand-rolled force layout —
  the d3-force pattern in ~90 zero-dep lines, graph inlined so it works
  from file://, the Towel, or any static host = the guide-style SNAPSHOT),
  **claims.html** (the carried matrix: every (claim, form) pair carried or
  debt — the frontier made visible; the poem column shows OT-1 at a
  glance).
- **`fedwiki/build_site.mjs` — the auto-build**: the whole wiki spool in
  one command — 11 pages: hub (hh-workshop), the-claim-register (by band),
  triptych pages + the-steward-chain + the-workshop-law (delegated through
  export_page so the consent gates stay in the path), one page per law
  (full .lex in a fenced block + its relation claims), **the-knowledge-web
  carrying the derived graph as a fenced ```hhgraph block** (the game42
  bridge pattern: the page IS the data), the-roster, the-chronicles.
- **The Towel serves it all**: `/web/` static (site), `/game/` (dist), new
  **web tab** with regenerate actions (site · graph · wikibuild) + an
  embedded live graph iframe. Smoke: /web/, graph, claims, /game/ all 200.

## The shape now

Five generative expressions, one source of truth (the ledgers):
**the web** (graph) · **the site** (snapshot) · **the wiki** (spool → oasis)
· **the game** (seal geometry + earned trust edges) · **the books** (bound
artefacts). Regenerating any of them is one action on the Towel; none of
them can drift from the repo because none of them is hand-authored.

## Standing notes

- The graph generator is additive-safe: unknown future ledgers just mean
  new walkers; the audit idiom (drop + count dangling edges) keeps it
  honest.
- Spellweb upstream remains hand-curated — a possible future fold is
  emitting hh nodes/edges INTO spellweb's TS data (their audit scripts
  would gate it); named for the First Person, not attempted.

## Addendum — the UX pass (same day, later)

Per the First Person ("working, but not spaced or sized correctly per
section"): full UX review written to `docs/UX_REVIEW.md` (use-case walk:
pre-flight · the Friday fold · a round · student glance · projector), then
the layout system applied to the Towel — spacing scale (--s1..--s5),
per-section widths (reading 880 / working 1100 / boards 1400), forms as
labeled fields, stat tiles fixed + text cards flexing, **outputs as the
protagonist** (collapsed until live, red-bordered on refusal — consent
refusals now LOOK like refusals), the steward chain as an amber-ruled
timeline of hands, tally JSON humanized, the graph iframe at 66vh, base
type 14.5px. The web stat tile reads `graph.json`, which the snapshot now
carries. Chrome extension offline again — findings from markup, visual QA
= the First Person's screen.

## Handoff

Doors unchanged (professor names/send · university · pushes · farm copy +
oasis cast · model/LoRA · counsel · lexon_pvm census fold) **plus**: the
optional spellweb upstream fold. Frontier lead still the poem tongue.
