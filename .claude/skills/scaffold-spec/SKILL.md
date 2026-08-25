---
name: scaffold-spec
description: Write a Draft spec for a scaffold-level infrastructure change (add server Actions + an email service, swap the animation strategy, add/rename a config file, change folder conventions, or any other change to the Invariant side of the Invariant-vs-Variable table) before implementing it. Use when the user asks to evolve the scaffold, add new infrastructure, or requests a spec for an infra-level change. NOT for routine per-client sections/pages — those are already specified by the brief + CHECKPOINTS.md. Produces specs/NN-slug.md, Status Draft, and stops for human sign-off; never implements and never flips Status to Approved itself.
---

Write a Draft spec for a **scaffold-level** change, per `AGENTS.md` §
"Evolving the scaffold" and `specs/README.md`. This skill only writes the
Draft and stops — it never implements, and it never sets `Status: Approved`
(only a human does that).

## When to use this (and when not to)

- **Use** for anything matching `AGENTS.md`'s "If you change X → update Y"
  table, or any other change that edits the **Invariant** side of the
  Invariant vs Variable table (folder structure, component contracts, build
  tooling, this file's conventions).
- **Do not use** for per-client section/page building, brand/content
  ingestion, or anything already covered by `docs/brief/*` +
  `CHECKPOINTS.md`. If the request is routine per-client work, say so and
  route it normally instead of writing a spec — adding spec ceremony there
  is friction this scaffold's own philosophy rejects.

## Workflow

**STEP 1 — Number the spec.** List `specs/*.md` (excluding `TEMPLATE.md`
and `README.md`), find the highest `NN` prefix used, and use `NN + 1`
(start at `01` if none exist yet).

**STEP 2 — Ask clarifying questions as a single numbered block**, then wait
for the answers before writing anything. Cover at minimum:

1. Goal — what capability/change, and why now.
2. Scope — explicitly in vs. out.
3. Files affected — cross-check against `AGENTS.md`'s "Invariant vs
   Variable" table, "Knobs map", and "If you change X → update Y" table;
   name the matching row if one exists.
4. Alternatives considered and why they were discarded.
5. Acceptance criteria — which `AGENTS.md`/`CHECKPOINTS.md` sections must
   be updated in the same change, and whether `pnpm verify` should pass.

**STEP 3 — Write `specs/NN-slug.md`** using every section of
`specs/TEMPLATE.md`, filled in from the answers. Set `Status: Draft`.

**STEP 4 — Stop.** Tell the user plainly: "This spec is Draft. Flip
`Status` to `Approved` yourself before implementation starts." Do not
begin implementing even if asked to in the same turn — that is a separate,
explicit step per `specs/README.md`.

## Relationship to other state stores

This is a pre-change sign-off gate, not a fourth state store. It does not
duplicate `feature_list.json` (build queue), git history (completion log),
or Engram (cross-session narrative) — see `AGENTS.md` § "Where state &
memory live". A spec's "Decisions made and discarded" section should link
to an Engram entry by search term rather than re-pasting reasoning already
saved there.
