---
name: adapt-harness
description: Adapt this harness onto a pre-existing Astro project that was NOT cloned from the astro-harness scaffold (a legacy client codebase). Explores the project's real code, writes an AGENTS.md describing what is actually there, and proposes Draft migration specs. Use after install-harness.sh has copied the apparatus into a legacy project. NOT for projects created from the scaffold — those already have their AGENTS.md. Never implements migrations and never flips a spec to Approved.
---

Adapt the harness onto a **pre-existing** Astro project — one that was not
created by cloning the `astro-harness` scaffold. This is a one-time
onboarding step. It produces two things and nothing else:

1. An `AGENTS.md` describing **this project's real structure**, not the
   scaffold's.
2. Zero or more **Draft** migration specs in `specs/`, proposing moves
   toward harness conventions where they actually earn their keep.

> **Hard rule — never implement, never self-approve.** This skill documents
> and proposes. It does not restructure code, does not move files, and does
> not set any spec to `Status: Approved` (only a human does that, per
> `specs/README.md`). Asked to implement in the same turn, say no and point
> at the spec gate.

Assumes `install-harness.sh` already copied `.claude/agents/`, this skill,
and `specs/README.md` + `specs/TEMPLATE.md` into the target project. If
`specs/TEMPLATE.md` is missing, stop and say the install script needs to run
first.

## Phase 1 — Explore the real code (primary source of truth)

Read the project itself before forming any opinion. At minimum:

- **`package.json`** — Astro version, styling (Tailwind? version? plain
  CSS? Sass?), UI framework integrations (React/Vue/Svelte/Solid/none),
  deploy adapter, SEO packages, animation libraries (`gsap`? `motion`?
  none), CMS/content packages.
- **`astro.config.mjs`** (or `.ts`/`.mjs` variant) — `integrations[]`,
  `adapter`, `site`, `output`, `env.schema`, `fonts[]` if present.
- **`tsconfig.json`** — path aliases actually configured (do **not** assume
  `@/`; many legacy projects use `~/`, `src/`, or no alias at all).
- **The real `src/` tree** — what folder conventions exist in fact.
  Document inconsistency **as inconsistency**; do not paper over a messy
  tree by describing the clean convention you wish were there.
- **Where per-site data actually lives** — a `src/config/`? Frontmatter?
  A CMS? Hardcoded in components? This becomes the Knobs map, and it must
  name real paths.
- **Existing docs** (`README.md`, any `AGENTS.md`/`CLAUDE.md`, `docs/`) —
  secondary to the code. Stale docs are common; the code wins.

## Phase 2 — Read the supplementary `.md`, if one was passed

If the user handed you a context/goals document, read it as **context and
intent only — never as authority**. If it contradicts the code, **the code
wins**, and you note the conflict for the Phase 6 report. If an `AGENTS.md`
already exists in the target (a re-run), read it the same way: context, not
truth.

## Phase 3 — Clarifying questions, as a single numbered block

Ask everything at once, then wait. Only ask what genuinely cannot be
inferred from Phase 1 — do not ask what the code already answers. Typical:

1. Discrepancies found between code, docs, and the supplementary `.md`.
2. **Source documents this project has** — a brief, client content
   documents (approved copy, FAQs, pricing sheets, etc.), or none. This
   decides whether the light lane (`feature_list.json` with `source` +
   `acceptance`) is usable for this project's routine work at all, or
   whether everything here falls to the full `/spec` lane instead.
3. Animation strategy, if the code is ambiguous about it.
4. Appetite for restructuring — how much migration is actually wanted vs.
   "document what's there and leave it alone".
5. Whether to also copy any scaffold-specific builder skill
   (`front-end-astro`, `seo-guide-lines`, `gsap-*`,
   `tailwind-css-patterns`) — only sensible if the stack genuinely matches.
6. Confirmation before overwriting, if an `AGENTS.md` already exists.

## Phase 4 — Write the project's own `AGENTS.md`

Same section skeleton as the scaffold's (Tech stack, Architecture,
Invariant vs Variable, Knobs map, Orchestration model, Conventions,
Evolving the scaffold, Spec-first), **populated from what Phase 1 actually
found**. Every path named must exist in this project.

Include a **"Development workflow"** section describing the two lanes all
work goes through, and the routing rule between them:

- **Full lane** — a decision with no source document to cite: `/spec`
  produces a Draft → a human flips it to `Approved` → `/spec-impl NN`
  implements it.
- **Light lane** — the answer already lives in an approved document (a
  brief, client-supplied content): an entry in `feature_list.json`
  carrying `source` (the document and section it came from) and
  `acceptance` (boolean criteria) → `/spec-impl feature <id>` implements
  it.
- **Both lanes end the same way** — implementation with pauses for
  review, then `spec-verifier` checks the criteria against the real
  build, then a human commits. No agent marks a spec `Approved` or a
  feature `done`.

The routing rule is mechanical, not a judgment call: if the answer is
already written in an approved document, cite it — light lane. If there
is a decision to make, it needs a spec — full lane. Use Phase 3's answer
about source documents to state plainly, in this section, whether the
light lane is usable for this project at all (it requires at least one
real source document) or whether everything here falls to the full lane.

If the real structure does not cleanly separate Invariant from Variable,
**say so explicitly in that section** rather than inventing a table that
does not match the codebase. A truthful "this project does not currently
separate these; see the migration specs" is worth far more than a tidy
fiction.

## Phase 5 — Propose migration specs

Only where restructuring has a real payoff. Use **exactly the mechanism of
the `/spec` skill**: number sequentially from existing `specs/*.md`,
copy every section of `specs/TEMPLATE.md`, set `Status: Draft`.

Prefer **several small, focused specs** over one sprawling migration — each
should be independently approvable and independently revertible. If nothing
genuinely warrants migrating, write **zero specs** and say so plainly; a
clean "nothing here needs restructuring" is a valid, useful outcome.

## Phase 6 — Stop and report

Report: the `AGENTS.md` written, how many specs were drafted (or none, and
why), every discrepancy found in Phases 1–2, and the reminder that a human
approves each spec manually before any implementation begins.

## Relationship to the two lanes

This is a one-time onboarding step. Once the project is adapted, all
future evolution goes through the two lanes described in the "Development
workflow" section this skill just wrote into the project's `AGENTS.md`:
`/spec` → `/spec-impl NN` for changes with no source document to cite, the
`feature_list.json` light lane (`/spec-impl feature <id>`) for changes an
approved document already answers. This skill is not re-run for ordinary
changes.
