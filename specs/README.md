# specs/ — spec-driven design gate

All work in this repo — from building a section to a scaffold-level chore —
goes through spec-driven design (SDD). It has **two lanes** that share the
same implementation and verification chain and differ only in the input
artifact:

- **Full lane** (this folder) — write a spec here when there's a decision
  to make that no document already answers.
- **Light lane** (`feature_list.json`) — when the answer is already
  written in an approved document (a brief, client-supplied content), an
  entry there with `source` + `acceptance` carries the same weight without
  the ceremony of a spec file. See `AGENTS.md` § `feature_list.json`.

## Routing rule

One question, mechanical — not a judgment call:

**Is the answer already written in an approved document (a brief, a
client content document)?**

- **Yes** → the document *is* the spec. Light lane: cite it in the
  feature's `source` field, verify the cited text actually landed.
- **No** → there's a decision to make. Full lane: write a spec with
  `/spec`.

| Example | Document? | Lane |
| --- | --- | --- |
| Inventing a new client-facing item (a service, a claim) with nothing behind it | No | Full — the invention itself is the undocumented decision |
| Client-supplied copy (FAQs, approved text) that needs to land on a page | Yes | Light — `source` cites the document, `acceptance` verifies the exact text landed |
| Redesigning a legacy project's UI | No | Full — a decision, not execution |
| A hero section straight from the brief | Yes | Light |
| A scaffold-level change — see `AGENTS.md` § "Evolving the scaffold" and its "If you change X → update Y" table (server Actions + email service, animation strategy swap, config file add/rename, folder convention change) | No | Full |

This is not ceremony for its own sake: both lanes exist because content
and infrastructure changes have shipped in this scaffold's client repos
with nothing tying them back to a source, and separately, scaffold-level
prose has gone stale after a change with no document forcing a review (see
`AGENTS.md` § "Evolving the scaffold" for that history). `source` +
`acceptance` (light lane) and a mandatory spec (full lane) are the two
narrow fixes for those two failure shapes — nothing broader.

## What goes here

- `NN-slug.md` — one file per full-lane change, numbered sequentially
  (`01-`, `02-`, …), using every section from `TEMPLATE.md` — including
  "Fuente del contenido"/"Source of the content" whenever the spec touches
  client data, citing the exact document and line range.
- `TEMPLATE.md` — the section list every spec follows. Copy it; don't
  reinvent the structure per spec.

## Workflow

Both lanes converge on the same chain from step 3 onward:

1. **Produce the input artifact.**
   - Full lane: invoke the `/spec` skill (or write `specs/NN-slug.md` by
     hand, following `TEMPLATE.md`) → `Status: Draft`.
   - Light lane: add or update an entry in `feature_list.json` with
     `source` and `acceptance` filled in.
2. **A human authorizes it.**
   - Full lane: a human flips `Status` to `Approved`. No agent may set its
     own (or anyone else's) spec to `Approved`, and a Draft is not
     authorization to implement.
   - Light lane: the entry itself is the authorization once `source` and
     `acceptance` are both filled in — a feature cannot move to
     `in_progress` without both.
3. **Implement.** `/spec-impl NN` (full lane) or `/spec-impl feature <id>`
   (light lane). `/spec-impl` delegates every step that writes or modifies
   code to the `coder` subagent, one step per call; the session itself
   orchestrates — branch, per-step pauses, diff review, ambiguities (see
   `.claude/agents/coder.md` § "When invoked from `/spec-impl`" for the
   subagent's side). Both create a branch under
   `BranchPrefix` (`specs/.spec-config.yml`, default `feature/`), mark the
   entry `in_progress`, and implement step by step with pauses for
   review. A user asking for the implementation in the current turn does
   not substitute for `Status: Approved` or a filled-in `source` +
   `acceptance` — if neither is on file, stop and ask for one instead of
   guessing at scope.
4. **Verify.** `spec-verifier` runs every acceptance criterion for real
   against the build — including, for the light lane, confirming the
   exact text cited in `source` actually appears in the built output.
   Neither lane marks itself `done` — that's the next step.
5. **A human commits.** Once verification passes, a human reviews and
   commits. A full-lane spec file stays in `specs/` as a record — it is
   not deleted or marked "done"; the commit that implements it is the
   completion record. A light-lane entry is the one place status *does*
   flip (`status: done`), but only by human action, same as `Approved`.

## What this is not

- **Not a build-state tracker.** See `AGENTS.md` § "Where state & memory
  live" for the three stores that already do that job: `feature_list.json`
  (in-progress queue — and, now, the light lane's own artifact), git
  history (completion log), Engram (cross-session narrative/decisions).
  This folder holds only the full lane's pre-change sign-off artifact —
  it does not duplicate any of the three.
- **Not required for work an approved document already answers.** That's
  the light lane — see the routing rule above. It still goes through SDD
  (`source` + `acceptance`, `/spec-impl feature`, `spec-verifier`), just
  not through this folder.
- **Not a running task list.** One file per full-lane change, written
  once, approved once. If a spec's scope needs to change materially after
  approval, write a new spec rather than silently editing an Approved
  one. Routine execution against an approved document lives in the light
  lane, not here — that split is what keeps this folder from becoming a
  task list.

> This folder ships with only `TEMPLATE.md` in the scaffold — the first
> real spec is written the first time someone needs the full lane: a
> change with no document already answering it.

The only overlap between the two lanes is "is this done?" (`status: done`
vs. `- [x]`), and never over the same object — a feature carries no spec,
a spec is not a feature. The routing rule above puts every unit of work in
exactly one lane.
