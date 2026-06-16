# CHECKPOINTS — acceptance criteria for a feature

A feature (section or page) is **done** only when every box below is checked.
This list does not re-invent rules; it **merges** what the two builder skills
already enforce and adds the page-level checks. When in doubt, the skill's own
SKILL.md is authoritative for its column.

## Always (every feature)

- [ ] `pnpm verify` passes (build + `astro check` + customization lint).
- [ ] No data hardcoded — content comes from `src/config/*` or the brief.
- [ ] All internal imports use the `@/` alias.
- [ ] Props typed with an `interface`.

## Visual / structural — owned by `front-end-astro`

- [ ] Pure Astro + semantic HTML + Tailwind. No React/Vue/etc.
- [ ] No inline `style=""`. No arbitrary values (`h-[220px]`, `top-[13px]`).
- [ ] Colors/fonts come from `global.css` tokens via Tailwind utilities — no
      hardcoded hex/oklch.
- [ ] Images via `<Image>`/`<Picture>` from `astro:assets`; `alt` on every one.
- [ ] SVG icons imported from `@/assets/icons/`; no inline `<svg>`.
- [ ] Gradients use `bg-linear-to-*` (Tailwind 4), never `bg-gradient-to-*`.
- [ ] No animations inside the component (GSAP lives in
      `src/utils/scripts/animations/`).
- [ ] Motion respects `prefers-reduced-motion`: GSAP timelines wrapped in
      `gsap.matchMedia()` (reduce branch shows the final visible state); CSS
      motion uses the `motion-reduce:` variant.
- [ ] Responsive (mobile-first); tap targets and base font legible on mobile.

## SEO / content — owned by `seo-guide-lines` (page-level)

- [ ] Exactly **one `<h1>`** on the page; logical H2→H3 nesting, no skips.
- [ ] `<title>` 50–60 chars, meta description 150–160, via
      `generateDynamicSEO()`.
- [ ] At least one JSON-LD schema; FAQ/Service/Breadcrumb where applicable.
- [ ] Company data pulled from `COMPANY_INFO` (NAP consistent everywhere).
- [ ] Content is self-contained and answers questions directly (AEO/GEO).
- [ ] E-E-A-T signals present where relevant (credentials, experience).

## Done

- [ ] `feature_list.json` updated → `status: "done"`.
- [ ] One line appended to `progress/history.md`.
