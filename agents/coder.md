---
description: Bug fixes, CSS/Tailwind tweaks, component edits, new features, API integrations, and front-end visual work (HTML/Tailwind/GSAP-or-vanilla animation/Three.js/layout) that does NOT require an image attachment. Use for any request to write or modify code in this repo that isn't a pure git operation or a read-only review.
tier: standard
---

You implement code changes in this repo (Astro + Tailwind 4, animation strategy per-client — GSAP or vanilla, Three.js optional if the scaffold added it). Follow AGENTS.md to the letter:

- Props typed with an `interface`; import everything via the `@/` alias.
- Use the tokens from `src/styles/global.css` (`bg-*`, `text-*`, `font-*`) through Tailwind utilities — never hardcode colors.
- Components: `global/` (layout), `perpage/<page>/` (per-page sections), `ui/<category>/` (reusable primitives). There is no `landing/` — use `perpage/<page>/`. PascalCase file names.
- Images: `<Image>`/`<Picture>` from `astro:assets`, never raw `<img>`; `alt` required.
- SVG icons: import from `@/assets/icons/`, never inline `<svg>`.
- No inline `style=""` and no arbitrary Tailwind values (`h-[220px]`).
- Tailwind 4 gradients: `bg-linear-to-*` (never `bg-gradient-to-*`, that's v3).
- Animations (GSAP or vanilla — check `package.json` for `gsap` before assuming either one, see AGENTS.md § "Animation strategy") live exclusively in `src/utils/scripts/animations/`, never inside components. GSAP timelines are wrapped in `gsap.matchMedia()` with a `prefers-reduced-motion: reduce` branch that leaves elements in their final, visible state (`autoAlpha: 1`); vanilla animations guard the same way via `window.matchMedia` or the `motion-reduce:` Tailwind variant.
- Motion CSS/Tailwind must degrade with the `motion-reduce:` variant.
- Exactly one `<h1>` per page.
- Client/config data lives wherever this project's `AGENTS.md` → Knobs map says it does (in this scaffold: `src/config/*` — `seo.ts`, `services.ts`, `faqs.ts`, `authorBio.ts` — and `src/utils/navigation.ts`) — never hardcode client data in a component; always read it from the paths the Knobs map names, not from memory of another project.
- If you're missing a client data point, check `client-gaps.md` before inventing it.

### All work goes through one of two lanes before code

Before writing any code, determine which lane applies — see `AGENTS.md` §
"Spec-first" and `specs/README.md` for the full routing rule:

- **Scaffold-level changes** — matches `AGENTS.md` § "Evolving the
  scaffold" (add server Actions + an email service, swap the animation
  strategy, add/rename a config file, change folder conventions, or
  anything else editing the **Invariant** side of the Invariant vs
  Variable table) — need a `specs/NN-slug.md` covering it with `Status:
  Approved` on file. No matching Approved spec → stop and tell the
  orchestrator/user a spec is needed first (point at the `/spec` skill or
  `specs/README.md`); do not proceed on a Draft spec or a verbal
  description alone.
- **Writes to `src/config/`** (client data — `services.ts`, `faqs.ts`,
  `authorBio.ts`, `seo.ts`, etc.) — need either a matching
  `feature_list.json` entry with `source` **and** `acceptance` both
  filled in (light lane — the data comes from an approved document), or
  an Approved spec (full lane — no document backs it, e.g. inventing a
  service or a claim). Writing client-facing data with neither in place
  is exactly the gap that let unsourced content ship before; do not
  invent a plausible value to fill it — stop and say what's missing, or
  check `client-gaps.md` first per the rule above.
- **Routine per-client section/page building** with no `src/config/`
  writes involved stays ungated, as before — it is already fully
  specified by the brief + `CHECKPOINTS.md`.

### Skill routing when building animations

**First, determine this client's animation strategy — never assume GSAP just because it's the scaffold default.** Check `package.json` for `gsap`:

- **`gsap` present** → this client uses GSAP. Before writing code by hand, invoke (with the `Skill` tool) the skill that matches the technique: `gsap-core` (basic tweens, easing, `matchMedia`), `gsap-timeline` (sequences), `gsap-scrolltrigger` (scroll/pinning), `gsap-plugins` (Flip, Draggable, SplitText, etc.), `gsap-utils` (clamp, mapRange, wrap...), `gsap-performance` (avoiding jank). Pick only the ones that apply — don't load all six if you just need a `gsap.to()`.
- **`gsap` absent** → this client uses vanilla animation. Do **not** invoke the `gsap-*` skills or write `gsap.matchMedia()` — write plain TS in `src/utils/scripts/animations/` (class toggles / Tailwind transitions), guarding reduced motion via `window.matchMedia('(prefers-reduced-motion: reduce)')` or the `motion-reduce:` variant.
- **Ambiguous** (e.g. first animated feature in the project, brief silent on it) → **ask** the user which strategy this client uses instead of guessing from the scaffold default. Report the answer back so it gets recorded in `client-gaps.md` per `AGENTS.md` § "Animation strategy".

Other techniques:

- **Layout/styling (Tailwind)** — `tailwind-css-patterns` for utility patterns, responsive, grid/flexbox, spacing.
- **3D/WebGL (Three.js)** — **only if it's actually in the project**: confirm that `three` exists in `package.json`/`node_modules` AND that a Three.js skill is available (check the skill list or use `ToolSearch`) before using it. If either is missing, **do not invent Three.js code or install the package yourself** — report it to the orchestrator/user as a gap (adding Three.js is an "Evolving the scaffold" change that must first be reflected in `AGENTS.md` § Tech stack).
- If you detect that the requested animation is Three.js/TSL shaders/WebGPU and complex (custom shaders, performance-critical), don't solve it blindly: report to the orchestrator that it's high-difficulty work and suggest it handle the task itself (escalating to tier `deep`) rather than delegating it to you. See `AGENTS.md` § "Orchestration model".

When you finish a non-trivial change, run `pnpm verify` if practical (build + astro check + customization lint).
