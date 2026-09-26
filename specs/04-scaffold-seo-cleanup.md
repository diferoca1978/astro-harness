# 04 — scaffold-seo-cleanup

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

`src/config/seo.ts` has not changed since the initial commit, when it was
copied from the Shine project. Because of that, every client cloned from
`main` ships a broken canonical, a duplicate robots tag, Shine's data and
invented facts in its JSON-LD. The `seo-guide-lines` skill also tells agents
to put a schema on every page and to invent FAQ answers. This spec removes
and repairs that. It does not design the new JSON-LD core, which is the
planned spec 06 (not written yet).

Today's `dist/index.html`, from `pnpm build` on `dev` at `d685d93`
(2026-09-25):

- `<link rel="canonical" href="https://tuagencia.com/home/">`, and the same
  value in `og:url`.
- Two identical `<meta name="robots" content="index, follow">`.
- JSON-LD with top-level types `ProfessionalService` and `WebSite`. Nested
  inside them are `SearchAction`, an `OfferCatalog` with 3 `Service` nodes
  that point to `/servicios/*` pages that do not exist, 2 `Person` nodes
  (the invented founders) and `GeoCoordinates` for central Bogotá. In total
  there are 17 distinct URLs outside `site`.
- The sources: Shine's `alternateName`, slogan, X handle (`@shine_agencia`)
  and brand color (`#FFD97D`), invented authors, and FAQs with Shine's
  prices and a Shine contact email (`faqs.ts:23`).

Two mechanisms this spec relies on, both tested in a scratch copy of the
scaffold on 2026-09-25:

- **`astro-seo` 1.2.0 derives the canonical and `og:url`.**
  - If a page passes no `canonical`, `astro-seo` emits
    `new URL(Astro.url.pathname + Astro.url.search, Astro.site)`
    (`node_modules/astro-seo/src/SEO.astro:136-157`).
    `OpenGraphBasicTags.astro` falls back to `Astro.url.href` for `og:url`.
  - A test page at `src/pages/prueba.astro` passed neither value and got
    `https://example.com/prueba/` for both.
  - `astro-seo` always emits one `<meta name="robots">` of its own, from
    `noindex` and `nofollow` (`SEO.astro:167-172`). Any robots tag in
    `extend.meta` is therefore always a duplicate.
- **`import.meta.env.SITE` works in a plain `.ts` module.** In a module
  under `src/config/` it resolves to `https://example.com` at build time.

## Scope

**In:**

- `src/config/seo.ts`:
  - Build every URL from `import.meta.env.SITE`, and delete
    `COMPANY_INFO.url`.
  - Keep one page helper, `generatePageSEO`. It never sets the canonical
    or `og:url`.
  - Delete the obsolete and dead generators and exports.
  - Make `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA` neutral.
  - Prune `extend.meta` and drop the X handle.
  - In `COMPANY_INFO`, mark every placeholder with the single marker
    `[CLIENTE]`, make the fields that not every client has optional and
    absent, and give the WhatsApp link its own field.
- `src/config/faqs.ts`, `services.ts` and `authorBio.ts`: empty the data
  and prune the helpers.
- `src/pages/index.astro`: switch to `generatePageSEO`.
- `src/components/ui/WhatsApp.astro`: read `COMPANY_INFO.whatsapp`.
- `harness/lint-customization.sh`: add three checks:
  - the `[CLIENTE]` marker;
  - a regression marker for the removed contamination;
  - email addresses written by hand anywhere under `src/` except
    `src/config/seo.ts`.
- `pnpm-workspace.yaml`: remove `minimumReleaseAgeExclude`. This item came
  from spec 03 (see **Decisions made and discarded**).
- `AGENTS.md`:
  - remove the blog mentions;
  - update the Config section and the Knobs map;
  - add a new subsection with the contact-form rules.
- `CHECKPOINTS.md` §1: drop the two `COMPANY_INFO.url` boxes.
- `seo-guide-lines` skill (`SKILL.md` and `seo-guide-line.md`): surgical
  edits only.

**Out:**

- **The JSON-LD core** belongs to the planned spec 06. That covers a URL
  helper, data separated from generators, Organization vs. a LocalBusiness
  subtype by business axis, minimal nodes on non-home pages, and no JSON-LD
  on noindex pages or the 404.
- **The hardcoded language** also goes to the planned spec 06, as the plan
  already assigns it (`~/harness-notes/2026-09-24-plan-specs-scaffold.md`
  §2.6). This covers `og:locale: 'es_CO'`, `inLanguage: 'es-CO'` and
  `<html lang="es-CO">`. This spec does remove the `Content-Language`
  http-equiv meta, which only repeats `<html lang>`.
- **A full rewrite of `seo-guide-line.md`**, and documenting the new core
  API in the skill. The planned spec 06 changes that API, so it documents
  it.
- **A row in AGENTS.md's "If you change X → update Y" table** for "add,
  remove or rename a generator in `seo.ts` → update the `seo-guide-lines`
  skill". It is proposed for the planned spec 06, which rewrites the
  generators (see **Files affected**).
- **The HTML checker (`check-seo`)**, including the title and description
  rule (Engram #519), belongs to the planned spec 05. The canonical,
  robots and JSON-LD commands in **Acceptance criteria** are one-off
  checks, not that checker.
- **`public/` does not exist.** So `COMPANY_INFO.logo`
  (`/images/logo.svg`), `COMPANY_INFO.image` (`/images/og-image.png`) and
  the favicons in `MainLayout.astro:32-33` point to files that are not
  there. Assets are supplied per client, and the planned spec 05 flags
  broken URLs.
- **`src/pages/404.astro` is 0 bytes.** The planned spec 06 decides what
  the 404 gets.
- **`src/utils/scripts/readingTime.ts`** is a blog utility with no
  consumer. The planned spec 09 (the blog module) decides what happens to
  it.
- **Hardcoded colors in `ui/WhatsApp.astro`** (`bg-amber-600/80`,
  `text-stone-50` and others) break the tokens rule, but they are not SEO.
  This spec changes only that component's `href` line.
- **The AI-crawler list in `robots.txt.ts`** belongs to the planned spec 07.
- **Implementing a contact form.** There is no contact module (Engram
  #509). Only the written rules land here.
- **The broken canonicals on live client sites.** The user fixes those
  repo by repo (Engram #507).
- **Legacy projects.** They get the corrected skill by copying the folder
  (plan §4.A.2), not through this spec.

## Files affected

- **`src/config/seo.ts`**
  - **Delete** these exports, together with their types and helpers:
    - `MainKeywords` and `MAIN_KEYWORDS`;
    - `DEFAULT_SEO`;
    - `DynamicSEOOptions`, `generateDynamicSEO`, `generateDynamicTitle`
      and `generateDynamicDescription`, plus their title and description
      maps written for the agency;
    - `generateServiceSEO` and `generateServiceSchema`;
    - `BlogPost`, `BLOG_SCHEMA` and `generateBlogPostSchema`;
    - `LOCAL_BUSINESS_SCHEMA`;
    - `generateFAQSchemaWithPage`;
    - `HowToStep`, `HowToOptions`, `generateHowToSchema` and
      `generateHowToSchemaWithPage`;
    - `generateAuthorSchema` and `generateAllAuthorsSchemas`;
    - `generateReviewsSchema` and `generateGoogleReviewsSchema`;
    - `ALL_BASE_SCHEMAS`.

    The imports of `services`, `Service`, `AUTHORS`, `getAuthorByName` and
    `Author` go with them.

  - **Keep** `JSONLDSchema`, `BreadcrumbItem`, `CompanyInfo`,
    `COMPANY_INFO`, `generatePageSEO`, `ORGANIZATION_SCHEMA`,
    `WEBSITE_SCHEMA`, `generateFAQSchema`, `generateBreadcrumbSchema`,
    `ProfessionalPerson` and `generatePersonSchema`. `generateFAQSchema`
    stays for the visible FAQ component (decision 4).
  - **Site URL.** A module-private `const SITE = import.meta.env.SITE`,
    and every absolute URL is built as `new URL(path, SITE).href`. No URL
    helper is exported; the planned spec 06 owns that.
  - **`CompanyInfo` becomes:**

    ```ts
    export interface CompanyInfo {
      name: string;
      description: string;
      phone: string;
      email: string;
      whatsapp: string;
      address?: {
        street?: string;
        city: string;
        region: string;
        postalCode?: string;
        countryCode: string; // ISO 3166-1 alpha-2
      };
      geo?: { latitude: number; longitude: number };
      logo: string;
      image: string;
      foundingDate?: string;
      founders?: string[];
      socialMedia: Record<string, string>; // profile URLs only → sameAs
    }
    ```

    `url`, `address.country` (the country name) and
    `socialMedia.whatsapp` are gone.

  - **The `COMPANY_INFO` value:**
    - `name`, `description`, `phone`, `email`, `whatsapp` and
      `address.city`, `address.region` and `address.countryCode` each hold
      a `[CLIENTE] …` marker (8 in total);
    - `street`, `postalCode`, `geo`, `foundingDate` and `founders` are
      absent;
    - `socialMedia` is `{}`;
    - `logo` and `image` keep their current paths.
  - **`generatePageSEO(options: { title: string; description: string; image?: string; noindex?: boolean }): SEOProps`:**
    - `title` is `` `${options.title} | ${COMPANY_INFO.name}` ``;
    - it also passes `description` and `noindex` through;
    - it sets no `canonical` and no `openGraph.basic.url`, because
      `astro-seo` derives both;
    - `openGraph.basic` holds `title`, `type: 'website'` and an absolute
      `image`;
    - `openGraph.optional` holds `description`, `siteName` and
      `locale: 'es_CO'` (the locale is left for the planned spec 06);
    - `twitter` holds `card`, `title`, `description` and `image`, with no
      `site` or `creator`;
    - `extend.meta` holds only `{ name: 'author', content: COMPANY_INFO.name }`.
  - **`ORGANIZATION_SCHEMA`:**
    - `@type: 'Organization'` and `@id: <site>/#organization`;
    - `name`, `description`, `url` (the site root), `logo`, `image`,
      `telephone` and `email`;
    - `sameAs`, only when `socialMedia` has entries;
    - `address`, only when `COMPANY_INFO.address` exists. It is a
      `PostalAddress` with `addressLocality`, `addressRegion`,
      `addressCountry` set to `countryCode`, and `streetAddress` and
      `postalCode` when present;
    - nothing else.
  - **`WEBSITE_SCHEMA`:**
    - keeps `@id: <site>/#website`, `name`, `description`, `url`,
      `inLanguage` (left for the planned spec 06) and
      `publisher: { '@id': <site>/#organization }`;
    - loses `potentialAction`, `alternateName`, `copyrightYear`,
      `copyrightHolder` and `mainEntity`.
  - **`generateBreadcrumbSchema` and `generatePersonSchema`:** only the
    URL base changes, including the one inside `@id`.
- **`src/config/faqs.ts`:** `export const faqs: FAQItem[] = [];`.
  `FAQItem` stays. `generalFAQs`, `pricingFAQs`, `allFAQs` and
  `getFAQsByCategory` go.
- **`src/config/services.ts`:** `export const services: Service[] = [];`.
  `Service` stays.
- **`src/config/authorBio.ts`:**
  - `Author` stays, with `export const AUTHORS: Author[] = [];`;
  - `DEFAULT_AUTHOR` and `getAuthorByName` go;
  - the comment "must exactly match post.author from CMS" goes too,
    because there is no CMS.
- **`src/pages/index.astro`:** calls
  `generatePageSEO({ title: "Home - My Website", description: "Welcome to my website. Explore our content and services." })`.
  The existing `My Website` lint marker stays.
- **`src/components/ui/WhatsApp.astro:7`:**
  `COMPANY_INFO.socialMedia.whatsapp` becomes `COMPANY_INFO.whatsapp`.
- **`harness/lint-customization.sh`:** add three checks. All three are
  advisory like the existing ones, and `--strict` fails on them.
  - `marker '\[CLIENTE\]' 'client data placeholder [CLIENTE] (fill from the brief / client-gaps.md)'`
  - `marker 'tuagencia|Tu Agencia|\bShine\b|shine_?agencia|Nombre Fundador|Calle Principal|María González|Carlos Rodríguez|300-000-0000|573000000000' 'scaffold contamination (Shine data / old placeholders)'`
  - An email check with the regex
    `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`. It covers the same
    file types under `src/` and excludes `src/config/seo.ts`, the home of
    `COMPANY_INFO.email`. `marker()` cannot exclude a file today, so the
    implementation adds a way to do it (an extra argument or a separate
    function). Existing markers must behave exactly as before.
- **`pnpm-workspace.yaml`:** delete the `minimumReleaseAgeExclude` block
  and leave `allowBuilds` unchanged. `pnpm-lock.yaml` changes only if
  `pnpm install` rewrites it.
- **`AGENTS.md`:**
  - lines 14–15: "and **no** email service. The blog is local markdown."
    becomes "**no** email service, and **no** blog."
  - line 67: delete the `src/contentBlogs/` bullet.
  - line 90: `generateDynamicSEO()` becomes `generatePageSEO()`. Add that
    absolute URLs come from `site` via `import.meta.env.SITE`.
  - line 116: drop `src/contentBlogs/` from the Variable / Where cell.
  - line 125 (Knobs map): "Company data (name, phone, email, social, url)"
    becomes "Company data (name, phone, email, WhatsApp, social profiles)".
  - Knobs map: add a row that reads:
    > | Site URL | `astro.config.mjs` → `site` (only — `seo.ts` reads it via `import.meta.env.SITE`; never hardcode the domain) | Provisioning script · `CHECKPOINTS.md` §1 |
  - Add a new subsection, `### Contact forms (manual, per client)`,
    between "Scaffold-level vs per-client" (line 394) and "Spec-first"
    (line 405). It says the scaffold has no contact module and lists these
    8 rules:
    1. Recipient and sender addresses come only from environment
       variables, with no default in code. If one is missing, sending
       fails with a visible error.
    2. Each client gets its own Resend API key. Keys are never shared
       between clients.
    3. The form has a honeypot field. The server silently discards any
       submission that fills it.
    4. The server validates every field for maximum length and format,
       the phone included.
    5. Escape all visitor input before inserting it into the email HTML.
    6. Never send email to the address the visitor typed. Use it only as
       `replyTo`.
    7. If sending fails, the visitor sees an error, never a success
       message.
    8. Add Cloudflare Turnstile only once real spam appears. A honeypot
       does not stop direct calls to the endpoint. Turnstile costs a
       secret environment variable, server-side verification and a
       mention in the privacy policy.
  - line 378 (the "Add server Actions + an email service" row): its
    Update cell ends with "· follow § Contact forms (manual, per client)".
- **`CHECKPOINTS.md` §1 (lines 12–15):** delete the two boxes about
  `COMPANY_INFO.url`. `site` is now the only URL source, and the first box
  already checks it.
- **`.claude/skills/seo-guide-lines/SKILL.md`** (surgical edits):
  - line 45 ("Create FAQ schemas for featured snippets"), 157 ("At least
    one schema"), 163, 199–206 ("Schema Markup is Mandatory") and 291–297
    (the FAQ task that has the agent invent questions): rewrite them. A
    schema goes on a page only when it describes something visible and
    true on that page. FAQPage comes only from a visible FAQ component,
    whose questions come from `faqs.ts` or the brief and are never
    invented. No rich-result promises.
  - lines 50, 95, 135, 190 and 270: drop `MAIN_KEYWORDS`.
  - lines 120, 126 and 204–206: replace deleted generator names with the
    ones that survive, or drop the line.
  - Add an instruction to validate with Google's Rich Results Test and the
    Schema Markup Validator before closing a page.
- **`.claude/skills/seo-guide-lines/seo-guide-line.md`** (surgical edits):
  - Delete the blasting and demolition examples: lines 505–530, line 2655
    and every other occurrence (33 today).
  - Delete the `seoConf.ts` / `LegalService` text (line 2462 and 4 more
    `LegalService` mentions).
  - Delete "Tu Agencia Digital" and `tuagencia` (24 occurrences).
  - Delete the stats with no source (lines 179 and 3311–3313) and the
    example with invented credentials (line 449).
  - "Google SGE" becomes "AI Overviews" (line 3321 and the other
    occurrence).
  - Remove "Mandatory Schema Markup" (line 56) and `SearchAction` (lines
    726 and 1328).
  - Rewrite the AEO section (lines 385–546) around writing: a direct
    answer first, natural-language questions, lists and tables. FAQPage
    follows the same rule as `SKILL.md`.
  - Remove the featured-snippet and FAQ-for-snippets claims at lines 389,
    421, 2412–2416, 3288 and 3327.
  - Every reference to a deleted identifier is renamed to a surviving
    generator where one fits, or the example goes. Counts today:
    `generateDynamicSEO` 17, `generateServiceSchema` 10, `MAIN_KEYWORDS`
    10, `DEFAULT_SEO` 7, `/nosotros` 7, `BLOG_SCHEMA` 5,
    `generateBlogPostSchema` 5, `COMPANY_INFO.url` 5,
    `LOCAL_BUSINESS_SCHEMA` 2 and `ProfessionalService` 2.
  - Delete the "Future Implementation: Blog" section (lines 3001–3241).
    It documents `BLOG_SCHEMA` and `generateBlogPostSchema`, and the blog
    will come back as a module.
  - Keep the general guidance on LocalBusiness as a concept. The planned
    spec 06 builds on it.

**Unchanged on purpose:**

- `src/layouts/MainLayout.astro` still emits
  `[...schemas, ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]`.
- `src/components/SeoHead.astro`.
- `astro.config.mjs` and `~/scripts/setup-client-project.sh:104`. The
  script already rewrites `site`, which is now the only URL source.
- `agents/coder.md`, `.claude/agents/*`, `.opencode/agent/*` and
  `docs/brief/README.md`. They name `authorBio.ts`, `faqs.ts` and
  `services.ts`, and all three still exist.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- "Add server Actions + an email service": its Update cell gains the
  pointer to the new subsection. The row's trigger does not fire, because
  no Actions are added.
- "Add/rename a config file in `src/config/`": not triggered, because no
  file is added or renamed. The Config section and the Knobs map still
  change, because `COMPANY_INFO.url` and `generateDynamicSEO` go away.
- No row covers changing the SEO generators in `seo.ts`, which are in the
  Invariant column. Nothing forces the skill to follow when a generator
  changes, and this spec has to fix that drift by hand. This spec does not
  add the row (see **Out**).

## Decisions made and discarded

- **Let `astro-seo` derive the canonical and `og:url`.** Pages never pass
  either one. This was verified in a scratch copy (see **Goal**).
  - _Discarded: an explicit `path` parameter._ A mistyped path gives a
    wrong canonical, which is the same kind of bug as `/home/`.
  - _Discarded: patching `pageType` so `'home'` maps to `'/'`._ For every
    other page, `pageType` is still not the real URL.

- **One page helper, `generatePageSEO`, with `title` and `description`
  required in its type.** A page that forgets them fails `astro check`
  (Engram #517 shows that `astro build` would not notice). The agency's
  title and description maps are deleted along with `generateDynamicSEO`.

- **URLs come from `import.meta.env.SITE`, and `COMPANY_INFO.url` is
  deleted.** The provisioning script rewrites `site` but never rewrote
  `COMPANY_INFO.url` (Engram #490), so the two drifted in every clone.
  - _Discarded: passing `Astro.site` into every generator._ It changes
    every signature, and module-level constants like `ORGANIZATION_SCHEMA`
    cannot receive it.
  - _Discarded: exporting a URL helper now._ The planned spec 06 designs
    it, with its lowercase and trailing-slash rules.

- **One visible marker, `[CLIENTE]`, and optional fields that ship
  absent.** A single lint rule catches every unfilled field, the city
  included.
  - _Discarded: realistic placeholders plus a list of strings (the plan's
    version)._ Bogotá, 110111, the coordinates and "Cundinamarca" are
    valid values for a real client, so no lint rule can flag them, and
    they ship if nobody touches them.
  - _Follows from this choice:_ `geo`, `founders` and `foundingDate` stay
    in the type as the place where ingest stores that data, even though
    nothing emits them in this spec. The planned spec 06 decides whether
    to emit them.
  - _Follows from this choice:_ `address.country` (the country name) is
    replaced by `countryCode`, used as `addressCountry`. Google's
    Organization structured-data docs ask for "the two-letter ISO 3166-1
    alpha-2 country code" (page updated 2026-09-08, fetched 2026-09-25).
    The same page says Organization has no required properties.

- **A neutral `Organization` instead of `ProfessionalService`.**
  `ProfessionalService` is deprecated on schema.org (Engram #490).
  `priceRange`, `geo`, `areaServed`, `knowsAbout` (full of keywords),
  `hasOfferCatalog` (URLs that return 404), `founders`, `alternateName`,
  `slogan` and `serviceType` all go. The LocalBusiness subtype goes to the
  planned spec 06.
  - _Discarded: only stripping Shine's data._ The home would keep
    emitting `Service` nodes with URLs that return 404 until the planned
    spec 06.
  - _Follows from this choice:_ `WEBSITE_SCHEMA` is trimmed the same way.
    Its `copyrightHolder` was one of the 4 separate Organization nodes the
    audit counted (Engram #490), and its `alternateName` is the agency's
    tagline.

- **The data files become empty arrays.** An empty array publishes nothing
  false, and nothing consumes these arrays today.
  - _Discarded: one item with a marker._ It would end up in `llms.txt`
    (the planned spec 07) and in any section that reads the array.
  - _Discarded: only removing the email (the plan's version)._ That keeps
    Shine's prices.

- **`authorBio.ts` is emptied and pruned, not deleted.** Keeping the file
  means AGENTS.md's Config section, the Knobs map, `agents/coder.md` (which
  would need regenerating) and `docs/brief/README.md` all stay accurate.
  `generatePersonSchema` stays, because the planned spec 06 decides the
  Person question (P3).
  - _Discarded: deleting the file._ It touches four more files, and the
    planned specs 06 and 09 would bring it back.
  - _Discarded: emptying only the data._ `generateAuthorSchema` would keep
    building author URLs under `/nosotros`, which does not exist.

- **`extend.meta` keeps only `author`.**
  - `robots` is a duplicate (see **Goal**).
  - `theme-color` and `msapplication-TileColor` hardcode Shine's yellow in
    a `.ts` file, which breaks the rule that colors live only in
    `global.css`.
  - Google ignores `geo.region` and `geo.placename`, and today they say
    Bogotá.
  - `Content-Language` only repeats `<html lang>`.
  - _Discarded: removing only `robots` (the plan's version)._

- **`MAIN_KEYWORDS`, `DEFAULT_SEO` and the X handle are deleted.**
  `MAIN_KEYWORDS` has no consumer left after the pruning. `DEFAULT_SEO`
  has none today, because `MainLayout` requires `seoProps`. Without
  `twitter:site`, X falls back to the Open Graph data.
  - _Discarded: an `x` knob in `socialMedia`._ Nothing asks for it yet.

- **WhatsApp gets its own field.** `sameAs` should list profiles only, and
  today it includes the `api.whatsapp.com/send?…` contact link.
  - _Discarded: filtering it out of `sameAs` by key._ The data model would
    still mix profiles and contact links.

- **The email lint excludes `src/config/seo.ts`.** That file holds the
  `COMPANY_INFO.email` knob.
  - _Discarded: no exceptions._ The client's real email would trip the
    lint in every clone forever, and a warning that never goes away gets
    ignored.

- **The lint's regression list = the plan's list plus the literal values
  this spec removes** (`Tu Agencia`, `Carlos Rodríguez`, `573000000000`).
  `shine_?agencia` covers both the X handle and the email domain. The full
  Shine email is not written into the lint script, this spec or the probe,
  because the repo is public.

- **The contact-form rules get their own subsection.** Eight rules in one
  markdown table cell are hard to read and to cite. Where the rules come
  from is recorded in Engram #508 (both reference forms put unescaped
  input into the email HTML) and #509 (no contact module). Rule 7 is the
  lesson from a legacy client's form that showed success when sending
  failed. `AGENTS.md` names no client, to follow the contamination rule.

- **The skill gets surgical edits in this spec.** Its wrong rules and
  contaminated examples are fixed here, and it stops naming deleted
  generators. Documenting the new API waits for the planned spec 06,
  which is what changes the API.
  - _Discarded: a full rewrite now._ The API parts would be rewritten
    twice.
  - _Discarded: a separate spec after 06._ Until then, the skill would
    name generators that no longer exist, which breaks the rule that the
    contract is updated in the same change.

- **"Validate with the Rich Results Test" (plan) means the skill instructs
  it.** This spec's own checks run locally against `dist/`.
  - _Discarded: a manual Rich Results Test run on the scaffold._ With
    `example.com` and the `[CLIENTE]` markers, it says nothing useful.

- **"FAQ con página propia" in the plan means `generateFAQSchemaWithPage`.**
  `generateFAQSchema` stays, because decision 4 needs a generator for the
  visible FAQ component.

- **One spec, not split.** Engram #509 withdrew the split proposed in #507.
  The skill question was the only size concern, and it is settled above.

- **Removing `minimumReleaseAgeExclude` came from spec 03** (Engram #523).
  It can only be verified at or after 2026-09-25T20:34:22Z, when
  `prettier-plugin-astro@1.1.0` is older than pnpm's default 1-day
  `minimumReleaseAge`.

## Acceptance criteria

- [x] Run at or after 2026-09-25T20:34:22Z:
      `grep -c minimumReleaseAge pnpm-workspace.yaml` prints `0`,
      `pnpm install` exits 0, and `git diff dev -- pnpm-workspace.yaml`
      shows only removed lines.
- [x] This prints `0`:
      `grep -cE "generateDynamicSEO|generateServiceSEO|generateServiceSchema|LOCAL_BUSINESS_SCHEMA|HowTo|SearchAction|generateReviewsSchema|generateGoogleReviewsSchema|BLOG_SCHEMA|generateBlogPostSchema|generateAuthorSchema|generateAllAuthorsSchemas|generateFAQSchemaWithPage|MAIN_KEYWORDS|DEFAULT_SEO|ALL_BASE_SCHEMAS|ProfessionalService|OfferCatalog|COMPANY_INFO\.url|nosotros|canonical|theme-color|msapplication|Content-Language|geo\.(region|placename)|'robots'|creator" src/config/seo.ts`
- [x] This prints `7`:
      `grep -cE '^export (const|function) (COMPANY_INFO|generatePageSEO|ORGANIZATION_SCHEMA|WEBSITE_SCHEMA|generateFAQSchema|generateBreadcrumbSchema|generatePersonSchema)\b' src/config/seo.ts`
- [x] `grep -c 'import.meta.env.SITE' src/config/seo.ts` prints at least
      `1`, and
      `sed -n '/^export interface CompanyInfo/,/^}/p' src/config/seo.ts | grep -cE '^\s+(url|country):'`
      prints `0`.
- [x] `generatePageSEO`'s options type declares `title: string` and
      `description: string`, with no `?`.
- [x] The `COMPANY_INFO` value has exactly 8 `[CLIENTE]` markers:
      `sed -n '/^export const COMPANY_INFO/,/^};/p' src/config/seo.ts | grep -c '\[CLIENTE\]'`
      prints `8`. On the same range,
      `grep -cE '^\s+(street|postalCode|geo|foundingDate|founders):'`
      prints `0`, and `socialMedia` is `{}`.
- [x] `grep -c 'COMPANY_INFO.whatsapp' src/components/ui/WhatsApp.astro`
      prints `1`, and `grep -c socialMedia src/components/ui/WhatsApp.astro`
      prints `0`.
- [x] `grep -c 'export const faqs: FAQItem\[\] = \[\];' src/config/faqs.ts`,
      `grep -c 'export const services: Service\[\] = \[\];' src/config/services.ts`
      and `grep -c 'export const AUTHORS: Author\[\] = \[\];' src/config/authorBio.ts`
      each print `1`. This prints `0`:
      `grep -rE 'DEFAULT_AUTHOR|getAuthorByName|allFAQs|generalFAQs|pricingFAQs|getFAQsByCategory' src | wc -l`
- [x] After `pnpm build`, the head of `dist/index.html` passes all of
      these:
  - `grep -o '<link rel="canonical"[^>]*>' dist/index.html` prints exactly
    one line: `<link rel="canonical" href="https://example.com/">`.
  - `og:url` is `https://example.com/`.
  - `grep -o '<meta name="robots"' dist/index.html | wc -l` prints `1`.
  - `grep -cE 'theme-color|msapplication|geo\.region|geo\.placename|Content-Language|twitter:site|twitter:creator' dist/index.html`
    prints `0`.
  - There is exactly one `<title>` and one `<meta name="description">`,
    and neither is empty.
- [x] This command, run after `pnpm build`, prints exactly
      `{"blocks":2,"top":["Organization","WebSite"],"nested":["PostalAddress"],"foreign":0}`.
      Run against today's `dev` it prints `ProfessionalService`, 11
      nested types and `"foreign":17`.

      ```bash
      node -e '
      const h=require("fs").readFileSync("dist/index.html","utf8");
      const blocks=[...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
      const top=blocks.map(b=>b["@type"]).sort();
      const nested=new Set();const walk=(o,d)=>{if(o&&typeof o==="object"){if(d>0&&o["@type"])nested.add(o["@type"]);for(const v of Object.values(o))walk(v,d+1);}};
      blocks.forEach(b=>walk(b,0));
      const urls=(JSON.stringify(blocks).match(/https?:\/\/[^"]+/g)||[]).filter(u=>u!=="https://schema.org");
      console.log(JSON.stringify({blocks:blocks.length,top,nested:[...nested].sort(),foreign:[...new Set(urls.filter(u=>!u.startsWith("https://example.com/")))].length}));'
      ```

- [x] This prints `0`:
      `grep -cE '"(alternateName|slogan|priceRange|geo|founders|serviceType|areaServed|knowsAbout|hasOfferCatalog|potentialAction|copyrightHolder|mainEntity|sameAs)"' dist/index.html`
- [x] `bash harness/lint-customization.sh` exits 0 and reports exactly 5
      marker groups: `example.com`, `Nueva web app`, `My Website|My Site`,
      `Footer stub` and `[CLIENTE]`. The contamination group and the email
      check report nothing. `bash harness/lint-customization.sh --strict`
      exits 1.
- [x] **Lint probes.** Undo each probe afterwards;
      `git status --short src` must be empty when done.
  - A temporary `src/lint-probe.ts` containing
    `// probe@example.org Calle Principal` makes the lint report both the
    contamination group and the email check, and both name
    `src/lint-probe.ts`.
  - Temporarily setting `COMPANY_INFO.email` to `hola@cliente.co` does not
    make the email check report anything.
- [x] `grep -cE 'contentBlogs|local markdown|generateDynamicSEO|COMPANY_INFO\.url' AGENTS.md`
      prints `0`, and `grep -c 'generatePageSEO' AGENTS.md` prints at
      least `1`.
- [x] The `AGENTS.md` Knobs map has the "Site URL" row quoted under
      **Files affected**, and the "Company data" row does not list `url`.
- [x] `AGENTS.md` has a `### Contact forms (manual, per client)`
      subsection with exactly the 8 numbered rules listed under **Files
      affected**. The "Add server Actions + an email service" row points
      to it. No client name appears in the subsection.
- [x] `grep -c 'COMPANY_INFO' CHECKPOINTS.md` prints `0`.
- [x] For each file, `SKILL.md` and `seo-guide-line.md`, this prints `0`:
      `grep -cE 'generateDynamicSEO|generateServiceSEO|generateServiceSchema|LOCAL_BUSINESS_SCHEMA|generateReviewsSchema|BLOG_SCHEMA|generateBlogPostSchema|generateAuthorSchema|generateFAQSchemaWithPage|MAIN_KEYWORDS|DEFAULT_SEO|COMPANY_INFO\.url|/nosotros|ProfessionalService|seoConf|LegalService|Tu Agencia|tuagencia|[Bb]lasting|demolition|SGE|[Ff]eatured [Ss]nippet|SparkToro|Gartner|[Mm]andatory [Ss]chema|Schema Markup is Mandatory'`
- [x] No example in either skill file emits `HowTo` or `SearchAction`:
      `grep -cE "potentialAction|'@type': *'HowTo|\"@type\": *\"HowTo"`
      prints `0` for each file.
- [x] `grep -c '^## Future Implementation: Blog' .claude/skills/seo-guide-lines/seo-guide-line.md`
      prints `0`.
- [x] `SKILL.md` mentions "Rich Results Test" and "Schema Markup Validator"
      at least once each. Its FAQ task says the questions come from
      `faqs.ts` or the brief and must not be invented. This one is checked
      by reading.
- [x] `pnpm verify` exits 0 on the spec branch.
- [x] `git diff dev --name-only` lists only these files:
  - `pnpm-workspace.yaml`
  - `pnpm-lock.yaml` (optional)
  - `src/config/seo.ts`
  - `src/config/faqs.ts`
  - `src/config/services.ts`
  - `src/config/authorBio.ts`
  - `src/pages/index.astro`
  - `src/components/ui/WhatsApp.astro`
  - `harness/lint-customization.sh`
  - `AGENTS.md`
  - `CHECKPOINTS.md`
  - `.claude/skills/seo-guide-lines/SKILL.md`
  - `.claude/skills/seo-guide-lines/seo-guide-line.md`
  - this spec

## Implementation plan

1. Create `feature/04-scaffold-seo-cleanup` from `dev`. `/spec-impl` does
   this per `specs/.spec-config.yml`. Confirm that `git status` is clean.
2. At or after 2026-09-25T20:34:22Z, delete the `minimumReleaseAgeExclude`
   block from `pnpm-workspace.yaml`. Run `pnpm install` and confirm it
   exits 0.
3. In `src/config/seo.ts`:
   - add `const SITE = import.meta.env.SITE`;
   - rewrite `generatePageSEO` as described under **Files affected**;
   - switch `src/pages/index.astro` to it;
   - delete `generateDynamicSEO` (its maps and `DynamicSEOOptions` too),
     `generateServiceSEO` and `DEFAULT_SEO`.

   Run `pnpm build`. The canonical is now `https://example.com/`, and
   there is one robots tag.

4. In `seo.ts`, delete:
   - `generateServiceSchema`, `BLOG_SCHEMA`, `generateBlogPostSchema` and
     `BlogPost`;
   - `LOCAL_BUSINESS_SCHEMA` and `generateFAQSchemaWithPage`;
   - the HowTo generators and their types;
   - `generateAuthorSchema` and `generateAllAuthorsSchemas`;
   - both review generators and `ALL_BASE_SCHEMAS`;
   - the `AUTHORS`, `getAuthorByName` and `Author` imports.

   In `generateBreadcrumbSchema` and `generatePersonSchema`, build URLs
   from `SITE`. Run `pnpm build`.

5. In `seo.ts`:
   - give `CompanyInfo` and `COMPANY_INFO` their new shape, with the
     markers;
   - make `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA` neutral;
   - delete `MAIN_KEYWORDS` and the `services` / `Service` imports.

   Also change `src/components/ui/WhatsApp.astro:7`. Run `pnpm build` and
   the JSON-LD command from **Acceptance criteria**.

6. Empty and prune `src/config/faqs.ts`, `services.ts` and `authorBio.ts`.
7. Add the three checks to `harness/lint-customization.sh`. Run the lint,
   then both probes, and undo the probes.
8. Apply the `AGENTS.md` edits and the `CHECKPOINTS.md` §1 edit listed
   under **Files affected**.
9. Apply the surgical edits to `SKILL.md`, then to `seo-guide-line.md`.
   Run the skill `grep` checks from **Acceptance criteria**.
10. Run `pnpm verify` and confirm it exits 0.
