# The Hitchhikers Workshop — a brief of the work, and how it plays out

*Delivered with the hh_workshop instrument. Everything described here is
built, verified, and running on one commodity machine; nothing described
here requires a cloud, a subscription, or a network. Where a claim can be
checked, the command that checks it is named.*

---

## 1 · The premise

A shared computer sits in a seminar room. The cohort calls it **the mage**,
because a good name matters and they chose it together. It runs a local
language model, air-gapped: nothing the room thinks ever leaves the room.
Over a ten-week course, the students train it — not abstractly, but
literally: their consented writing becomes its grounding, week by week,
until the machine answers in the room's own words.

The course runs one exercise, recursively. Each student carries a single
understanding across three tongues:

> **sci-fi narrative** (casting it forward) → **poem** (compressing it
> until a person can say it aloud) → **formal paper** (making it
> checkable) → and around again.

We call this the **babblefish recursion**, after the fish that translates
every tongue. The pedagogical thesis, made mechanical: *understanding only
counts when it survives translation.* A rendering that is beautiful but no
longer carries the mechanism is a drift, not a translation — and the
instrument catches it.

How it catches it is the serious part. Submitted work faces **the gate**:
a cryptographic draw — commit first, salt after, hash-derived — selects
ONE of the three tongues, and a blind reader who has never seen the answer
key must recover, from that text alone, every claim the tongue declares.
The author cannot know which tongue will be interrogated, so polishing one
at the others' expense is a losing strategy. Every verdict is replayable
offline from saved bytes by anyone who distrusts it.

## 2 · What exists today (built, verified)

The instrument is a standalone repository, copyable to any machine with
Node and a local model runtime. Its current, checkable state:

- **The harness** — a verification loop (propose → hold-apart → assay →
  critic → chronicle) with the blind gate above; registered as instance
  #12 of the public agentprivacy dual-agent harness. `node tools/check.mjs`
  → **all 9 gates pass**; every recorded run re-derives offline
  (`node tools/verify_run.mjs . --all`).
- **The canon** — a 31-claim register distilled from the founding
  chronicle, plus a seed triptych (story, poem, paper) that passes the
  gate by construction — the canary that proves the exam is passable.
- **Live rounds** — real rounds have run with a local 12-billion-parameter
  model holding every seat: a full census recovered 20/20 claims through
  the story tongue; another round recovered 10/10 through the *poem* —
  hard evidence the compressed form can carry mechanism through a blind
  read.
- **The mage + the mirror** — the facilitator persona grounded in the
  consent-gated corpus; a chat surface (the mirror) where its first live
  answer near-quoted the cohort's own folded voice note. Two hats, two
  invocations, by law: the persona'd mage converses; only the *base*
  model ever sits in the judge's seat.
- **The consent architecture** — one agreement in four registers: plain
  language, legal, machine-readable, and **Lexon** — controlled natural
  language a lawyer reads and a machine parses. The laws compile (26
  checks, `node lexon/check.mjs`), including **absence claims**: the
  checker *proves* no clause routes a student's expression to the
  operator, and proves it falsifiably, by generating the mutated contract
  that adds the route and catching it. Consent is enforced in the pipes —
  the corpus packer and every exporter refuse unledgered material.
- **The provenance chain** — a rotating student steward folds each week's
  consented expressions into the mage; each fold is hashed, signed into a
  log, and re-derived in public (`node tools/corpus_pack.mjs --verify`).
  The chain is printed into every bound book: the cohort's verifiable
  record as this machine's first trainers.
- **The interfaces** — one local control surface (**the Towel**, with a
  newcomer's front door: don't panic, three role paths, a glossary);
  **the workshop's 42** (a game board where stations light only when the
  ledgers record real trust tasks); **the web** (a knowledge graph derived
  — never authored — from the repo's own ledgers, with a constellation
  forge that lets a bearer star a path of nodes and sign it into a new
  artefact); a generative static site; and a one-command wiki build for
  federation outward. A fully fictional, clearly-bannered **sample
  cohort at week 5** exists for demonstrations.
- **The autonomous layer** — a measure-only **dream cycle** (measures
  everything, folds nothing, files a dated watch report) and a derived
  **keystone queue** (everything waiting on a human, one page). The
  governing split, enforced structurally: *the instrument measures and
  proposes; only humans fold, and only humans open doors.* There is no
  publish, push, or send button anywhere in the system.

## 3 · How it plays out — the course, walked

**Week 0 — the seed.** The machine is prepared: model pulled, canon
seeded, gates green, the zeroth fold signed by the facilitator. The
instrument arrives at the university already *whole*: the course could be
examined before it begins.

**Week 1 — the rite.** The flight case opens. The room joins a carried
local network (the venue's plumbing is never trusted — the first hour
teaches why, with a true story about a hostname that died), resolves the
mage's one good name, and each student *offers* — is never scanned for —
their presence. Each signs their consent line: their words, their
signature, their standing right to withdraw. Each writes a first
expression of what they understood; each expression is simultaneously
their **key** (access deepens with demonstrated understanding — there are
no logins) and the mage's **food**. The room seals: one artefact that
says *we reached the shared mind together*.

**Weeks 2–7 — the loop.** The weekly shape, every week:

1. *Handover.* Last week's steward verifies the fold-chain green in front
   of everyone, reads their log entry aloud, and passes the key. A
   different student holds the mage's training every week — by course end,
   every name is in the chain.
2. *Ingest.* Voice notes and drafts run through the local transcriber;
   authors sign their consent lines; the steward admits what is covered
   and nothing that isn't (the tools refuse otherwise).
3. *Write.* Students work their triptychs, entering at whichever tongue
   they love — and talking it through with the mirror, which reflects and
   connects but never grades.
4. *The gate.* Submitted triptychs face the blind draw. The tongue you
   didn't polish is the one interrogated — that lesson lands in week two
   and never leaves.
5. *The fold.* The steward packs the week's corpus; the hash is read
   aloud like a grace; the mirror deepens.
6. *The board.* The workshop's 42 lights another station or two — laws
   compiled, folds logged, rounds proven, pages spooled. Progress is
   visible instantly; *credit* moves only when the gate validates.
   Students pair by a hash-drawn matching (complementary tongues first —
   nobody tunes who they're paired with); earned events — serving as a
   blind reader, holding the steward week — mint signed edges in a small,
   real trust graph.

**Week 8 — own the evaluation.** The turn that makes this a course about
knowledge rather than compliance: the cohort re-fits the exam itself —
the metric, the gate, the hard constraints, the canary — through the
keystone discipline, with the conformance gate green before and after.
They graduate owning the examiner, not just having passed it.

**Weeks 9–10 — the leaving.** The pipeline binds three books — the Book
of Poems, the Collected Papers, the Story Anthology — each carrying the
steward chain in its endpapers. Students may forge **constellations**:
named, signed paths through the knowledge web that become artefacts in
their own right ("The Proverb Chain" was the first). Consented pages spool
toward the hitchhikers.earth federation — carried outward only by a
person, by hand. The seal disc closes on the cohort's board state; each
student leaves with books, verdicts anyone can replay, their weeks in the
chain, and the right — standing, structural — to withdraw their words.

## 4 · What the university receives

A **public-goods research instrument**, in the strict sense: zero marginal
dependency (one commodity box is the whole stack), non-extractive by
construction (the absence claims make extraction structurally impossible,
not merely forbidden), forkable (the upstream harness is public; a sister
department copies the directory and owns its own), and with the students
positioned as **provenance, never product**.

Assessment posture: the gate answers *"does the understanding survive
translation?"* — blind, replayable, third-party auditable. Marks remain
the institution's own act, informed by artefacts the instrument makes
unusually legible: validated triptychs, fold history, each student's
contributions to the register. The consent architecture is designed to
make the ethics-board conversation short: per-expression, author-signed,
withdrawable, machine-enforced, and written in a law that compiles.

The research horizon compounds across cohorts: each cohort's mage is a
reproducible generation; cross-cohort verification (one cohort's work
assayed by another's model — a genuinely distinct prior) is the natural
follow-on experiment; and between sister universities, the **erasmus
rule** keeps sovereignty intact: *methods and probes travel; corpora
never do.*

## 5 · How a skeptic checks (the whole point)

```
node tools/check.mjs                 # nine gates: axioms → laws → every run re-derives
node tools/verify_run.mjs . <run>    # replay any verdict from saved bytes, no model, no net
node tools/corpus_pack.mjs --verify  # the training chain re-derives to the signed hash
node lexon/check.mjs                 # the law compiles; the absence claims hold; the twins are caught
node tools/dream_cycle.mjs           # the standing watch — measure everything, fold nothing
```

Nothing in this brief asks to be believed.

## 6 · The path from here

1. **A room and a colleague** — eight to fourteen masters students, a
   faculty co-host, ten sessions (a summer intensive compresses well).
   The letters to the law and cryptography chairs travel with this
   package; the demonstration cohort at `/demo/` shows week five before
   week one exists.
2. **The pilot cohort** — the course as §3; the university keeps the
   machine, the corpus, the method, and everything the cohort makes.
3. **The federation** — consented outputs travel to the hitchhikers.earth
   commons; a second university makes the erasmus weave real; the trust
   graph grows the only way it can here: earned.

## 7 · The package

| document | what it carries |
|---|---|
| `docs/BRIEF.md` | this document |
| `README.md` | the instrument's front door + quickstart |
| `workshop/CURRICULUM.md` · `workshop/CEREMONY.md` | the ten-week arc · the opening rite, run-of-show |
| `workshop/UNIVERSITY_ONEPAGER.md` | the one-page pitch |
| `letters/` | to the international-law chair · to the cryptography chair |
| `workshop/consent/` + `lexon/` | the agreement in four registers; the laws that compile |
| `docs/AUTO_RESEARCH.md` | the public-goods auto-research pattern |
| `docs/SUITE_MAPPING.md` | how the new methods seat into the wider agentprivacy suite |
| `artifact/PROVENANCE.md` | what the students verifiably keep |
| `mage/MACHINE_SETUP.md` · `workshop/PREFLIGHT.md` | a fresh machine from zero · venue day |
| `docs/UX_REVIEW.md` · `chronicles/` | how the interfaces were audited · the honest build record, reversals included |
| `KEYSTONE_QUEUE.md` | live: everything currently waiting on a human |

---

*Contact: Mitchell Travers · mitchell@soulbis.com · the public upstream:
github.com/mitchuski/agentprivacy-harness*

*"This document travels at the speed of trust."*
