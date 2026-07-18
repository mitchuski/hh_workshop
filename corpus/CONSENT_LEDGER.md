# CONSENT_LEDGER.md — one line per admitted expression

This ledger is the hard constraint made visible (harness.config.mjs,
hardConstraint (b); claims C16, C20): **nothing enters `corpus/` or any
export without a line here.** `tools/corpus_pack.mjs` and
`fedwiki/export_page.mjs` refuse files this ledger does not cover. A violated
consent makes the result not exist, whatever the debt says.

Format — the SPEAKER/AUTHOR signs, never the steward on their behalf:

| date | participant | corpus path | scope | terms | signed |
|---|---|---|---|---|---|
| YYYY-MM-DD | name | corpus/<file>.md | corpus \| export \| both | workshop/consent/<register> | initials or mark |

- **scope `corpus`** — the mage may eat it (context pack / training).
- **scope `export`** — it may leave the room (fedwiki spool, bound books).
- **scope `both`** — both of the above.
- Withdrawal: delete the corpus file, ~~strike~~ the row (leave it visible),
  re-run `corpus_pack`. The strike is part of the record.

## Entries

| date | participant | corpus path | scope | terms | signed |
|---|---|---|---|---|---|
| 2026-07-17 | The First Person (seed) | corpus/seed-canon-note.md | both | workshop/consent/plain-language.md | M |
| 2026-07-18 | The First Person (seed) | corpus/audio-note-poem-scarcity.md | both | workshop/consent/plain-language.md | M |
| 2026-07-18 | The First Person (seed) | artifact/t1-the-stewards-week | both | workshop/consent/plain-language.md | M |
