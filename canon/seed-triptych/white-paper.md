# The Portable Proof-of-Understanding Workshop: A Specification

*Seed white paper · the canary's third tongue. The formal register of the same
understanding the narrative dramatizes and the poem compresses. Declares all
31 claims of `canon/UNDERSTANDING.md`; each section notes the claims it
states.*

## Abstract

We specify a facilitated course built around a shared, air-gapped local
language model (the *mage*), in which access is earned by expressed
understanding, participant expressions form the model's training corpus, and
one understanding is deliberately rendered across three forms — science-
fiction narrative, poem, and formal paper — whose mutual fidelity is verified
by a blind gate. We further specify the consent layer (IEEE Std 7012-2025),
the portable naming layer the workshop must carry, and the structural
incompleteness principle that governs the whole design.

## 1. The babblefish recursion (C1–C4)

**C1.** A single body of understanding is rendered across three forms — sci-fi
narrative, poem, white paper. Each rendering is a *translation* of the same
invariant content, never a new content.

**C2.** The recursion is cyclic and plural-entry: narrative → poem → paper →
recurse, and a participant may enter at any form; the loop carries them
around the other two.

**C3.** The name "babblefish" denotes the design goal: the same truth speaking
in many tongues. Cross-form fidelity is the object of the exercise, not a
stylistic bonus.

**C4.** A rendering that reads well but no longer carries the mechanism is
classified as *drift*, not translation. Only renderings that survive blind
interrogation in each declared tongue count as carried understanding; this is
the workshop's mirage discipline.

## 2. Understanding as key (C5–C9)

**C5.** Access to the mage is earned by expressing understanding. There are no
logins; no credential issues access.

**C6.** Access depth is monotone in understanding: to go deeper into the mage
one must understand more deeply. The lock and the lesson are one mechanism.

**C7.** Each admitted expression functions twice: it is the participant's key
(access) and the mage's food (corpus).

**C8.** Write access is granted as graduated, host-scoped permission — the
"cookie jar" — opened by the trust artefact of §4. The raw credential is
brokered and never enters any participant's or agent's context.

**C9.** The terminal artefact of the joining rite is the *seal*: a legible
record that the assembled room reached the shared mind together. Proof of
understanding is this seal, not a deployment.

## 3. The shared mage and its training loop (C10–C15)

**C10.** The mage is a shared local model, air-gapped by default: the room's
thinking never leaves the room. Sovereignty is the substrate, not a feature.

**C11.** The mage is co-held. It is a witness the room bears together — not
the property or instrument of any single member.

**C12.** The training corpus is the set of consented first-person expressions.
Over the course, the mage becomes a mirror of the room: it is made of their
words.

**C13.** Training is staged: the *good* first pass is retrieval/context-
grounding (the mage reads the room's corpus live); the *perfect* is true
weight fine-tuning (LoRA-class), hardware-gated and adopted later. Ship the
good; grow into the perfect.

**C14.** The whole assembly is portable. It must operate in venues whose
network infrastructure the workshop does not control.

**C15.** The loop closes: understand → express → the expression is admitted
(key + food) → the mage reflects the room's understanding back → understanding
deepens → recurse.

## 4. Consent and the agreement layer (C16–C21)

**C16.** Consent precedes contact. A participant *offers* their address to the
roster; no device is scanned or probed. The rite is an invitation, never an
attack.

**C17.** The trust artefact is a **myTerms** agreement under **IEEE Std
7012-2025** (Machine Readable Personal Privacy Terms): the individual
*proposes* the terms; the counterparty accepts, counter-offers once, or
declines.

**C18.** A 7012 agreement is strictly bilateral: First Person ↔ Second Party.
Agents, devices, and trust communities are the fabric around the agreement,
never parties to it.

**C19.** Every agreement exists in three registers: plain-language
(human-readable), legal (lawyer-readable), and machine-readable.

**C20.** No expression enters the corpus, and nothing leaves the room, without
a recorded consent line. A result resting on violated consent does not exist,
whatever any metric reports.

**C21.** Fidelity to the agreement is measured by verifiable trust communities
standing *outside* it. They are the witness from beyond the system — the
structural answer to §6.

## 5. The carried naming layer (C22–C28)

**C22.** Name resolution outsourced to venue infrastructure is a load-bearing
dependency whose absence is discovered only in a strange room. The workshop
therefore treats naming as part of what it carries.

**C23.** Name-keyed routing (serving only one literal hostname) converts a
soft failure into a hard one: when the name dies, the bare name and the raw
IP both return errors. This trap is prohibited by design.

**C24.** Naming contract: each shared model carries exactly ONE good name,
chosen by whoever holds it. There is no canonical global string; all services
are paths under the one name.

**C25.** Resolution must be deterministic and identical for every client. The
workshop carries its own resolver; venue mDNS is never load-bearing.

**C26.** An intermittently resolving name is more dangerous than a dead one:
it passes tests in friendly conditions and fails in the venue. Diagnosis
discipline: never trust a warm browser; test from a clean resolver on more
than one client.

**C27.** Shared names must not use the `.localhost` TLD: browsers force it to
loopback and bypass the hosts file (RFC 6761).

**C28.** The front door behind the chosen name serves a catch-all, so that a
near-miss degrades to a soft signpost, never a hard error.

## 6. The incompleteness principle (C29–C31)

**C29.** Any agreement complete enough to need no one outside it has either
stopped listening or begun to lie.

**C30.** Lintel form: a trust that certifies itself is the one you cannot
trust.

**C31.** Incompleteness is the permanent, healthy condition of a living
system (Gödel): truths a system cannot prove about itself must be witnessed
from outside. The workshop is therefore built incomplete on purpose — open
doors, outside witnesses, one good name and no throne.

## 7. Verification note

This paper is the canary of the instance's gate: authored together with the
claim register, it passes the census by construction and exists so that a
total failure is never ambiguous — a bad candidate can be told apart from an
impossible gate.
