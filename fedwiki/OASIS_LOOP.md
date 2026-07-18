# OASIS_LOOP.md — how workshop pages travel to the hitchhiker federation

The FedWiki loop — *fork a page to your own site → cast your ident → a keeper
forks it home → transmit* — **is** the Oasis Protocol (Tome V Act 10, the
Holon Hitchhikers), walked on shared substrate. hitchhikers.earth is the
first named, real oasis; Hitchhiker FM (`fm.ide.earth`) is its studio; the
first circle is The Three Mice. This workshop's outputs
are seeds a hitchhiker carries between oases.

> "This document travels at the speed of trust." — the Hitchhiker's
> Declaration (Robbie Stamp, for the H2G2 community)

## The legs, from air-gap to oasis

| leg | who | tool |
|---|---|---|
| 1 · express → spool | the harness / any participant | `fedwiki/export_page.mjs` → `fedwiki/out/*.json` (works fully offline; the venue needs no network) |
| 2 · spool → local farm site | facilitator machine, back home | `fedwiki/sync_spool.mjs --copy ~/.wiki/hh.workshop.localhost` (local files only; refuses surprise overwrites) |
| 3 · serve / push the site | **the First Person (the door)** | existing cookie-broker flow — `fedwiki-cohere-sync` skill, `~/.wiki/.creds/`, raw cookie never in agent context |
| 4 · cast toward the oasis | **the First Person (the bearer)** | fork workshop pages toward `mitch.fm.ide.earth` / hitchhikers.earth; a keeper there forks home and `transmit`s |

Legs 3 and 4 are outward acts — the First Person's alone (T6/GR-8). Nothing
in this repo performs them; this file only names them so the path is walkable.

## House rules for pages that travel

- **Cross-site links are `reference` items, never `[[ ]]`** — a `[[ ]]` link
  only resolves within its own site; export_page.mjs already emits the
  standing oasis anchors (The Three Mice · Hitchhiker FM) as references.
- **Export consent precedes travel** — the exporter refuses participant
  material without an export-scope consent row; what leaves the room is only
  what its author sent out (C20).
- **The naming rule follows the pages**: the workshop's own farm site name
  avoids load-bearing `.localhost` sharing (RFC 6761 — C27); `hh.workshop.
  localhost` is a *local viewing* name on the facilitator's machine only; the
  federated copies live under the oasis's own good names.

## Standing repair, flagged (the First Person's call)

The Hitchhiker FM skill page still carries a dangling reference to
`tome-v-act-18-the-first-oasis` (the act body was lost to a concurrent farm
session, 2026-07-07). `export_page.mjs --md <a re-minted act>` makes the
re-mint one command whenever the First Person chooses to re-tell it.
