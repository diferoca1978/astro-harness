# 05 — check-seo

**Status:** Implemented <!-- Draft | Approved — only a human may change this to Approved -->

## Goal

Add `harness/check-seo.mjs`, a zero-dependency Node script that checks the
HTML a site actually publishes (the build with `--dist`, the live site with
`--url`) against universal SEO rules, and make it step 3 of `pnpm verify` so
that a structural error fails the gate. Today nothing reads the output:
`astro build` exits 0 on a home page with no `<title>` and no description
(Engram #517, #519), and the scaffold's `/home/` canonical reached live
client sites (Engram #502).

What the rules find in today's build (`pnpm build` on `dev` at `625f3e0`,
2026-09-26):

- `dist/index.html` passes every structural rule:
  - one canonical, `https://example.com/`;
  - one `<meta name="robots">`;
  - JSON-LD that parses, with a `publisher` `@id` that resolves to the
    Organization on the same page.
- `dist/index.html` also has two kinds of customization finding, both
  deliberate:
  - placeholder text: `[CLIENTE]`, `My Website`, `example.com` and
    `Nueva web app` (the hero `<h1>`);
  - asset URLs with no file behind them, because `public/` does not exist:
    `/images/logo.svg` and `/images/og-image.png` (in the JSON-LD,
    `og:image` and `twitter:image`), plus `/favicon.svg` and `/favicon.ico`.
- `dist/404.html` is 0 bytes, because `src/pages/404.astro` is empty. The
  planned spec 06 decides what the 404 gets.

These are the real defects the checker is tested against:

- **`d685d93`**, the last `dev` commit before spec 04. It builds a home page
  with:
  - the canonical `https://tuagencia.com/home/`;
  - two robots metas;
  - `ProfessionalService` and `SearchAction` (spec 04, **Goal**).
- **Shine's live site.** Two blog posts emit a FAQPage whose questions are
  not in the HTML at all.
  - `PostLayout.astro:64-68` builds the schema from the frontmatter `faqs:`
    and never renders them. This was checked read-only on 2026-09-26
    (Engram #536).
  - The questions are missing from the HTML, not hidden with CSS, so a text
    check can see them.
- **A client site whose canonical is `/home/`,** which returns 404. It is
  the first row of the table in `~/harness-notes/2026-09-24-jsonld-shine-scaffold.md`
  §4. This spec does not name the client, because `specs/` ships with every
  clone.

## Scope

**In:**

- `harness/check-seo.mjs` (new):
  - two input modes, `--dist <dir>` and `--url <origin>`, that feed one rule
    set through a shared page model;
  - 15 rules with stable ids and two severities (the table is under **Files
    affected**);
  - three flags:
    - `--strict`: warnings count as errors;
    - `--report`: always exit 0, except on usage errors;
    - `--site <origin>`: overrides the origin in `--dist`;
  - usage, rules and limits documented in its header comment.
- `init.sh`: a new step `[3/4]` runs the script on `dist/` and passes
  `--strict` through. The lint becomes `[4/4]`.
- `AGENTS.md`: the Commands block, the harness paragraph that repeats what
  `verify` runs, and the legacy-adaptation paragraph (what
  `install-harness.sh` copies).
- `CHECKPOINTS.md`: a new §5, "`pnpm verify --strict` passes".
- `agents/coder.md:83` and its two generated copies: the list of what
  `verify` runs becomes a pointer to `AGENTS.md` § Commands.
- `~/scripts/install-harness.sh` (outside the repo, not versioned): copies
  the script into the legacy project.

**Out:**

- **The rule "no physical location, no address"** belongs to the planned
  spec 06, because it depends on the core.
- **The rule "`llms.txt` links resolve"** belongs to the planned spec 07.
- **What the 404 contains.** The planned spec 06 decides. Until then, an
  empty `404.html` produces one warning.
- **A lowercase or trailing-slash policy.** The URL helper in the planned
  spec 06 sets it. This spec only compares a URL with the canonical of the
  page it leads to.
- **Fetching external URLs** (`sameAs`, social profiles). Many networks
  answer 403 or 429 to bots.
- **Wiring the script into a legacy project's `pnpm verify`.** Each
  project's migration spec does that (plan §4.A.3).
- **Running `--url` over the 8 maintained projects.** That is plan step 9.
- **Fixing what the live runs find.** Shine's defects go to its spec 11, and
  the user fixes the broken canonicals repo by repo.
- **Schema.org vocabulary validation** (unknown properties, wrong value
  types) **and rich-result eligibility.** The Schema Markup Validator and
  the Rich Results Test stay the tools for that, and the `seo-guide-lines`
  skill already says so.
- **Whether the data is true, and text hidden with CSS or with the `hidden`
  attribute.** The script reads markup, not styles, and it does not judge
  what an interaction reveals.
- **The `X-Robots-Tag` header.** `noindex` is read only from
  `<meta name="robots">`.
- **Committed test fixtures.** The probe pages live in a temp dir (see
  **Decisions made and discarded**).
- **A machine-readable report** (`--json`). Nothing consumes one yet.
- **`coder.md`'s "if practical" and the model drift from `625f3e0`.** The
  first contradicts on-demand `verify` and was flagged in spec 03. The
  second is recorded in Engram #531. This spec edits only the parenthetical
  on that line, and the two hand-edited `model:` lines stay as they are.
- **A `check:seo` script in `package.json`.**

## Files affected

- **`harness/check-seo.mjs`** (new)
  - **Runtime:** Node 22 or later. It uses only `node:` built-ins and the
    global `fetch`, and adds nothing to `package.json`.
  - **CLI:**

    ```
    node harness/check-seo.mjs --dist <dir> [--site <origin>] [--strict] [--report]
    node harness/check-seo.mjs --url <origin> [--strict] [--report]
    ```

    Exactly one of `--dist` and `--url` must be given.

  - **Exit codes:**
    - `0`: no errors.
    - `1`: at least one error. With `--strict`, warnings count as errors.
    - `2`: a usage error or input that cannot be read. That covers:
      - a missing `<dir>`;
      - no sitemap and no `--site`;
      - a sitemap that cannot be fetched;
      - page `<loc>`s with more than one origin and no `--site`.
    - `--report` turns `1` into `0`. It never hides `2`.
  - **Output:** plain text, grouped by page (the file path in `--dist`, the
    URL in `--url`).
    - Each finding is one line with its severity, rule id and message.
    - A final line gives the page count, the errors and the warnings.
  - **Page model:**
    - Each page is `{ url, status, html }` plus its kind:
      - `404`: `dist/404.html`, in `--dist` only;
      - `noindex`: its `<meta name="robots">` content includes `noindex`;
      - `indexable`: every other page.
    - The rules see only this model, so they do not know which mode fed
      them.
    - An empty `404.html` gets `404-empty` and no other rule.
  - **`--dist` input:**
    - **Pages:** every `*.html` under `<dir>`.
    - **A page's own URL:**
      - `index.html` → `<origin>/`;
      - `<path>/index.html` → `<origin>/<path>/`;
      - any other `<name>.html` → `<origin>/<name>`.
    - **Sitemaps:**
      - read `<dir>/sitemap-index.xml`, or `<dir>/sitemap.xml` if there is
        no index;
      - follow each child `<loc>` to its local file by pathname. For
        example, `https://example.com/sitemap-0.xml` becomes
        `<dir>/sitemap-0.xml`.
    - **Origin:** taken from the page `<loc>`s in the child sitemaps.
      `--site` overrides it.
    - **Resolving a same-site URL:** decode its pathname, then:
      - it ends in `/` → `<dir><path>index.html`;
      - it ends in `.html` → that file;
      - it has no extension → `<dir><path>/index.html`, then
        `<dir><path>.html`;
      - it has any other extension → that file, which is an asset.

      The lookup is case-sensitive, like the host.
  - **`--url` input:**
    - **Sitemaps:** the `Sitemap:` lines of `<origin>/robots.txt`. If there
      are none, `<origin>/sitemap-index.xml`, then `<origin>/sitemap.xml`.
      Sitemap indexes are followed.
    - **Pages:** every page `<loc>`, fetched with GET. A page's own URL is
      its `<loc>`.
    - **Other same-site URLs:** each is requested once.
      - Pages use GET, because the rules need their canonical.
      - Assets use HEAD, and fall back to GET on a 405 or 501.
    - **Requests:**
      - `redirect: 'manual'`;
      - 4 at a time;
      - a 10 s timeout;
      - `User-Agent: astro-harness-check-seo`.

      A timeout or a network error counts as a failed request for that URL.
  - **URLs the rules look at:**
    - **From the HTML:**
      - `<a href>`, `<img src>`;
      - `<link rel="canonical">`, and any `<link>` whose `rel` contains
        `icon`;
      - `og:url`, `og:image` and `twitter:image`.
    - **From JSON-LD:**
      - every string that starts with `http://` or `https://`, except values
        under `@context` and `@id`, and except schema.org URLs;
      - every string that starts with `/` under `url`, `item`, `logo`,
        `image` or `sameAs`.
    - **From the sitemap:** every page `<loc>`.
    - **Same-site** means the same hostname as the origin, ignoring the
      scheme and a leading `www.`. Every other URL is external.
    - A same-site URL is a **page** if its path has no extension or ends in
      `.html`. Any other extension makes it an **asset**.
  - **Rules** (with `--strict`, every warning becomes an error):

    | Id                   | Severity | What must hold                                                                                                                                                                                                                                                                                                    |
    | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `jsonld-parse`       | error    | Every `<script type="application/ld+json">` parses as JSON and declares a schema.org `@context`. Each top-level node (or `@graph` member) has a `@type`.                                                                                                                                                          |
    | `jsonld-id-resolves` | error    | Every reference node points to an `@id` that a typed node defines in a JSON-LD block of the same page. A reference node is an object whose only key is `@id`.                                                                                                                                                     |
    | `jsonld-noindex`     | error    | `noindex` pages and the 404 carry no JSON-LD.                                                                                                                                                                                                                                                                     |
    | `title-description`  | error    | Every page has exactly one non-empty `<title>` and exactly one non-empty `<meta name="description">`. The 404 needs only the title.                                                                                                                                                                               |
    | `canonical-self`     | error    | An indexable page has exactly one `<link rel="canonical">`, and it equals the page's own URL. A noindex page may have none, but if it has any, it has exactly one and it equals the page's own URL. The 404 has none.                                                                                             |
    | `robots-single`      | error    | A page has at most one `<meta name="robots">`.                                                                                                                                                                                                                                                                    |
    | `url-resolves`       | error    | A same-site page URL leads to a page. In `--dist` that means a file. In `--url` it means a 200 with no redirect.                                                                                                                                                                                                  |
    | `url-canonical-form` | error    | A same-site page URL that resolves equals the canonical of the page it leads to, ignoring the `#fragment`. If that page has no canonical, or its canonical fails `canonical-self`, it equals the page's own URL, so a broken canonical is reported once, on its own page. A relative URL in JSON-LD always fails. |
    | `faq-visible`        | error    | The `name` of every `Question` in a `FAQPage` appears in the page's visible text.                                                                                                                                                                                                                                 |
    | `breadcrumb-shape`   | error    | A `BreadcrumbList` has at least 2 items, and the home page (`/`) has none.                                                                                                                                                                                                                                        |
    | `asset-missing`      | warning  | A same-site asset URL exists. In `--dist` that means a file. In `--url` it means a 2xx.                                                                                                                                                                                                                           |
    | `placeholder-text`   | warning  | The HTML contains none of `[CLIENTE]`, `example.com`, `My Website`, `My Site`, `Nueva web app`, `tuagencia` or `lorem ipsum`. Only `lorem ipsum` is matched in any case.                                                                                                                                          |
    | `404-empty`          | warning  | `dist/404.html` is not empty, meaning it is not 0 bytes and not only whitespace. `--dist` only.                                                                                                                                                                                                                   |
    | `deprecated-type`    | warning  | No node has the `@type` `ProfessionalService`, `SearchAction` or `HowTo`.                                                                                                                                                                                                                                         |
    | `external-url-http`  | warning  | Every external URL in the JSON-LD uses `https:`.                                                                                                                                                                                                                                                                  |

  - **Visible text**, for `faq-visible`:
    - It is the `<body>` minus its `<script>`, `<style>` and `<template>`
      elements. A `<template>`'s content is an inert fragment, not part of
      the rendered document.
    - Entities are decoded, all whitespace is removed on both sides before
      comparing, and the comparison ignores case. Text on either side of a
      tag is joined with nothing in between, so removing whitespace keeps a
      question split by `<br>` or by a block element from failing.
    - Text inside a closed `<details>` or an element with the `hidden`
      attribute counts as visible, because it is in the HTML. Both are
      usually opened by an interaction, and judging that is out of scope.
  - **Header comment:**
    - usage and the exit codes;
    - every rule id with its severity and a one-line description;
    - the limits: the script cannot tell whether the data is true, cannot
      see text hidden with CSS or with the `hidden` attribute, and does not
      replace the Rich Results Test or the Schema Markup Validator.
- **`init.sh`**
  - The header comment lists 4 steps, with
    `3. SEO check (harness/check-seo.mjs on dist/)`. Its `--strict` line
    says that `--strict` also turns SEO warnings into errors.
  - After `pnpm build`, it runs `echo "▶ [3/4] SEO check"` and then
    `node "$ROOT/harness/check-seo.mjs" --dist "$ROOT/dist" $STRICT`.
  - `[1/3]`, `[2/3]` and `[3/3]` become `[1/4]`, `[2/4]` and `[4/4]`.
    `astro check` stays step 1.
- **`AGENTS.md`**
  - Line 31 becomes
    `pnpm verify     # ./init.sh — astro check + build + SEO check + customization lint (the gate)`.
  - The Commands block gains this line:
    `node harness/check-seo.mjs --url https://<domain> --report   # SEO check of a live site, report only`.
  - Line 190: "`pnpm verify` (build + astro check + customization lint) is
    **not** run" becomes "`pnpm verify` (see **Commands**) is **not** run".
  - Lines 466–467: the pieces that `install-harness.sh` copies become
    "subagents, the spec-gate, `CLAUDE.md`, `harness/check-seo.mjs`".
- **`CHECKPOINTS.md`**: a new last section.

  ```markdown
  ## 5. Strict gate passes (only if step 1 is done)

  - [ ] `pnpm verify --strict` exits 0: no placeholder text, no missing
        assets (logo, og-image, favicons), a non-empty 404 and no
        deprecated schema types.
  ```

- **`agents/coder.md:83`**
  - "(build + astro check + customization lint)" becomes
    "(what it runs: `AGENTS.md` § Commands)".
  - `bash harness/bind-runtime.sh opencode` then regenerates
    `.opencode/agent/coder.md`.
  - `.claude/agents/coder.md:84` gets the same edit by hand. Running
    `bind-runtime.sh claude-code` would also revert the hand-edited
    `model:` lines from `625f3e0` in `coder.md` and `spec-verifier.md`
    (Engram #531). This was reproduced in a scratch copy on 2026-09-26.
- **`~/scripts/install-harness.sh`** (outside the repo)
  - After the "Spec gate" block, it gets its own heading and one line:
    `copy_file "$HARNESS_SOURCE/harness/check-seo.mjs" "$TARGET/harness/check-seo.mjs"`.
  - The line inherits `copy_file`'s behavior: it skips an existing file
    unless `--force` is given.

**Unchanged on purpose:**

- `harness/lint-customization.sh`. Its markers overlap with
  `placeholder-text`, but it reads the source and runs before a build, where
  the checker cannot.
- `package.json` and `pnpm-lock.yaml`. Nothing is added: no dependency and
  no script.
- `~/scripts/setup-client-project.sh`. The script ships with every clone on
  purpose, because it is part of the client's `pnpm verify`. It is not
  builder-only tooling, so the contamination rule does not remove it.
- `harness/README.md`, which only documents agent generation.
- `.claude/skills/seo-guide-lines/`. It already sends the agent to the Rich
  Results Test and the Schema Markup Validator.

**Match against `AGENTS.md`'s "If you change X → update Y" table:**

- "Change a workflow skill or agent": the `coder.md` edit triggers it. The
  sections its Update cell names do not list the steps of `verify`, so they
  need no edit.
- "Add or change a subagent role, its tier…": not triggered. No role, tier
  or runtime changes, and only opencode is regenerated.
- "Add a dependency": not triggered, because the script has no
  dependencies.
- No row covers the gate's own tooling (`init.sh` and `harness/`, in the
  Invariant column). This spec adds none: the rules are documented once, in
  the script header, so there is no second copy to keep in sync.

## Decisions made and discarded

The reasoning for the round is in Engram #535 (block 1), #536 (Shine's FAQ)
and #537 (blocks 2 to 5).

- **Zero dependencies.** The script has a minimal tag and attribute reader
  of its own. Copying it to a legacy project means copying one file. Every
  site is Astro, so the HTML is predictable. This matches plan decision 3:
  a script, not a package (Engram #505).
  - _Discarded: `parse5` or `node-html-parser`._ Every clone would inherit
    the dependency, and `install-harness.sh` would have to add it to each
    legacy project's `package.json`.

- **Both modes in this spec, over one page model.** The rules see
  `{ url, status, html }` and never the mode, so each mode is only an input
  adapter.
  - The defects that set the bar only show in production: the camelCase
    301s from Aguilar's spec 13, and a canonical that returns 404.
  - _Discarded: `--dist` now and `--url` in a later spec._ The rules would
    not be tested against those defects, and the script would have to be
    reopened.

- **Two severities, split by class.**
  - Structural rules are always errors.
  - Customization findings (placeholder text, missing assets, the empty 404) and advisories are warnings. `--strict` makes them errors, which
    is the same policy as `lint-customization.sh`.
  - The new `CHECKPOINTS.md` §5 makes `--strict` the pre-production gate,
    so a broken `og:image` does not reach a live site.
  - _Discarded: placeholder assets in `public/`._ A placeholder image could
    ship unnoticed, because the lint cannot recognize a PNG or an ICO by its
    content.
  - _Discarded: everything is an error._ `pnpm verify` would fail from the
    first clone, which is what happened with PR #11.

- **The `--dist` page set is every `.html` file, and the 404 has its own
  rules.** The script checks what is actually published.
  - The 404 has no canonical and no JSON-LD, and it needs a title (#519).
  - An empty `404.html` gives one warning until the planned spec 06 gives
    it a layout.
  - _Discarded: only the pages in the sitemap._ A page that is not in the
    sitemap would never be checked.
  - _Discarded: skipping the 404 until spec 06._ Spec 06 would have to
    reopen the checker to add the 404 rules.

- **The origin comes from the page `<loc>`s, reached through the sitemap
  index.** The user corrected the first proposal: the `<loc>` in
  `sitemap-index.xml` is a sitemap (`sitemap-0.xml`), not a page.
  - Mixed origins are a usage error unless `--site` is given.
  - In `--url`, sitemaps are discovered through `robots.txt` first, because
    legacy projects do not always use Astro's file names.
  - _Discarded: `site:` from `astro.config.mjs`._ That ties the script to
    the config's shape, and it does not work on a bare legacy `dist/`.
  - _Discarded: a mandatory `--site`._ `init.sh` would have to repeat the
    domain.
  - _Discarded: taking the origin from the canonical._ That hides exactly
    the `d685d93` bug, where the canonical pointed to `tuagencia.com`.

- **Canonical form means "equal to the target's canonical".** This spec
  sets no lowercase or trailing-slash policy, because that belongs to the
  URL helper in the planned spec 06.
  - External URLs are checked only for syntax.
  - _Discarded: fixing lowercase and the trailing slash now._ It would get
    ahead of spec 06.
  - _Discarded: fetching external URLs in `--url`._ Social networks answer
    403 or 429 to bots, so every run would have false errors.

- **Page or asset is decided by extension.** For example, the `/servicios/*`
  pages that do not exist are errors, while the scaffold's `logo.svg` is a
  warning.
  - _Discarded: deciding by context_ (`og:image` means asset, `<a href>`
    means page). It needs more rules, and an `<a href>` to a PDF would
    count as a page.

- **Counts.**
  - An indexable page has exactly 1 canonical.
  - A page has at most 1 robots meta.
  - A noindex page has no JSON-LD.
  - Every page has a title and a description, except the 404.
  - _Discarded: exactly one robots meta everywhere._ The scaffold would
    pass, because `astro-seo` always emits one. Legacy sites without the
    tag would get false errors, and a missing tag is valid (it means
    `index`).

- **The placeholder patterns are a constant in the script.** The lint reads
  the source and the checker reads published HTML. The checker also has to
  work in legacy projects that have no lint.
  - _Discarded: a shared `harness/placeholders.txt`._ Both scripts would
    need changes, and legacy projects would need two copied files.

- **Network policy for `--url`.**
  - Redirects are not followed.
  - 4 requests run in parallel, with a 10 s timeout.
  - _Discarded: one request at a time._ The sites are small landings, so
    parallelism saves seconds, not load.
  - _Discarded: following redirects and only warning._ That turns the very
    production case that justifies `--url` into a warning.

- **Step `[3/4]`, exit codes 0/1/2, and the docs in the script header.**
  `AGENTS.md` only updates Commands and the two places that restate them.
  - With `set -e`, an SEO error stops `init.sh` before the lint. The lint
    output is lost on that run, but not the failure.
  - _Discarded: also adding `pnpm check:seo`._ It would be one more file to
    touch, for a command that `pnpm verify` already runs.

- **The evidence is reproducible, plus one live run.**
  - `d685d93` is built in a git worktree, which can be reproduced forever.
  - Synthetic probe pages cover the other defect shapes, with no client
    data.
  - Shine and the client with the `/home/` canonical get one live
    `--url --report` run each. It is recorded as evidence, not as a
    pass/fail criterion, because those sites are going to be fixed.
  - _Discarded: criteria against the live sites._ They could not be re-run
    once the sites are fixed.
  - _Discarded: probes only._ Probes written by the rule designer tend to
    pass.

- **The probes are not committed.** Everything committed ships to every
  client clone (the contamination rule, plan §4).
  - The cost is that a later change to the rules has to rebuild the probes
    from the table in **Acceptance criteria**.
  - _Discarded: `harness/fixtures/`, plus an `rm -rf` in
    `setup-client-project.sh`._ That is two files with no automated link
    between them, for probes that only verify this spec.

- **The live-run output is recorded outside the repo,** in the plan doc. It
  names a client and that client's defects, and `specs/` ships with every
  clone.

- **Shine's hidden FAQ can be detected** (Engram #536). The questions are
  missing from the HTML, not hidden with CSS. This resolves the plan's
  question 3. The limit (CSS and the `hidden` attribute) still stands for
  other sites.

- **`faq-visible` excludes only `<script>`, `<style>` and `<template>`.**
  The `hidden` attribute counts as present. The user raised this after
  reading the first draft, which also excluded `hidden`.
  - It does not affect the GSAP anti-FOUC pattern. That pattern hides with
    `autoAlpha: 0` (`opacity` and `visibility`, which are CSS). The `hidden`
    attribute means `display: none`, which leaves ScrollTrigger nothing to
    measure and which `autoAlpha` never changes.
  - The rule checks questions, not answers. An accordion that hides its
    answers with `hidden` does not trip it.
  - _Discarded: treating `hidden` as not visible._ A vanilla "show more
    questions" button or a set of tabs can leave real questions in a
    `<div hidden>` that JS opens. That would be a false positive, because
    Google indexes tab and accordion content. The rule exists for questions
    that are not in the HTML at all, which is Shine's case.

- **`coder.md` gets a pointer, not an updated list.** The list of what
  `verify` runs lives once, in `AGENTS.md` § Commands. The duplicate in
  `coder.md` went stale in this change, and it would go stale again with the
  next step.
  - _Discarded: leaving the line stale and listing it under **Out**._ That
    breaks the rule that the contract is updated in the same change.
  - _Discarded: resolving the tiers here_ (coder → `deep`, spec-verifier →
    `standard`). It is a model decision that also changes opencode, which is
    outside this spec.

- **`install-harness.sh` only copies the script.** Wiring it into each
  legacy project's `verify` belongs to that project's migration spec.

- **Proposed in this draft, not asked in the round.** Review these:
  - Same-site means the same hostname, ignoring the scheme and a leading
    `www.`. That way `http://` or a `www.` mismatch on the client's own
    domain fails `url-canonical-form` instead of passing as external.
  - `@id` values are left out of the URL rules. They are identifiers, and
    `jsonld-id-resolves` already checks them.
  - `external-url-http` is a warning. An `http:` profile link is not a
    structural break.
  - `--dist` falls back to `sitemap.xml`, the same as `--url`.
  - `--url` does not check the 404, because it is not in the sitemap.

- **Amended during implementation** (2026-09-26, decided by the user):
  - The clean scaffold also has `Nueva web app`, the hero `<h1>`. The
    rule table already listed that pattern, but **Goal** and the
    clean-scaffold criterion missed it.
  - `faq-visible` removes all whitespace before comparing. Joining text
    across tags with nothing in between made a question split by `<br>`
    fail, and the rule is an error, so a false positive breaks the gate.
    _Discarded:_ a space at block tags (with Tailwind, a class sets
    `display`, not the tag) and the literal `textContent`.
  - `url-canonical-form` compares with the target's own URL when the
    target's canonical fails `canonical-self`. Otherwise one broken
    canonical fails every link to that page, and the sitemap `<loc>` too,
    which also contradicted the `canonical-roto` probe row. _Discarded:_
    adding the finding to the probe table, and dropping sitemap `<loc>`s
    from the rule.
  - `canonical-self` also checks a noindex page that has a canonical: it
    must have exactly one, equal to its own URL. `noindex` plus a canonical
    to another URL are contradictory signals for Google. Without this, the
    previous amendment still cascaded for such a page, because its
    canonical never failed `canonical-self`. _Discarded:_ comparing with
    the own URL for every noindex target (no rule would report the
    conflict), and the literal cascade.
  - In `--url`, a page `<loc>` on another host is not requested: fetching
    external URLs is out of scope. A note under the heading names the host.
    If no `<loc>` is on the site, the script exits `2` and names the origin
    to pass. The "more than one origin" exit applies to `--dist` only,
    because `--site` does not exist with `--url`. _Discarded:_ exiting `2`
    on any off-host `<loc>` (that stops the run on the first one), and a
    16th rule for it.
  - The `init.sh` grep criterion became `grep -cF 'check-seo.mjs" --dist'`.
    The command quoted under **Files affected** has a closing `"` after
    `check-seo.mjs`, so the original pattern could never match.
    _Discarded:_ changing the command to fit the grep.

## Acceptance criteria

The probe set, the worktree, the scratch copy and the install target are
temp dirs outside the repo, deleted after use.

- [x] Every import in `harness/check-seo.mjs` is a `node:` built-in:
  - `grep -oE "from ['\"][^'\"]+['\"]" harness/check-seo.mjs | grep -vc 'node:'`
    prints `0`;
  - `grep -cE 'require\(|import\(' harness/check-seo.mjs` prints `0`;
  - `git diff dev --quiet -- package.json pnpm-lock.yaml` exits 0.
- [x] Each of the 15 rule ids in the table appears in
      `harness/check-seo.mjs`. The header comment lists all 15 with their
      severities, plus the three limits. The header is checked by reading.
- [x] Each of these exits `2`, with or without `--report`:
  - no arguments;
  - `--dist dist --url https://example.com`;
  - `--dist /nonexistent`;
  - `--dist <an empty temp dir>`;
  - `--url http://localhost:9`.
- [x] **Clean scaffold.** After `pnpm build`,
      `node harness/check-seo.mjs --dist dist` exits `0` and reports `0`
      errors. Its only warnings are:
  - on `index.html`, `placeholder-text` (`[CLIENTE]`, `My Website`,
    `example.com`, `Nueva web app`);
  - on `index.html`, `asset-missing` for exactly `/images/logo.svg`,
    `/images/og-image.png`, `/favicon.svg` and `/favicon.ico`;
  - on `404.html`, `404-empty`.

  With `--strict` the same command exits `1`. With `--strict --report` it
  exits `0`.

- [x] **Probe set, `--dist`.** Build a temp dir `$P` shaped like a build:
  - `sitemap-index.xml` points to `sitemap-0.xml`, which lists every page
    below except `404.html` on the origin `http://localhost:8765`;
  - every page is valid (one title, one description, one canonical to
    itself and one robots `index, follow`) except for the defect planted in
    it;
  - no page contains client data or a placeholder pattern.

  `node harness/check-seo.mjs --dist $P` exits `1` and reports exactly these
  findings and no others:

  | Page                        | Planted defect                                                                                                                                          | Expected findings                                                                                                            |
  | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
  | `index.html`                | a `BreadcrumbList` with 2 items                                                                                                                         | `breadcrumb-shape`                                                                                                           |
  | `faq/index.html`            | a FAQPage with 5 questions: #1 in a `<p>`, #2 only in the JSON-LD, #3 inside a `<template>`, #4 inside a closed `<details>`, #5 inside a `<div hidden>` | `faq-visible` for #2 and #3 only                                                                                             |
  | `miga/index.html`           | a `BreadcrumbList` with 1 item                                                                                                                          | `breadcrumb-shape`                                                                                                           |
  | `canonical-roto/index.html` | the canonical `http://localhost:8765/no-existe/`                                                                                                        | `canonical-self`, `url-resolves`                                                                                             |
  | `sin-title/index.html`      | no `<title>` and no description                                                                                                                         | `title-description`                                                                                                          |
  | `noindex/index.html`        | robots `noindex`, one JSON-LD block, no canonical                                                                                                       | `jsonld-noindex`                                                                                                             |
  | `doble-robots/index.html`   | two robots metas                                                                                                                                        | `robots-single`                                                                                                              |
  | `id-colgado/index.html`     | `{"@id": "http://localhost:8765/#nadie"}`, which no node defines                                                                                        | `jsonld-id-resolves`                                                                                                         |
  | `json-roto/index.html`      | a JSON-LD block that is not valid JSON                                                                                                                  | `jsonld-parse`                                                                                                               |
  | `enlaces/index.html`        | `<a href="/no-existe/">`, `<a href="/faq">`, JSON-LD `"url": "/faq/"`, `<img src="/img/nada.png">` and JSON-LD `"sameAs": "http://perfil.test/x"`       | `url-resolves` (`/no-existe/`), `url-canonical-form` (`/faq` and the relative `/faq/`), `asset-missing`, `external-url-http` |
  | `obsoleto/index.html`       | a node with `@type: "HowTo"`                                                                                                                            | `deprecated-type`                                                                                                            |
  | `404.html`                  | none: a title, no canonical, no JSON-LD                                                                                                                 | none                                                                                                                         |

- [x] **Probe set, `--url`.** Serve `$P` with
      `python3 -m http.server 8765 --directory $P`. Then
      `node harness/check-seo.mjs --url http://localhost:8765` exits `1`.
      Its findings match the `--dist` run, with two differences:
  - `404.html` is not checked, because it is not in the sitemap;
  - `<a href="/faq">` is reported as `url-resolves`, because the server
    answers 301, instead of `url-canonical-form`.
- [x] **`d685d93`.** Create a worktree of `d685d93` in a temp dir, then run
      `pnpm install --frozen-lockfile` and `pnpm build` there. The spec
      branch's script,
      `node harness/check-seo.mjs --dist <worktree>/dist`, exits `1`. On
      `index.html` it reports at least:
  - `canonical-self`, naming `https://tuagencia.com/home/`;
  - `robots-single`;
  - `deprecated-type` for `ProfessionalService` and for `SearchAction`.

  Afterwards, `git worktree list` shows only the main worktree.

- [x] In `init.sh`:
  - `grep -cF 'check-seo.mjs" --dist' init.sh` prints `1`;
  - `grep -cE '\[[1-4]/4\]' init.sh` prints `4`;
  - `grep -c '/3\]' init.sh` prints `0`;
  - `astro check` is still step `[1/4]`.
- [x] `pnpm verify` exits `0` on the spec branch. Its output includes
      `[3/4] SEO check` and `[4/4]`.
- [x] `pnpm verify --strict` exits `1`, and the SEO step is the one that
      fails.
- [x] **Gate probe.** Undo it afterwards: `git status --short src` must be
      empty when done.
  - Set `description: ""` in `src/pages/index.astro`.
  - `pnpm verify` exits `1` at step 3, and its output names
    `title-description` on `index.html`.
  - Before that, `astro check` and `astro build` both pass, which is the
    gap Engram #517 found.
- [x] In `AGENTS.md`:
  - `grep -c 'build + astro check + customization lint' AGENTS.md` prints
    `0`;
  - `grep -c 'check-seo' AGENTS.md` prints at least `2`;
  - line 31 reads as quoted under **Files affected**.
- [x] `CHECKPOINTS.md` has a `## 5.` section, and
      `grep -c 'pnpm verify --strict' CHECKPOINTS.md` prints at least `1`.
- [x] Each of `agents/coder.md`, `.claude/agents/coder.md` and
      `.opencode/agent/coder.md` passes both checks:
  - `grep -c 'build + astro check + customization lint'` prints `0`;
  - ``grep -cF '`AGENTS.md` § Commands'`` prints `1`.
- [x] Make a throwaway copy of the working tree, without `node_modules` and
      `dist`, and give it its own `git init` and one commit. In that copy:
  - `bash harness/bind-runtime.sh opencode` changes no file;
  - `bash harness/bind-runtime.sh claude-code` changes only the `model:`
    line of `.claude/agents/coder.md` and of `.claude/agents/spec-verifier.md`.
- [x] `grep -c 'harness/check-seo.mjs' ~/scripts/install-harness.sh` prints
      at least `1`. Running it against a temp dir whose `package.json` is
      `{"dependencies":{"astro":"^7"}}` leaves `<tmp>/harness/check-seo.mjs`,
      and `cmp` against the repo's copy exits `0`.
- [x] **Live evidence.** Run `node harness/check-seo.mjs --url <site> --report`
      once against each of two sites:
  - Shine's live site (the `site` in its `astro.config.mjs`);
  - the client with the `/home/` canonical (§4 of the 2026-09-24 notes,
    first row).

  For each run, record the date, the command and the finding counts per
  rule id in `~/harness-notes/2026-09-24-plan-specs-scaffold.md`, step 3,
  under a line `Evidencia en vivo (spec 05)`. This criterion checks that the
  runs were made and recorded, not what they found.

- [x] `git status --short` and `git diff dev --name-only`, together, list
      only these files:
  - `harness/check-seo.mjs`
  - `init.sh`
  - `AGENTS.md`
  - `CHECKPOINTS.md`
  - `agents/coder.md`
  - `.claude/agents/coder.md`
  - `.opencode/agent/coder.md`
  - this spec

## Implementation plan

1. Create `feature/05-check-seo` from `dev`. `/spec-impl` does this per
   `specs/.spec-config.yml`. Confirm that `git status` is clean.
2. Write `harness/check-seo.mjs` with:
   - CLI parsing, the exit codes and the output;
   - the tag reader;
   - the `--dist` adapter: sitemaps, origin, page set, own URLs and URL
     resolution;
   - the page-level rules: `title-description`, `canonical-self`,
     `robots-single`, `placeholder-text` and `404-empty`.

   Run it on `dist/`. Nothing is wired into the gate yet.

3. Add the JSON-LD rules: `jsonld-parse`, `jsonld-id-resolves`,
   `jsonld-noindex`, `faq-visible`, `breadcrumb-shape` and
   `deprecated-type`.
4. Add the URL rules: `url-resolves`, `url-canonical-form`, `asset-missing`
   and `external-url-http`. Write the header comment. Run the script on
   `dist/` and compare with the clean-scaffold criterion.
5. Build the probe set in a temp dir. Run `--dist` on it until the findings
   match the probe table exactly.
6. Add the `--url` adapter. Serve the probe set with
   `python3 -m http.server 8765` and compare with the `--dist` findings.
   Then delete the probe dir.
7. Run the script on a `d685d93` worktree, then remove the worktree.
8. Wire step `[3/4]` into `init.sh`. Run `pnpm verify`, then
   `pnpm verify --strict`, then the gate probe, and undo the probe.
9. Apply the `AGENTS.md` and `CHECKPOINTS.md` edits.
10. Edit `agents/coder.md:83` and run `bash harness/bind-runtime.sh opencode`.
    Apply the same edit to `.claude/agents/coder.md:84` by hand. Then run
    the regeneration check in the scratch copy.
11. Add the copy line to `~/scripts/install-harness.sh` and run it against a
    temp dir.
12. Make the two live `--url --report` runs and record them in the plan doc.
