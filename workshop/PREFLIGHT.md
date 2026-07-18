# PREFLIGHT.md — venue checklist + naming contract + failure playbook

Run **on arrival, before participants enter**. Two minutes when everything is
healthy; the whole point is discovering when it isn't (C22: you find the
missing dependency standing in a strange room — this list makes you find it
*first*).

## The 2-minute pre-flight

- [ ] Mage powered; `curl http://127.0.0.1:11434/api/tags` answers **on the
      mage box** (model present — pulled before travel, never at the venue).
- [ ] Carried naming layer up; the one good name resolves from a **clean
      resolver** (`ping <name>` in a *fresh* shell — never a warm browser,
      C26) on **two different client machines** (one PC, one Mac if mixed).
- [ ] Raw-IP fallback answers something soft (the catch-all — C28), not a 502.
- [ ] Client-to-client reachability: one laptop pings another. If this fails,
      the venue has client/AP isolation → carried switch/AP or overlay; no
      LAN trick will help (playbook, CEREMONY.md §5).
- [ ] `node tools/check.mjs` green on the mage box (axioms → runs re-derive).
- [ ] `node tools/corpus_pack.mjs --verify` green (the chain is intact before
      the room watches it extend).
- [ ] Roster page empty and serving; consent registers printed/loadable
      (workshop/consent/).

## Naming contract (carried, not negotiated per venue)

- ONE good name for this mage instance — chosen by the cohort, held by the
  holder, no canonical string (C24). Services are **paths** under it.
- Resolution comes from **our resolver**, deterministic and identical for
  every client (C25). Venue mDNS may work; it is never *load-bearing*.
- Never `.localhost` for a shared name (RFC 6761 forces it to loopback —
  C27). Plain TLD (`.mesh` and friends) per instance.
- DHCP: the mage box gets a static/reserved address the resolver leans on.

## Failure playbook (what the room sees → the move)

| the room sees | it is | the move |
|---|---|---|
| "can't find the server" on SOME laptops | mDNS intermittency (C26) | switch everyone to the carried name; verify from clean shells |
| name dead AND raw IP 502s | name-keyed vhost (C23) | catch-all front door; never one literal string |
| nothing reaches anything | client isolation | carried AP/switch; else the overlay/tunnel |
| worked at home, dead here | outsourced naming (C22) | this checklist, next time run FIRST |
| it loads in the browser but ping fails | warm cache lying (C26) | trust the clean resolver, not the browser |

**The meta-rule:** a flaky pass is a fail. A name that resolves *sometimes*
ships the failure to the exact moment the room is watching.
