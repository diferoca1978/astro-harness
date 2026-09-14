# Writing a useful spec

This file is a **quality guide**, not a structure. For the exact sections,
their order, and their headings, use `specs/TEMPLATE.md` — that is the
single source of truth for shape, and the one all real specs in this repo
follow. This file exists to help you fill those sections *well*, not to
describe them a second time in a different way.

---

## The objective, in one sentence

`specs/TEMPLATE.md`'s `## Goal` section wants one or two sentences: what
this adds or changes, and why it's needed now. If it doesn't fit, the
feature is too big — split it before continuing.

> ✅ "Wire `front-end-astro` and `seo-guide-lines` into `coder.md`'s
> operational skill routing — today only GSAP/Tailwind/Three.js are wired,
> so the two builder skills are described in `AGENTS.md` but never
> invoked."
>
> ❌ "Improve how the coder picks skills." — not concrete, doesn't say what
> changes or why now.

## Scope: what's out matters as much as what's in

`specs/TEMPLATE.md`'s `## Scope` has explicit **In** and **Out**
sub-lists. The **Out** list is not optional filler — it's where you record
what came up during the conversation but was deliberately deferred.
Without it, implementation quietly re-absorbs deferred work "while we're
at it."

## Files affected: name the real ones

List concrete paths and line ranges where you know them
(`.claude/agents/coder.md:35`), not vague areas ("the coder config").
Cross-reference `AGENTS.md`'s "If you change X → update Y" table — say
which row this spec matches, or that it matches none and one should be
added.

## Decisions made and discarded

The section with the most value three months from now. Capture what you
**considered**, not only what you picked — a decision without the
discarded alternative is the first thing later readers question.

> ✅ "Renamed the heading instead of leaving it as-is. Discarded: keeping
> '...when building animations' — it already covered non-animation content
> before this change, and adding two more entries made the name actively
> wrong."

## Acceptance criteria: boolean, not aspirational

Every item in `specs/TEMPLATE.md`'s `## Acceptance criteria` checklist
must be answerable yes/no by running something real — a grep, a build, a
manual click-through — not by opinion.

**Anti-patterns:**

- ❌ "That it works well." — not verifiable.
- ❌ "Good UX." — subjective.
- ❌ "No bugs." — not operational.
- ✅ "`coder.md` has a bullet invoking `front-end-astro` for
  component/section building." — verifiable, boolean.

## Implementation plan: each step stays runnable

Numbered, and each step must leave the system functional — no "implement
half and continue tomorrow." If a step needs more than 30–50 lines, split
it. The last step is never "test everything" — that's what the acceptance
criteria are for.

---

## Global rules

- **One sentence per idea.** Two commas and a semicolon means split it.
- **Concrete names.** Not "the levels module" — `src/levels.js`. Not "a
  key" — the exact string.
- **No TODOs.** A TODO in a spec means the decision wasn't made. Make it,
  or record it as a pending decision with a reason.
- **No long executable code.** The spec describes; the code comes after.
  Short snippets to illustrate a shape are fine; full functions aren't.
- **Standard markdown.** Renders on GitHub with no surprises.
