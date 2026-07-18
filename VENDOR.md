# VENDOR.md — provenance of the vendored skeleton

**Vendored work is not authored.** Everything listed here was copied verbatim
from the dual-agent harness framework so this instance can run standalone
(no network, no framework checkout) — per the engine's own note: the root
"defaults to the instance itself, which is only correct if the instance
carries its own copies (T3)."

- **Source repo:** `C:\Users\mitch\dual-agent-harness`
  (public: github.com/mitchuski/agentprivacy-harness)
- **Source commit:** `c4443c7a072e6a3550bd22114eeb329b5f549483`
- **Vendored on:** 2026-07-17

## Verbatim copies

| here | from | what |
|---|---|---|
| `TRUSTS.md` | root | T1–T6, the constitution — keep verbatim, never edit here |
| `GROUND_RULES.md` | root | GR-1..GR-10 |
| `seats/*.md` | `seats/` | the seven seat cards |
| `engine/dual_agent_loop.mjs` | `engine/` | the loop |
| `engine/gap.mjs` | `engine/` | the Gap as code (pure-JS SHA-256) |
| `engine/conform.mjs` | `engine/` | the conformance gate (G0) |
| `engine/{gap,loop,loop.salt}.test.mjs` | `engine/` | the engine's own tests |
| `tools/kappa.mjs` | `tools/` | the κ law (canonicalJson) |
| `tools/verify_run.mjs` | `tools/` | offline run verifier (D5) |
| `tools/mint_artefact.mjs` | `tools/` | artefact minting |
| `tools/render_run.mjs` | `tools/` | static run render |
| `tools/console.html` + `workshop.html` + `frontier.html` | `tools/` | the Workshop Console pages |
| `tools/emit_feed.mjs`, `tools/vrc.mjs` | `tools/` | feed + signed-edge helpers the console imports |
| `tools/bundle.mjs` | `tools/` | config+engine → self-contained .workflow.mjs |
| `tools/check_claims.mjs` | `tools/` | claims-register enforced-by gate |
| `templates/*` | `templates/` | the blank an instance is copied from (required to FAIL conform) |

## Adapted (not verbatim — divergences named)

| here | divergence |
|---|---|
| `tools/check.mjs` | framework version discovers instances in subdirectories; here the instance IS the repo root, so discovery is replaced by a direct `conform.mjs .` gate. Order and discipline otherwise identical. |
| `tools/console.mjs` | one-line adaptation of the instance-id mapping (the instance at the repo root would get the empty id); marked ADAPTED at the edit site. Otherwise verbatim — the GET-only Workshop Console (127.0.0.1:4242). |
| `tools/console.roots.json` | machine-local by design (gitignored in the framework); points at this instance's root. |

## Second source: the Lexon spec-checker (from lexon_pvm)

- **Source repo:** `C:\Users\mitch\lexon_pvm` · **commit:** `4d9a3ad740843d7deb802a5877f3f6e8817ca0b2` · **vendored:** 2026-07-17

| here | from | what |
|---|---|---|
| `lexon/tools/lexon_check.mjs` | `tools/` | the base grammar gate (attested Lexon subset: parse → binding → round-trip → promise typing) |
| `lexon/tools/relation_check.mjs` | `tools/` | the mutation probe (relation claims + falsifiability twins) |
| `lexon/tools/golden/*` | `tools/golden/` | the lexon.org golden fixtures + mutants + relation fixture (the selftest canary) |

The three `.lex` laws, their `.claims.json`, and `lexon/check.mjs` are
authored here.

## Third source: the Game of 42 (built dist)

- **Source repo:** `C:\Users\mitch\game42` (public: github.com/mitchuski/game42) · **commit:** `2dc4255` (dated-seal) · **vendored:** 2026-07-18
- `game/dist/*` = the app's own `npm run build` output (conform gate + 21 vitest + vite, run fresh at vendor time). Served air-gapped at **`/game/full/`** — the elder sibling, reachable but not the front door.
- **`game/board.html` is authored here** (2026-07-18, per the First Person: the game "reset for this use case"): the workshop's own 42 — 6 axes × 7 stations DERIVED from the ledgers by `boardState()` in `tools/workshop_ui.mjs`, κ-addressed, served at `/game/`. The roster/edges lane (`game/roster.json`, `game/edges.jsonl`, `game/keys/`) is also authored here, on the vendored `tools/vrc.mjs` + `tools/kappa.mjs`.

## Everything else is authored here

`harness.config.mjs` (filled), `canon/`, `corpus/`, `ingest/`, `driver/`,
`mage/`, `fedwiki/`, `workshop/`, `tools/measure_debt.mjs`,
`tools/corpus_pack.mjs`, `tools/bind_book.mjs` — hh_workshop's own work.

## Re-sync (when the framework moves)

From `C:\Users\mitch\dual-agent-harness`, re-copy the verbatim rows above,
re-read the two adapted files for drift, then update the commit hash here and
run `node tools/check.mjs` — it must stay green. Never edit a verbatim file in
place; fix upstream and re-vendor.
