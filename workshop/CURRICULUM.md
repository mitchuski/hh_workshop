# CURRICULUM.md — the course arc

A masters-cohort course (8–12 weeks works; the arc below is written for 10)
around the shared mage: **sci-fi casting forward → poems compressing into
human-readable → formal papers**, each week feeding the machine the room
trains. The cohort ends holding its own evaluation harness, three bound
books, and the provenance chain (artifact/PROVENANCE.md).

## The weekly shape (every week, after week 1)

1. **Steward handover** — outgoing steward's `corpus_pack --verify` green in
   front of the room; incoming steward takes the key (mage/STEWARD.md).
2. **Ingest** — the week's audio notes and drafts through
   `ingest/transcribe.mjs` → consent lines → corpus (INGEST.md).
3. **Express** — participants work their triptychs with the mage as mirror
   (never as grader — FACILITATOR.md rule 4).
4. **The babblefish round** — submitted triptychs face the blind gate
   (`node driver/run_round.mjs --model <mage> --run w<N> --triptych <dir>`).
   The probe form is drawn where no one can tune it: *the tongue you didn't
   polish is the lesson.*
5. **Fold** — the keystone pair folds VALIDATED levers (frontier first, prose
   second); the steward folds the week's corpus; both hashes read aloud.
6. **Seal** — the week closes with the group seal (CEREMONY.md §7).

## The arc

| weeks | movement | what happens |
|---|---|---|
| 1 | **The Rite** | full ceremony (CEREMONY.md); the room reads the seed triptych + register; everyone's first expression = their Traveler key |
| 2–3 | **Casting forward** | sci-fi entry: each participant drafts a narrative carrying claims they choose; first live rounds; lexicon workshop — the cohort proposes its first new claims to the keystone |
| 4–5 | **Compressing** | poem entry: the scarcest tongue (frontier OT-1); pairs swap — compress *each other's* narrative; Mentor rungs open (blind-assayer service) |
| 6–7 | **Formalizing** | paper entry: formal renderings; citations discipline; triptychs complete and face the census |
| 8 | **The turn: own the evaluation** | the cohort re-fits the five answers (metric · gate · hard constraint · canary · Gap recipe) in a keystone session — the course's stated goal: they graduate owning the examiner, not just passing it. Register amendments folded; conform must stay green before and after (G0) |
| 9 | **Binding** | `bind_book.mjs` — the Book of Poems, the Collected Papers, the Story Anthology; provenance page checked by a stranger (someone outside the cohort replays the chain) |
| 10 | **The Oasis leg** | consented pages spooled and carried to the federation (OASIS_LOOP.md); closing seal; the mage's flight case shuts on a corpus that is *them* |

## The trust ladder → mechanics

Rungs are earned by expressed understanding (never by credential — C5), and
audited by the enumerable checklist in UNDERSTANDING_KEY.md:

| rung | earned by |
|---|---|
| **Traveler** | consented + first expression admitted (week 1 seal) |
| **Contributor** | at least one form carrying ≥1 claim through the gate |
| **Author** | a full triptych VALIDATED by the census |
| **Mentor** | serving as blind assayer for another's triptych (the human seat of the prover — reads the probe form cold, never the canon) |
| **Fellow** | proposing a claim the keystone accepts into the register — their words become part of what every later triptych is measured against |

**Steward rotation is orthogonal to the ladder**: every student takes exactly
one week holding the mage's training, whatever their rung — the chain in
`mage/steward_log.md` must end the course with every name in it.

## Assessment posture (for the university partner)

The harness produces the artefacts a program can assess — validated
triptychs, fold history, the amended register — but the *grading* of record
stays the institution's own act. The workshop's gate answers "does the
understanding survive translation?", which is a different and complementary
question to "what mark does this earn?" (UNIVERSITY_ONEPAGER.md).
