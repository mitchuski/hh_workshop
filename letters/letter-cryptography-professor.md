# To the professor of cryptography and cybersecurity

*Draft for Mitch's hand — sending is the door. Salutation left open until
the university is chosen.*

---

Dear Professor —

I want to offer your masters students a semester inside a live protocol —
not a lecture about commitment schemes, but a course whose grading pipeline
*is* one, running on an air-gapped machine they train themselves, where
every verdict that ever touches them can be re-derived offline from saved
bytes by anyone who distrusts it.

The course wears science fiction on the outside, deliberately. The shared
local model in the flight case is called the mage; the writing exercise is
the "babblefish recursion" (one understanding carried across three tongues:
a sci-fi story, a poem, a formal paper); the first session opens with a
short story about a hostname that died on a strange router and took the
whole rig with it. Under the story, your students will find the following,
all built and verified:

**A Fiat–Shamir hold-apart.** Students submit a triptych; the examiner
must be blind. Each proposal is canonically serialized (recursive sorted
keys, no whitespace — those exact bytes are persisted) and hashed; a
run-level salt secret, drawn after the proposal is committed and never
shown to any seat, derives a per-proposal salt; the seed is
`sha256(h_source ‖ h_proposal ‖ salt)`. The draw that seed governs is the
detail I am proudest of pedagogically: the *census* probes every claim
(N=31, and the conformance gate refuses sampling below the census
threshold — students can read the refusal message and the detection-
probability arithmetic behind it), while the seed selects **which of the
three tongues gets interrogated**. The author cannot know which of their
renderings will face the blind assayer, so polishing one at the expense of
the others is a losing strategy. Grinding the proposal cannot fix the draw;
the salt lands after commitment. Your students will meet grind-resistance
not as a slide but as the reason they must write all three tongues well.

**Offline, fail-closed verification.** Every round persists
`proposal_canon.json`, `gap.json`, `verdict.json`. A zero-dependency
verifier replays the whole chain — byte-canonicality, hash, salted seed,
draw — with no model calls and no network, and exits non-zero on anything
it cannot establish, with `UNVERIFIABLE` as a distinct verdict, never a
pass. I will happily show your students the failure that hardened it: in
our first live round, the model returned a VALIDATED verdict without its
pass-ratio field; the verifier refused the run. The fix was not to soften
the verifier but to make the field required in the schema — with
structured-output enforcement, *an optional field is a field the model may
omit*. That is a security lesson I could not have scripted better.

**An adversarial architecture with its parameters declared.** Proposer and
prover are separated seats; the one thing they share is the human at the
root. When one local model wears both hats, the separation term is zero —
and the system *declares* Φ_inference = 0 rather than hiding it. A second
machine, or a visiting model from a sister cohort, raises it: a
pre-registered experiment your students can run and measure. The named
failure mode — a MIRAGE, a candidate that passes the author's probe and
fails the real gate — is the course's favourite word, and it earns it.

**Content addressing and an earned trust graph.** Every artefact is
κ-addressed (`sha256` over canonical bytes, label excluded from its own
preimage); the mage's weekly training folds form a hash chain signed by a
rotating student steward, so "who trained this model on what, when" is a
replayable record — the students' provenance as the machine's first
trainers, verifiable years later on a laptop with Node and nothing else.
On top of it sits a small, real trust graph: workshop events (serving as a
blind assayer, holding the steward week, keystone folds) mint ed25519
`did:key` edges over the κ-addressed persona holons — earned edges only,
no self-edges, every signature verifiable offline. The consent layer that
feeds the model is enforced *in the pipes* — the corpus packer and the
exporter both refuse unledgered material — and the workshop's own law,
written in a controlled natural language, carries machine-checked
**absence claims**: the checker proves no clause routes a student's
expression to the operator, and proves it falsifiably, by generating the
mutated twin that adds the route and catching it.

Security people will also appreciate what is *not* here: no cloud, no
telemetry, no credentials in any agent's context (write access is brokered
and scoped), and one gate no automation can open — publication and
federation are a human's outward act, structurally. The threat model
extends to the seminar room's own network: the first hour of the course is
a live lesson in why you never let a venue's mDNS be load-bearing.

The university keeps everything: the machine's stack (one commodity box,
zero external dependencies), the harness, the corpus its students
consented into it, and each cohort's model lineage — with cross-cohort
verification (your students' proposals assayed by a *different* cohort's
model, a genuinely distinct-prior prover) waiting as the natural follow-on
experiment. It is a public-goods donation in an auto-research pattern: the
instrument measures and proposes on its own; humans keep the folds and the
doors.

It is built. The gate suite is nine-for-nine; the first live round ran
this week on a 12-billion-parameter local model that recovered twenty of
twenty declared claims through the probe tongue, and the run re-derives
from its own bytes. What I need is a room, the students, and a colleague
who will enjoy asking them, in week one: *the browser loads the page and
ping says the host doesn't exist — what do you trust, and why?*

With respect and anticipation,

**Mitchell Travers**
mitchell@soulbis.com · the agentprivacy work: github.com/mitchuski/agentprivacy-harness
