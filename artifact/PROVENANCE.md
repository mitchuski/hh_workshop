# PROVENANCE.md — the students who began the training

What a cohort walks away with is not only the books — it is a **re-derivable
claim**: *we are the people whose words this mage is made of.* This file says
how that claim is carried and how a stranger checks it.

## The chain

```
consent line (CONSENT_LEDGER.md, signed by the speaker)
  → corpus/ file (admitted by the week's steward)
    → context pack (tools/corpus_pack.mjs — deterministic bytes, sha256)
      → steward_log.md entry (week · steward · files folded · pack hash)
        → the mage (Modelfile / context grounding the room talks to)
          → the books (bind_book.mjs prints the steward chain into every copy)
```

Three properties make it provenance and not a story:

1. **Consented at the root** — no unconsented word can enter the chain; the
   packer and the exporter refuse at the pipe (hard constraint b).
2. **Re-derivable at every link** — `node tools/corpus_pack.mjs --verify`
   re-hashes the corpus and must match the latest steward entry; a moved
   corpus with an unlogged fold fails loudly.
3. **Named hands** — every fold names its steward. The rotation means every
   student's name enters the chain at least once: the cohort is not
   "acknowledged", it is *structural*.

## What each student takes away

- the bound artefacts (`book_of_poems.html`, `collected_papers.html`,
  `story_anthology.html` — print to PDF), each carrying the steward chain;
- their triptychs, with gate verdicts a third party can replay offline
  (`node tools/verify_run.mjs . <runId>`);
- their line(s) in `mage/steward_log.md` — their week holding the mirror;
- their consent rows — which they may also withdraw (INGEST.md): provenance
  here includes the right to leave.

## For the university partner

This chain is the course's assessment story inverted: instead of the
institution grading the students, the students build the evaluator (the
harness config is cohort-amended through the keystone), train the examiner's
opposite (the mage is their mirror, and it never grades), and leave holding
a verifiable record that the whole apparatus began with them.
