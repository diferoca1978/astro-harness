# docs/brief/ — client brief drop zone

Put the client brief here, then tell Claude Code: **"ingiere el brief"**.

## What goes here

- `arquitectura-informacion.md` — site architecture (sitemap, URLs, nav/footer
  spec) + copy per page and section. This is the **content source of truth**.
- (optional) `marca.md` — brand input: color palette (hex/oklch), fonts, logo,
  photos. If you have a brand guide, drop it here too.

## What the harness does with it

1. Reads the brief and populates `src/config/*` (`services`, `faqs`,
   `authorBio`, `COMPANY_INFO`) + `src/utils/navigation.ts`.
2. Generates `feature_list.json` — one feature per section/page.
3. Writes `client-gaps.md` at the repo root — the short list of things the
   brief does NOT cover (phone, email, brand palette, fonts, logo, photos).

The content brief does **not** carry brand colors/fonts — those come from a
brand input and land only in `src/styles/global.css` (`@theme`).

> This folder ships **empty** in the scaffold. The brief is attached per client
> after cloning.
