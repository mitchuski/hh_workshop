# lexon/ — the workshop's law, compiling

The workshop's legal-shaped invariants written in **Lexon** — controlled
natural language a lawyer can read AND a machine can parse — and held green
by the same gate the `lexon_pvm` harness uses. This is the fourth face of
the consent layer: where `workshop/consent/` carries plain-language, legal,
and machine-JSON registers as three files, a Lexon law is **one text that is
both the legal prose and the parseable structure** — the babblefish thesis
applied to law itself.

## What "compiling" means here (the regime, honestly)

There is **no public Lexon compiler for this platform** (the reference
compiler is a macOS-only alpha, source unpublished). This lane runs the
**spec-checker regime** vendored from `lexon_pvm`: a hand-written validator
of an *attested subset* of Lexon (every grammar production is backed by a
lexon.org golden fixture). "Compiles" = passes:

1. **the base gate** (`tools/lexon_check.mjs`) — parse into subject-verb-
   object triples · noun binding (definitions immutable) · **round-trip**
   (triples re-serialize to canonical sentences that re-parse identically) ·
   promise typing (every action edge typed promise/commitment, polarity +);
2. **every relation claim** (`tools/relation_check.mjs`) — the structural
   fact each law exists to state, verified on the clause graph **with a
   falsifiability twin**: a minimally mutated contract must still gate-pass
   yet fail the claim, or the claim proves nothing. Negative expectations
   (claims that must come back ABSENT) prove the gate can refuse.

Run it: `node lexon/check.mjs` — also wired into `node tools/check.mjs`.

## The three laws

| law | what it compiles | the load-bearing claims |
|---|---|---|
| `consent_agreement.lex` | the myTerms/IEEE-7012 bilateral (First Person proffers, Workshop Holder accepts; per-expression corpus/export scope; revocation with mandatory return) | `Consented = Proffered ∧ Accepted` (the invitation pattern); Admit gated on Consented; **absence: no transfer clause routes anything to the Workshop Holder** — the extraction shape is structurally impossible, not merely forbidden |
| `steward_fold.lex` | the weekly steward's duties (STEWARD.md as law) | Admit gated on Consented; `Complete = Pack Hash ∧ Fold Record`; Handover gated on Verified; absence: nothing routes to the Steward |
| `babblefish_gate.lex` | the harness's own gate discipline (T2/T5/D1 as law) | Draw gated on Committed (**grind-proofing: the draw cannot precede the commit**); Validate gated on Recovered; Fold gated on Validated; **absence: nothing routes to the Proposer or the Assayer** — the seats cannot be paid off |

Each law's `.claims.json` uses `{expect, claim}` rows — `RELATION PASS`
rows are the law's asserted structure; `RELATION ABSENT` rows are the
counter-claims that must fail (a gate that cannot refuse is worth less than
none).

## House grammar (the attested subset — imitate exactly)

Types: `person amount text time binary data contract number account` ·
Verbs: `pay return appoint fix certify register grant declare file send
terminate set` · Shape: `LEX <Title>.` · `"Name" is a <type>.` definitions ·
one recital (no modal) · `CLAUSE: <Name>.` blocks · `may`/`must` ·
conditions `, if <Binary> is declared:` or `, if this <Noun> is
<Predicate>:` · conjunctions via `"P" is defined as: the A is fixed and the
B is fixed.` · **never an em dash** (the upstream census refuses them).

## Provenance & the loop back

Checker + goldens vendored verbatim from `C:\Users\mitch\lexon_pvm` @
`4d9a3ad` (see `../VENDOR.md`). The upstream LEXICON already carries the
7012 family (LEXPVM-T-055/059/060/067) these laws are stylistic kin to.
**Possible upstream fold (the First Person's call, lexon_pvm's own keystone
discipline):** the workshop's terms — babblefish recursion, understanding-
as-key, steward, translation-debt — are candidates for lexon_pvm census
terms; these three laws are ready-made draft expressions for that fold.
In the course itself, Lexon is a natural **fourth tongue** for advanced
cohorts (understanding → narrative → poem → paper → *law*); staged, not yet
in the harness gate.
