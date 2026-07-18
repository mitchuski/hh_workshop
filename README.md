# hh_workshop — the Hitchhikers Workshop harness

A **standalone** harness instance for a facilitated masters-cohort workshop
around a shared, air-gapped local mage: the **babblefish recursion** —

```
sci-fi narrative → poem → white paper → (recurse) ↺
```

— one understanding rendered across three tongues, with a blind, hash-drawn
gate checking that the understanding *survives translation*. Understanding is
the key (access is expressed, never issued); participant expressions are both
key and food (the cohort trains its own mage, week by week, through a
rotating steward); the cohort graduates owning its own evaluation harness,
three bound books, and verifiable provenance as the mage's first trainers.

A sibling instance of the dual-agent harness
(github.com/mitchuski/agentprivacy-harness): the engine is vendored verbatim
(VENDOR.md), `harness.config.mjs` is the divergence surface, and TRUSTS.md
T1–T6 bind unchanged. Copy this directory onto a fresh machine and it runs —
no framework checkout, no internet, no Claude Code (mage/MACHINE_SETUP.md).

## Quickstart

```
node tools/check.mjs                                  # every gate — green before anything else
node driver/run_round.mjs --stub --run smoke          # the loop, deterministically, no model
node driver/run_round.mjs --model <m> --run r1 --triptych canon/seed-triptych   # the mage holds the seats
node tools/verify_run.mjs . r1                        # the round replays offline
node tools/console.mjs                                # the room's window — 127.0.0.1:4242
```

## The five answers (harness.config.mjs)

| | |
|---|---|
| **artifact** | the cohort canon (`canon/UNDERSTANDING.md`, 31 numbered claims) + triptychs (`artifact/*/` — three tongues + `carry.json` declarations) |
| **metric** | translation-debt ↓ — (claim, form) pairs not yet carried; `node tools/measure_debt.mjs`; baseline 32 (frontier.json) |
| **gate** | babblefish census: all 31 claims, probed through ONE form drawn Fiat-Shamir from the committed triptych — the tongue you didn't polish is the one interrogated; assayer blind to canon; any miss = zero |
| **hard constraint** | no canon drift (additive-only register, keystone-folded) + consent-first (nothing enters corpus or export without a signed ledger line — enforced in the pipes, not the prose) |
| **canary** | `canon/seed-triptych/` — authored with the register; passes the census by construction |

## The map

| | |
|---|---|
| `canon/` | the claim register + seed triptych (the canary) |
| `harness.config.mjs` · `engine/` · `seats/` · `TRUSTS.md` | the harness (engine vendored — VENDOR.md) |
| `driver/` | local-model runtime: `run_round.mjs` (round runner + audit-trail writer), `ollama_rt.mjs`, `stub_rt.mjs` |
| `corpus/` · `ingest/` | the mage's food: consent ledger, audio→text pipeline (local whisper.cpp) |
| `mage/` | machine setup, facilitator persona, Modelfile, the steward's rite + log (the provenance chain) |
| `tools/` | check · verify_run · console · `measure_debt` (the counting rule) · `corpus_pack` (the fold) · `bind_book` (the leave-with-it artefacts) |
| `workshop/` | the ceremony (8 sections) · curriculum · access ladder (an auditor, honestly) · pre-flight · university one-pager · consent registers ×3 |
| `fedwiki/` | the Oasis bridge: export → offline spool → local farm; casting to hitchhikers.earth stays the First Person's door |
| `lexon/` | the workshop's law, compiling: consent agreement, steward fold, and the babblefish gate itself in controlled natural language, held green by the lexon_pvm spec-checker (`node lexon/check.mjs`) |
| `tools/workshop_ui.mjs` | **the Towel** 🧣 — the local control surface (`:4245`): dashboard + whitelisted actions (rounds, folds, books, spool, regenerate-the-websites) + the Game of 42 + the web lane; the console (`:4242`) stays the GET-only window; the door is never a button |
| `web/` | the spellweb lane: `graph.mjs` DERIVES the knowledge graph from the ledgers (spellweb dialect — typed nodes, snake_case verb edges, incl. the laws' modal-verb triples); `site.mjs` emits a self-contained generative site (force-layout web, carried matrix) — copy `web/out/site/` anywhere = the snapshot |
| `fedwiki/build_site.mjs` | the fedwiki auto-build: the whole wiki spool derived in one command (hub, register, laws, roster, chronicles, knowledge-web page carrying the graph as a fenced ```` ```hhgraph ```` block) |
| `game/` | **the workshop's 42** — the cohort's own board at `/game/`: 6 axes × 7 stations lit only by ledger events, seal κ re-derived per load (`board.html` + `boardState()`); plus the lane: consent-gated roster, hash-drawn pairs, earned ed25519 trust edges; the full always-on game (vendored dist) at `/game/full/` |
| `docs/BRIEF.md` | **the delivery brief** — the whole work and how a cohort plays out, week 0 to the leaving; bound print-ready at `artifact/brief.html` (`node tools/bind_brief.mjs`); §7 is the package manifest |
| `docs/AUTO_RESEARCH.md` | the public-goods auto-research pattern: what the university receives, the moving ceiling, the dream cycle, the mage lineage as citable artifacts |
| `letters/` | drafts to the university professors (international law · cryptography/cybersecurity) — sending is the First Person's door |
| `runs/` · `chronicles/` · `artifact/` | audit trails, session records, bound books + PROVENANCE.md |

## Lineage

Distilled from the LAN-ceremony chronicle (2026-06-28: the naming barrier,
understanding-as-key, the babblefish recursion) and the hitchhikers.earth
first-oasis link (2026-07-07: Proof of Understanding ↔ understanding-as-key;
The Three Mice). The university thread comes from the Hitchhiker timeline
sessions (niche-research universities, the "global erasmus"). This instance
is where those threads first meet in one buildable thing.
