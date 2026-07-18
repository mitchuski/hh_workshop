# INGEST.md — how expressions enter the mage

Everything the mage eats passes one gate, in one direction:

```
raw input → ingest/out/ (CANDIDATE) → consent line → corpus/ → corpus_pack → the mage's context
```

No step may be skipped. The exporter (`fedwiki/export_page.mjs`) and the packer
(`tools/corpus_pack.mjs`) both REFUSE material without a consent line — the
hard constraint reaches every pipe (harness.config.mjs, hardConstraint (b)).

## Accepted inputs

| input | route |
|---|---|
| **audio notes** (voice memos, session recordings) | `node ingest/transcribe.mjs <file>` — ffmpeg + local whisper.cpp, fully offline → `ingest/out/<name>.md` candidate |
| **text** (triptych drafts, reflections, notes) | drop the `.md` into `ingest/out/` yourself; same consent rule |
| **images by path** (whiteboard photos, sketches) | reference the file path from a text candidate; the image stays where it is — the corpus carries words plus pointers |

## The consent rule (C16, C20)

- The **speaker/author** signs the line, not the steward: one row in
  `corpus/CONSENT_LEDGER.md` naming the corpus path, the scope
  (`corpus` = the mage may eat it · `export` = it may leave the room ·
  `both`), and the terms reference (`workshop/consent/`).
- Group recordings need every voice in the room consented, or the transcript
  is trimmed to the consenting voices before admission.
- Withdrawal is honoured by deletion: remove the corpus file, strike the
  ledger line (leave the strike visible), re-run `corpus_pack` — the next
  pack simply no longer contains it, and the steward log shows the fold.

## The steward's move (weekly)

Admission is the steward's act (mage/STEWARD.md): check the consent line,
move the candidate from `ingest/out/` into `corpus/`, run
`node tools/corpus_pack.mjs`, and log the pack hash in `mage/steward_log.md`.
