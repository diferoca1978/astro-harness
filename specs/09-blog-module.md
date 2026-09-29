# 09 — blog-module

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

Ship the blog as `harness/modules/blog/`, the first real module installed
through the `add-module` mechanism (spec 08): a content collection, the
`/blog/` index and `/blog/<id>/` post pages, and a `/llms/<id>.txt` leaf per
post wired into `llms.txt` (spec 07) through its `EXTRA_SECTIONS` extension
point. Ported from AguilarAbogados (specs 17, 23, 25–27), not Shine, per the
plan's decision 15 — but rebuilt to this scaffold's own conventions
(`front-end-astro` components, core JSON-LD generators, `z` from
`astro/zod`) rather than copied file-for-file, since Aguilar's actual
components (`CardHeroTyped`, `CtaBanner`, `MarkdownPostLayout`, `Prose`)
don't exist here and don't follow this scaffold's rules. With specs 03–09
done, the scaffold itself is complete and the new project (plan §3, paso
after this one) can start.

## Scope

**In:**

- `harness/modules/blog/` (new): `patch.json` (one entry, targeting the
  `llms-extra-sections` point spec 08 already marked) and a `src/` tree
  mirroring the destination project — content collection config, the
  collection itself (with one placeholder post), `posts.ts`, the blog's own
  SEO generators, the index/post pages, the `llms/<id>.txt` route, and one
  `perpage/blog` component.
- `src/utils/scripts/readingTime.ts` (core, **deleted**) and its three
  now-orphaned dependencies removed from `package.json` — see **Decisions**.
- `harness/lint-customization.sh` (core): its `marker()`/`marker_src_except()`
  `--include` flags gain `*.md`, so the existing `[CLIENTE]` marker also
  scans `src/content/**/*.md` — the mechanism that flags the module's
  placeholder post as unfinished.
- `AGENTS.md` (core): two wording fixes, dropping "future"/"planned" language
  about the blog module now that it is real (**Files affected**).

**Out:**

- **Rewriting Aguilar's components.** `CardHeroTyped`, `CtaBanner`,
  `MarkdownPostLayout`, `Prose` are not ported. The blog's markup is rebuilt
  with `front-end-astro`, using `global.css` tokens and this scaffold's own
  component conventions (**Decisions**).
- **A contact CTA on the blog index.** Aguilar's index ends in a `CtaBanner`
  to `/contacto`, a route this scaffold does not guarantee exists (contact
  forms are manual, per client — see AGENTS.md § "Contact forms"). The
  ported index has no CTA.
- **An individual author per post.** `BlogPosting` carries `publisher` (the
  business) only, no `author` `Person`. `authorBio.ts` ships empty by
  default in a clean scaffold; requiring an author would force inventing
  one. No new frontmatter field for it.
- **An automatic navigation patch.** `add-module.sh`'s existing-line guard
  (spec 08) aborts when the line after a marker matches neither the core
  value nor the patch's `insert` — and a client almost always customizes
  `navigation.ts` (adds its real pages) before it ever installs a module, so
  an automatic "Blog" nav-link patch would abort on nearly every real
  install. Not worth a new extension point for a case that rarely applies —
  adding the link stays a manual, one-line edit, same as any other nav item.
- **New `harness/check-seo.mjs` rules.** The existing generic rules
  (`title-description`, `canonical-self`, `jsonld-id-resolves`,
  `llms-links-resolve`, `deprecated-type`, …) already run against every
  page and every llms document, blog included. Nothing about `Blog`/
  `BlogPosting` needs a rule of its own yet. (`check-seo.mjs` does gain a
  small fix during implementation — not a new rule, see **Files affected**
  and **Decisions**.)
- **`llms-full.txt` and the FAQs/"nosotros" llms leaves** (Aguilar specs 26
  and 27). Still undecided at the core level (spec 07 left them open); this
  spec does not resolve them for the blog either.
- **Reading time.** `readingTime.ts` is removed, not wired in — see
  **Decisions**. A future spec reintroduces an updated version.
- **Pagination, tags/category pages, an RSS feed.** Not requested; today's
  scope is a flat index and one page per post, matching Aguilar's own v1
  shape before its later specs (24, 32+) added catalog and filtering
  features this scaffold has no equivalent of yet.
- **Removing an installed module, or a second module that also needs
  `src/content.config.ts`.** Out of scope for the reasons spec 08 already
  gives (uninstall is manual) and a new one this spec surfaces — see
  **Decisions**, "One module owns `content.config.ts`."
- **Running `add-module blog` against any of the 8 legacy projects.** Per
  spec 08's own scope, `add-module` only targets projects created from the
  scaffold after spec 06 (decision 16).

## Files affected

- **`harness/modules/blog/patch.json`** (new)

  ```json
  [
    {
      "point": "llms-extra-sections",
      "file": "src/utils/llms.ts",
      "insert": "export { EXTRA_SECTIONS } from '@/utils/llmsBlogSections';"
    }
  ]
  ```

  Replaces the core's `export const EXTRA_SECTIONS: string[] = [];` with a
  re-export from a file this module copies in. `src/utils/llms.ts` keeps its
  "no imports" shape (`grep -c '^import' src/utils/llms.ts` still prints
  `0` — an `export … from …` line does not start with `import`), and the
  async post-list computation lives entirely in the module's own file, not
  patched into the core (**Decisions**).

- **`harness/modules/blog/src/content.config.ts`** (new)

  ```ts
  import { defineCollection } from "astro:content";
  import { glob } from "astro/loaders";
  import { z } from "astro/zod";

  const blog = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        publishDate: z.date(),
        modifiedDate: z.date(),
        tags: z.array(z.string()),
        image: image(),
      }),
  });

  export const collections = { blog };
  ```

  `z` from `astro/zod`, per AGENTS.md's correction of Aguilar's own (deprecated)
  `astro:content` re-export. Fields match Aguilar's (`publishDate`,
  `modifiedDate`), not Shine's (`pubDate`) — plan decision 15.
  `slug` in the schema is what makes `post.id` resolve to it instead of the
  filename: Astro's `glob()` loader uses a `slug` frontmatter property as the
  entry's `id` when present (confirmed against the Astro docs' "Defining
  custom IDs" section) — the exact mechanism Aguilar's spec 23 found
  empirically. No custom `generateId` needed.

- **`harness/modules/blog/src/content/blog/post-de-ejemplo.md`** (new) — the
  placeholder post the acceptance probes build against. Frontmatter:
  `title: "[CLIENTE] título del post de ejemplo"`,
  `slug: "post-de-ejemplo"`,
  `description: "[CLIENTE] descripción breve del post de ejemplo"`,
  `publishDate`/`modifiedDate` set to the install date, `tags: []`,
  `image: "images/post-de-ejemplo.webp"`. Body: a few real paragraphs (not
  lorem ipsum — the scaffold's placeholder convention is marked English/
  `[CLIENTE]` strings, not filler Latin). The `[CLIENTE]` markers are what
  `lint-customization.sh`'s existing marker catches once it scans `.md`
  files (**Decisions**).

- **`harness/modules/blog/src/content/blog/images/post-de-ejemplo.webp`**
  (new) — a small, real, generic placeholder image (not a broken
  reference). Required because `image()` is a build-time Zod helper that
  resolves and processes an actual file, unlike a plain string URL.

- **`harness/modules/blog/src/utils/posts.ts`** (new)

  ```ts
  import { getCollection, type CollectionEntry } from "astro:content";

  export type BlogPost = CollectionEntry<"blog">;

  export const getAllPosts = async () => {
    const posts = await getCollection("blog");
    return posts.sort(
      (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
    );
  };
  ```

  Same as Aguilar's — already correct there (`getCollection`/
  `CollectionEntry` from `astro:content` is fine; only `z` needed the
  `astro/zod` fix).

- **`tsconfig.json`** (core) — `"harness/modules"` added to `exclude`, next
  to `"dist"`. `include: ["**/*"]` otherwise makes `astro check` (and this
  repo's `pnpm check`/`pnpm verify`) type-check `harness/modules/blog/src/**`
  against this repo's own `src/content.config.ts`, which has no `blog`
  collection — `posts.ts`'s `getCollection("blog")` and
  `CollectionEntry<"blog">` fail with "does not satisfy the constraint
  'never'" (**Decisions**). The module tree is a template copied into
  client projects by `add-module.sh`, not live source this repo's own
  build reads — `astro build` only ever reads the root `src/content.config.ts`,
  so excluding `harness/modules` from type-checking doesn't affect the
  build, only `astro check`.

- **`harness/modules/blog/src/utils/llmsBlogSections.ts`** (new)

  ```ts
  import { linkList } from "@/utils/llms";
  import { getAllPosts } from "@/utils/posts";

  const posts = await getAllPosts();

  export const EXTRA_SECTIONS: string[] = [
    linkList(
      "Blog",
      posts.map((post) => ({
        title: post.data.title,
        url: `/llms/${post.id}.txt`,
        notes: post.data.description,
      })),
    ),
  ];
  ```

  Top-level `await` — resolved once at build time, same as any other static
  endpoint in this scaffold. The one thing `patch.json` changes in the core
  is the single re-export line that points here.

- **`harness/modules/blog/src/config/blogSeo.ts`** (new) — the blog's own
  generators, kept in the module (not patched into the core `seo.ts`, which
  has no extension point for new generators). Reuses the core's exported
  `generateBusinessRef()`, `siteUrl()` and `mediaUrl()` — no author node
  (**Scope → Out**):

  ```ts
  import { generateBusinessRef, type JSONLDSchema } from "@/config/seo";
  import { COMPANY_INFO } from "@/config/companyInfo";
  import { siteUrl, mediaUrl } from "@/utils/url";
  import type { BlogPost } from "@/utils/posts";

  export function generateBlogSchema(posts: BlogPost[]): JSONLDSchema {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": siteUrl("/blog/#blog"),
      name: `Blog | ${COMPANY_INFO.name}`,
      url: siteUrl("/blog/"),
      publisher: generateBusinessRef(),
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        "@id": siteUrl(`/blog/${post.id}/#blogposting`),
        headline: post.data.title,
        url: siteUrl(`/blog/${post.id}/`),
      })),
    };
  }

  export function generateBlogPostingSchema(post: BlogPost): JSONLDSchema {
    const { title, description, image, publishDate, modifiedDate } = post.data;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": siteUrl(`/blog/${post.id}/#blogposting`),
      headline: title,
      description,
      image: mediaUrl(image.src),
      datePublished: publishDate.toISOString(),
      dateModified: modifiedDate.toISOString(),
      url: siteUrl(`/blog/${post.id}/`),
      isPartOf: {
        "@type": "Blog",
        "@id": siteUrl("/blog/#blog"),
        name: `Blog | ${COMPANY_INFO.name}`,
        url: siteUrl("/blog/"),
      },
      publisher: generateBusinessRef(),
    };
  }
  ```

  `blogPost` and `isPartOf` are typed stubs (`@type`, `@id`, plus a couple of
  identifying fields), the same shape `generateBusinessRef()` already uses
  for a cross-reference — not bare `{ "@id": … }` reference nodes.
  `check-seo.mjs`'s `jsonld-id-resolves` rule only flags an object whose
  _only_ key is `@id` (a "reference node") when no typed node on the same
  page defines that `@id`; the `Blog` and post pages never emit the other
  half of the reference (the `Blog` node lives on `/blog/`, not on each post
  page, and vice versa), so a bare reference would always fail. Giving the
  reference its own `@type` and a couple of fields takes it out of that
  check entirely — it's no longer a pure reference node (**Decisions**,
  found during implementation).

- **`harness/modules/blog/src/pages/blog/index.astro`** (new). Built by
  `front-end-astro` at implementation time (grid of `PostCard`s, one `<h1>`,
  intro copy — no CTA, **Scope → Out**), closed by `seo-guide-lines`:
  `generatePageSEO()` for the SEO props, `generateBreadcrumbSchema([{name:
'Inicio', path: '/'}, {name: 'Blog', path: '/blog/'}])` passed to
  `MainLayout`'s `schemas`, and `generateBlogSchema(posts)` emitted next to
  the grid with `JsonLd.astro` — per AGENTS.md's "JSON-LD lives next to what
  it describes" rule.

- **`harness/modules/blog/src/pages/blog/[...id].astro`** (new). Same
  builder split: `front-end-astro` for the article markup (title,
  description, publish date, rendered `Content`), `seo-guide-lines` for
  `generatePageSEO()`, a 3-item breadcrumb (`Inicio` → `Blog` → the post
  title) through `MainLayout`'s `schemas`, and `generateBlogPostingSchema(post)`
  emitted next to the article with `JsonLd.astro`. `getStaticPaths` maps
  `params: { id: post.id }` — never the filename (Aguilar's spec 23
  lesson).

- **`harness/modules/blog/src/pages/llms/[id].txt.ts`** (new) — ported from
  Aguilar's spec 23, `id` param (not `slug`), URL built from `post.id`:

  ```ts
  import type { APIRoute } from "astro";
  import { getAllPosts } from "@/utils/posts";
  import { header, doc } from "@/utils/llms";
  import { siteUrl } from "@/utils/url";

  export const getStaticPaths = async () => {
    const posts = await getAllPosts();
    return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
  };

  export const GET: APIRoute = ({ props }) => {
    const { post } = props as {
      post: Awaited<ReturnType<typeof getAllPosts>>[number];
    };
    const { title, description, publishDate, modifiedDate } = post.data;
    const body = [
      header(title, description),
      doc({ title: "URL", notes: siteUrl(`/blog/${post.id}/`) }),
      doc({
        title: "Published",
        notes: publishDate.toISOString().slice(0, 10),
      }),
      doc({ title: "Updated", notes: modifiedDate.toISOString().slice(0, 10) }),
      "",
      post.body ?? "",
    ].join("\n");

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  };
  ```

  Reuses `header()`/`doc()` from the core's `src/utils/llms.ts` (spec 07) —
  no new builder needed. `llmsBlogSections.ts`'s links already point at
  `/llms/${post.id}.txt`, matching this route's shape.

- **`harness/modules/blog/src/components/perpage/blog/PostCard.astro`**
  (new) — the index grid's card: `<Image>` from `astro:assets` (never a raw
  `<img>`), `alt={post.data.title}` (no separate alt field in the schema —
  **Decisions**), title, description, formatted `publishDate`. Built by
  `front-end-astro` using `global.css` tokens, no arbitrary Tailwind values.

- **`src/utils/scripts/readingTime.ts`** (core, **deleted**) — see
  **Decisions**.

- **`package.json`** (core) — three now-orphaned dependencies removed:
  `reading-time`, `mdast-util-from-markdown`, `mdast-util-to-string`.
  `pnpm-lock.yaml` regenerated by `pnpm install` in the same change.

- **`harness/lint-customization.sh`** (core) — both `marker()`'s and
  `marker_src_except()`'s `--include` flag lists gain `--include='*.md'`,
  so the existing `[CLIENTE]` and Shine-contamination markers also scan
  `src/content/**/*.md`. No new marker pattern needed — the placeholder
  post's `[CLIENTE]` strings are already caught by the pattern
  `companyInfo.ts` already uses.

- **`harness/check-seo.mjs`** (core) — `pathKind()` and `resolveInDist()`
  gain a special case for `/.netlify/images?url=<path>&w=…&h=…`, the URL
  shape `@astrojs/netlify`'s Image CDN rewrites a local `<Image>` asset to
  by default: both now treat that pathname as an asset and resolve/probe the
  file named by its `url=` query parameter, instead of misreading the
  extension-less `/.netlify/images` path as a page. Not a new rule —
  `url-resolves` and `asset-missing` already exist; this fixes their shared
  asset/page classification for a URL shape neither anticipated. Found
  during this spec's own implementation (**Decisions**).

- **`AGENTS.md`** (core) — two wording fixes, no new table rows (the
  "Add or change a module" row from spec 08 already covers this without
  edits, since this module changes no convention):
  - Knobs map, "Modules" row: `harness/modules/<name>/ (source, in this
repo)` unchanged; only the row's left-hand label drops "e.g. a future
    blog" now that one is real.
  - "### Modules — installed on demand with `add-module`": "the planned
    blog module is the first, see `specs/09-*`" → "the blog module is the
    first, see `specs/09-blog-module.md`".

**Unchanged on purpose:**

- `src/utils/llms.ts`, `src/pages/llms.txt.ts`, `src/pages/robots.txt.ts`
  (spec 07). The patch only ever touches the one marked line.
- `src/config/seo.ts`. The blog's generators live in the module's own
  `blogSeo.ts`, reusing `generateBusinessRef()` — no core edit, no new
  extension point.
- `src/utils/navigation.ts`. Nav stays manual (**Scope → Out**).
- `harness/modules/README.md`. No convention change — one entry in an
  existing table row ("Add or change a module") already covers adding a
  module without editing this file.
- `CHECKPOINTS.md`. No new pre-production step — see **Scope → Out**.
  (`harness/check-seo.mjs` itself is no longer unchanged — see **Files
  affected**: it gains an asset-detection fix, not a new rule.)
- `~/scripts/add-module.sh`, `~/scripts/setup-client-project.sh`. This spec
  adds a module; it does not change the mechanism spec 08 built.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- "Add or change a module under `harness/modules/<name>/`" (spec 08's row):
  matches directly — its "update `harness/modules/README.md`" clause is
  conditional ("if the directory or `patch.json` convention itself
  changes") and not triggered here.
- "Add a dependency / remove one → `package.json` · Tech stack above": the
  three removed dependencies were never listed in AGENTS.md's Tech Stack
  prose (they shipped silently with `readingTime.ts`), so there is nothing
  to un-list there.
- No row covers a module adding its own `src/config/*.ts` or
  `src/content.config.ts` — nothing in the core changes shape, so no new
  row is needed (consistent with spec 08's own precedent of only adding a
  row when the core itself gains a new concept).

## Source of the content

This spec invents no client-facing copy sourced from a brief — there is no
brief; this is scaffold infrastructure. The one piece of content it does
add, the placeholder post (`post-de-ejemplo.md`), is scaffold-authored
filler explicitly marked with the `[CLIENTE]` convention `companyInfo.ts`
already uses, exactly so it reads as unfinished until a client replaces it
— not invented client data, the same treatment `COMPANY_INFO`'s own
placeholder fields get.

## Decisions made and discarded

- **`blogPost`/`isPartOf` are typed stubs, not bare `{ "@id": … }` reference
  nodes — found during implementation.** `check-seo.mjs`'s
  `jsonld-id-resolves` rule only accepts a bare `{ "@id": … }` object when a
  typed node on the _same page_ defines that `@id`; the `Blog` node lives on
  `/blog/` and each `BlogPosting` node lives on its own `/blog/<id>/`, so
  neither page ever defines the other half of a bare cross-page reference.
  Giving `blogPost` items and `isPartOf` their own `@type` plus a couple of
  identifying fields (the same shape `generateBusinessRef()` already uses)
  takes them out of that check entirely, since the rule only inspects
  objects whose _only_ key is `@id`.
  - _Discarded: removing `blogPost`/`isPartOf` entirely._ Passes the rule
    trivially, but loses the semantic link between the `Blog` and its posts
    that `BlogPosting.isPartOf`/`Blog.blogPost` exist to express.
  - _Discarded: emitting the referenced node (a full `Blog` node on the post
    page, a full `BlogPosting` node on the index) instead of a stub._ Also
    passes, but duplicates real data across pages for no reason a stub
    doesn't already serve.

- **The rendered post body (`<Content />`) is styled with bracket-syntax
  descendant variants, not a new dependency — found during implementation.**
  This scaffold has no `@tailwindcss/typography` plugin, so markdown
  headings/lists/links inside `[...id].astro` need explicit styling or they
  read as plain paragraphs. `[&_h2]:…`, `[&_h3]:…`, `[&_ul]:…`, `[&_ol]:…`,
  `[&_li]:…`, `[&_a]:…` on the `<Content />` wrapper use only `global.css`
  tokens and standard Tailwind scale values — this is bracket-syntax
  variant syntax, not an arbitrary value, so it stays inside
  `front-end-astro`'s "no arbitrary Tailwind values" rule.
  - _Discarded: a scoped `<style>` block with `:global()`._ Also
    dependency-free, but a second styling mechanism next to Tailwind
    classes for no benefit over bracket variants here.
  - _Discarded: adding `@tailwindcss/typography`._ Cleanest for a large
    prose surface, but a new dependency and a scaffold-level addition this
    spec doesn't otherwise need to make.

- **`check-seo.mjs`'s asset detection learns the Netlify Image CDN's URL
  shape — found during implementation, not blog-specific.** `@astrojs/netlify`
  rewrites a local `<Image>` asset to `/.netlify/images?url=<path>&w=…&h=…`
  by default. `pathKind()` classifies a URL by its path's file extension;
  `/.netlify/images` has none, so it was misread as a page URL, and
  `url-resolves` then failed looking for a `.netlify/images/index.html` or
  `.netlify/images.html` that will never exist. This is the first page in
  the scaffold to use `<Image>` with a local asset, so nothing surfaced it
  before spec 09. `pathKind()` and `resolveInDist()` (`harness/check-seo.mjs`)
  now special-case a `/.netlify/images` pathname: treat it as an asset and
  resolve/probe the file named by its `url=` query parameter instead of the
  literal `/.netlify/images` path. No new rule is added (**Scope → Out**
  still holds — this fixes `url-resolves`'/`asset-missing`'s existing
  general-purpose asset detection, not a blog-specific rule), and the fix
  benefits every future page that uses `<Image>` with a local asset, not
  just the blog's.
  - _Discarded: `netlify({ imageCDN: false })` in `astro.config.mjs`._ Also
    fixes it, but changes build/runtime image behavior scaffold-wide (every
    project loses on-the-fly CDN resizing), a much bigger change than
    teaching one check script about one URL shape it already has the
    concept ("asset") for.
  - _Discarded: relaxing the acceptance criterion instead of fixing the
    bug._ Ships spec 09 with a known-failing generic check against its own
    pages, and leaves every future page that uses `<Image>` with a local
    asset to hit the same false failure.

- **Rebuilt with `front-end-astro`, not ported file-for-file.** Aguilar's
  blog pages depend on components (`CardHeroTyped`, `CtaBanner`,
  `MarkdownPostLayout`, `Prose`) that don't exist here and don't follow
  this scaffold's conventions (`perpage/<page>/`, no arbitrary Tailwind
  values, tokens from `global.css`). Only the _logic_ is ported: the
  collection shape, `posts.ts`, the `id`-not-filename rule, and the llms
  leaf pattern.
  - _Discarded: porting Aguilar's components as literally as possible._
    Faster, but bakes an outside visual style into every future client
    that installs this module, and none of those components pass this
    scaffold's own conventions review.

- **`EXTRA_SECTIONS` becomes a re-export, not an inline computation.**
  `export { EXTRA_SECTIONS } from '@/utils/llmsBlogSections';` is the one
  line the patch writes; the actual async post-list computation lives in
  the module's own file. This is the answer to the problem spec 08
  explicitly left open ("how the blog module's dynamic post list actually
  reaches `EXTRA_SECTIONS`... within a single replaced line").
  - _Discarded: an inline IIFE with a dynamic `import()` in the patched
    line itself._ Works, but is a much less readable single line, and
    buries real logic inside what is supposed to be a thin wiring point.

- **The blog's JSON-LD generators live in the module's own
  `src/config/blogSeo.ts`, not patched into the core `src/config/seo.ts`.**
  `seo.ts` has no extension-point marker, and the one-line patch mechanism
  cannot insert whole new functions. `blogSeo.ts` reuses the core's already
  -exported `generateBusinessRef()`, so nothing in `seo.ts` needs to change
  or gain a marker.
  - _Discarded: adding a `seo.ts` extension point for new generators._
    A bigger mechanism change than this spec needs; nothing else is
    waiting to reuse it yet.

- **No individual author on `BlogPosting`.** `authorBio.ts` ships empty in
  a clean scaffold; requiring a per-post author would mean inventing one,
  which this codebase's conventions (and `AGENTS.md`'s "nothing the brief
  doesn't answer gets invented" rule for the light lane) rule out doing
  silently. `publisher` (the business, via `generateBusinessRef()`) is
  enough for a v1 `BlogPosting`.
  - _Discarded: a new `authorSlug` frontmatter field resolved against
    `authorBio.ts`, failing the build if absent._ Real, but adds a hard
    requirement with nothing behind it yet — a later spec can add it once
    a client actually has named blog authors.

- **No automatic navigation patch.** Investigated during this spec's own
  design: `add-module.sh`'s existing-line guard (spec 08) aborts unless the
  line after a marker equals either the untouched core value or the
  patch's own `insert` — and a client's `navigation.ts` is almost always
  already customized (real pages added) by the time they install a module,
  since the module gets added _after_ the site exists. An automatic "Blog"
  link patch would abort on nearly every real install, so it buys little
  over a documented manual edit while still costing a new extension point,
  a core-file reformat (collapsing `MainNavigation` onto one line, the way
  `EXTRA_SECTIONS` already is) and a `harness/modules/README.md` registry
  row.
  - _Discarded: adding the `main-navigation` extension point anyway, to
    at least cover the clean-scaffold case._ The failure mode (abort on
    almost every real install) makes it more surface than it's worth for a
    case that rarely applies.

- **`readingTime.ts` is deleted, not wired in, in this same spec** — by
  explicit instruction: it will be replaced by an updated version in a
  later spec, so wiring the current one into the blog post page now would
  mean building UI around code about to be replaced. Its three
  dependencies (`reading-time`, `mdast-util-from-markdown`,
  `mdast-util-to-string`) go with it, since nothing else uses them — a
  clean scaffold otherwise ships dependencies with no caller.
  - _Discarded: leaving `readingTime.ts` in place, unused, for the future
    spec to pick up._ It already had no caller before this spec (the plan
    flagged it as scaffold-04 leftover); shipping the blog post page
    without wiring it in would leave it exactly as orphaned as it is
    today, so deleting it now and re-adding an updated version later is no
    more work than leaving it and is one fewer stale file in the
    meantime.

- **`lint-customization.sh` gains `*.md` on its existing `--include`
  flags, not a new marker function.** The placeholder post's `[CLIENTE]`
  strings are already exactly the pattern the existing marker catches —
  the only gap was that markdown files were never in its scan scope.
  - _Discarded: a blog-specific marker (e.g. matching the post's slug)._
    Redundant with the marker that already exists and already does the
    job, once it can see `.md` files at all.

- **`harness/modules/blog` is excluded from `astro check` via `tsconfig.json`,
  discovered during implementation.** `tsconfig.json`'s `include: ["**/*"]`
  makes `pnpm check` (and therefore `pnpm verify`) type-check the module's
  template files against this repo's own `src/content.config.ts`, which has
  no `blog` collection — `posts.ts`'s `getCollection("blog")` fails with
  "does not satisfy the constraint 'never'". Adding `"harness/modules"` to
  `exclude` (next to `"dist"`) fixes it without touching the module's own
  files; `astro build` never reads `harness/modules` anyway, so nothing
  about the build changes. The module's real type shape is still verified
  for real once it's installed into a target project (Acceptance criteria,
  "Mechanism probe").
  - _Discarded: a second, module-scoped `tsconfig` for `init.sh`'s `astro
check` to use instead._ Works, but adds a config file to maintain for a
    one-line `exclude` fix.
  - _Discarded: `// @ts-nocheck` in each module file._ Would ship into every
    client project that installs the module, silently hiding real type
    errors there.

- **One module owns `src/content.config.ts` — a real, named limitation.**
  The file-copy step is skip-if-exists (spec 08), so a second future
  module that also needs a content collection cannot cleanly add its own
  collection to a `content.config.ts` this module already placed; it would
  have to hand-merge. Not a problem today (this is the only collection any
  module defines), but worth naming now rather than discovering it cold
  when a second content-bearing module is designed.
  - _Discarded: designing a merge strategy for `content.config.ts` now._
    No second module exists yet to merge with; solving it here would be
    speculative.

- **A real placeholder image ships with the module**
  (`post-de-ejemplo.webp`), not a broken reference. `image()` is a
  build-time Zod helper that resolves and processes an actual file —
  unlike every other placeholder in this scaffold (the logo, the
  og-image), which are deliberately-broken paths flagged by check-seo's
  `asset-missing` warning. A broken `image()` reference would fail
  `pnpm build` outright, not just warn.
  - _Discarded: keeping the field optional and shipping the post with no
    image._ Changes the schema's shape from what Aguilar has (`image()` is
    required there), and cards look meaningfully different with and
    without a cover image — better to prove the real path works.

## Acceptance criteria

All probes run in a disposable temp copy of the scaffold, outside this
repo, deleted after use. `git status --short` in this repo must be empty
when done, except for the files this spec's own diff touches.

**Source shape (this repo)**

- [x] `harness/modules/blog/patch.json` exists, is valid JSON, and its one
      entry has `point: "llms-extra-sections"`, `file: "src/utils/llms.ts"`
      and the exact `insert` line quoted under **Files affected**.
- [x] `find harness/modules/blog/src -type f` lists exactly: `content.config.ts`,
      `content/blog/post-de-ejemplo.md`,
      `content/blog/images/post-de-ejemplo.webp`, `utils/posts.ts`,
      `utils/llmsBlogSections.ts`, `config/blogSeo.ts`,
      `pages/blog/index.astro`, `pages/blog/[...id].astro`,
      `pages/llms/[id].txt.ts`, `components/perpage/blog/PostCard.astro`.
- [x] `grep -cE "from [\"']astro/zod[\"']" harness/modules/blog/src/content.config.ts`
      prints `1` (either quote style — this repo's Prettier default is double
      quotes); `grep -c 'astro:content' harness/modules/blog/src/content.config.ts`
      prints `1` (only `defineCollection`, never `z`).
- [x] `grep -c '\[CLIENTE\]' harness/modules/blog/src/content/blog/post-de-ejemplo.md`
      prints at least `2` (title and description).
- [x] `test -x` is not required, but `file harness/modules/blog/src/content/blog/images/post-de-ejemplo.webp`
      reports a real image, not a zero-byte or text file.
- [x] `test -f src/utils/scripts/readingTime.ts` fails (deleted).
- [x] `grep -cE 'reading-time|mdast-util' package.json` prints `0`.
- [x] `grep -c "include='\*.md'" harness/lint-customization.sh` prints at
      least `2` (both `marker()` and `marker_src_except()`).
- [x] `AGENTS.md`: `grep -c 'a future blog' AGENTS.md` prints `0`;
      `grep -c 'specs/09-blog-module.md' AGENTS.md` prints at least `1`.

**Mechanism probe** (temp copy of this repo's scaffold at current `HEAD`
as the `add-module` target, same shape as spec 08's own probes)

- [x] `pnpm install` on the target succeeds (regenerated lockfile).
      `grep -cE 'reading-time|mdast-util-from-markdown|mdast-util-to-string'
    pnpm-lock.yaml` prints `0` — the three packages this spec removes are
      gone. (`mdast-util-to-hast` is a different package, pulled in
      transitively by Astro/Shiki regardless of this spec, and legitimately
      stays in the lockfile — a bare `mdast-util-*` pattern would false-fail
      on it; found during implementation.)
- [x] `ADD_MODULE_SOURCE=<this checkout> add-module.sh blog <target>` exits
      `0`. In `<target>`:
  - every file from the module's `src/` tree exists at the matching path;
  - `src/utils/llms.ts`'s `EXTRA_SECTIONS` line equals the patch's
    `insert` value;
  - `MODULES.md` names `blog` and this checkout's short SHA.
- [x] `pnpm build` succeeds. In `dist/`:
  - `dist/blog/index.html` and `dist/blog/post-de-ejemplo/index.html`
    exist;
  - `dist/llms/post-de-ejemplo.txt` exists, and its `URL:` line is
    `https://example.com/blog/post-de-ejemplo/` (id, not filename);
  - `dist/llms.txt` has a `## Blog` section linking
    `/llms/post-de-ejemplo.txt`;
  - `dist/blog/index.html` contains one `<script type="application/ld+json">`
    with `"@type":"Blog"`, and `dist/blog/post-de-ejemplo/index.html`
    contains one with `"@type":"BlogPosting"` and no `"author"` key.
- [x] `node harness/check-seo.mjs --dist dist` exits `0` — the generic
      rules (title/description, canonical-self, jsonld-id-resolves,
      llms-links-resolve, breadcrumb-shape, deprecated-type) all pass
      against the blog pages with no blog-specific rule added.
- [x] `harness/lint-customization.sh` (run from the target) reports the
      placeholder post's `[CLIENTE]` strings; `harness/lint-customization.sh --strict`
      exits `1` because of them.
- [x] **Idempotent re-run.** Running the same `add-module.sh blog <target>`
      again exits `0`, changes no file, and `MODULES.md` still has exactly
      one line for `blog`.
- [x] Delete the target copy.

**Gate**

- [x] `pnpm verify` exits `0` on this repo's spec branch (the scaffold
      itself ships no blog — nothing here changes what a clean clone
      builds, beyond the dependency removal).
- [x] `git status --short` and `git diff dev --name-only`, together, list
      only these files:
  - `harness/modules/blog/patch.json`
  - `harness/modules/blog/src/content.config.ts`
  - `harness/modules/blog/src/content/blog/post-de-ejemplo.md`
  - `harness/modules/blog/src/content/blog/images/post-de-ejemplo.webp`
  - `harness/modules/blog/src/utils/posts.ts`
  - `harness/modules/blog/src/utils/llmsBlogSections.ts`
  - `harness/modules/blog/src/config/blogSeo.ts`
  - `harness/modules/blog/src/pages/blog/index.astro`
  - `harness/modules/blog/src/pages/blog/[...id].astro`
  - `harness/modules/blog/src/pages/llms/[id].txt.ts`
  - `harness/modules/blog/src/components/perpage/blog/PostCard.astro`
  - `src/utils/scripts/readingTime.ts` (deleted)
  - `package.json`
  - `pnpm-lock.yaml`
  - `harness/lint-customization.sh`
  - `harness/check-seo.mjs`
  - `tsconfig.json`
  - `AGENTS.md`
  - this spec

## Implementation plan

1. Create `feature/09-blog-module` from `dev`. `/spec-impl` does this per
   `specs/.spec-config.yml`. Confirm `git status` is clean.
2. Delete `src/utils/scripts/readingTime.ts`; remove `reading-time`,
   `mdast-util-from-markdown` and `mdast-util-to-string` from
   `package.json`; run `pnpm install`. Confirm `pnpm build` still succeeds.
3. Write `harness/modules/blog/src/content.config.ts` and
   `src/utils/posts.ts`.
4. Write `harness/modules/blog/src/content/blog/post-de-ejemplo.md` and its
   placeholder image.
5. Write `harness/modules/blog/src/utils/llmsBlogSections.ts` and
   `harness/modules/blog/src/config/blogSeo.ts`.
6. Write `harness/modules/blog/src/pages/llms/[id].txt.ts`.
7. Build `harness/modules/blog/src/pages/blog/index.astro`,
   `blog/[...id].astro` and `components/perpage/blog/PostCard.astro` —
   `front-end-astro` for the markup, then `seo-guide-lines` for
   `generatePageSEO()`, breadcrumbs and the `JsonLd.astro` placement, per
   AGENTS.md's "Order per page."
8. Write `harness/modules/blog/patch.json`.
9. Edit `harness/lint-customization.sh`'s `--include` flags.
10. Apply the two `AGENTS.md` wording fixes.
11. Run the mechanism probe end to end (install into a temp target, build,
    `check-seo`, `lint-customization.sh`, idempotent re-run). Delete the
    temp target afterward.
12. Run `pnpm verify` on this repo's branch.
