# docs/brief/ — client brief drop zone

Put the client brief here, then tell Claude Code: **"ingiere el brief"**.

## What goes here

Both files below are **mandatory** — the harness must always ingest both.
Never skip or omit either one, even if a request only mentions one of them.

- `arquitectura-informacion.md` — site architecture (sitemap, URLs, nav/footer
  spec) + copy per page and section. This is the **content source of truth**.
- `brand.md` — brand input: color palette (hex/oklch), fonts, logo, photos.

If either file is missing, **stop and ask for it** before ingesting — do not
proceed with only one of the two, and do not silently invent brand or content
data. Note the missing file in `client-gaps.md` if the user explicitly
confirms it isn't available yet.

## What the harness does with it

1. Reads `arquitectura-informacion.md` and populates `src/config/*` (`services`,
   `faqs`, `authorBio`, `COMPANY_INFO`) + `src/utils/navigation.ts`. Reads
   `brand.md` and populates `src/styles/global.css` (`@theme` tokens) + the
   Astro Fonts API config.
2. Generates `feature_list.json` — one feature per section/page.
3. Writes `client-gaps.md` at the repo root — the short list of things the
   brief does NOT cover (phone, email, brand palette, fonts, logo, photos).

The content brief (`arquitectura-informacion.md`) does **not** carry brand
colors/fonts — those come from `brand.md` and land only in
`src/styles/global.css` (`@theme`).

> This folder ships **empty** in the scaffold. The brief is attached per client
> after cloning.
