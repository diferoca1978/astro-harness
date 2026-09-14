# 01 — wire-builder-skills-into-coder

**Status:** Draft <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

`AGENTS.md` § "Skill routing — the two builders work at different altitudes"
describes `front-end-astro` (section/component builder) and
`seo-guide-lines` (page-level SEO/data layer) as the two skills that do the
actual building work, and the routing table sends "isolated component, new
feature, visual work" to `coder`. But verified in code, `coder.md` never
invokes either one — its own "Skill routing" section only wires `gsap-*`,
`tailwind-css-patterns`, and the Three.js gap-check. The pattern that *does*
work is animation: `AGENTS.md` § "Animation strategy" explicitly says "the
operational routing lives in `.claude/agents/coder.md` § 'Skill routing when
building animations' — keep the two in sync", and `coder.md` delivers on
that with an imperative "invoke (with the `Skill` tool)..." instruction. The
two builder skills never got that second half — they're described, never
routed to.

A related inaccuracy surfaced during this audit: `AGENTS.md` (§ "Acceptance
— see `CHECKPOINTS.md`") states a page is "done" only when it passes "the
`front-end-astro` constraints and the `seo-guide-lines` checklist in
`CHECKPOINTS.md`" — but `CHECKPOINTS.md` as it exists today contains only
the pre-production domain/Resend/DNS checklist, no such section. See Scope
Out — flagged, not fixed here.

This same gap was found and fixed locally in a client repo
(AguilarAbogados, adapted from this scaffold) via its own
`specs/15-wire-builder-skills-into-coder.md`; this spec is the equivalent
fix for the scaffold itself, so future clones don't inherit the gap.

## Scope

**In:**

- Add to `.claude/agents/coder.md` the operational instruction that's
  missing for `front-end-astro` and `seo-guide-lines`, in the same
  imperative style already used for `gsap-*` and `tailwind-css-patterns`.
- Rename `coder.md`'s `### Skill routing when building animations` heading
  to `### Skill routing` — it already covers Tailwind and Three.js besides
  animation; the current name was already inaccurate before this change and
  adding two more non-animation entries makes it worse.
- Add one sentence to `AGENTS.md` § "Skill routing — the two builders work
  at different altitudes" pointing at `coder.md` as the owner of the
  operational routing, mirroring the sentence that already does this for
  animation in § "Animation strategy" — so the two files don't drift apart
  silently again.

**Out:**

- Writing the missing "front-end-astro constraints + seo-guide-lines
  checklist" section of `CHECKPOINTS.md` that `AGENTS.md` already claims
  exists. That's real checklist-design work (what exactly counts as
  passing), not a one-line routing fix — worth its own spec.
- Any change to how `feature_list.json` / brief ingestion works.
- GSAP routing, which is already correctly wired in both files.

## Files affected

- `.claude/agents/coder.md`:
  - Line 35 (`### Skill routing when building animations`) → rename to
    `### Skill routing`.
  - Lines 43-47 ("Other techniques:" block) → add two bullets, for
    `front-end-astro` (building new components/sections — invoke before
    writing markup by hand) and `seo-guide-lines` (meta tags, JSON-LD
    schemas, E-E-A-T, `<title>`, canonical — invoke before writing
    SEO-related code by hand).
- `AGENTS.md` line ~200 (end of § "Skill routing — the two builders work at
  different altitudes") → add the sync-pointer sentence.

Matches the existing "If you change X → update Y" table row **"Change
folder conventions" → Components section · the structure note in
`front-end-astro` SKILL.md** only partially — that row is about folder
layout, not skill routing. No existing row covers "wire a skill's
operational routing into `coder.md`"; propose adding one as part of this
change (`Add or change a subagent's skill routing → coder.md § Skill
routing · the corresponding AGENTS.md skill-routing section`).

## Decisions made and discarded

- **Scope of the `seo-guide-lines` bullet.** Written as specific as the
  Tailwind one (utility patterns, responsive, grid/flexbox, spacing):
  meta tags, JSON-LD/schemas, E-E-A-T, `<title>`, canonical. *Discarded:* a
  generic "for SEO work, use this skill" line — that weak phrasing already
  exists in prose form in AGENTS.md and evidently isn't enough for `coder`
  to act on it; it needs the same imperative form as the GSAP bullets.

- **Renaming the `coder.md` heading.** Discarded leaving it as "...when
  building animations" — the section already contains non-animation
  content (Tailwind, Three.js) before this change; two more non-animation
  bullets make the mismatch worse, and it's a one-line fix.

- **Not touching `CHECKPOINTS.md`'s missing checklist section.** Considered
  writing it as part of this spec (it's the more complete fix — it would
  make the `AGENTS.md` claim actually true). Discarded because it requires
  deciding what the checklist items actually are, which is a design
  decision independent of the routing gap this spec fixes, and would blow
  up this spec's diff. Flagged in Goal/Scope so it isn't lost.

## Acceptance criteria

- [ ] `coder.md` has a bullet with "invoke (with the `Skill` tool)
      `front-end-astro`" for component/section building.
- [ ] `coder.md` has a bullet with "invoke (with the `Skill` tool)
      `seo-guide-lines`" for SEO/meta/schema work.
- [ ] `coder.md`'s skill-routing heading no longer says "...when building
      animations".
- [ ] `AGENTS.md` § "Skill routing — the two builders..." points at
      `coder.md` as the operational-routing owner, same pattern as
      § "Animation strategy" already does.
- [ ] **Functional test:** delegate a new-component task to `coder` and
      confirm it invokes `front-end-astro` before hand-writing markup;
      separately, delegate a meta-tags/schema change and confirm it invokes
      `seo-guide-lines`.
- [ ] `pnpm verify`, run on-demand, still passes (no code changes expected
      to break it — this is a docs/contract-only change).

## Implementation plan

1. Edit `.claude/agents/coder.md`: rename the heading, add the two bullets.
2. Edit `AGENTS.md`: add the sync-pointer sentence in § "Skill routing —
   the two builders...".
3. Add the new table row to "If you change X → update Y" for future
   skill-routing changes.
4. Run the two functional tests in Acceptance criteria.
