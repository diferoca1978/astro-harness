# 07 — llms-txt-core

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

Add `llms.txt` to the core: every clone generates it from `COMPANY_INFO`,
`services` and `faqs`, the same pattern `robots.txt.ts` already uses, and
discovers it through a `<link rel="alternate">` in `MainLayout`. The blog
module (planned spec 09) extends it instead of editing it, through one
export. While in this area, narrow `robots.txt.ts`'s bot list to the
crawlers that actually serve AI search/citation traffic, and teach
`check-seo.mjs` that llms.txt's own links must resolve — closing the last
open item the 2026-09-24 plan left for this spec (paso 5).

## Scope

**In:**

- `src/utils/llms.ts` (new): the four shared builders the plan named —
  `header()`, `doc()`, `linkList()` and `llmsTxt()` — plus `EXTRA_SECTIONS`,
  the blog module's extension point.
- `src/pages/llms.txt.ts` (new): generates `llms.txt` from `COMPANY_INFO`,
  `services`, `faqs` and `siteUrl()`, the same way `robots.txt.ts` generates
  its file.
- `src/layouts/MainLayout.astro`: one `<link rel="alternate" type="text/plain"
href="/llms.txt">` in the `<head>`.
- `src/pages/robots.txt.ts`: the `User-agent` list is narrowed to AI
  search/citation crawlers, dropping the training crawlers it lists today.
- `harness/check-seo.mjs`: a new rule, `llms-links-resolve` (18 rules
  total), a new `checkSite(site)` rule hook, and `llms.txt`/`llms/*.txt`
  discovery in both adapters.
- `AGENTS.md`: the Routing section, the Invariant "Where" cell, and one new
  "If you change X → update Y" row.

**Out:**

- **`llms-full.txt` and per-service/FAQ leaf `.txt` files.** Decided in this
  round's question block: the scaffold has no per-service or "nosotros"
  page to link from a leaf, so there is nothing real to dump yet. See
  Engram #554.
- **The blog module's own llms.txt section and leaves.** Planned spec 09,
  through `EXTRA_SECTIONS` — it never reopens this file's route.
- **`add-module` itself.** Planned spec 08.
- **Extending `placeholder-text`, `asset-missing` or any other existing
  check-seo rule to llms.txt's content.** Only `llms-links-resolve` is
  added; the rest stay HTML-only, reading `page.html`.
- **The `Llms-Txt:` robots.txt directive.** Rejected this round: it is not
  a standard any crawler reads. Discovery is the `<link rel="alternate">`
  alone.
- **Rewriting `.claude/skills/seo-guide-lines/`.** It covers JSON-LD and
  meta tags, not llms.txt. Untouched, same as spec 06 deferred its full
  rewrite.
- **i18n of the section headings** ("Sitio", "Servicios", "Preguntas
  frecuentes"). Spanish structural text, the same treatment spec 06 gave
  the 404 copy — not client data, ready for production as it is.
- **Running `check-seo.mjs --url` with the new rule against the 8 legacy
  projects.** None of them has this llms.txt shape; that is migration work
  (plan pasos 9–10).
- **`astro.config.mjs`.** `llms.txt.ts` is a plain endpoint, the same
  convention `robots.txt.ts` already uses; it needs no `prerender` export.

## Files affected

- **`src/utils/llms.ts`** (new)

  ```ts
  export interface LlmsItem {
    title: string;
    url?: string; // omitted → a plain bullet, no link
    notes?: string;
  }

  export function header(title: string, summary?: string): string;
  export function doc(item: LlmsItem): string;
  export function linkList(heading: string, items: LlmsItem[]): string;
  export function llmsTxt(header: string, sections: string[]): string;

  export const EXTRA_SECTIONS: string[] = [];
  ```

  - **`header(title, summary?)`:** `` `# ${title}\n` `` when `summary` is
    absent or blank; `` `# ${title}\n\n> ${summary}\n` `` otherwise.
  - **`doc(item)`:** one bullet.
    - `item.url` given: `` `- [${item.title}](${item.url})` ``, plus
      `` `: ${item.notes}` `` when `notes` is given.
    - `item.url` absent: `` `- ${item.title}` ``, plus the same notes
      suffix. This is how a service or a FAQ becomes a line with no link
      (**Decisions**).
  - **`linkList(heading, items)`:** `''` when `items` is empty, so a caller
    can push it unconditionally; otherwise
    `` `## ${heading}\n\n` + items.map(doc).join('\n')` ``.
  - **`llmsTxt(header, sections)`:** joins `header` and every `sections`
    entry that is not `''`, with `\n\n` between them, one trailing `\n`.
  - **`EXTRA_SECTIONS`:** pre-rendered section strings (the same shape
    `linkList()` returns), appended after the core's own sections. Empty
    until a module fills it — the blog module (spec 09) is its first real
    writer, patched in by `add-module` (spec 08) as a one-line change to
    this initializer (**Decisions**).
  - No imports: like `companyInfo.ts`, this is a small, dependency-free
    module — every input is a parameter.

- **`src/pages/llms.txt.ts`** (new)

  ```ts
  import type { APIRoute } from "astro";
  import { COMPANY_INFO } from "@/config/companyInfo";
  import { faqs } from "@/config/faqs";
  import { services } from "@/config/services";
  import { siteUrl } from "@/utils/url";
  import { header, linkList, llmsTxt, EXTRA_SECTIONS } from "@/utils/llms";

  export const GET: APIRoute = () => {
    const sections = [
      linkList("Sitio", [
        {
          title: COMPANY_INFO.name,
          url: siteUrl("/"),
          notes: COMPANY_INFO.description,
        },
      ]),
      linkList(
        "Servicios",
        services.map((s) => ({ title: s.title, notes: s.seoDescription })),
      ),
      linkList(
        "Preguntas frecuentes",
        faqs.map((f) => ({ title: f.question, notes: f.answer })),
      ),
      ...EXTRA_SECTIONS,
    ];

    const body = llmsTxt(
      header(COMPANY_INFO.name, COMPANY_INFO.description),
      sections,
    );

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  };
  ```

  - `services` and `faqs` are empty by default (**Config**), so the clean
    scaffold's `llms.txt` has only the `## Sitio` section — `linkList()`
    returns `''` for the other two, and `llmsTxt()` drops them.
  - The `## Sitio` section's URL always comes from `siteUrl()`, never a raw
    path, following the rest of the core (spec 06). The `## Servicios` and
    `## Preguntas frecuentes` bullets carry no `url`, by this round's
    decision (**Decisions**).

- **`src/layouts/MainLayout.astro`** — one new line after the sitemap
  `<link>` (line 43):

  ```astro
  <!-- llms.txt -->
  <link rel="alternate" type="text/plain" href="/llms.txt" />
  ```

- **`src/pages/robots.txt.ts`** — the `User-agent` blocks become exactly
  (the two leading blank lines are the template literal's own, unchanged
  from before this spec):

  ```


  User-agent: *
  Allow: /


  User-agent: ChatGPT-User
  Allow: /

  User-agent: OAI-SearchBot
  Allow: /

  User-agent: Claude-User
  Allow: /

  User-agent: Claude-SearchBot
  Allow: /

  User-agent: Perplexity-User
  Allow: /

  User-agent: PerplexityBot
  Allow: /

  Sitemap: ${sitemapURL.href}
  ```

  - **Removed** (training crawlers): `GPTBot`, `ClaudeBot`,
    `Google-Extended`, `CCBot`.
  - **Added** (search/citation crawlers): `OAI-SearchBot`, `Claude-User`,
    `Claude-SearchBot`, `Perplexity-User`.
  - **Kept:** `User-agent: *`, `ChatGPT-User`, `PerplexityBot`, the
    `Sitemap:` line. Nothing else in the file changes — the function
    signature, the `Content-Type` and the export stay as they are.

- **`harness/check-seo.mjs`**
  - **New rule:**

    | Id                   | Severity | What must hold                                                                                                                                                                                                                                                 |
    | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `llms-links-resolve` | error    | Every same-site, page-shaped URL inside a markdown link (`[text](url)`) found in `llms.txt`, and in every `llms/*.txt` leaf discovered by following such a link from it, leads to a page — the same resolution `url-resolves` already uses (`site.resolve()`). |

  - **New site-level rule hook, `checkSite(site)`,** alongside the existing
    `check(page, site)` and `checkSitemap(site, occurrences)`. It runs once
    per whole site, not once per page; its findings are grouped under each
    llms document's own label, the same way a page's findings are grouped
    under its file path or URL.
  - **New site field, `site.llmsDocs: [{ label, text }]`:**
    - `--dist`: `{ label: 'llms.txt', text }` when `<dir>/llms.txt` exists;
      plus one entry per `<dir>/llms/*.txt` file (`label: 'llms/<name>.txt'`)
      when that directory exists. Neither is required — a build with
      neither gives an empty `llmsDocs` and no finding.
    - `--url`: `GET <origin>/llms.txt`; a non-200 response gives no doc and
      no finding. On success, every same-site URL inside its text whose
      pathname matches `/^\/llms\/.*\.txt$/` is fetched once (GET) and
      added as its own doc — so a leaf the blog module adds later (spec 09)
      is picked up by being linked from `llms.txt`, with no further change
      to this script.
  - **Link extraction:** `/\[[^\]]*\]\(([^)\s]+)\)/g` over the doc's plain
    text. A captured URL is resolved against the site origin, kept only
    when it is same-site (`isSameSite`) and page-shaped
    (`pathKind(url) === 'page'`) — the same filter `url-resolves` already
    applies to HTML pages — then checked with `site.resolve()`. A miss
    reports `` `${url} (in ${doc.label}) leads to no page: ${r.reason}` ``,
    grouped under `doc.label`.
  - **Header comment:** `Rules (17)` becomes `Rules (18)`, with the new row
    in its table; the site-context bullet list gains `site.llmsDocs`; the
    "Layout of this file" bullet gains the `checkSite` hook.
  - **Runner:** after the per-page and per-sitemap passes, it runs every
    `checkSite` rule once against `site`, and prints its findings as one
    more group, the same shape as a page's. The final summary line's page
    count is unaffected — an llms document is not a page.

- **`AGENTS.md`**
  - **Routing:** "`robots.txt` is generated by `src/pages/robots.txt.ts`;
    the sitemap is automatic." becomes "`robots.txt` and `llms.txt` are
    generated by `src/pages/robots.txt.ts` and `src/pages/llms.txt.ts`; the
    sitemap is automatic."
  - **Invariant vs Variable**, Invariant "Where" cell: gains
    `src/utils/llms.ts`, next to `src/utils/url.ts`.
  - **"If you change X → update Y":** a new row —
    > | Add, remove or rename a builder in `src/utils/llms.ts`, or change
    > what `src/pages/llms.txt.ts` includes | this file's Routing section,
    > if the route's own shape changes · `harness/check-seo.mjs`'s
    > `llms-links-resolve` rule, if the same-site link shape changes |

**Unchanged on purpose:**

- `astro.config.mjs`. `llms.txt.ts` follows the same endpoint convention as
  `robots.txt.ts`; no `prerender` export, no `trailingSlash` interaction
  (an endpoint with an extension is exempt, spec 06 Amendment 1).
- `src/config/companyInfo.ts`, `src/config/services.ts`,
  `src/config/faqs.ts`. `llms.txt.ts` only reads them.
- `~/scripts/install-harness.sh`. It already copies `harness/check-seo.mjs`
  in full; this spec changes that file's content, not its existence.
- `.claude/skills/seo-guide-lines/`, `CHECKPOINTS.md`, `agents/coder.md`.
  Nothing here is client data to fill in, so none of the three needs an
  entry.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- No existing row covers adding a new `src/pages/*.ts` endpoint or a new
  `src/utils/*.ts` module on its own — the closest, "Add, remove or rename
  a generator in `src/config/seo.ts`, a helper in `src/utils/url.ts` or
  `JsonLd.astro`", names none of the files this spec adds. This spec adds
  its own row instead (**Files affected**), the same move spec 06 made for
  its own generators.
- "Add/rename a config file in `src/config/`": not triggered — no file in
  `src/config/` is added, removed or renamed.
- "Change a workflow skill or agent": not triggered — no agent, skill or
  runtime file changes.

## Source of the content

This spec invents no client-facing copy. Every string `llms.txt` shows
comes verbatim from existing config (`COMPANY_INFO.name`,
`COMPANY_INFO.description`, `Service.title`, `Service.seoDescription`,
`FAQItem.question`, `FAQItem.answer`) — the same fields other generators
already read. The three section headings ("Sitio", "Servicios", "Preguntas
frecuentes") are structural labels, not sourced from a brief, the same
treatment spec 06 gave the 404 page's copy.

## Decisions made and discarded

The round's reasoning is in Engram #554.

- **Scope v1 is a single `llms.txt`, nothing else.** No `llms-full.txt`, no
  leaf `.txt` files. The scaffold has no per-service or "nosotros" page to
  link from a leaf, so there is nothing real to dump.
  - _Discarded: shipping `llms-full.txt` now too._ It would dump the same
    handful of fields `llms.txt` already carries — no second document earns
    its place yet.
  - _Discarded: per-service/FAQ leaf files with anchors, as Aguilar did._
    It assumes a home-page anchor id this spec does not control (front-end
    section markup is `front-end-astro`'s job, not the core's).

- **A service or a FAQ is a plain bullet, no link.** `doc()` takes an
  optional `url`; omitting it is enough, so `linkList()` did not need a
  second code path.
  - _Discarded: an anchor URL (`/#<slug>`)._ It assumes the home page's
    services section uses that id, which nothing enforces.

- **The `Llms-Txt:` robots.txt directive is not added.** It is not a
  standard any crawler reads; Aguilar kept it only because it was already
  published. The `<link rel="alternate">` is the one, real discovery path.

- **`robots.txt.ts`'s bot list is narrowed to search/citation crawlers,
  verified against each vendor's own docs** (not assumed from memory):
  Cloudflare's AI-crawler taxonomy (training vs. search vs. agent),
  Anthropic's three-bot framework (`ClaudeBot` trains,
  `Claude-SearchBot` indexes for search, `Claude-User` fetches on a real
  user's behalf), OpenAI's (`GPTBot` trains, `OAI-SearchBot` indexes,
  `ChatGPT-User` fetches on request) and Perplexity's
  (`PerplexityBot` indexes, `Perplexity-User` fetches on request).
  - **Removed:** `GPTBot`, `ClaudeBot`, `Google-Extended` (all three train a
    model) and `CCBot` (Common Crawl, a dataset many orgs train on, not a
    search/citation bot for any one of them).
  - **Added:** `OAI-SearchBot`, `Claude-User`, `Claude-SearchBot`,
    `Perplexity-User`, alongside the `ChatGPT-User` and `PerplexityBot`
    already present.
  - _Discarded: leaving the list as it was._ It blocked nothing (every
    entry was `Allow: /`), but it named training crawlers as if allowing
    them were a citation decision, when Google's and Anthropic's own
    framing treats training and retrieval as separate opt-ins.

- **The extension point is a plain `string[]`, not a typed section
  object.** `EXTRA_SECTIONS` holds pre-rendered `linkList()` output.
  `add-module` (spec 08) only ever has to change this one initializer line
  to wire in the blog module (spec 09) — the "one-line patch" the plan
  requires of every extension point (plan, paso 6).
  - _Discarded: an array of `{ heading, items }` objects that the route
    renders itself._ It would make the route call `linkList()` on the
    module's behalf, so patching in a module would mean editing the route's
    render loop, not one line.

- **`llms-links-resolve` ships in this spec, not deferred to spec 09.** It
  reuses `site.resolve()`, the function `url-resolves` already built, so
  the marginal cost is the new `checkSite` hook and the discovery code —
  not a second resolver. Spec 09 then adds real leaves and needs no further
  change here.
  - _Discarded: waiting for spec 09._ The plan's own paso 5 already named
    this rule for spec 07; deferring it would mean reopening
    `check-seo.mjs` a second time for something the resolver already knows
    how to check.

- **Leaves are discovered by following links, not by a fixed glob, in
  `--url`.** There is no sitemap entry for a `.txt` file (Astro's sitemap
  integration excludes them the same way it excludes `robots.txt`), so
  `--url` has no other way to find `llms/<name>.txt`. `--dist` could glob
  `<dir>/llms/*.txt` directly, and does — the two adapters use whatever
  input each actually has, the same asymmetry `--dist` and `--url` already
  have for pages and sitemaps.

- **No escaping in `doc()`.** The one real `[title](url)` link in v1 uses
  `COMPANY_INFO.name`; a business name containing `]` or `)` is a real but
  unlikely edge case, and building an escaper for a single field now is
  the kind of complexity this codebase's conventions ask to avoid until it
  is needed. Flagged here as a known limitation, not silently ignored.

- **`llms-links-resolve` is its own rule, not folded into `url-resolves`.**
  An llms document is not part of `site.pages` — it has no HTML, no title,
  no canonical — so giving its findings a different id keeps "which rule
  fired on which kind of document" legible in the output.

## Acceptance criteria

Probes are undone after use: `git status --short src harness` must be
empty when done.

**Source shape**

- [x] `src/utils/llms.ts` exports exactly the four builders and the
      extension point:
  - `grep -cE '^export function (header|doc|linkList|llmsTxt)\(' src/utils/llms.ts`
    prints `4`;
  - `grep -c '^export const EXTRA_SECTIONS: string\[\] = \[\];' src/utils/llms.ts`
    prints `1`;
  - `grep -c '^import' src/utils/llms.ts` prints `0`.
- [x] `src/pages/llms.txt.ts`:
  - `grep -c '@/utils/llms' src/pages/llms.txt.ts` prints `1`;
  - `grep -c '@/utils/url' src/pages/llms.txt.ts` prints `1`;
  - `grep -c 'text/plain' src/pages/llms.txt.ts` prints `1`.
- [x] `grep -c 'rel="alternate" type="text/plain" href="/llms.txt"' src/layouts/MainLayout.astro`
      prints `1`.
- [x] In `src/pages/robots.txt.ts`:
  - `grep -cE 'User-agent: (GPTBot|ClaudeBot|Google-Extended|CCBot)' src/pages/robots.txt.ts`
    prints `0`;
  - `grep -cE 'User-agent: (ChatGPT-User|OAI-SearchBot|Claude-User|Claude-SearchBot|Perplexity-User|PerplexityBot)' src/pages/robots.txt.ts`
    prints `6`.

**Clean scaffold build** (after `pnpm build`)

- [x] `dist/llms.txt` exists:
  - its first line is `# [CLIENTE] nombre del negocio`;
  - `grep -c '^## Sitio' dist/llms.txt` prints `1`, and the section's link
    is `https://example.com/`;
  - `grep -c '^## Servicios' dist/llms.txt` and
    `grep -c '^## Preguntas frecuentes' dist/llms.txt` both print `0`
    (`services` and `faqs` are empty by default).
- [x] `dist/robots.txt` matches the block quoted under **Files affected**,
      byte for byte except for the `Sitemap:` origin.
- [x] `grep -c 'rel="alternate" type="text/plain" href="/llms.txt"' dist/index.html`
      prints `1`.
- [x] `node harness/check-seo.mjs --dist dist` exits `0`, and its output
      names `llms.txt` as a checked document with 0 findings. Checked by
      reading.

**Probes** (each reverted after `pnpm build`)

- [x] **Sections with data.** Temporarily set `services` to one item and
      `faqs` to one item. `dist/llms.txt` then has both `## Servicios` and
      `## Preguntas frecuentes`, each with one bullet (`- title: notes`,
      no `[`/`]`) naming that item's title/question and
      description/answer.
- [x] **Broken llms.txt link.** Temporarily set `EXTRA_SECTIONS` in
      `src/utils/llms.ts` to `['## Prueba\n\n- [Roto](/no-existe)']`. Then
      `node harness/check-seo.mjs --dist dist` exits `1` and reports
      `llms-links-resolve` under `llms.txt`, naming `/no-existe`.
- [x] **`--url` parity.** `check-seo.mjs --url` follows `robots.txt`'s
      `Sitemap:` line, which is built from `astro.config.mjs`'s `site`
      (`https://example.com` in a clean scaffold) — a local server on
      `localhost:8765` cannot be reached through that origin. Temporarily
      set `site` in `astro.config.mjs` to `http://localhost:8765`, then
      `pnpm build` with the broken-link probe still in place. Serve `dist/`
      with `python3 -m http.server 8765 --directory dist`.
      `node harness/check-seo.mjs --url http://localhost:8765` exits `1`
      and reports the same `llms-links-resolve` finding on `llms.txt`. Then
      stop the server, remove the `EXTRA_SECTIONS` probe, revert `site` to
      `https://example.com` and rebuild.
- [x] **Leaf discovery.** With the broken-link probe replaced by
      `['## Prueba\n\n- [Hoja](/llms/prueba.txt)']` and a file
      `dist/llms/prueba.txt` containing `[Roto](/no-existe)`, rebuild (`site`
      still pointed at `http://localhost:8765`, per the previous probe).
      Both `--dist dist` and (served the same way, on 8765) `--url` report
      `llms-links-resolve` under `llms/prueba.txt`, not under `llms.txt`.
      Then stop the server, remove both probes, revert `site` and rebuild.

**Contract**

- [x] `harness/check-seo.mjs`:
  - `grep -c 'Rules (18)' harness/check-seo.mjs` prints `1`;
  - `grep -c 'llms-links-resolve' harness/check-seo.mjs` prints at least
    `2`.
- [x] `AGENTS.md`:
  - `grep -c 'llms.txt.ts' AGENTS.md` prints at least `1`;
  - `grep -c 'src/utils/llms.ts' AGENTS.md` prints at least `1`.

**Gate**

- [x] `pnpm verify` exits `0` on the spec branch.
- [x] `git status --short` and `git diff dev --name-only`, together, list
      only these files:
  - `src/utils/llms.ts`
  - `src/pages/llms.txt.ts`
  - `src/layouts/MainLayout.astro`
  - `src/pages/robots.txt.ts`
  - `harness/check-seo.mjs`
  - `AGENTS.md`
  - this spec

## Implementation plan

1. Create `feature/07-llms-txt-core` from `dev`. `/spec-impl` does this per
   `specs/.spec-config.yml`. Confirm `git status` is clean.
2. Write `src/utils/llms.ts` with the four builders and `EXTRA_SECTIONS`.
3. Write `src/pages/llms.txt.ts`. Run `pnpm build` and read `dist/llms.txt`
   by hand against the clean-scaffold criteria.
4. Add the `<link rel="alternate">` to `MainLayout.astro`. Run `pnpm build`
   and check `dist/index.html`.
5. Rewrite `robots.txt.ts`'s `User-agent` blocks. Run `pnpm build` and
   check `dist/robots.txt`.
6. Extend `check-seo.mjs`: `llmsDocs` discovery in both adapters, the
   `checkSite` hook, the `llms-links-resolve` rule, and the header comment
   (`Rules (17)` → `Rules (18)`). Run it against `dist/`.
7. Run the sections-with-data probe, then the broken-link, `--url`-parity
   and leaf-discovery probes (serving with `python3 -m http.server 8765`).
   Undo each probe.
8. Apply the `AGENTS.md` edits.
9. Run `pnpm verify`.
