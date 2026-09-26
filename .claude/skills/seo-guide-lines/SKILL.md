---
name: seo-guide-lines
description: |
  Optimize websites for SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) in the 2026 AI era. Use this skill whenever the user mentions: SEO optimization, meta tags, schema markup, structured data, Google rankings, AI search visibility, OpenGraph tags, site performance, keyword optimization, content structure for search engines, or wants to improve their website's discoverability. Also trigger when users ask to create service pages, about pages, contact pages, or any page that needs SEO setup, or when they mention ChatGPT/Perplexity/AI citations.
compatibility:
  required_tools:
    - Read
    - Write
    - Edit
    - Grep
    - Glob
---

# SEO/AEO/GEO Optimizer Skill

You are an expert in modern SEO optimization for the AI era (2026+), covering three critical disciplines:

- **SEO**: Traditional search engine optimization (Google, Bing rankings)
- **AEO**: Answer Engine Optimization (direct answers, voice search, "People Also Ask")
- **GEO**: Generative Engine Optimization (ChatGPT, Perplexity, Claude citations)

## Core Reference

This project has a comprehensive SEO optimization guide at:

```
seo-guide-line.md
```

**ALWAYS read this guide first** to understand:

- The project's SEO architecture (`src/config/seo.ts`)
- Implementation patterns for different page types
- Schema markup generators available
- E-E-A-T principles for AI trust
- Complete code templates ready to use

## When This Skill Triggers

Use this skill when the user asks to:

- ✅ Optimize a page for SEO/search engines
- ✅ Add or improve meta tags, Open Graph, Twitter cards
- ✅ Implement schema markup (JSON-LD)
- ✅ Add FAQPage schema to a visible FAQ section
- ✅ Improve content for AI citations (ChatGPT, Perplexity)
- ✅ Structure content for E-E-A-T (Experience, Expertise, Authority, Trust)
- ✅ Create service pages, about pages, or contact pages with SEO
- ✅ Audit existing pages for SEO issues
- ✅ Set up `COMPANY_INFO` configuration
- ✅ Implement breadcrumbs or sitemaps
- ✅ Configure robots.txt for non-Astro projects (in Astro, robots.txt is generated at build time — no manual file needed)
- ✅ Set up hreflang tags or multi-language / international SEO
- ✅ Fix mobile issues (tap targets, font sizes, viewport)

## Workflow

### Step 0: Detect Framework

Before anything else, check what framework this project uses — it changes what checks apply:

```bash
# Check for Astro
Read: astro.config.mjs (or astro.config.ts)

# Fallback: check package.json
Read: package.json
```

**If Astro is detected:**
- **Do NOT flag a missing `robots.txt`** in `/public/`. Astro generates it automatically at build time via integrations like `@astrojs/sitemap`. Flagging it as missing is a false positive.
- The sitemap is also auto-generated — do not suggest manually creating one.
- SSR vs SSG matters: check `output` in `astro.config.mjs`. Static (`output: 'static'` or default) means all pages are pre-rendered HTML — ideal for SEO. Hybrid/server mode requires page-level `prerender` flags.
- Content lives in `.astro` components and `src/content/` collections — not in JS/TS files the way Next.js uses.

**If Next.js / other framework is detected:**
- `robots.txt` should exist in `/public/` — flag if missing.
- Check for `next/head` or `<Head>` usage for meta tags.

### Step 1: Understand Context

First, read `AGENTS.md` for the project's conventions and harness contract (the
repo's `CLAUDE.md` is just a pointer to it), then the SEO guide to understand the
project architecture:

```bash
Read: AGENTS.md
Read: seo-guide-line.md
```

Then identify what the user needs:

- **New page creation?** → Use the appropriate Pattern (1-5) from the guide
- **Existing page optimization?** → Audit current implementation
- **Configuration setup?** → Help with `COMPANY_INFO`
- **Schema markup?** → Use generators from `src/config/seo.ts`

### Step 2: Locate Relevant Files

```bash
# Find the SEO configuration
Read: src/config/seo.ts

# Find existing pages (if optimizing)
Glob: src/pages/**/*.astro

# Find the specific page to optimize
Read: src/pages/[path-to-page].astro
```

### Step 3: Apply Optimizations

Based on the user's request and the SEO guide patterns:

**For New Pages:**

1. Choose the correct pattern from the guide (Service, Homepage, About, Projects, Contact)
2. Copy the template code
3. Replace `[placeholders]` with actual company data from `COMPANY_INFO`
4. Add only the schemas that describe what the page shows (`generateBreadcrumbSchema()`; `generateFAQSchema()` only for a visible FAQ section)
5. Structure content following GEO principles (self-contained chunks, natural language)

**For Existing Pages:**

1. Audit current implementation:
   - Does it use `generatePageSEO()` with its own `title` and `description`?
   - Are schemas implemented?
   - Is content structured for AEO (FAQ format, direct answers)?
   - Does it demonstrate E-E-A-T?
2. Identify gaps using the Optimization Checklist from the guide
3. Apply improvements incrementally

**For Configuration:**

1. Read current `COMPANY_INFO`
2. Validate data completeness (NAP consistency critical!)
3. Suggest improvements based on industry best practices from the guide

### Step 4: Validate Implementation

After making changes, verify:

**Schema Validation:**

- Ensure all schemas are valid JSON-LD
- Before closing a page, validate its JSON-LD with Google's **Rich Results Test** (https://search.google.com/test/rich-results) and the **Schema Markup Validator** (https://validator.schema.org/). A pass means the markup is valid, not that Google will show a rich result.

**SEO Checklist:**

- [ ] Unique meta title (50-60 characters)
- [ ] Compelling meta description (150-160 characters)
- [ ] Only one H1 per page — the primary keyword/entity definition
- [ ] H2s cover main subtopics and integrate secondary keywords naturally (e.g. "pricing", "2026 models", "how it works")
- [ ] H3s capture long-tail variants and consideration-stage queries (e.g. "how much does X cost?", "X vs Y differences")
- [ ] Heading hierarchy is logical (H1 → H2 → H3), never skipped
- [ ] Images have descriptive alt text
- [ ] Schemas describe only what is visible and true on the page (Organization + WebSite come from `MainLayout` — don't add them again)
- [ ] Breadcrumb schema on non-homepage pages
- [ ] Internal links with descriptive anchor text

**AEO Checklist:**

- [ ] FAQPage schema only where a visible FAQ section exists, with questions from `faqs.ts` or the brief
- [ ] Questions formatted naturally ("What is...", "How does...")
- [ ] Direct answers in first 50-100 words
- [ ] Lists, tables, or structured data for easy extraction

**GEO Checklist:**

- [ ] Natural, conversational language (not keyword-stuffed)
- [ ] Self-contained paragraphs (each works independently)
- [ ] E-E-A-T signals (credentials, experience, authority)
- [ ] Content updated within 90 days (note last update date)

## Why SEO Still Dominates in the LLM Era

Understanding this dynamic prevents misplaced priorities:

- Consequence: GEO is not a separate discipline. Traditional SEO is the raw material that feeds generative answers. Do not sacrifice technical SEO fundamentals for "AI optimization."

## Key Principles from the Guide

### 1. Always Use the Central Configuration

Never hardcode company data. Always import from `COMPANY_INFO`:

```typescript
import { COMPANY_INFO } from "@/config/seo";

// ✅ CORRECT
<p>Phone: {COMPANY_INFO.phone}</p>

// ❌ WRONG
<p>Phone: [hardcoded phone number]</p>
```

### 2. Schema Markup Must Describe the Page

A JSON-LD schema goes on a page only when it describes something visible and true on that page. Never add one to chase a rich result, and never fill one with data the page doesn't show:

- **Every page**: `MainLayout.astro` already appends `ORGANIZATION_SCHEMA` + `WEBSITE_SCHEMA` — don't add them again. Pass extra schemas through `<MainLayout seoProps={…} schemas={[…]}>`.
- **Non-home pages**: `generateBreadcrumbSchema()`, matching the page's real path.
- **Visible FAQ section**: `generateFAQSchema()`, built from the same questions and answers the section renders, taken from `faqs.ts` or the brief — never invented.
- **A real person shown on the page**: `generatePersonSchema()`, only with data from `authorBio.ts` or the brief.

### 3. E-E-A-T is Critical for GEO

AI systems prioritize content from trustworthy sources. Always include:

- **Experience**: Years in business, number of projects, specific achievements
- **Expertise**: Certifications, education, professional credentials
- **Authority**: Industry recognition, publications, client testimonials
- **Trust**: Transparent contact info, privacy policy, real team photos

### 4. Content Structure for AI

- Write in **natural, conversational language**
- Create **self-contained paragraphs** (each can stand alone)
- Answer questions **directly in first 50-100 words**
- Use **lists and tables** for easy data extraction
- Include **specific facts and numbers** (not vague "many years")

### 6. Keyword Strategy: Funnel Velocity over Volume

Traffic volume is a vanity metric in 2026. Prioritize **transactional intent density**:

- **Filter out non-transactional modifiers**: "gratis", "tutorial", "manual", "casero", "DIY" — these attract browsers, not buyers.
- **Hunt growth anomalies**: Terms with 50%+ YoY growth in a low-competition niche signal arbitrage opportunities — especially in traditional/industrial sectors with low SEO sophistication.
- **One page per search intent, not per keyword**: Consolidate keywords that return the same SERP competitors into one URL. Only create a separate URL if the SERP shows a distinctly different competitor set (different audience, different intent).

### 7. URL Architecture: Concentrate Then Distribute Authority

Structure URLs from generic to specific so link equity flows down correctly:

```
domain.com/category/          ← Authority accumulates here
domain.com/category/sub/      ← Inherits authority
domain.com/category/sub/niche/ ← Maximum specificity
```

- **Seasonal pages**: Link from the footer (not main nav) to maintain constant authority without polluting navigation. Remove from nav once the season ends; keep the URL alive with footer support.

### 8. JavaScript Is a Blind Spot for LLMs

**Critical technical warning**: LLMs cannot execute JavaScript. If your page's primary content (headings, body text, FAQs) is rendered client-side via JS, AI crawlers are completely blind to it — even if Googlebot can render it.

- Prefer **SSR or static HTML** for all content that matters for search.
- Audit with: view the raw HTML source (not the rendered DOM) and confirm the content is present.
- This affects GEO directly: content invisible to LLMs cannot be cited in AI answers.

### 9. NAP Consistency (Local SEO)

Name, Address, Phone must be **identical** across:

- Contact page HTML
- LocalBusiness schema
- Footer on all pages
- Google Business Profile
- All directory listings

Even small differences ("Suite 200" vs "Ste 200") hurt local rankings.

## Common Tasks

### Task: Create a New Service Page

1. Read the guide's **Pattern 1** (Service Page Template)
2. Read `COMPANY_INFO` from `src/config/seo.ts`
3. Copy the Pattern 1 template
4. Replace all `[placeholders]` with actual data
5. Implement required schemas
6. Structure content in self-contained chunks for GEO

### Task: Audit Existing Page

1. Read the page file
2. Check against the Optimization Checklist in the guide
3. Identify missing elements
4. Provide specific recommendations with code examples
5. Offer to implement fixes

### Task: Set Up COMPANY_INFO

1. Read current `src/config/seo.ts`
2. Validate all required fields are filled
3. Check NAP consistency
4. Suggest improvements based on industry examples

### Task: Implement FAQ Schema

1. Take the questions and answers from `faqs.ts` or the brief — never invent them. If neither has them, record the gap in `client-gaps.md` instead of writing FAQs.
2. Render them in a visible FAQ section on the page
3. Build the schema with `generateFAQSchema()` from the same data, so the FAQPage JSON-LD matches the visible text
4. Include the schema in the page's `schemas` array

## Output Format

When making changes, always:

1. **Explain what you're doing** and why (reference the guide section)
2. **Show before/after** for significant changes
3. **Provide validation steps**
4. **Reference specific patterns** from the guide
5. **Note any trade-offs** or decisions made

## Important Warnings

### ⚠️ Never Do This:

1. **Don't hardcode company data** - Always use `COMPANY_INFO`
2. **Don't add schemas the page doesn't back** - Each schema must describe something visible and true on the page
3. **Don't keyword stuff** - Use natural, conversational language
4. **Don't create duplicate content** - Each page must be unique
5. **Don't ignore mobile** - Always mobile-first design
6. **Don't break NAP** - Keep Name/Address/Phone identical everywhere

### ✅ Always Do This:

1. **Read the guide first** - It has complete templates and examples
2. **Use generator functions** - Don't manually create schemas
3. **Structure for AI** - Self-contained paragraphs, direct answers
4. **Demonstrate E-E-A-T** - Show credentials, experience, authority
5. **Include metrics** - Specific numbers beat vague claims
6. **Validate schemas** - Test at validator.schema.org

## Key Files Reference

- **SEO Guide**: `seo-guide-line.md`
- **SEO Config**: `src/config/seo.ts`
- **SeoHead Component**: `src/components/SeoHead.astro`
- **Page Templates**: See Patterns 1-5 in the guide
- **Technical Edge Cases**: See `## Technical SEO Appendix` in `seo-guide-line.md` for:
  - `robots.txt` patterns — only relevant for non-Astro projects (Astro generates this at build time)
  - URL structure rules and anti-patterns
  - Mobile CSS requirements (tap targets, font sizes)
  - International SEO and hreflang tags

Remember: The guide is comprehensive - almost every SEO scenario has a template or example. Use it as your primary reference!
