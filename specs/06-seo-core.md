# 06 — seo-core

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

**Amendment 1 (2026-09-26, during implementation, after step 2):** media URLs
may be absolute (`mediaUrl()`), and `siteUrl()` percent-decodes before its
uppercase test. **Status:** Approved <!-- only a human may change this to Approved; step 4 needs it -->

## Goal

Build the SEO core that every clone ships and that the planned specs 07
(`llms.txt`) and 09 (blog module) build on. It has six parts:

- two URL helpers: `siteUrl()` for this site, and `mediaUrl()` for media
  that may live on a CDN;
- client data kept apart from the generators;
- a business axis: a remote `Organization`, or a `LocalBusiness` subtype
  with a real address;
- the business node and the `WebSite` on the home page only;
- no JSON-LD on noindex pages or the 404;
- one locale knob.

Spec 04 removed what was wrong and left this design to spec 06 (its
**Out**).

What today's build shows (`pnpm build` on `dev` at `d13fa7c`, 2026-09-26):

- `MainLayout.astro:22` appends `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA`
  to every page. The scaffold has only a home page, so nothing shows this
  yet. The first inner page or noindex page will carry both.
- `dist/index.html` has no `<head>` element. `<meta charset>` starts at
  byte 2246, after the title, the meta tags and both JSON-LD blocks. The
  HTML standard wants the encoding declared within the first 1024 bytes.
- `SeoHead.astro:31` writes `set:html={JSON.stringify(schema)}`. A data
  string that contains `</script>` closes the script element early (Engram
  #487).
- The language is hardcoded in three places:
  - `seo.ts:82`: `og:locale` `es_CO`;
  - `seo.ts:134`: `inLanguage` `es-CO`;
  - `MainLayout.astro:26`: `<html lang="es-CO">`.
- `src/pages/404.astro` is 0 bytes, so `dist/404.html` is empty, and
  check-seo reports `404-empty`.
- `seo.ts` holds both the client data (`COMPANY_INFO`) and the generators.
- There are two person models for the same thing: `ProfessionalPerson`
  (`seo.ts:172`) and `Author` (`authorBio.ts`). `generatePersonSchema`
  derives the Person `@id` from the name, accents included (Engram #487).

## Scope

**In:**

- `src/config/companyInfo.ts` (new, data only):
  - `COMPANY_INFO`, with a `business` axis;
  - `LOCALE`;
  - the `LocalBusinessType` union.
- `src/config/seo.ts`: generators only.
  - The two schema constants become functions.
  - New functions: `generateNotFoundSEO`, `generateBusinessRef` and
    `generateHomeSchemas`.
- `src/config/authorBio.ts`: one person model, with a stable `slug`.
- `src/utils/url.ts` (new): `siteUrl()` and `mediaUrl()`.
- `src/components/JsonLd.astro` (new). `SeoHead.astro` uses it.
- `src/layouts/MainLayout.astro`:
  - a real `<head>`;
  - `lang` from `LOCALE`;
  - the home schemas on `/` only;
  - no JSON-LD on noindex pages.
- `src/pages/404.astro`: the layout plus generic copy.
- `src/components/ui/WhatsApp.astro`: its import path.
- `astro.config.mjs`: `trailingSlash: 'always'`.
- `harness/check-seo.mjs`: two new error rules, `local-address` and
  `url-lowercase`.
- `harness/lint-customization.sh`:
  - the email-check exclusion follows `COMPANY_INFO` to its new file;
  - the dead `lang="en"` marker goes.
- `AGENTS.md`:
  - the Routing, Components, Config and Layout sections;
  - the Invariant vs Variable table and the Knobs map;
  - Conventions;
  - a new "If you change X → update Y" row for the generators.
- `agents/coder.md` and its two generated copies: the list of client-data
  files.
- `.claude/skills/seo-guide-lines/SKILL.md`: documents the core API.
- `.claude/skills/seo-guide-lines/seo-guide-line.md`: surgical edits only,
  so it names nothing that this spec removes or renames.

**Out:**

- **Removing `@astrojs/netlify`** (question P4) gets its own planned spec.
  - Today the adapter builds an SSR function on `/*` (Engram #545).
  - It stays in this spec.
- **The full rewrite of `seo-guide-line.md`** gets its own planned spec,
  after the planned spec 09. Specs 07 to 09 also add API, so a rewrite now
  would have to be redone (Engram #545).
- **`llms.txt`** belongs to the planned spec 07. It will build its URLs with
  `siteUrl()`.
- **The blog module** belongs to the planned spec 09, and **services pages
  and contact forms** are per-client work. `generateBusinessRef()` ships in
  this spec, and the planned spec 09 is its first real consumer.
- **A CMS integration:** fetching posts, the rebuild webhook, and
  `image.remotePatterns` so that `<Image>` can optimize remote images. It
  belongs to the planned spec 09 or to its own module spec. This spec only
  lets a media field hold an absolute `https://` URL, through `mediaUrl()`.
  A `VideoObject` generator is out as well; when one comes, it uses
  `mediaUrl()`.
- **A FAQ component.** Its design is per client. The core ships
  `generateFAQSchema()` and `JsonLd.astro`.
- **i18n:** hreflang, per-locale routes and Astro's `i18n` config. The
  migration of the project that needs it does that. This spec only removes
  the hardcoded language, so that nothing blocks it.
- **Deriving the 404 copy from `LOCALE`.** The copy is Spanish text.
- **`openingHoursSpecification` and `areaServed`.** They are added when a
  client needs them and shows them on the page.
- **Lowercasing URLs.** Neither `siteUrl()` nor the sitemap lowercases
  anything (see **Decisions made and discarded**).
- **Running the new rules on live sites** is plan step 9. **Legacy
  migrations** are separate specs, one per project.
- **Assets in `public/`.** They stay warnings, as spec 05 decided.
- **The Hero, NavBar and Footer placeholders,** and the hardcoded colors in
  `ui/WhatsApp.astro`.
- **`~/scripts/install-harness.sh`.** It already copies `check-seo.mjs`.
  A legacy project that already has a copy keeps the old one until it is
  copied again with `--force`.

## Files affected

- **`src/config/companyInfo.ts`** (new). It has no imports: data and the
  types that shape it.

  ```ts
  export const LOCALE = "es-CO"; // BCP 47

  export type LocalBusinessType = "LocalBusiness" | "LegalService";

  export type Business =
    | {
        kind: "remote";
        address?: { city: string; region: string; countryCode: string };
      }
    | {
        kind: "local";
        type: LocalBusinessType;
        address: {
          street: string;
          city: string;
          region: string;
          postalCode?: string;
          countryCode: string; // ISO 3166-1 alpha-2
        };
        geo?: { latitude: number; longitude: number };
      };
  ```

  - **`LOCALE`** has a comment: `<html lang>`, `og:locale` and
    `WebSite.inLanguage` derive from it.
  - **`LocalBusinessType`** has a comment:
    - add a subtype when a client's brief needs one;
    - add it to `LOCAL_BUSINESS_TYPES` in `harness/check-seo.mjs` as well,
      or `local-address` will not check it.
  - **`Business`:**
    - `remote` means the client receives no visitors at an address. That
      kind cannot hold a street, a postal code or `geo`.
    - `local` means a real address that the site shows.
  - **`CompanyInfo`** is the spec 04 interface with these changes:
    - `address` and `geo` move into `business: Business`;
    - `founders?: string[]` now holds `Author` slugs from `authorBio.ts`,
      not names.
  - **The `COMPANY_INFO` value** is today's value with its `address` moved
    into `business: { kind: 'remote', address: { … } }`. It still has
    exactly 8 `[CLIENTE]` markers. `founders` and `foundingDate` stay
    absent.

- **`src/utils/url.ts`** (new)
  - It is the only file in `src/` that reads `import.meta.env.SITE`.
  - It exports `siteUrl(path: string): string`:
    - `path` must start with `/`, or it throws;
    - `path` must not start with `//`, or it throws: `new URL` would read
      it as another host (Amendment 1);
    - the `?query` and `#fragment` are kept as they are;
    - a **page** path, whose last segment has no extension (the same rule
      as `check-seo`), throws if its percent-decoded pathname contains an
      uppercase letter (Unicode category `Lu`), and gets a trailing `/` if
      it has none. `%C3%A9` does not count; a malformed `%` escape throws
      too, and the message names the path (Amendment 1);
    - an **asset** path, which has an extension, is left as it is;
    - the result is `new URL(path, SITE).href`.
  - It exports `mediaUrl(src: string): string` (Amendment 1), for a field
    that holds an image or a video, which may live on a CDN:
    - an absolute `https:` URL is returned as `new URL(src).href`, with no
      other change;
    - a protocol-relative `src`, which starts with `//`, is returned as
      `new URL('https:' + src).href`. Some CMSs return asset URLs in that
      form; Contentful does;
    - any other `src` that starts with `/` is returned as `siteUrl(src)`;
    - anything else throws, `http:` included (mixed content), and the
      message names the value.
    - **Who uses it:** only the media fields: `generatePageSEO`'s `image`,
      `COMPANY_INFO.logo` and `COMPANY_INFO.image`, and `Author.image`. Page
      URLs, `@id`s and breadcrumb items always use `siteUrl()`.
  - Examples with `site: 'https://example.com'`:

    | Call                                         | Result                                    |
    | -------------------------------------------- | ----------------------------------------- |
    | `siteUrl('/')`                               | `https://example.com/`                    |
    | `siteUrl('/servicios')`                      | `https://example.com/servicios/`          |
    | `siteUrl('/#organization')`                  | `https://example.com/#organization`       |
    | `siteUrl('/images/logo.svg')`                | `https://example.com/images/logo.svg`     |
    | `siteUrl('/Servicios/')`                     | throws, and the message names the path    |
    | `siteUrl('/caf%C3%A9/')`                     | `https://example.com/caf%C3%A9/`          |
    | `siteUrl('//cdn.example.net/x')`             | throws, and the message names the path    |
    | `siteUrl('https://cdn.example.net/og.jpg')`  | throws, and the message names the path    |
    | `mediaUrl('/images/og-image.png')`           | `https://example.com/images/og-image.png` |
    | `mediaUrl('https://cdn.example.net/og.jpg')` | `https://cdn.example.net/og.jpg`          |
    | `mediaUrl('//cdn.example.net/og.jpg')`       | `https://cdn.example.net/og.jpg`          |
    | `mediaUrl('http://cdn.example.net/og.jpg')`  | throws, and the message names the value   |

- **`src/config/seo.ts`**: generators only.
  - **Imports:**
    - `COMPANY_INFO`, `LOCALE` and the types from `./companyInfo`;
    - `AUTHORS` and `Author` from `./authorBio`;
    - `siteUrl` and `mediaUrl` from `@/utils/url`;
    - `FAQItem` from `./faqs`;
    - `SEOProps` from `astro-seo`.
  - **Deleted:**
    - the module `SITE` constant;
    - `CompanyInfo` and `COMPANY_INFO`, which move to `companyInfo.ts`;
    - `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA`;
    - `ProfessionalPerson`.
  - **Exports:** `JSONLDSchema`, `BreadcrumbItem`, and the 9 functions
    below. There is no `export const`.
  - **`generatePageSEO(options: { title; description; image?; noindex?; locale? })`**
    - Same output as today, except for two things:
      - `og:locale` is the locale with `-` replaced by `_` (default:
        `LOCALE`);
      - the image URL comes from `mediaUrl()`, so it may be a CDN URL
        (Amendment 1).
  - **`generateNotFoundSEO(options: { title: string })`**
    - returns `title` as `` `${options.title} | ${COMPANY_INFO.name}` ``,
      with `canonical: null` and `noindex: true`;
    - sets no description, no Open Graph and no Twitter.
    - `astro-seo` types `canonical` as `URL | string | null` and emits no
      canonical tag for `null` (`SEO.astro:28` and `156`).
  - **`generateBusinessSchema()`**
    - **`@type`:** `Organization` when `business.kind` is `remote`, and
      `business.type` when it is `local`.
    - **`@id`:** `siteUrl('/#organization')`, for both kinds.
    - **Always:** `name`, `description`, `url` (`siteUrl('/')`), `logo`,
      `image`, `telephone` and `email`. `logo` and `image` come from
      `mediaUrl()` (Amendment 1).
    - **`sameAs`:** only when `socialMedia` has entries.
    - **`address`** (`PostalAddress`):
      - `remote`: only when present, with `addressLocality`,
        `addressRegion` and `addressCountry`;
      - `local`: always, with those three plus `streetAddress`, and
        `postalCode` when present.
    - **`geo`** (`GeoCoordinates`): `local` only, and only when present.
    - **`foundingDate`:** when present.
    - **`founder`:** one reference node `{ '@id': <Person @id> }` per slug
      in `founders`, only when the list is not empty.
  - **`generateBusinessRef()`**
    - returns `{ '@type': 'Organization', '@id', name, url }`;
    - the `@id` is the same one `generateBusinessSchema()` uses;
    - it is nested inside another node on an inner page (for example
      `provider` or `publisher`), not used as its own block, so it has no
      `@context`.
  - **`generateWebSiteSchema(locale = LOCALE)`**
    - Today's `WEBSITE_SCHEMA` fields, with `inLanguage: locale`.
    - `publisher` is a reference node to the business `@id`.
  - **`generatePersonSchema(author: Author)`**
    - `@type: 'Person'`, with the `@id` `siteUrl('/#person-' + author.slug)`;
    - `name`, `jobTitle` (from `role`) and `description` (from `bio`);
    - `image` through `mediaUrl()` and `url` through `siteUrl()`, when
      present (Amendment 1);
    - `sameAs` when `socialMedia` has entries;
    - `worksFor`: a reference node to the business `@id`;
    - nothing else: no address, no `hasOccupation` and no `knowsAbout`.
  - **`generateHomeSchemas(locale = LOCALE)`**
    - returns `generateBusinessSchema()` and
      `generateWebSiteSchema(locale)`, plus one `generatePersonSchema()`
      per founder;
    - throws if a founder slug has no `Author` in `AUTHORS`, and the error
      names the slug.
  - **`generateFAQSchema(faqs)`:** unchanged.
  - **`generateBreadcrumbSchema(items)`:** `item` becomes
    `siteUrl(crumb.path)`.
  - Every top-level schema carries `@context`.
- **`src/config/authorBio.ts`**

  ```ts
  export interface Author {
    slug: string; // ASCII kebab-case, unique, stable
    name: string;
    role: string;
    bio: string;
    image?: string;
    credentials: string[];
    socialMedia?: Record<string, string>; // profile URLs only → sameAs
    url?: string;
  }

  export const AUTHORS: Author[] = [];
  ```

  - `slug` has a comment: the Person `@id` is `<site>/#person-<slug>`.
  - `credentials` has a comment: shown on the page for E-E-A-T, and not
    emitted in the JSON-LD.
  - `url` has a comment: the author's page on this site.
  - `image` has a comment: a path on this site or an `https://` URL
    (Amendment 1). `CompanyInfo`'s `logo` and `image` get the same comment.

- **`src/components/JsonLd.astro`** (new)
  - Its props are `{ schema: JSONLDSchema }`.
  - It renders `<script type="application/ld+json" set:html={json} />`,
    where `json` is `JSON.stringify(schema)` with every `<` replaced by
    `\u003c`.
  - It is the only file in `src/` that serializes JSON-LD.
  - **Who uses it:**
    - `SeoHead`, for the layout's schemas;
    - a section component, for its own schema, placed next to the content
      that schema describes.
- **`src/components/SeoHead.astro`**
  - It renders one `<JsonLd schema={…} />` per schema.
  - The usage example in its header comment (line 9) stops naming
    `ORGANIZATION_SCHEMA`.
- **`src/layouts/MainLayout.astro`**
  - `<html lang={LOCALE}>`.
  - A `<head>` holds, in this order:
    1. `<meta charset="UTF-8" />`;
    2. the viewport meta;
    3. `SeoHead`;
    4. the favicons, the fonts, the sitemap link and the Lenis script.
  - **Schemas:**
    - When `seoProps.noindex` is true, it emits none.
    - Otherwise it emits the page's `schemas`, plus
      `generateHomeSchemas()` when `Astro.url.pathname === '/'`.
  - Its props do not change (`seoProps`, `schemas?`).
- **`src/pages/404.astro`**
  - `MainLayout`, with `seoProps={generateNotFoundSEO({ title: 'Página no encontrada' })}`.
  - One section holds:
    - `<h1>Página no encontrada</h1>`;
    - `<p>La página que buscas no existe o cambió de dirección.</p>`;
    - a link to `/` that reads "Volver al inicio".
  - It is styled with `global.css` tokens only: no hardcoded colors and no
    arbitrary values (AGENTS.md § Conventions).
- **`src/components/ui/WhatsApp.astro:2`:** imports `COMPANY_INFO` from
  `@/config/companyInfo`.
- **`astro.config.mjs`:** `trailingSlash: 'always'`. The Astro docs say an
  endpoint with an extension, such as `/robots.txt`, only answers without a
  trailing slash, whatever `trailingSlash` says (Endpoints guide, checked
  2026-09-26).
- **`harness/check-seo.mjs`**
  - It gets two rules, 17 in total. The header comment lists both and its
    count becomes `Rules (17)`.

    | Id              | Severity | What must hold                                                                                                                                                                                                                                                                                                                                                                                                                                 |
    | --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `local-address` | error    | Every node whose `@type` includes one of `LOCAL_BUSINESS_TYPES` has an `address` object with non-empty string `streetAddress`, `addressLocality` and `addressCountry`.                                                                                                                                                                                                                                                                         |
    | `url-lowercase` | error    | These pathnames have no uppercase letter: each page's own URL; every same-site page URL in the page's HTML and JSON-LD, which is the set `url-resolves` looks at; and every page `<loc>` in the sitemaps. The pathname is percent-decoded first, so `%C3%A9` does not count, and the query and fragment are ignored. Each distinct URL is reported once per page, and a `<loc>` is reported under its sitemap, the same way as `url-resolves`. |

  - `LOCAL_BUSINESS_TYPES` is a constant in the script: `LocalBusiness`,
    `LegalService`, `Attorney` and `ProfessionalService`. It covers the
    core's union plus the LocalBusiness subtypes found in client code
    (Engram #547). A type missing from the list gives a false negative,
    never a false positive.
  - `url-lowercase` and `siteUrl()` test the same way: percent-decode the
    pathname, then look for an uppercase letter (Unicode category `Lu`), so
    `É` counts on both sides (Amendment 1).
- **`harness/lint-customization.sh`**
  - Line 50: delete the `lang="en"` marker. `<html lang>` now comes from
    `LOCALE`, so the pattern can never match.
  - Line 57: the email check excludes `src/config/companyInfo.ts`, and its
    message points there.
- **`AGENTS.md`** (line numbers at `d13fa7c`)
  - **Routing (lines 71–75):** route files in `src/pages/` are lowercase,
    kebab-case Spanish slugs.
    - `siteUrl()` refuses an uppercase page path.
    - `check-seo` fails an uppercase page URL (`url-lowercase`).
  - **Components (line 83):** a new bullet after `SeoHead.astro`:
    `JsonLd.astro` serializes and escapes one JSON-LD block, and a section
    component uses it for its own schema.
  - **Config (lines 90–92):** the `seo.ts` bullet becomes two:
    - `companyInfo.ts` holds `COMPANY_INFO` (company data and the
      `business` axis, `remote` or `local`) and `LOCALE`. It is data only.
    - `seo.ts` holds generators only: `generatePageSEO()`,
      `generateNotFoundSEO()` and the JSON-LD generators. Absolute URLs come
      from `siteUrl()` in `src/utils/url.ts`, which reads `site`. Never
      hardcode the domain. A media field (an image or a video) may hold an
      `https://` URL on a CDN, through `mediaUrl()` (Amendment 1).
  - **Config (line 95):** `authorBio.ts` holds people, authors and
    founders, for E-E-A-T. It has one `Author` model, and each author's
    `slug` gives the Person `@id`.
  - **Layout (lines 99–100):** "The `<html lang>` default is `es-CO`"
    becomes three statements:
    - `<html lang>` comes from `LOCALE`;
    - the layout emits the home schemas (the business, the `WebSite` and
      the founders) on `/` only;
    - it emits no JSON-LD at all when `seoProps.noindex` is true.
  - **Invariant vs Variable (line 118):**
    - the Invariant "Where" cell gains `src/utils/url.ts` and
      `JsonLd.astro`;
    - in the Variable "Where" cell, "`MainLayout` `lang`" becomes
      "`LOCALE` in `config/companyInfo.ts`".
  - **Knobs map:**
    - **Site URL (line 127):** "`seo.ts` reads it via" becomes
      "`src/utils/url.ts` reads it via".
    - **Company data (line 128):** the label becomes "Company data (name,
      phone, email, WhatsApp, social profiles, business kind and address)",
      and its home becomes `src/config/companyInfo.ts` → `COMPANY_INFO`.
    - **`lang` / locale (line 134):** its home becomes
      `src/config/companyInfo.ts` → `LOCALE`, from which `<html lang>`,
      `og:locale` and `inLanguage` derive.
  - **Conventions:** a new bullet after "Exactly one `<h1>` per page":
    - a section that shows what a schema describes (for example a FAQ)
      emits that schema itself, with `JsonLd.astro`, next to the content;
    - page-level schemas, such as a `BreadcrumbList`, go through
      `MainLayout`'s `schemas`;
    - the business node and the `WebSite` come only from `MainLayout`, on
      `/`.
  - **"If you change X → update Y":** a new row after "Add/rename a config
    file":
    > | Add, remove or rename a generator in `src/config/seo.ts`, a helper in `src/utils/url.ts` or `JsonLd.astro`, or change its signature | `.claude/skills/seo-guide-lines/SKILL.md` § "Core API" · every reference in `seo-guide-line.md` |
- **`agents/coder.md`**
  - Lines 18 and 36: the lists of client-data files lose `seo.ts` and gain
    `companyInfo.ts`.
  - Then `bash harness/bind-runtime.sh opencode` regenerates
    `.opencode/agent/coder.md`.
  - `.claude/agents/coder.md` (lines 19 and 37) gets the same edit by hand.
    Running `bind-runtime.sh claude-code` would revert the hand-edited
    `model:` lines (Engram #531 and #537).
- **`.claude/skills/seo-guide-lines/SKILL.md`**
  - **Lines 32, 96, 102, 268, 284 and 329:** where they point to
    `src/config/seo.ts` for data, they name `companyInfo.ts` for data and
    `seo.ts` for generators.
  - **Line 188:** the import becomes `@/config/companyInfo`.
  - **Line 157 and § "2. Schema Markup Must Describe the Page" (lines
    199–204):** rewritten for the core rules:
    - `MainLayout` emits the business, the `WebSite` and the founders on
      `/` only;
    - an inner page gets its breadcrumb through `schemas`;
    - a section emits its own schema with `JsonLd.astro`;
    - a node on an inner page that refers to the business uses
      `generateBusinessRef()`;
    - noindex pages and the 404 get no JSON-LD;
    - `generatePersonSchema()` takes an `Author`.
  - **Task "Set Up COMPANY_INFO" (lines 282 and on):**
    - `business` is `remote` unless the brief gives a street address where
      the business receives visitors;
    - a `local` business takes a subtype from `LocalBusinessType`, and one
      is added when the brief needs it;
    - `founders` lists only authors the brief names and the home page
      shows;
    - the section also explains `LOCALE`.
  - **A new section, "Core API":** one line for each of these:
    - the data files;
    - `siteUrl()` and `mediaUrl()`, and which fields take which (Amendment
      1);
    - the 9 functions in `seo.ts`;
    - `JsonLd.astro`.
- **`.claude/skills/seo-guide-lines/seo-guide-line.md`** (surgical edits
  only)
  1. **"SEO System Architecture" tree (lines 26–45):** the new files and
     names. `generateSEOWithAlternates()` goes, because it never existed.
  2. **`COMPANY_INFO` imports:** every import of it from `@/config/seo`
     comes from `@/config/companyInfo`.
  3. **`ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA`** (7 occurrences each)
     become "the home schemas that `MainLayout` emits on `/`". The lines
     that say they come on every page are corrected.
  4. **The `generatePersonSchema({ … })` call (line 1167)** takes an
     `Author` from `authorBio.ts`.
  5. **Pattern 5 (lines 1650–1972):**
     - its heading becomes "Pattern 5: Contact Page";
     - the hand-built LocalBusiness JSON-LD, from line 1676, goes; one line
       says that the business node lives on the home page;
     - the visible NAP markup reads `COMPANY_INFO.business.address`
       inside a `business.kind === 'local'` guard;
     - `COMPANY_INFO.address.country` goes. That field no longer exists.
  6. **The hreflang section (lines 2585–2600):** the
     `generateSEOWithAlternates()` example goes, and the prose stays.

  Everything else waits for the planned rewrite spec.

**Unchanged on purpose:**

- `src/pages/index.astro`. The home schemas come from the layout.
- `src/pages/robots.txt.ts`. It builds the sitemap URL from `site` itself.
- `src/config/faqs.ts`, `src/config/services.ts` and
  `docs/brief/README.md`. The README names `COMPANY_INFO`, not its file.
- `package.json` and `pnpm-lock.yaml`. Nothing is added.
- `init.sh` and `CHECKPOINTS.md`. The gate already runs `check-seo`, and
  §5 still describes the strict gate correctly.
- The `front-end-astro` skill. It says nothing about route file names or
  JSON-LD.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- **"Add/rename a config file in `src/config/`":** triggered, because
  `companyInfo.ts` is new. The Config section and the Knobs map change.
- **"Change a workflow skill or agent":** triggered by the `coder.md` edit.
  The sections its Update cell names do not list the config files, so they
  need no edit.
- **"Change folder conventions":** not triggered. No folder is added. The
  lowercase rule for route files goes into the Routing section.
- **"Add a dependency":** not triggered.
- **The new row** covers changing the SEO generators. Spec 04 found that no
  row did, and proposed this one for spec 06 (spec 04, **Out**).

## Decisions made and discarded

The round's reasoning is in Engram #545 (block 1), #546 (blocks 2 and 3)
and #547 (block 4). The user took every recommendation, except that block
4 left out two optional checker rules.

- **Split the plan's spec 06.** As listed in the plan, it covered seven
  areas.
  - **This spec is the core only.** It updates `SKILL.md` and makes
    surgical edits to the guide, so the contract changes in the same change
    as the code.
  - **The full rewrite of `seo-guide-line.md` (2690 lines) goes after the
    planned spec 09.** The planned specs 07 to 09 also add API.
  - **Removing the adapter (P4) gets its own spec.** It is a different
    "If you change X" row, and it can be reverted on its own.
  - _Discarded: everything in one spec._ It would be too large to verify.
  - _Discarded: the rewrite right after this spec._ Specs 07 to 09 would
    make someone rewrite it again.
  - _Discarded: removing the adapter inside this spec._ It adds a
    dependency decision to a spec that is already large.

- **P3: the business is the main entity, and a person is a linked node.**
  Every client site gets an `Organization` or a `LocalBusiness` subtype,
  even when it is named after the person.
  - The Person carries E-E-A-T and connects through `founder` and
    `worksFor`.
  - Of four personal-brand client sites, two have an office and two work
    remotely (Engram #545). All four run a practice with services and a
    phone number.
  - _Discarded: `person` as a third kind of main entity._ It would be more
    accurate for a remote professional with no firm. But it adds a branch
    to the core and the checker, and a Person has no `logo`.
  - _Discarded: deferring P3 to a migration._ Every clone would keep two
    person models.

- **The data lives in `src/config/companyInfo.ts`**, the same file name as
  the legacy reference project's spec 12. Migrations then look the same in
  every project.
  - _Discarded: a `site.ts` manifest._ With add-on modules there are no
    features to switch on, so the name promises more than the file holds.
  - _Discarded: keeping the data in `seo.ts`._ It contradicts the plan.

- **The business axis is a discriminated union.** `remote` cannot hold a
  street, a postal code or `geo`, and `local` requires a street.
  - `astro check` enforces the rule "no physical location, no address"
    for the scaffold.
  - `local-address` enforces the half of that rule that the HTML can show,
    for any site, legacy included: a LocalBusiness has a street. The
    checker cannot tell whether a street is real.
  - **The subtype is a closed union that grows per client.** A typo such
    as `'LegalServices'` fails `astro check`.
  - _Discarded: a free string._ The typo would reach production.

- **The scaffold ships the `remote` profile.** No clone can publish a fake
  LocalBusiness by default. Ingest switches to `local` only when the brief
  has a real address.
  - _Discarded: `local` `LegalService` with markers._ Most clients look
    like that. But a forgotten marker would publish a LocalBusiness whose
    street is `[CLIENTE] calle`, and only `--strict` would catch it.

- **`MainLayout` emits the home schemas when the pathname is `/`.** No page
  can forget or duplicate them. Google needs neither on every page (plan
  notes, 2026-09-24, §1).
  - _Discarded: the home page passes them in `schemas`._ It depends on the
    agent remembering, in every clone.

- **The layout drops every schema on a noindex page.** The 404 goes through
  `generateNotFoundSEO()`, which meets spec 05's 404 rules: a title, no
  canonical, no description and no JSON-LD. `jsonld-noindex` is the second
  net.
  - _Discarded: relying on the checker only._ The error would show in
    `verify` instead of not being possible to write.

- **One person model, in `authorBio.ts`.** `Author` absorbs
  `ProfessionalPerson`.
  - It gains a stable `slug` for the `@id`, which fixes the accented `@id`.
  - It has no address, because the address belongs to the business.
  - `COMPANY_INFO.founders` lists slugs.
  - _Discarded: a `COMPANY_INFO.person` field._ It would make two homes
    for people once the blog brings authors.
  - _Discarded: leaving both models._

- **URLs: `trailingSlash: 'always'` and lowercase route files, with
  nothing lowercased silently.** The `astro-seo` canonical comes from
  `Astro.url`, which is the real file name. If `siteUrl()` lowercased, a
  camelCase file would still get a camelCase canonical, so the mismatch
  would be hidden, not prevented. That is why `siteUrl()` throws and
  `url-lowercase` flags the file.
  - _Discarded: lowercasing in the helper._ The legacy reference project
    needed it (its spec 13) only because its camelCase URLs were already
    published.
  - _Discarded: a trailing slash only._ Netlify answers 301 to a camelCase
    URL (the same spec 13).

- **Amendment 1: media URLs may be absolute; page URLs may not.** Raised
  by the user after step 2. Some clients serve blog covers, images and
  videos from a CMS's CDN; delta-irat uses Content Island (Engram #264).
  With `siteUrl()` alone, `generatePageSEO({ image: post.cover })` would
  fail the build.
  - `mediaUrl()` lets the media fields take an `https://` URL.
  - `siteUrl()` stays strict, because its strictness is what enforces the
    lowercase and trailing-slash rules on this site's URLs.
  - `check-seo` already treats another host as external (`isSameSite`), so
    `url-resolves` and `asset-missing` skip a CDN URL. The checker needs no
    change for it. The cost: the gate does not notice a broken CDN URL.
  - `mediaUrl()` turns a protocol-relative `//host/…` into
    `https://host/…`, chosen by the user. On an `https:` site the browser
    reads it that way already, so the conversion is exact.
    - _Discarded: throwing on `//`, so the caller adds `https:`._ Every
      integration with a CMS that returns that form would trip on it.
  - _Discarded: loosening `siteUrl()` to pass absolute URLs through._ A
    same-site page URL written in full would skip both checks.
  - _Discarded: a separate spec after this one, or the planned spec 09._ A
    CDN image also serves a service page's `og:image` or the logo, so either
    one would reopen the core.
  - The CMS integration itself stays out (**Scope → Out**).

- **Amendment 1: `siteUrl()` percent-decodes before its uppercase test,**
  the same as `url-lowercase`. Step 2 showed that the raw test throws on
  `siteUrl('/caf%C3%A9/')`, because of the hex digits in `%C3`.
  - _Discarded: skipping `%XX` escapes in the test._ `%C3%89` (`É`) would
    pass `siteUrl()` and fail the checker.
  - _Discarded: the raw test._ The two rules would disagree.

- **One `LOCALE` constant.** The generators take a locale parameter that
  defaults to it, so an i18n migration can pass `Astro.currentLocale`
  without rewriting them.
  - _Discarded: Astro's `i18n` config._ It designs for i18n, and the plan
    only asks not to block it.
  - _Discarded: keeping the locale in `MainLayout`._ The generators in
    `.ts` modules could not read it.

- **`JsonLd.astro` is the one place that serializes, and a section emits
  its own schema.** A schema that lives in the same component as the
  content it describes cannot describe hidden content. That is how
  Shine's hidden FAQ happened (spec 05, **Goal**).
  - _Discarded: escaping in `SeoHead` only._ Section schemas would keep
    travelling through the page's `schemas` prop, apart from their content.

- **The 404 has generic Spanish copy and no lint marker.** It is not
  client data, so it is ready for production as it is.
  - _Discarded: a marker that forces per-client copy._ It adds one more
    warning that almost nobody would act on.

- **Two new checker rules: `local-address` and `url-lowercase`.**
  - _Discarded by the user: `home-entity` and `entity-home-only`
    (warnings)._ In the scaffold the layout already guarantees both. They
    would only help diagnose legacy sites.

- **`generateBusinessRef()` ships now.** It sits next to the full
  generator and shares its `@id`, and a probe page exercises it.
  - _Discarded: adding it in the planned spec 09._ That spec would have to
    reopen the core.

- **Probes and the `local` profile run in temp dirs and a temp copy, and
  are not committed.** Everything committed ships to every client clone,
  and spec 05 made the same choice.

- **Proposed in this draft, not asked in the round. Review these:**
  - The names: `siteUrl`, `generateBusinessSchema`, `generateBusinessRef`,
    `generateWebSiteSchema`, `generateHomeSchemas` and
    `generateNotFoundSEO`. `siteUrl()` is one function that tells a page
    from an asset by extension, the same rule `check-seo` uses.
  - The business `@id` stays `#organization` for both kinds, so switching
    kind changes no `@id`.
  - `generateBusinessRef()` always uses the type `Organization`.
    - It is true for every subtype.
    - Without it, `local-address` would fail a stub for a `local` business,
      because a stub has no address.
  - The Person emits only `name`, `jobTitle`, `description`, `image`,
    `url`, `sameAs` and `worksFor`.
    - `credentials` stay text on the page, because Google documents no use
      for them in a Person.
    - `hasOccupation` and `knowsAbout` go. The audit called `knowsAbout`
      keyword filler.
  - A founder slug with no `Author` fails the build.
  - `generateNotFoundSEO()` emits no Open Graph and no Twitter tags.
  - `foundingDate` is emitted when present, and `geo` only for `local`.
  - The lint's `lang="en"` marker is deleted, not retargeted. `es-CO` is a
    valid default, not a placeholder.
  - `LOCAL_BUSINESS_TYPES` in the checker also has `Attorney` and
    `ProfessionalService`, which the core does not accept, so that legacy
    sites get checked.
  - The exact 404 copy under **Files affected**.
  - `url-lowercase` percent-decodes before comparing, so an encoded
    lowercase `é` is not a finding.
  - **Amendment 1, proposed with it and not asked:**
    - the name `mediaUrl`;
    - `mediaUrl()` refuses `http:`, because an `http:` image on an
      `https:` page is mixed content;
    - `siteUrl()` refuses a path that starts with `//` (observed in step
      2), because it is never a page of this site;
    - the media fields are `generatePageSEO`'s `image`, `COMPANY_INFO.logo`
      and `image`, and `Author.image`. `COMPANY_INFO.logo` and `image` also
      feed `generatePageSEO`'s default image.

## Acceptance criteria

The probe set, the temp copy and the throwaway copy are temp dirs outside
the repo, deleted after use. Probes in the working tree are undone:
`git status --short src` must be empty when done.

**Source shape**

- [x] `src/config/companyInfo.ts` imports nothing and exports the five
      names:
  - `grep -c '^import' src/config/companyInfo.ts` prints `0`;
  - `grep -cE '^export (const|type|interface) (LOCALE|LocalBusinessType|Business|CompanyInfo|COMPANY_INFO)\b' src/config/companyInfo.ts`
    prints `5`.
- [x] On the `COMPANY_INFO` value
      (`sed -n '/^export const COMPANY_INFO/,/^};/p' src/config/companyInfo.ts`):
  - `grep -c '\[CLIENTE\]'` prints `8`;
  - `grep -c "kind: 'remote'"` prints `1`;
  - `grep -cE '^\s+(street|geo|founders|foundingDate):'` prints `0`.
- [x] `src/config/seo.ts` holds no data and no constants:
  - `grep -c '^export const' src/config/seo.ts` prints `0`;
  - `grep -cE 'ORGANIZATION_SCHEMA|WEBSITE_SCHEMA|ProfessionalPerson|interface CompanyInfo|import\.meta\.env|new URL\(|es[-_]CO' src/config/seo.ts`
    prints `0`.
- [x] `grep -c '^export function' src/config/seo.ts` prints `9`, and so
      does
      `grep -cE '^export function (generatePageSEO|generateNotFoundSEO|generateBusinessSchema|generateBusinessRef|generateWebSiteSchema|generatePersonSchema|generateHomeSchemas|generateFAQSchema|generateBreadcrumbSchema)\(' src/config/seo.ts`.
- [x] Each of these prints exactly one path:
  - `grep -rl 'import.meta.env.SITE' src` prints `src/utils/url.ts`;
  - `grep -rlE 'es[-_]CO' src` prints `src/config/companyInfo.ts`;
  - `grep -rl 'application/ld+json' src` prints
    `src/components/JsonLd.astro`;
  - `grep -rl 'JSON.stringify' src` prints `src/components/JsonLd.astro`.
- [x] This prints nothing:
      `grep -rnE 'ORGANIZATION_SCHEMA|WEBSITE_SCHEMA|ProfessionalPerson|generateSEOWithAlternates' src AGENTS.md .claude/skills/seo-guide-lines agents .claude/agents .opencode/agent`
- [x] `grep -c "trailingSlash: 'always'" astro.config.mjs` prints `1`.
- [x] `grep -cE '^export function (siteUrl|mediaUrl)\(' src/utils/url.ts`
      prints `2` (Amendment 1).
- [x] `authorBio.ts`:
  - `sed -n '/^export interface Author/,/^}/p' src/config/authorBio.ts | grep -cE '^\s+slug: string;'`
    prints `1`;
  - `grep -c 'address' src/config/authorBio.ts` prints `0`;
  - `grep -c 'export const AUTHORS: Author\[\] = \[\];' src/config/authorBio.ts`
    prints `1`.
- [x] **Type probe.** A temporary `src/type-probe.ts` holds four object
      literals, each typed as `Business` and preceded by
      `// @ts-expect-error`:
  - a `remote` business with `address.street`;
  - a `remote` business with `geo`;
  - a `local` business whose address has no `street`;
  - a `local` business with `type: 'LegalServices'`.

  `pnpm check` exits 0, which means each literal is a type error. Delete
  the file afterwards.

**Clean scaffold build** (after `pnpm build`)

- [x] In `dist/index.html`:
  - there is exactly one `<head` element (regex `<head[\s>]`);
  - `<meta charset` starts before byte 1024;
  - the page has `<html lang="es-CO"`;
  - the page has `og:locale` `es_CO`.
- [x] Spec 04's JSON-LD command (spec 04, **Acceptance criteria**) still
      prints
      `{"blocks":2,"top":["Organization","WebSite"],"nested":["PostalAddress"],"foreign":0}`,
      and `grep -c '"inLanguage":"es-CO"' dist/index.html` prints `1`.
- [x] `dist/404.html` passes all of these:
  - it is not empty;
  - it has exactly one `<h1>`, and it reads `Página no encontrada`;
  - it has a link with `href="/"`;
  - its robots meta is `noindex, follow`;
  - it has a non-empty `<title>`;
  - it has no `<link rel="canonical"` and no `application/ld+json`.
- [x] `node harness/check-seo.mjs --dist dist` exits `0`, reports `0`
      errors and no `404-empty`. Its only warnings are `placeholder-text`
      and `asset-missing`, and `asset-missing` names only
      `/images/logo.svg`, `/images/og-image.png`, `/favicon.svg` and
      `/favicon.ico`.

**Probes in the working tree** (each after `pnpm build`)

- [x] **Inner, noindex and stub pages.** Add three temporary pages:
  - `src/pages/prueba-interior.astro` uses `generatePageSEO` and passes no
    `schemas`;
  - `src/pages/prueba-noindex.astro` uses `generatePageSEO({ …, noindex: true })`
    and passes a 2-item `generateBreadcrumbSchema()` in `schemas`;
  - `src/pages/prueba-ref.astro` passes
    `{ '@context': 'https://schema.org', '@type': 'Service', name: 'Prueba', provider: generateBusinessRef() }`.

  Then:
  - `prueba-interior/index.html` and `prueba-noindex/index.html` have 0
    JSON-LD blocks;
  - `prueba-ref/index.html` has exactly 1 block, and its `provider` has
    the `@type` `Organization` and the same `@id` as the home page's
    Organization;
  - `node harness/check-seo.mjs --dist dist` reports `0` errors.

- [x] **Uppercase path.** A temporary page that calls
      `siteUrl('/Servicios/')` makes `pnpm build` fail, and the error
      message contains `/Servicios/`.
- [x] **URL helpers (Amendment 1).** A temporary page makes every call in
      the `url.ts` examples table, each one inside `try`/`catch`, and
      prints the result or the error message:
  - each row that has a URL in **Result** prints exactly that URL;
  - each row that says "throws" prints an error message that contains the
    argument.
- [x] **CDN image (Amendment 1).** A temporary page uses
      `generatePageSEO({ …, image: 'https://cdn.example.net/og.jpg' })`.
      Then:
  - its `og:image` and `twitter:image` are exactly
    `https://cdn.example.net/og.jpg`;
  - `node harness/check-seo.mjs --dist dist` reports `0` errors, and no
    finding names `cdn.example.net`.
- [x] **Escaping.** Temporarily set `COMPANY_INFO.description` to
      `</script><script>alert(1)</script>`. Then:
  - `grep -c '</script><script>alert(1)' dist/index.html` prints `0`;
  - the Organization block parses, and its `description` equals that
    string exactly;
  - `check-seo` reports no `jsonld-parse` finding.
- [x] **Locale.** Temporarily set `LOCALE = 'en-US'`. `dist/index.html`
      then has `<html lang="en-US"`, `og:locale` `en_US` and
      `"inLanguage":"en-US"`.

**The `local` profile** (in a temp copy of the working tree without
`node_modules`, `dist` and `.git`, after `pnpm install --frozen-lockfile`)

- [x] Set up the copy:
  - `business` is
    `{ kind: 'local', type: 'LegalService', address: { street: 'Calle 1 # 2-3', city: 'Cali', region: 'Valle del Cauca', countryCode: 'CO' } }`;
  - `founders` is `['ana-perez']`;
  - `AUTHORS` has one `Author` whose `slug` is `ana-perez`.

  After `pnpm build`, `dist/index.html` passes all of these:
  - its top-level JSON-LD types are exactly `LegalService`, `Person` and
    `WebSite`;
  - the LegalService has an `address` with `streetAddress`, and
    `founder: [{"@id":"https://example.com/#person-ana-perez"}]`;
  - the Person has
    `worksFor: {"@id":"https://example.com/#organization"}` and no
    `address`;
  - `node harness/check-seo.mjs --dist dist` reports `0` errors.

- [x] In the same copy, `founders: ['nadie']` makes `pnpm build` fail, and
      the error names `nadie`.

**`check-seo` probe set**

- [x] Build a temp dir `$P` shaped like a build, the same way as spec 05's
      probe set:
  - `sitemap-index.xml` points to `sitemap-0.xml`, which lists every page
    below on the origin `http://localhost:8765`;
  - every page is valid except for the defect planted in it;
  - no page contains client data or a placeholder pattern.

  `node harness/check-seo.mjs --dist $P` exits `1` and reports exactly
  these findings and no others:

  | Page                             | Planted                                                                                            | Expected findings                                                                   |
  | -------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | `index.html`                     | an `Organization` whose `address` has no `streetAddress`                                           | none                                                                                |
  | `local-ok/index.html`            | a `LegalService` with `streetAddress`, `addressLocality` and `addressCountry`                      | none                                                                                |
  | `local-sin-calle/index.html`     | a `LegalService` whose `address` has `addressLocality` and `addressCountry` but no `streetAddress` | `local-address`                                                                     |
  | `local-sin-direccion/index.html` | a `LocalBusiness` with no `address`                                                                | `local-address`                                                                     |
  | `Mayus/index.html`               | a valid page in a camelCase folder, with its canonical to itself                                   | `url-lowercase` on the page, plus `url-lowercase` for its `<loc>` under the sitemap |
  | `enlaces/index.html`             | `<a href="/Mayus/">` and `<a href="/caf%C3%A9/">`                                                  | `url-lowercase` for `/Mayus/` only                                                  |
  | `café/index.html`                | a valid page, with its canonical to its percent-encoded own URL                                    | none                                                                                |

- [x] Serve `$P` with `python3 -m http.server 8765 --directory $P`. Then
      `node harness/check-seo.mjs --url http://localhost:8765` exits `1`
      and reports the same findings as the `--dist` run.
- [x] The `harness/check-seo.mjs` header has `Rules (17)` and lists
      `local-address` and `url-lowercase` as errors. This is checked by
      reading.

**Lint**

- [x] In `harness/lint-customization.sh`:
  - `grep -c 'lang="en"' harness/lint-customization.sh` prints `0`;
  - `grep -c 'src/config/seo.ts' harness/lint-customization.sh` prints
    `0`;
  - `grep -c 'src/config/companyInfo.ts' harness/lint-customization.sh`
    prints at least `1`.
- [x] `bash harness/lint-customization.sh` exits 0 and reports exactly 5
      marker groups: `example.com`, `Nueva web app`, `My Website|My Site`,
      `Footer stub` and `[CLIENTE]`.
- [x] **Lint probes.**
  - Temporarily setting `COMPANY_INFO.email` to `hola@cliente.co` does not
    make the email check report anything.
  - A temporary `src/lint-probe.ts` containing `// probe@example.org`
    makes the email check report it.

**Contract**

- [x] In `AGENTS.md`:
  - `grep -c 'companyInfo.ts' AGENTS.md` prints at least `3`;
  - `grep -c 'JsonLd.astro' AGENTS.md` prints at least `2`;
  - `grep -c 'default is .es-CO' AGENTS.md` prints `0`.

  Checked by reading:
  - the Routing, Config and Layout text;
  - the three Knobs map rows;
  - the Conventions bullet;
  - the new table row, as quoted under **Files affected**.

- [x] In each of `agents/coder.md`, `.claude/agents/coder.md` and
      `.opencode/agent/coder.md`:
  - `grep -c 'companyInfo.ts'` prints `2`;
  - `grep -c 'seo\.ts'` prints `0`.
- [x] Make a throwaway copy of the working tree, without `node_modules`
      and `dist`, and give it its own `git init` and one commit. In that
      copy:
  - `bash harness/bind-runtime.sh opencode` changes no file;
  - `bash harness/bind-runtime.sh claude-code` changes only the `model:`
    line of `.claude/agents/coder.md` and of
    `.claude/agents/spec-verifier.md`.
- [x] In `SKILL.md`:
  - each of `companyInfo.ts`, `LOCALE`, `siteUrl`, `mediaUrl`,
    `JsonLd.astro`, `generateHomeSchemas`, `generateBusinessRef` and
    `generateNotFoundSEO` appears at least once;
  - the file has a `Core API` heading.
- [x] Neither skill file imports `COMPANY_INFO` from `@/config/seo`:
      `grep -Pzo 'import \{[^}]*COMPANY_INFO[^}]*\} from "@/config/seo"' <file>`
      finds no match in either file.
- [x] In `seo-guide-line.md`:
  - `grep -cE 'COMPANY_INFO\.(address|geo)' seo-guide-line.md` prints `0`;
  - `grep -c 'Contact Page with LocalBusiness Schema' seo-guide-line.md`
    prints `0`;
  - in Pattern 5
    (`sed -n '/^### .*Pattern 5/,/^## Optimization Checklist/p'`),
    `grep -cE '"@type": *"(LocalBusiness|Organization)"'` prints `0`.

**Gate and diff**

- [x] `pnpm verify` exits 0 on the spec branch.
- [x] `git status --short` and `git diff dev --name-only`, together, list
      only these files:
  - `src/config/companyInfo.ts`
  - `src/config/seo.ts`
  - `src/config/authorBio.ts`
  - `src/utils/url.ts`
  - `src/components/JsonLd.astro`
  - `src/components/SeoHead.astro`
  - `src/layouts/MainLayout.astro`
  - `src/pages/404.astro`
  - `src/components/ui/WhatsApp.astro`
  - `astro.config.mjs`
  - `harness/check-seo.mjs`
  - `harness/lint-customization.sh`
  - `AGENTS.md`
  - `agents/coder.md`
  - `.claude/agents/coder.md`
  - `.opencode/agent/coder.md`
  - `.claude/skills/seo-guide-lines/SKILL.md`
  - `.claude/skills/seo-guide-lines/seo-guide-line.md`
  - this spec

## Implementation plan

1. Create `feature/06-seo-core` from `dev`. `/spec-impl` does this per
   `specs/.spec-config.yml`. Confirm that `git status` is clean.
2. Add `src/utils/url.ts` and `trailingSlash: 'always'`. Switch the URLs in
   `seo.ts` from `new URL(…, SITE)` to `siteUrl()`, and drop the module
   `SITE`. Run `pnpm build`: the JSON-LD command from spec 04 prints the
   same result as before.
3. Create `src/config/companyInfo.ts`:
   - move `CompanyInfo` and `COMPANY_INFO` into it;
   - add `LOCALE`, `LocalBusinessType` and `Business`;
   - move `address` into `business`.

   Point `seo.ts` and `WhatsApp.astro` at it, and update the lint's email
   exclusion. Run `pnpm check`, then the type probe, and delete the probe.

4. **Needs Amendment 1 approved.** In `url.ts`, add `mediaUrl()`, and make
   `siteUrl()` refuse `//` and percent-decode before its uppercase test.
   In `authorBio.ts`, give `Author` its new shape. In `seo.ts`:
   - delete `ProfessionalPerson`;
   - rewrite `generatePersonSchema(author)`;
   - replace the two constants with `generateBusinessSchema`,
     `generateBusinessRef`, `generateWebSiteSchema` and
     `generateHomeSchemas`;
   - make `generatePageSEO` take `locale`;
   - route the media fields through `mediaUrl()`.

   Switch `MainLayout` from the two constants to `generateHomeSchemas()`,
   still on every page, so the output does not change yet. Run
   `pnpm build`, then the URL-helper and CDN-image probes, and undo them.

5. Add `src/components/JsonLd.astro`, and switch `SeoHead` to it. Rewrite
   `MainLayout`:
   - the `<head>`;
   - `lang={LOCALE}`;
   - the home schemas only on `/`;
   - no JSON-LD on noindex.

   Run `pnpm build`, then the head, escaping, locale and inner-page
   probes, and undo them.

6. Add `generateNotFoundSEO`, and write `src/pages/404.astro`. Run
   `pnpm build` and check-seo on `dist/`, and compare with the
   clean-scaffold criteria.
7. Run the `local` profile in a temp copy, including the missing-founder
   case. Delete the copy.
8. Add `local-address`, `url-lowercase` and `LOCAL_BUSINESS_TYPES` to
   `harness/check-seo.mjs`, and update its header. Build the probe set,
   run `--dist` and then `--url`, and delete it.
9. Delete the `lang="en"` marker from the lint. Run the lint and both lint
   probes, and undo them.
10. Apply the `AGENTS.md` edits.
11. Edit `agents/coder.md` and run `bash harness/bind-runtime.sh opencode`.
    Apply the same edit to `.claude/agents/coder.md` by hand. Then run the
    regeneration check in the throwaway copy.
12. Update `SKILL.md`: the paths, the schema rules, the Set Up task and the
    "Core API" section.
13. Apply the six surgical edits to `seo-guide-line.md`, and run the skill
    `grep` checks.
14. Run `pnpm verify`.
