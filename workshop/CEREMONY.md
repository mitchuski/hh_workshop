# CEREMONY.md — the Portable Proof-of-Understanding Ceremony

*The 8-section spec proposed in the LAN-ceremony chronicle (2026-06-28, §5),
filled. This is the rite that opens the course and re-opens every venue.*

## 1 · Premise & myth

A shared local mage — an air-gapped model in a flight case — sits on the
table. The room co-holds it: a witness the group bears together, like a bowl
too wide for one pair of hands (C10, C11). The ceremony's output is not a
deployment; it is **proof of understanding** — shared comprehension made
legible as a seal (C9). The myth the room steps into is the babblefish: one
truth, many tongues, and the joy of hearing it speak in each (C1–C3).

## 2 · The trust/sync rite

The human sequence, in order — each rung consent-gated, understanding is what
climbs (LAN §4¾):

1. **Arrive** — the room assembles; the steward of the week uncrates the mage.
2. **Join the local net** — the carried network (§3), never the venue's Wi-Fi
   as a dependency.
3. **Resolve the mage's one good name** — every client, identically (C24, C25).
   The room *says the name together*; thirteen of fourteen resolving is a
   failure state, not a quorum.
4. **Offer, don't probe** — each participant *offers* their address to the
   roster (C16). Nobody is scanned.
5. **Read the gateway with your own agency** — the front-door page carries the
   rite; understanding-as-key begins at the moment of reading (C5).
6. **First shared exchange** — each participant expresses, in their own words,
   what they understood; the expression is admitted through the consent gate
   and becomes both key and food (C7).
7. **The seal** — when every participant is synced and expressed, the group
   seals: one artefact that says *this room reached the shared mind together*
   (C9). The seal is logged; the trust artefact (§4 below) opens the cookie
   jar (C8).

## 3 · The portable substrate

What physically travels (C14):

- **the mage machine** — the local LLM host (mage/MACHINE_SETUP.md);
- **the carried naming layer** — our own resolver answering the one good
  name deterministically (C25); venue mDNS is never load-bearing;
- **participant clients** — mixed PC/Mac laptops; must Just Work against the
  carried layer;
- **the flight-case extras** — cables, a small switch/AP if the venue's
  network is hostile (client isolation = reach for the overlay), the steward's
  key.

## 4 · The naming contract

- ONE good name per mage instance; whoever holds the mage names it; there is
  no canonical string (C24). Everything else is a **path** under the name
  (`/mage`, `/roster`, `/gateway`), never a second name.
- Never `.localhost` for a shared name (RFC 6761 — C27).
- The front door serves a **catch-all** so near-misses degrade soft (C28).
- The trust artefact issued on sealing is a **myTerms (IEEE 7012) agreement**
  — bilateral, First Person ↔ workshop-holder; the mage and every agent are
  fabric, not parties (C17–C19). Registers in `workshop/consent/`.

## 5 · Failure-mode playbook

Seeded from the canonical live case ("the name that worked in the browser"):

| symptom the room sees | trap | move |
|---|---|---|
| one laptop resolves, the next doesn't; or it worked five minutes ago | mDNS/`.local` intermittency (C26) | never trust a warm browser; test from a clean shell (`ping`, `nslookup`) on ≥2 clients; fail over to the carried resolver |
| name dead AND raw IP returns 502 | name-keyed routing (C23) | the catch-all front door (C28); never serve only one literal string |
| devices can't see each other at all | client/AP isolation | no LAN trick helps — carried switch/AP, or the overlay/tunnel |
| yesterday's address is wrong today | DHCP drift | static/reserved address for the mage; the naming layer leans on it |

## 6 · Pre-flight checklist

Run on arrival, before participants enter (2 minutes): see
`workshop/PREFLIGHT.md` — resolution from a clean resolver on two clients,
catch-all answering, roster empty, steward's `--verify` green.

## 7 · Ceremony script (run-of-show)

1. Steward's opening: last week's fold read aloud; `corpus_pack --verify`
   green in front of the room (the chain is public to itself).
2. The rite of §2, walked.
3. The week's babblefish round: entries, renderings, the blind gate
   (workshop/CURRICULUM.md carries the session arc).
4. Steward's fold: the week's consented expressions eaten; new pack hash
   logged and read aloud.
5. Handover: next week's steward takes the key.

## 8 · Canon binding

- Every session ends with a chronicle draft (the harness's Chronicle seat, or
  the steward's hand) filed in `chronicles/`.
- Outputs that should travel are spooled (`fedwiki/export_page.mjs`) and walk
  the Oasis loop home (`fedwiki/OASIS_LOOP.md`) — fork → cast → transmit,
  with the outward legs at the First Person's door (T6).
- The course's lineage lands in the City's canon the way the first oasis did:
  as a named, real link — never an abstract placeholder.
