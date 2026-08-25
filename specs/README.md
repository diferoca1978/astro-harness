# specs/ — spec-driven design gate for scaffold-level changes

Before making a **scaffold-level** change — see `AGENTS.md` § "Evolving the
scaffold" and its "If you change X → update Y" table (adding server Actions
+ an email service, swapping the animation strategy, adding/renaming a
config file, changing folder conventions, or anything else that edits the
**Invariant** side of the Invariant vs Variable table) — write a spec here
and get it to **`Status: Approved`** before writing any code.

**Not for routine per-client work.** Building a section or page from the
brief is already fully specified by `docs/brief/*` + `CHECKPOINTS.md` — do
not write a spec for it. Adding spec ceremony there is exactly the
abstraction-for-its-own-sake this scaffold avoids. This gate exists for one
reason only: scaffold-level changes are multi-file and expensive to
revert, and this repo has a documented failure mode where `AGENTS.md`
prose went stale after such a change (GSAP removed from `package.json`,
docs never updated) — see `AGENTS.md` § "Evolving the scaffold" for the
full story.

## What goes here

- `NN-slug.md` — one file per proposed scaffold change, numbered
  sequentially (`01-`, `02-`, …), using every section from `TEMPLATE.md`.
- `TEMPLATE.md` — the section list every spec follows. Copy it; don't
  reinvent the structure per spec.

## Workflow

1. Invoke the `scaffold-spec` skill (or write the file by hand, following
   `TEMPLATE.md`) → produces `specs/NN-slug.md` with `Status: Draft`.
2. **A human flips `Status` to `Approved`.** This is a manual, explicit
   step — no agent may set its own (or anyone else's) spec to `Approved`,
   and a Draft is not authorization to implement.
3. Only once `Status: Approved`, implementation may start. The `coder`
   subagent checks for this before touching scaffold-level files — see
   `.claude/agents/coder.md`. If asked to make a scaffold-level change with
   no `Approved` spec on file, it stops and asks for one instead of
   guessing at scope.
4. Once the change lands, the spec file stays in `specs/` as a record — it
   is not deleted or marked "done". The commit that implements it is the
   completion record (see "What this is not" below).

## What this is not

- **Not a build-state tracker.** See `AGENTS.md` § "Where state & memory
  live" for the three stores that already do that job: `feature_list.json`
  (in-progress queue), git history (completion log), Engram (cross-session
  narrative/decisions). This folder holds only the pre-change sign-off
  artifact — it does not duplicate any of the three.
- **Not required for per-client section/page work** — see the intro above.
- **Not a running task list.** One file per proposed scaffold change,
  written once, approved once. If a spec's scope needs to change
  materially after approval, write a new spec rather than silently editing
  an Approved one.

> This folder ships with only `TEMPLATE.md` in the scaffold — the first
> real spec is written the first time someone proposes a scaffold-level
> change.
