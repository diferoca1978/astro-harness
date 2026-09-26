# SEO/AEO/GEO Optimization Guide

> **Master reference for digital visibility optimization in the AI era**
>
> This document is the source of truth for all SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization) decisions in this project. Consult this file before creating or modifying any SEO-related content.

---

## 📋 Table of Contents

1. [SEO System Architecture](#seo-system-architecture)
2. [Project Base Configuration](#project-base-configuration)
3. [Current Project Structure](#current-project-structure)
4. [SEO: Search Engine Optimization](#seo-search-engine-optimization)
5. [AEO: Answer Engine Optimization](#aeo-answer-engine-optimization)
6. [GEO: Generative Engine Optimization](#geo-generative-engine-optimization)
7. [Implementation Patterns](#implementation-patterns)
8. [Optimization Checklist](#optimization-checklist)
9. [Metrics and Measurement](#metrics-and-measurement)
10. [Technical SEO Appendix](#technical-seo-appendix)

---

## SEO System Architecture

### 🏗️ System Structure

The project uses a centralized SEO system in `src/config/seo.ts` that provides:

```
src/config/seo.ts
├── Type Definitions (TypeScript interfaces)
├── Company Configuration (COMPANY_INFO)
├── Dynamic SEO Generators
│   ├── generatePageSEO()
│   └── generateSEOWithAlternates()
└── JSON-LD Schema Generators
    ├── ORGANIZATION_SCHEMA
    ├── WEBSITE_SCHEMA
    ├── generatePersonSchema()
    ├── generateFAQSchema()
    ├── generateVideoSchema()
    └── generateBreadcrumbSchema()
```

### 🎯 Fundamental Principles

1. **Single Source of Truth**: `COMPANY_INFO` is the only source of company data
2. **Composition over Duplication**: Use generator functions, don't copy code
3. **Schema Only for What Is on the Page**: A schema goes on a page only when it describes something visible and true on that page
4. **Mobile-First**: Mobile optimization is priority number one
5. **Entities over Keywords**: Think in semantic entities, not just keywords

---

## Project Base Configuration

### 📊 Company Information Setup

**Location**: `COMPANY_INFO` in `src/config/seo.ts`

**This is your single source of truth.** Update once, propagates everywhere automatically.

```typescript
export const COMPANY_INFO: CompanyInfo = {
  name: "[Company legal name]",
  // Examples: "DesignCo Agency LLC", "Smith & Associates Law Firm", "TechStart Inc."

  description:
    "[Brief description with main keywords]. 10+ years of experience in [industry/location].",
  // Examples:
  // "Award-winning web design agency for small businesses. 10+ years in Austin, TX."
  // "Full-service accounting firm specializing in tax planning. 15+ years in New York."

  // No `url` field: the site URL lives only in astro.config.mjs → `site`

  phone: "+57 300 0000000",
  // Format: "+1 512 555 0123" (use international format)

  email: "[contact email]",

  address: {
    street: "[Number] [Street Name], [Suite/Unit]",
    // Example: "123 Main Street, Suite 200"
    city: "Bogotá",
    region: "Cundinamarca",
    postalCode: "110111",
    country: "[Country Name]",
    countryCode: "CO", // 2-letter code: "US", "CA", "MX", etc.
  },

  geo: {
    // HIGHLY recommended for local SEO
    latitude: [XX.XXXXXX], // Get from: https://www.latlong.net/
    longitude: [-XX.XXXXXX],
  },

  logo: "/images/logo.svg.webp",
  image: "/images/og-image.png", // 1200x630px for social sharing

  foundingDate: "2025", // Example: "2014"

  founders: ["[Founder full name]"], // Can be array: ["Jane Doe", "John Smith"]

  socialMedia: {
    linkedin: "https://linkedin.com/company/[handle]",
    facebook: "https://facebook.com/[handle]",
    instagram: "https://instagram.com/[handle]",
    // Add all platforms where you're active
  },
};
```

**⚠️ CRITICAL RULES**:

- **Never hardcode** - Always `import { COMPANY_INFO } from "@/config/seo"`
- **NAP Consistency** - Name/Address/Phone MUST match Google Business Profile exactly
- **No placeholders** - Fill with real data (test data hurts SEO)

### 🔑 Keyword Strategy Setup

Group the client's keywords in three tiers (there is no keywords config in `src/config/`):

- **Primary** (3-5 keywords): highest priority, high volume + intent. Use in H1, meta titles, homepage, service names.
- **Secondary** (5-10 keywords): medium volume, specific. Use in H2, meta descriptions, service pages.
- **Tertiary** (10-20 keywords): long-tail, very specific, high conversion. Use in FAQ, detailed content, schema `knowsAbout`.

**Keyword Usage by Discipline**:

| Discipline | Keyword Type           | Usage                                        |
| ---------- | ---------------------- | -------------------------------------------- |
| **SEO**    | Primary + Secondary    | Meta titles, descriptions, H1/H2 headings    |
| **AEO**    | Primary (as questions) | FAQ titles (What is..., How to...)           |
| **GEO**    | All three tiers        | Schema `knowsAbout`, complete context for AI |

**🔍 How to Find Your Keywords:**

1. **Google Keyword Planner** (free) - Search volume data
2. **Answer the Public** (free) - Question-based keywords for AEO
3. **Google Search Console** - See what you already rank for
4. **Competitor Analysis** - Check top 3 competitors' meta titles
5. **Customer Language** - How do YOUR customers describe your service?

---

## Recommended Site Structure

### 📁 Essential Pages for Any Project

Every website should have these core pages for optimal SEO/AEO/GEO:

```
src/pages/
├── index.astro                    # Homepage (REQUIRED - uses generatePageSEO)
├── about.astro                    # About/Team page (CRITICAL for E-E-A-T)
├── contact.astro                  # Contact page (REQUIRED for LocalBusiness schema)
├── services/                      # Service pages directory
│   ├── diseno-web.astro         # Individual service pages
│   ├── marketing-digital.astro         # (Use Pattern 1 for each)
│   └── optimizacion-seo.astro
├── projects.astro                 # Portfolio/case studies (RECOMMENDED for authority)
├── privacy-policy.astro           # Privacy policy (REQUIRED by law in many regions)
├── 404.astro                      # Error page
└── blog/                          # Blog (OPTIONAL but helps SEO long-term)
    ├── index.astro               # Blog listing page
    └── [post-slug].astro         # Individual blog posts
```

**Priority Implementation Order:**

1. **Week 1**: Homepage + 1-3 Service Pages + Contact
2. **Week 2**: About Page + Projects/Portfolio Page
3. **Week 3**: Privacy Policy + 404 Page
4. **Week 4+**: Blog (if content strategy allows)

### 📝 Note on Blog Implementation

**Blog Status**: Optional but beneficial for long-term SEO growth. The scaffold has no blog and no blog schema generators; the blog comes back as a separate module.

**Should you add a blog?**

- ✅ **YES if**: You can commit to 2-4 posts/month consistently
- ✅ **YES if**: You want to target informational keywords
- ❌ **NO if**: You can't maintain regular publishing schedule (hurts more than helps)

---

## SEO: Search Engine Optimization

### 🎯 Objective

Position web pages in traditional search results (Google, Bing) to generate organic traffic.

### 📝 Page Implementation

#### Basic Pattern (Used in Service Pages)

```astro
---
// src/pages/services/[service-name].astro
import SeoHead from "@/components/SeoHead.astro";
import { generatePageSEO } from "@/config/seo";

// generatePageSEO appends " | COMPANY_INFO.name" to the title
const seoProps = generatePageSEO({
  title: "Diseño Web Estratégico in [Location]",
  description: "[Service description with primary keyword]. 10+ years of experience in Bogotá, Colombia. [Call to action].",
  image: "/images/services/[service]-og.jpg"
});
---

<SeoHead {seoProps} />
```

#### Traditional SEO Best Practices

1. **Meta Title**:
   - ✅ Length: 50-60 characters
   - ✅ Include primary keyword at the beginning
   - ✅ Include brand at the end
   - ❌ Don't repeat keywords (keyword stuffing)

   ```typescript
   // ✅ CORRECT
   title: "Diseño Web Estratégico in [Location] | [Brand]";

   // ❌ INCORRECT
   title: "[Service] [Service] [Keyword] [Service] [Location]"; // Keyword stuffing!
   ```

2. **Meta Description**:
   - ✅ Length: 150-160 characters
   - ✅ Include call to action
   - ✅ Include secondary keyword

   ```typescript
   // ✅ CORRECT
   description: "[Service] with estrategia auténtica in [location]. 10+ years of experience in diseño web, marketing digital y SEO. [Call to action].";

   // Example: "Professional landscaping with organic practices in Portland. 12+ years of experience in residential and commercial projects. Get your free quote today."
   ```

3. **Heading Structure**:

   ```html
   <h1>[Main Service/Topic Name]</h1>
   <!-- Only ONE per page -->
   <h2>[Subtopic 1]</h2>
   <h3>[Detail 1.1]</h3>
   <h3>[Detail 1.2]</h3>
   <h2>[Subtopic 2]</h2>
   <h3>[Detail 2.1]</h3>

   <!-- Example for a web design agency -->
   <h1>Professional Web Design Services</h1>
   <h2>Our Design Process</h2>
   <h3>Discovery & Research</h3>
   <h3>Design & Development</h3>
   <h2>Portfolio Showcase</h2>
   ```

4. **Optimized URLs**:
   - ✅ Descriptive and short
   - ✅ Use hyphens, not underscores
   - ✅ Lowercase
   - ✅ Match content language

   ```typescript
   // ✅ CORRECT
   canonical: "/services/[service-name]";

   // ❌ INCORRECT
   canonical: "/services/Service_Name_Location_2026"; // Too long, underscores, unnecessary date
   ```

### 🖼️ Image Optimization

```html
<!-- ✅ CORRECT -->
<image
  src="/images/servicio-digital.jpg"
  alt="[Detailed description of what's in the image, including relevant keywords]"
  class="h-full w-full object-cover object-center"
  priority
/>

<!-- Example: -->
<image
  src="/images/team-designing-website-office.jpg"
  alt="Professional web design team collaborating on responsive website layout in modern office"
  class="h-full w-full object-cover object-center"
  priority
/>

<!-- ❌ INCORRECT -->
<img src="/images/IMG_2034.jpg" alt="image" />
<!-- Generic filename and alt text -->
```

**Image Checklist**:

- [ ] Descriptive filename with keywords
- [ ] Complete and descriptive alt text (not "imagen" or "foto")
- [ ] Dimensions specified (width/height)
- [ ] WebP format when possible
- [ ] Compressed (TinyPNG, Squoosh)
- [ ] Lazy loading for below-the-fold images

### 📍 Current Page SEO Priorities

Based on existing pages, prioritize SEO for:

1. **Service Pages** (`/services/*`):
   - Primary target for conversions
   - Include FAQ sections where applicable

2. **Homepage** (`/`):
   - Use `generatePageSEO()`
   - `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA` come from `MainLayout` on every page (don't add them again)
   - Feature primary keywords prominently

3. **About Page**:
   - Implement `generatePersonSchema()` for founder
   - Demonstrate E-E-A-T (Experience, Expertise, Authority, Trust)
   - Include company history and certifications

4. **Projects Page** (`/proyectos`):
   - Showcase completed work (builds authority)
   - Include case studies with results
   - Use descriptive project titles with keywords

5. **Contact Page** (`/contacto`):
   - Include LocalBusiness schema with accurate contact info
   - Ensure NAP (Name, Address, Phone) consistency with COMPANY_INFO

---

## AEO: Answer Engine Optimization

### 🎯 Objective

Make each page easy to quote for search engines, AI assistants and voice assistants: a question in the customer's words, a direct answer right below it, and structured detail after that. AEO is a writing discipline. No markup guarantees a snippet, an answer box or any other rich result.

### 🔧 Implementation Strategies

#### 1. Direct Answer First

**Rule**: Answer the question in the first sentence, and finish the core answer within the first 50-100 words. Details, context and caveats come after it.

```astro
<article>
  <h2>[Question in natural language format]</h2>
  <p>
    [Direct answer in the first sentence, then the key specifics, all within
    50-100 words. Only facts from the brief or the client.]
  </p>
  <!-- More details after -->
</article>

<!-- Example for a web design agency -->
<article>
  <h2>What is responsive web design?</h2>
  <p>
    Responsive web design is an approach that creates websites that automatically
    adapt to different screen sizes and devices. Using flexible layouts, images,
    and CSS media queries, responsive sites provide optimal viewing experiences
    on desktops, tablets, and smartphones without requiring separate mobile versions.
  </p>
</article>
```

#### 2. Natural-Language Questions as Headings

Phrase H2/H3 headings the way customers ask, as full questions in the page's language, and answer each one directly below it:

- What is...?
- How does... work?
- Why...?
- When should...?
- Where can...?
- How much does... cost?
- Who can benefit from...?
- Which... is best for...?

Base the questions on what customers really ask (the brief, `faqs.ts`). The answers state only facts from the brief or the client. Anything missing goes to `client-gaps.md` and gets asked, never filled with a plausible guess.

#### 3. Lists and Comparison Tables

Put steps, options and comparisons in HTML lists and tables instead of long paragraphs, one idea per item:

```astro
<h2>[Which types of service do you offer?]</h2>
<ul>
  <li><strong>[Type 1]:</strong> [What it is and who it is for, in one sentence]</li>
  <li><strong>[Type 2]:</strong> [What it is and who it is for]</li>
  <li><strong>[Type 3]:</strong> [What it is and who it is for]</li>
</ul>

<h2>[How do the options compare?]</h2>
<table>
  <thead>
    <tr>
      <th>[Option]</th>
      <th>[Criterion 1]</th>
      <th>[Criterion 2]</th>
      <th>Best for</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[Option 1]</td>
      <td>[Value]</td>
      <td>[Value]</td>
      <td>[Use case]</td>
    </tr>
    <tr>
      <td>[Option 2]</td>
      <td>[Value]</td>
      <td>[Value]</td>
      <td>[Use case]</td>
    </tr>
  </tbody>
</table>
```

#### 4. FAQ Sections and FAQPage Schema

A schema goes on a page only when it describes something visible and true on that page. `FAQPage` comes only from a visible FAQ component, and its questions and answers come from `src/config/faqs.ts` or the brief. Never invent them. `FAQPage` does not promise any rich result.

```astro
---
import MainLayout from "@/layouts/MainLayout.astro";
import { faqs } from "@/config/faqs";
import { generatePageSEO, generateFAQSchema } from "@/config/seo";

const seoProps = generatePageSEO({ title: "[Page title]", description: "[Page description]" });

// FAQPage only when the FAQ section below is rendered
const schemas = faqs.length > 0 ? [generateFAQSchema(faqs)] : [];
---

<MainLayout seoProps={seoProps} schemas={schemas}>
  {faqs.length > 0 && (
    <section>
      <h2>Frequently Asked Questions</h2>
      {faqs.map((item) => (
        <div>
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      ))}
    </section>
  )}
</MainLayout>
```

---

## GEO: Generative Engine Optimization

### 🎯 Objective

Be cited and referenced accurately by ChatGPT, Google AI Overviews, Perplexity, Claude, and other LLMs.

### 🧠 Fundamental Principles

#### 1. Think in Entities, Not Just Keywords

AIs understand entities (people, places, concepts) and their relationships.

#### 2. Conversational and Natural Language

AIs are trained on human conversations. Write as you would speak.

#### 3. Modular Content in Self-Contained "Chunks"

Each paragraph should function independently. **Critical for service pages.**

### 📊 Advanced Schema Markup for GEO

#### Organization and Website Schemas

`MainLayout.astro` appends `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA` to every page. Don't add them again in a page's `schemas`.

These schemas are pre-configured in `src/config/seo.ts` and include:

- Company name, description, and contact info
- Logo and images
- Social media profiles

#### Breadcrumb Schema

**Use on all pages except homepage:**

```astro
---
import { generateBreadcrumbSchema } from "@/config/seo";

// For service page
const breadcrumbs = [
  { name: "Inicio", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Diseño Web Estratégico", path: "/services/diseno-web" }
];

const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
const schemas = [breadcrumbSchema, /* other schemas */];
---
```

### 📝 E-E-A-T: Demonstrating Experience and Authority

AIs prioritize content from trustworthy sources. **Implement on the About page (see Pattern 3):**

#### Experience (Experiencia)

Show years in business, projects delivered and a short company history, using only numbers the client has confirmed.

#### Expertise (Experticia)

List only the certifications and accreditations the client really holds, with the issuing body.

#### Authority (Autoridad)

**Demonstrate through:**

- Founder credentials
- Years in business
- Project portfolio
- Industry recognition
- Client testimonials

#### Trust (Confianza)

**Build trust through:**

- Client testimonials (Projects page)
- Transparent contact information
- Privacy policy (`/politica-de-privacidad`)
- Clear service descriptions
- Safety records

### 🔄 Content Freshness and Updates

AIs prioritize updated content. **Critical rule**: Content not updated for more than 90 days loses visibility on platforms like Perplexity.

**Implementation:**

```astro
---
const publishDate = "2024-01-15";
const lastUpdated = "2026-03-09"; // Update this regularly
---

<article>
  <div class="content-meta">
    <time datetime={publishDate}>Publicado: 15 de enero, 2024</time>
    <time datetime={lastUpdated}>Última actualización: 9 de marzo, 2026</time>
  </div>
  <!-- Content -->
</article>
```

**Update strategy for this project:**

- [ ] **Service Pages**: Quarterly review (every 90 days)
- [ ] **Homepage**: Monthly review (competitive info, stats)
- [ ] **Projects Page**: Add new projects as completed
- [ ] **About Page**: Annual review (team, certifications)
- [ ] **Contact Page**: Verify info monthly (hours, phone, email)

---

## Implementation Patterns

### 🎨 Pattern 1: Complete Service Page

**Universal Template with Mock Data Example**

This pattern works for any service-based business. Replace bracketed placeholders `[like this]` with your actual data.

```astro
---
// src/pages/services/diseno-web.astro
// Example slug: "premium-web-design", "seo-consulting", "mobile-app-development"
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generatePageSEO,
  generateFAQSchema,
  generateBreadcrumbSchema
} from "@/config/seo";

// SEO Props - Customize for your service (generatePageSEO appends " | COMPANY_INFO.name")
const seoProps = generatePageSEO({
  title: "Diseño Web Estratégico in [Location]",
  // Example: "Premium Web Design in Austin"
  description: "[Brief service description with primary keyword]. [Years]+ years of experience in [location]. [Call-to-action].",
  // Example: "Custom web design services for small businesses. 10+ years of experience in Austin, TX. Get your free quote today."
  image: "/images/services/[service]-og.jpg"
});

// FAQ Schema - only because the FAQ section below renders these items.
// Questions and answers come from src/config/faqs.ts or the brief; never invent them.
const faqItems = [
  {
    question: "[Question in natural language format starting with What/How/Why/When]?",
    // Example: "What is included in your web design service?"
    answer: "[Comprehensive 50-100 word answer that directly addresses the question. Be specific and include relevant details, pricing if applicable, timeline, or process information.]"
    // Example: "Our web design service includes custom homepage and up to 10 interior pages, mobile-responsive design, SEO optimization, content management system integration (WordPress), 3 rounds of revisions, and 30 days of post-launch support. The typical project timeline is 6-8 weeks from kickoff to launch, including initial discovery, wireframing, design mockups, development, testing, and deployment."
  },
  {
    question: "[Second common question]?",
    // Example: "How long does the web design process take?"
    answer: "[50-100 word answer with specifics.]"
    // Example: "The complete web design process typically takes 6-8 weeks for a standard 5-10 page website. This includes 1 week for discovery and planning, 2 weeks for design mockups and revisions, 2-3 weeks for development and content integration, and 1 week for testing and quality assurance. Rush projects can be accommodated in 4 weeks with expedited fees. Complex websites with custom functionality may require 10-12 weeks. We provide a detailed timeline during the proposal phase."
  },
  {
    question: "[Third question addressing concerns/objections]?",
    // Example: "Do you provide ongoing support after launch?"
    answer: "[50-100 word answer addressing concern.]"
    // Example: "Yes, all web design projects include 30 days of complimentary post-launch support for bug fixes and minor adjustments. After the initial period, we offer monthly maintenance plans starting at $199/month including hosting, security updates, performance monitoring, content updates (up to 2 hours/month), and priority support. Many clients choose our maintenance plans to ensure their site stays secure, fast, and up-to-date with the latest web standards."
  },
  {
    question: "[Fourth question about process/logistics]?",
    // Example: "What information do you need to start a project?"
    answer: "[50-100 word answer.]"
  },
  {
    question: "[Fifth question about pricing/value]?",
    // Example: "How much does a custom website cost?"
    answer: "[50-100 word answer with range or factors.]"
  }
];
const faqSchema = generateFAQSchema(faqItems);

// Breadcrumb Schema - Update navigation path
const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Diseño Web Estratégico", path: "/services/diseno-web" }
];
const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

const schemas = [faqSchema, breadcrumbSchema];
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <!-- Hero Section -->
  <section class="hero">
    <h1>Diseño Web Estratégico in [Location]</h1>
    <!-- Example: "Premium Web Design Services in Austin, TX" -->
    <p class="lead">
      [One-sentence value proposition highlighting main benefits].
      [Years/credentials statement]. [Call-to-action].
    </p>
    <!-- Example: "Award-winning web design that converts visitors into customers.
         Over 10 years of experience with 200+ successful projects. Get your free quote today." -->
  </section>

  <!-- Main Content (SEO + AEO) -->
  <section class="service-description">
    <h2>What is Diseño Web Estratégico?</h2>
    <!-- This heading format is CRITICAL for AEO - answer the question directly below -->
    <p>
      [Direct answer in first 50-100 words. Define the service clearly
      using natural language. Include primary keywords naturally. Explain
      what makes this service different from alternatives.]
    </p>
    <!-- Example: "Premium web design is a custom website creation service
         that combines aesthetic excellence with conversion optimization.
         Unlike template-based solutions, premium web design involves
         custom coding, strategic UX planning, and brand-specific visual
         design tailored to your business goals. It's ideal for businesses
         that need a unique online presence that stands out from competitors." -->
    <p>
      [Second paragraph with technical details, process overview, or
      industry context. Each paragraph should be self-contained (GEO principle).
      Include secondary keywords naturally.]
    </p>
    <!-- Example: "The premium web design process typically involves discovery
         and strategy, custom wireframing, visual design mockups, responsive
         development, SEO optimization, and rigorous testing. Modern premium
         websites are built with mobile-first design, ensuring optimal
         performance on all devices from smartphones to desktop computers." -->
  </section>

  <!-- Types/Variants Section -->
  <section class="service-types">
    <h2>Types of [Service] We Offer</h2>
    <!-- or "Our [Service] Options" -->
    <ul>
      <li>
        <strong>[Type/Package 1 Name]:</strong> [Brief description of what
        this includes and ideal use case. 1-2 sentences.]
      </li>
      <!-- Example: "Starter Website Package: 5-page responsive website with
           custom design, mobile optimization, and basic SEO. Ideal for
           small businesses launching their first professional site." -->
      <li>
        <strong>[Type/Package 2 Name]:</strong> [Description and use case]
      </li>
      <!-- Example: "Business Growth Package: 10-15 page website with
           advanced features like custom forms, blog integration, and
           analytics setup. Perfect for established businesses looking
           to scale." -->
      <li>
        <strong>[Type/Package 3 Name]:</strong> [Description and use case]
      </li>
      <!-- Example: "Enterprise Solution: Custom web application with
           advanced functionality, API integrations, user portals, and
           dedicated support. For companies with complex requirements." -->
      <li>
        <strong>[Optional 4th Type]:</strong> [Description and use case]
      </li>
    </ul>
  </section>

  <!-- Process Section -->
  <section class="process">
    <h2>Our [Service] Process</h2>
    <!-- or "How We Deliver [Service]" -->
    <ol>
      <li>
        <strong>[Step 1 Name]:</strong> [What happens in this step, deliverables,
        typical duration]. [Any client involvement required].
      </li>
      <!-- Example: "Discovery & Strategy: Initial consultation to understand
           your business goals, target audience, and competitors. We create
           a project brief and sitemap. Duration: 1 week. Client provides:
           brand assets, content guidelines, and goals." -->
      <li>
        <strong>[Step 2 Name]:</strong> [Description and duration]
      </li>
      <!-- Example: "Wireframing & Planning: We create low-fidelity wireframes
           showing page layouts and user flow. Client reviews and approves
           structure before design begins. Duration: 1-2 weeks." -->
      <li>
        <strong>[Step 3 Name]:</strong> [Description and duration]
      </li>
      <!-- Example: "Visual Design: Custom mockups for homepage and key pages
           in your brand style. Up to 2 rounds of revisions included.
           Duration: 2 weeks." -->
      <li>
        <strong>[Step 4 Name]:</strong> [Description and duration]
      </li>
      <!-- Example: "Development: Converting approved designs into responsive
           code. Integration with CMS, forms, and any required features.
           Duration: 2-3 weeks." -->
      <li>
        <strong>[Step 5 Name]:</strong> [Description and duration]
      </li>
      <!-- Example: "Testing & QA: Cross-browser testing, mobile responsiveness
           check, performance optimization, and accessibility audit.
           Duration: 1 week." -->
      <li>
        <strong>[Step 6 Name]:</strong> [Description and duration]
      </li>
      <!-- Example: "Launch & Training: Website goes live. We provide
           1-hour training session on managing content. Includes 30 days
           of post-launch support." -->
    </ol>
  </section>

  <!-- Comparison Table (AEO) - OPTIONAL, use if applicable -->
  <section class="comparison">
    <h2>[Service] Options Comparison</h2>
    <!-- or "Pricing Packages Comparison" or "Feature Comparison" -->
    <table>
      <thead>
        <tr>
          <th>[Option/Package Name]</th>
          <th>[Feature 1]</th>
          <th>[Feature 2]</th>
          <th>[Feature 3]</th>
          <th>Price Range</th>
          <th>Best For</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>[Package 1]</td>
          <!-- Example: "Starter" -->
          <td>[Value]</td>
          <!-- Example: "5 pages" -->
          <td>[Value]</td>
          <!-- Example: "Basic SEO" -->
          <td>[Value]</td>
          <!-- Example: "1 month support" -->
          <td>$-$$</td>
          <td>[Ideal customer]</td>
          <!-- Example: "New businesses" -->
        </tr>
        <tr>
          <td>[Package 2]</td>
          <td>[Value]</td>
          <td>[Value]</td>
          <td>[Value]</td>
          <td>$$-$$$</td>
          <td>[Ideal customer]</td>
        </tr>
        <tr>
          <td>[Package 3]</td>
          <td>[Value]</td>
          <td>[Value]</td>
          <td>[Value]</td>
          <td>$$$-$$$$</td>
          <td>[Ideal customer]</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- FAQ Section (AEO) - CRITICAL for Answer Engine Optimization -->
  <section class="faq">
    <h2>Frequently Asked Questions about Diseño Web Estratégico</h2>
    {faqItems.map(item => (
      <div class="faq-item">
        <h3>{item.question}</h3>
        <p>{item.answer}</p>
      </div>
    ))}
  </section>

  <!-- Authority/E-E-A-T Section (GEO) -->
  <section class="experience">
    <h2>Our Experience with Diseño Web Estratégico</h2>
    <div class="stats-grid">
      <div class="stat">
        <span class="number">10+</span>
        <!-- Example: "10+" -->
        <span class="label">[Label]</span>
        <!-- Example: "Years of Experience" -->
      </div>
      <div class="stat">
        <span class="number">10+</span>
        <!-- Example: "200+" -->
        <span class="label">[Label]</span>
        <!-- Example: "Successful Projects" -->
      </div>
      <div class="stat">
        <span class="number">10%</span>
        <!-- Example: "98%" -->
        <span class="label">[Label]</span>
        <!-- Example: "Client Satisfaction" -->
      </div>
      <div class="stat">
        <span class="number">10+</span>
        <!-- Example: "15" -->
        <span class="label">[Label]</span>
        <!-- Example: "Industry Awards" -->
      </div>
    </div>
    <p>
      [Self-contained paragraph describing specific experience. Include:
      founding/start year, geographic reach, notable projects/clients
      (if allowed), and any unique achievements. Keep focused on facts
      that demonstrate expertise.]
    </p>
    <!-- Example: "Since 2014, DesignCo has delivered over 200 premium websites
         for clients across Texas, California, and New York. Notable projects
         include the award-winning redesign of Austin Tech Hub (2021) and
         the e-commerce platform for GreenGoods Co. that increased conversions
         by 240%. Our work has been featured in Awwwards, CSS Design Awards,
         and Web Designer Magazine." -->
  </section>

  <!-- Certifications/Trust Signals Section (GEO - E-E-A-T) -->
  <section class="certifications">
    <h2>[Certifications / Trust Signals / Credentials]</h2>
    <!-- Use: "Certifications", "Why Choose Us", "Our Credentials", etc. -->
    <ul>
      <li>✓ [Certification, license, or credential 1]</li>
      <!-- Example: "Google Partner Certified since 2016" -->
      <li>✓ [Industry certification 2]</li>
      <!-- Example: "Member of American Institute of Graphic Arts (AIGA)" -->
      <li>✓ [Process or methodology credential]</li>
      <!-- Example: "Agile Project Management Certified (PMI-ACP)" -->
      <li>✓ [Team qualification]</li>
      <!-- Example: "All designers hold Bachelor's degrees in Design or related field" -->
      <li>✓ [Tool or technology expertise]</li>
      <!-- Example: "Certified Webflow Experts and WordPress Developers" -->
      <li>✓ [Insurance, security, or compliance]</li>
      <!-- Example: "$2M professional liability insurance coverage" -->
    </ul>
  </section>

  <!-- CTA Section -->
  <section class="cta">
    <h2>[CTA Headline with Question or Action]?</h2>
    <!-- Examples: "Ready to Start Your Project?", "Need Help with [Service]?",
         "Want to Discuss Your [Service] Needs?" -->
    <p>
      [Brief value statement. 1-2 sentences mentioning free consultation,
      custom quote, no-obligation, or other low-friction offer.]
    </p>
    <!-- Example: "Contact us for a free 30-minute consultation and custom
         quote. No obligation, no pressure – just expert advice tailored
         to your business goals." -->
    <a href="/contact" class="btn-primary">[CTA Button Text]</a>
    <!-- Examples: "Get Your Free Quote", "Schedule Consultation",
         "Start Your Project", "Request Proposal" -->
  </section>
</MainLayout>
```

---

**📌 Quick Adaptation Guide**

<details>
<summary>Example: How to Adapt This Pattern for Different Industries</summary>

### For SaaS/Software Products:

- Replace "Types of Service" → "Pricing Tiers" or "Feature Packages"
- Add "Technology Stack" or "Integrations" section
- FAQ: Focus on security, data privacy, uptime, migrations
- Stats: Users, uptime percentage, data processed, integrations

### For Professional Services (Legal, Accounting, Consulting):

- Emphasize credentials (licenses, bar admissions, CPAs)
- Replace "Process" → "Our Methodology" or "How We Work"
- Add "Practice Areas" or "Specializations"
- FAQ: Pricing models, initial consultation, confidentiality
- Stats: Years practicing, cases handled, client industries

### For E-commerce/Product Businesses:

- Replace service schema with Product schema
- Add "Features & Specifications" table
- Include shipping, returns, warranty information in FAQ
- Stats: Products sold, customer reviews, years in business
- Comparison table: Product variants or competitors

### For Local Service Businesses (Plumbers, Electricians, etc.):

- Add service area map or list of cities covered
- Emphasize licenses, insurance, background checks
- Include emergency/24-7 availability if applicable
- FAQ: Pricing (hourly vs flat rate), response time, guarantees
- Stats: Jobs completed, average response time, cities served

</details>

### 🎨 Pattern 2: Homepage Implementation

**Universal Homepage Template**

The homepage uses pre-configured schemas from `Seo.ts`. Customize the HTML content to match your business.

```astro
---
// src/pages/index.astro
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import { generatePageSEO } from "@/config/seo";

const seoProps = generatePageSEO({
  title: "[Primary Service] in [Location]",
  description: "[150-160 characters: what you do, where, and a call to action]"
});

// ORGANIZATION_SCHEMA (your company/business details) and WEBSITE_SCHEMA
// (website-level information) are appended to every page by MainLayout.
// Don't add them here.
const schemas = [];
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <!-- Hero Section - Include ALL primary keywords -->
  <section class="hero">
    <h1>[Primary Service 1] and [Primary Service 2] in [Location]</h1>
    <!-- Examples:
         "Web Design and Development Services in Austin, TX"
         "Legal Services and Business Law in New York City"
         "Plumbing and HVAC Services in Phoenix, Arizona" -->
    <p class="lead">
      [Value proposition. Years of experience. Key differentiator. Call-to-action.]
    </p>
    <!-- Example: "Award-winning web design that grows your business. 10+ years
         of experience serving 200+ satisfied clients. Schedule your free consultation today." -->
  </section>

  <!-- Services Overview Section -->
  <section class="services-preview">
    <h2>Our Services</h2>
    <!-- or "What We Do", "How We Help", "Our Solutions" -->
    <p>
      [Brief introduction to your service portfolio. 1-2 sentences.]
    </p>
    <!-- Example: "We offer comprehensive digital solutions for small and
         medium businesses, from custom website design to ongoing marketing support." -->

    <div class="services-grid">
      <!-- Service Card 1 -->
      <div class="service-card">
        <h3>[Service Name 1]</h3>
        <!-- Example: "Custom Web Design" -->
        <p>[Brief 1-2 sentence description]</p>
        <!-- Example: "Beautiful, conversion-focused websites tailored to
             your brand and business goals." -->
        <a href="/services/[service-slug-1]">Learn More →</a>
      </div>

      <!-- Service Card 2 -->
      <div class="service-card">
        <h3>[Service Name 2]</h3>
        <p>[Brief description]</p>
        <a href="/services/[service-slug-2]">Learn More →</a>
      </div>

      <!-- Service Card 3 -->
      <div class="service-card">
        <h3>[Service Name 3]</h3>
        <p>[Brief description]</p>
        <a href="/services/[service-slug-3]">Learn More →</a>
      </div>

      <!-- Add more service cards as needed -->
    </div>
  </section>

  <!-- Stats/Social Proof Section (E-E-A-T) -->
  <section class="stats">
    <h2>[Stats Section Headline]</h2>
    <!-- Examples: "Our Track Record", "By the Numbers", "Our Impact" -->

    <div class="stats-grid">
      <div class="stat">
        <span class="stat-number">10+</span>
        <!-- Example: "10+" -->
        <span class="stat-label">[Metric]</span>
        <!-- Example: "Years in Business" -->
      </div>

      <div class="stat">
        <span class="stat-number">10+</span>
        <!-- Example: "500+" -->
        <span class="stat-label">[Metric]</span>
        <!-- Example: "Happy Clients" -->
      </div>

      <div class="stat">
        <span class="stat-number">10%</span>
        <!-- Example: "98%" -->
        <span class="stat-label">[Metric]</span>
        <!-- Example: "Client Satisfaction" -->
      </div>

      <div class="stat">
        <span class="stat-number">10+</span>
        <!-- Example: "1,000+" -->
        <span class="stat-label">[Metric]</span>
        <!-- Example: "Projects Completed" -->
      </div>
    </div>
  </section>

  <!-- Value Proposition / Why Choose Us Section -->
  <section class="why-choose-us">
    <h2>Why Choose [Company Name]?</h2>
    <!-- or "What Makes Us Different", "Our Advantages" -->

    <div class="benefits-grid">
      <div class="benefit">
        <h3>[Benefit 1 Headline]</h3>
        <!-- Example: "Expert Team" -->
        <p>[Description showing expertise/experience]</p>
        <!-- Example: "Our team of certified professionals brings 50+ years
             of combined experience to every project." -->
      </div>

      <div class="benefit">
        <h3>[Benefit 2 Headline]</h3>
        <!-- Example: "Proven Results" -->
        <p>[Description with metrics if possible]</p>
        <!-- Example: "Our clients see an average 150% increase in leads
             within the first 6 months." -->
      </div>

      <div class="benefit">
        <h3>[Benefit 3 Headline]</h3>
        <!-- Example: "Transparent Process" -->
        <p>[Description of process/approach]</p>
        <!-- Example: "Clear communication, realistic timelines, and no
             hidden fees. You'll know exactly what to expect." -->
      </div>
    </div>
  </section>

  <!-- Testimonials / Social Proof (Optional but recommended) -->
  <section class="testimonials">
    <h2>What Our Clients Say</h2>
    <!-- or "Client Success Stories", "Testimonials" -->

    <div class="testimonials-grid">
      <blockquote>
        <p>"[Client testimonial quote - specific results if possible]"</p>
        <cite>— [Client Name], [Title/Company]</cite>
      </blockquote>
      <!-- Example:
           <p>"DesignCo transformed our website and our leads increased by 200%
              in just 3 months. Highly recommended!"</p>
           <cite>— Sarah Johnson, CEO of TechStartup Inc.</cite> -->

      <!-- Add 2-3 more testimonials -->
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta">
    <h2>[CTA Question or Statement]?</h2>
    <!-- Examples: "Ready to Get Started?", "Let's Build Something Great Together",
         "Transform Your Business Today" -->
    <p>[Supporting text with low-friction offer]</p>
    <!-- Example: "Schedule a free 30-minute consultation to discuss your
         project. No obligation, no pressure." -->
    <a href="/contact" class="btn-primary">[CTA Button]</a>
    <!-- Examples: "Get Your Free Quote", "Schedule Consultation",
         "Contact Us Today" -->
  </section>
</MainLayout>
```

**💡 Homepage SEO Tips:**

- Use ALL primary keywords in the H1
- Link to every service page from homepage
- Include company stats (builds trust/authority)
- Add client testimonials with real names (E-E-A-T)
- Make sure ORGANIZATION_SCHEMA and WEBSITE_SCHEMA in `Seo.ts` have accurate data

### 🎨 Pattern 3: About Page Implementation (E-E-A-T Critical)

**Universal About/Team Page Template**

The About page is CRITICAL for E-E-A-T (Experience, Expertise, Authority, Trust). This pattern demonstrates credibility to both users and AI systems.

```astro
---
// src/pages/about.astro (or /team.astro, /company.astro)
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generatePageSEO,
  generatePersonSchema,
  generateBreadcrumbSchema,
  COMPANY_INFO
} from "@/config/seo";

const seoProps = generatePageSEO({
  title: "About Us - [Primary Service] Experts",
  // Example: "About Us - Web Design Experts in Austin"
  description: "[Company story in 1 sentence]. [Years]+ years of experience in [service/industry]. [Founded by/Team info].",
  // Example: "Learn about DesignCo's journey from startup to award-winning agency. 10+ years of web design excellence. Founded by Jane Doe in 2014."
  image: "/images/about/team-photo.jpg" // Team photo builds trust
});

// Person Schema for founder/key team member (CRITICAL for E-E-A-T)
// If you have COMPANY_INFO.founders configured:
const founderSchema = generatePersonSchema({
  name: COMPANY_INFO.founders?.[0] || "[Founder full name]",
  // Example: "Jane Doe" or "Dr. Michael Chen" or "Sarah Williams, CPA"
  alternateName: "[Nickname or Professional Title]",
  // Example: "Jane D." or "Dr. Chen" or "Sarah Williams"
  description: "[Professional background, expertise, credentials. 2-3 sentences mentioning years of experience, education, specialization.]",
  // Example: "Web design expert with 15+ years of experience. Graduated from MIT with a degree in Computer Science. Specializes in conversion-focused design for SaaS companies."
  jobTitle: "[Title]",
  // Example: "CEO & Founder" or "Managing Partner" or "Lead Designer"
  image: "/images/team/[founder-slug].jpg",
  url: "/about", // resolved against the site URL
  knowsAbout: [
    // Add specific expertise areas:
    "[Specific Skill 1]",
    "[Specific Skill 2]",
    "[Specific Skill 3]"
  ],
  // Example: ["Responsive Web Design", "UX Strategy", "Brand Development"]
  sameAs: [
    COMPANY_INFO.socialMedia.linkedin,
    // Add founder's personal profiles if available:
    // "https://twitter.com/foundername",
    // "https://www.linkedin.com/in/foundername"
  ]
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" }
];
const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

const schemas = [founderSchema, breadcrumbSchema];
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <!-- Hero Section -->
  <section class="about-hero">
    <h1>About [Company Name]</h1>
    <!-- or "Our Story", "Meet the Team", "Who We Are" -->
    <p class="lead">
      [One-sentence mission statement or value proposition]
    </p>
    <!-- Example: "We help small businesses thrive online with beautiful,
         conversion-focused web design." -->
  </section>

  <!-- Company History (GEO - Self-contained chunks) -->
  <section class="company-history">
    <h2>Our Story</h2>
    <!-- or "How We Started", "Company History", "Our Journey" -->

    <p>
      [Founding story paragraph 1: When was the company founded? By whom?
      What was the original vision or problem being solved? Keep this
      self-contained.]
    </p>
    <!-- Example: "DesignCo was founded in 2014 by Jane Doe, a former Google
         designer frustrated by the lack of affordable, high-quality web
         design for small businesses. The vision was simple: bring enterprise-
         level design expertise to companies of all sizes." -->

    <p>
      [Growth/milestone paragraph 2: Key achievements, pivots, or expansions.
      Include specific years and facts. Self-contained.]
    </p>
    <!-- Example: "In our first three years, we grew from a solo operation
         to a team of 12 designers and developers. By 2018, we had completed
         over 200 websites and won our first Awwwards Site of the Year award." -->

    <p>
      [Current state paragraph 3: Where is the company today? Team size,
      locations, clients served, current focus. Self-contained.]
    </p>
    <!-- Example: "Today, DesignCo operates with a team of 25 professionals
         across Texas and California. We've served over 500 clients, from
         Austin startups to Fortune 500 companies, and continue to push the
         boundaries of web design excellence." -->
  </section>

  <!-- Founder/Leadership Bio (E-E-A-T: Experience & Expertise) -->
  <section class="founder-section">
    <h2>[Our Founder / Leadership Team / Meet the Team]</h2>

    <div class="founder-profile">
      <div class="founder-image">
        <img
          src="/images/team/[founder-slug].jpg"
          alt="[Founder full name], [Title] of [Company Name]"
          width="400"
          height="400"
          loading="lazy"
        />
      </div>

      <div class="founder-bio">
        <h3>[Full Name with Credentials]</h3>
        <!-- Example: "Dr. Jane Doe, MBA" or "Michael Chen, CPA" or "Sarah Williams, Esq." -->
        <p class="founder-title">[Title] | [Professional Designation if any]</p>
        <!-- Example: "CEO & Founder | Certified Webflow Expert" -->

        <p>
          [Background paragraph 1: Education, early career, expertise
          development. Include specific credentials, degrees, certifications.]
        </p>
        <!-- Example: "Jane holds a B.S. in Computer Science from MIT and an
             MBA from Stanford. She spent 8 years at Google as a Senior UX
             Designer, working on products used by millions." -->

        <p>
          [Expertise paragraph 2: Specific areas of mastery, publications,
          speaking engagements, industry recognition. Quantify experience.]
        </p>
        <!-- Example: "With over 15 years in web design, Jane has spoken at
             20+ industry conferences including SXSW and An Event Apart. Her
             work has been featured in Smashing Magazine, A List Apart, and
             Web Designer Magazine." -->

        <p>
          [Philosophy/approach paragraph 3: What drives them? Teaching,
          methodology, unique approach.]
        </p>
        <!-- Example: "Jane believes exceptional design isn't about following
             trends—it's about understanding user psychology and business
             goals. She personally reviews every project to ensure it meets
             her exacting standards." -->

        <!-- Credentials List -->
        <div class="credentials">
          <h4>Education & Certifications:</h4>
          <ul>
            <li>[Degree] - [Institution]</li>
            <!-- Example: "B.S. Computer Science - MIT, 2004" -->
            <li>[Certification 1]</li>
            <!-- Example: "Google UX Design Professional Certificate" -->
            <li>[Certification 2]</li>
            <!-- Example: "Certified Webflow Expert - 2019" -->
            <li>[Professional License if applicable]</li>
            <!-- Example: "Licensed Professional Engineer (PE) - Texas" -->
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Company Stats (E-E-A-T: Experience) -->
  <section class="company-stats">
    <h2>Our Track Record</h2>
    <!-- or "By the Numbers", "Our Impact", "Our Experience" -->

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-number">10+</span>
        <!-- Example: "10+" -->
        <span class="stat-label">[Metric]</span>
        <!-- Example: "Years in Business" -->
        <span class="stat-detail">[Additional Context]</span>
        <!-- Example: "Since 2014" -->
      </div>

      <div class="stat-card">
        <span class="stat-number">10+</span>
        <span class="stat-label">[Metric]</span>
        <span class="stat-detail">[Context]</span>
      </div>

      <div class="stat-card">
        <span class="stat-number">10%</span>
        <span class="stat-label">[Metric]</span>
        <span class="stat-detail">[Context]</span>
      </div>

      <div class="stat-card">
        <span class="stat-number">10+</span>
        <span class="stat-label">[Metric]</span>
        <span class="stat-detail">[Context]</span>
      </div>
    </div>
  </section>

  <!-- Certifications/Credentials (E-E-A-T: Expertise) -->
  <section class="certifications">
    <h2>Certifications & Credentials</h2>
    <!-- or "Why Trust Us", "Our Qualifications", "Accreditations" -->

    <p>
      [Brief intro explaining why certifications matter in your industry]
    </p>
    <!-- Example: "We maintain the highest industry certifications to ensure
         our clients receive expert, up-to-date service." -->

    <div class="certifications-list">
      <ul>
        <li>✓ [Certification/License 1 with issuing body and year]</li>
        <!-- Example: "Google Partner Certified - 2016-Present" -->
        <li>✓ [Industry Association Membership]</li>
        <!-- Example: "Member, American Institute of Graphic Arts (AIGA)" -->
        <li>✓ [Professional License if applicable]</li>
        <!-- Example: "Licensed General Contractor #123456 (California)" -->
        <li>✓ [Quality/Process Certification]</li>
        <!-- Example: "ISO 9001:2015 Certified Quality Management" -->
        <li>✓ [Insurance/Bonding]</li>
        <!-- Example: "Fully Insured & Bonded - $2M Liability Coverage" -->
        <li>✓ [Technology/Platform Certifications]</li>
        <!-- Example: "Certified Webflow Partner & WordPress Experts" -->
      </ul>
    </div>
  </section>

  <!-- Recognition/Awards (E-E-A-T: Authority) - OPTIONAL -->
  <section class="recognition">
    <h2>Recognition & Awards</h2>
    <!-- Only include if you have actual awards/recognition -->

    <div class="awards-list">
      <div class="award">
        <h3>[Award Name]</h3>
        <p>[Award description and significance]</p>
        <span class="award-date">[Year]</span>
      </div>
      <!-- Example:
           <h3>Awwwards Site of the Day</h3>
           <p>Recognized for exceptional design and innovation in the
              TechStartup Inc. website redesign project.</p>
           <span>2022</span> -->

      <!-- Add 2-5 notable awards or recognitions -->
    </div>
  </section>

  <!-- Values/Mission (E-E-A-T: Trust) -->
  <section class="values">
    <h2>Our Values</h2>
    <!-- or "What We Stand For", "Our Principles", "Core Values" -->

    <div class="values-grid">
      <div class="value-card">
        <h3>[Value 1]</h3>
        <!-- Example: "🎯 Client-First Approach" -->
        <p>[Explanation of how this value manifests in work]</p>
        <!-- Example: "Every decision we make starts with asking: 'Is this
             best for the client?' We prioritize your success over our
             convenience." -->
      </div>

      <div class="value-card">
        <h3>[Value 2]</h3>
        <p>[Explanation]</p>
      </div>

      <div class="value-card">
        <h3>[Value 3]</h3>
        <p>[Explanation]</p>
      </div>

      <div class="value-card">
        <h3>[Value 4]</h3>
        <p>[Explanation]</p>
      </div>
    </div>
  </section>

  <!-- Optional: Full Team Section (if applicable) -->
  <section class="team">
    <h2>Meet Our Team</h2>

    <p>
      [Brief intro about team size, structure, expertise distribution]
    </p>
    <!-- Example: "Our team of 25 professionals includes 12 designers,
         8 developers, 3 project managers, and 2 marketing specialists." -->

    <!-- If you have individual team members to showcase -->
    <div class="team-grid">
      <div class="team-member">
        <img src="/images/team/[member-slug].jpg" alt="[Name]" loading="lazy" />
        <h3>[Name]</h3>
        <p class="role">[Role/Title]</p>
        <p class="bio">[One-sentence bio]</p>
      </div>
      <!-- Repeat for key team members -->
    </div>
  </section>

  <!-- CTA Section -->
  <section class="about-cta">
    <h2>Want to Work With Us?</h2>
    <!-- or "Ready to Get Started?", "Let's Connect" -->
    <p>
      [Invitation to contact with low-friction offer]
    </p>
    <!-- Example: "We'd love to hear about your project. Schedule a free
         consultation to discuss how we can help." -->
    <a href="/contact" class="btn-primary">Get in Touch</a>
  </section>
</MainLayout>
```

**🎓 E-E-A-T Checklist for About Page:**

- [ ] Founder/leadership bios with real credentials
- [ ] Education and professional certifications listed
- [ ] Specific years of experience (not vague "many years")
- [ ] Industry recognition, awards, or publications
- [ ] Company history with founding date
- [ ] Team size and structure
- [ ] Professional headshots (builds trust)
- [ ] Links to professional profiles (LinkedIn, etc.)
- [ ] Certifications/licenses with numbers and issuing bodies

### 🎨 Pattern 4: Projects/Portfolio Page

**Universal Projects Showcase Template**

The projects/portfolio page demonstrates your work and builds authority (E-E-A-T). Use real case studies with metrics.

```astro
---
// src/pages/projects.astro (or /portfolio.astro, /work.astro, /case-studies.astro)
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generatePageSEO,
  generateBreadcrumbSchema
} from "@/config/seo";

const seoProps = generatePageSEO({
  title: "Our Projects - [Service] Success Stories",
  // Example: "Our Projects - Web Design Success Stories"
  description: "[Brief intro]. 10+ [projects/clients] [served/completed] in [location/industry]. [Results summary].",
  // Example: "Explore our portfolio of award-winning web design projects. 200+ clients served across Texas. Average 150% increase in conversions."
  image: "/images/projects/featured-project-og.jpg"
});

const breadcrumbs = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" }
  // or "Portfolio", "Our Work", "Case Studies"
];
const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
---

<MainLayout>
  <SeoHead {seoProps} {schemas: [breadcrumbSchema]} />

  <h1>Our [Projects / Portfolio / Work]</h1>

  <p class="lead">
    [Brief introduction to your portfolio. Highlight total projects,
    industries served, or key results.]
  </p>
  <!-- Example: "Since 2014, we've delivered over 200 custom websites for
       clients ranging from Austin startups to Fortune 500 companies. Browse
       our featured projects below." -->

  <!-- Optional: Filter/Category Navigation -->
  <nav class="project-filters">
    <button data-filter="all">All Projects</button>
    <button data-filter="[category-1]">[Category 1]</button>
    <!-- Example: <button data-filter="ecommerce">E-commerce</button> -->
    <button data-filter="[category-2]">[Category 2]</button>
    <!-- Example: <button data-filter="saas">SaaS</button> -->
    <button data-filter="[category-3]">[Category 3]</button>
  </nav>

  <!-- Projects Grid -->
  <section class="projects-grid">
    <!-- Project Card Template - Repeat for each project -->
    <article class="project-card" data-category="[category]">
      <a href="/projects/[project-slug]">
        <!-- Project Image -->
        <img
          src="/images/projects/[project-slug]-thumb.jpg"
          alt="[Descriptive alt text with project name, service type, and client if allowed]"
          width="800"
          height="600"
          loading="lazy"
        />
        <!-- Example alt: "E-commerce website design for GreenGoods organic products company" -->

        <!-- Project Info -->
        <div class="project-info">
          <h2>[Project Title with Keywords]</h2>
          <!-- Example: "E-commerce Website for Organic Products Brand" -->

          <div class="project-meta">
            <span class="service-type">[Service Type]</span>
            <!-- Example: "Web Design & Development" -->
            <span class="location">[Location or Industry]</span>
            <!-- Example: "Austin, TX" or "Healthcare" -->
            {/* Optional: Year */}
            <span class="year">[Year]</span>
          </div>

          <p class="project-description">
            [One-sentence description of the project and its goals]
          </p>
          <!-- Example: "Complete e-commerce redesign focused on improving
               mobile checkout experience and increasing organic traffic." -->

          <!-- Results/Metrics (if available) - HIGHLY recommended for E-E-A-T -->
          <div class="project-results">
            <div class="result">
              <span class="result-number">[+X]%</span>
              <span class="result-label">[Metric]</span>
            </div>
            <!-- Example: "+240%", "Conversions" -->
            <div class="result">
              <span class="result-number">[+X]%</span>
              <span class="result-label">[Metric]</span>
            </div>
            <div class="result">
              <span class="result-number">[+X]%</span>
              <span class="result-label">[Metric]</span>
            </div>
          </div>

          {/* Optional: Client name (if allowed) */}
          <p class="client-name">Client: [Client Name or "Confidential"]</p>
        </div>
      </a>
    </article>

    <!-- Repeat project cards -->
    <!-- Best practice: Feature 6-12 of your best projects -->
  </section>

  <!-- Optional: Call to Action -->
  <section class="projects-cta">
    <h2>Want Similar Results?</h2>
    <p>
      [Invitation to discuss their project]
    </p>
    <!-- Example: "Let's discuss how we can achieve similar success for your business." -->
    <a href="/contact" class="btn-primary">Start Your Project</a>
  </section>
</MainLayout>
```

**📋 Project Page Best Practices:**

**Each Project Should Include:**

- [ ] Descriptive title with service type keywords
- [ ] High-quality featured image (before/after if applicable)
- [ ] Service type or category
- [ ] Location, industry, or client type
- [ ] Brief description (1-2 sentences)
- [ ] **Results with metrics** (e.g., "+150% traffic", "40% faster load time")
- [ ] Year completed
- [ ] Client name (if permitted) or industry vertical

**Image Optimization:**

```html
<!-- ✅ CORRECT -->
<img
  src="/images/projects/ecommerce-redesign-greengoods.jpg"
  alt="E-commerce website redesign for GreenGoods organic products - mobile-first design with streamlined checkout"
  width="800"
  height="600"
  loading="lazy"
/>

<!-- ❌ INCORRECT -->
<img src="/images/project1.jpg" alt="project" />
```

**Individual Project Pages (Optional but Recommended):**

If you create individual project pages (`/projects/[slug].astro`), include:

- Full project details and objectives
- Before/after screenshots
- Detailed results with metrics
- Technologies/tools used
- Client testimonial (if available)
- Project timeline
- Challenges overcome
- Link to live project (if allowed)

### 🎨 Pattern 5: Contact Page with LocalBusiness Schema

**Universal Contact Page Template**

CRITICAL for local SEO: NAP (Name, Address, Phone) must be identical everywhere and match `COMPANY_INFO`.

```astro
---
// src/pages/contact.astro (or /contacto.astro, /get-in-touch.astro)
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generatePageSEO,
  generateBreadcrumbSchema,
  COMPANY_INFO
} from "@/config/seo";

const seoProps = generatePageSEO({
  title: "Contact Us - [City, State]",
  // Example: "Contact Us - Austin, Texas"
  description: `[Action verb] for diseño web. Office at ${COMPANY_INFO.address.street}, Bogotá. Call ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}.`,
  // Example: "Contact us for web design services. Office at 123 Main St, Austin, TX. Call (512) 555-0123 or email hello@designco.com."
});

// LocalBusiness Schema - CRITICAL for Local SEO
// This tells Google your exact location, hours, and how to contact you
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness", // or a more specific subtype: "Store", "Restaurant", etc.
  "@id": new URL("#localbusiness", Astro.site).href,
  "name": COMPANY_INFO.name,
  "image": new URL(COMPANY_INFO.image, Astro.site).href,
  "description": COMPANY_INFO.description,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": COMPANY_INFO.address.street,
    "addressLocality": COMPANY_INFO.address.city,
    "addressRegion": COMPANY_INFO.address.region,
    "postalCode": COMPANY_INFO.address.postalCode,
    "addressCountry": COMPANY_INFO.address.countryCode
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": COMPANY_INFO.geo?.latitude,
    "longitude": COMPANY_INFO.geo?.longitude
  },
  "url": new URL("/", Astro.site).href,
  "telephone": COMPANY_INFO.phone,
  "email": COMPANY_INFO.email,
  "priceRange": "$$", // Update: $ (budget), $$ (moderate), $$$ (expensive), $$$$ (luxury)
  // Business Hours - UPDATE WITH YOUR ACTUAL HOURS
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",  // Update with your hours
      "closes": "17:00"  // 24-hour format
    }
    // Add Saturday/Sunday if applicable:
    // {
    //   "@type": "OpeningHoursSpecification",
    //   "dayOfWeek": "Saturday",
    //   "opens": "10:00",
    //   "closes": "14:00"
    // }
  ],
  "sameAs": Object.values(COMPANY_INFO.socialMedia).filter(Boolean)
};

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" }
]);

const schemas = [localBusinessSchema, breadcrumbSchema];
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <h1>Contact [Company Name]</h1>
  <!-- or "Get in Touch", "Let's Talk", "Contact Us" -->

  <p class="lead">
    [Invitation message. Mention response time or what to expect.]
  </p>
  <!-- Example: "We'd love to hear about your project. Fill out the form
       below and we'll get back to you within 24 hours." -->

  <div class="contact-container">
    <!-- Contact Form -->
    <section class="contact-form">
      <h2>Send Us a Message</h2>
      <!-- or "Request a Quote", "Get Started", "Schedule Consultation" -->

      <form action="/api/contact" method="POST">
        <!-- Name -->
        <div class="form-group">
          <label for="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="John Doe"
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="john@example.com"
          />
        </div>

        <!-- Phone (optional but recommended) -->
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="(555) 123-4567"
          />
        </div>

        <!-- Service Interest (optional but helps qualification) -->
        <div class="form-group">
          <label for="service">Service Interested In</label>
          <select id="service" name="service">
            <option value="">Select a service...</option>
            <option value="diseno-web">[Service 1 Name]</option>
            <option value="marketing-digital">[Service 2 Name]</option>
            <option value="optimizacion-seo">[Service 3 Name]</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Message -->
        <div class="form-group">
          <label for="message">Your Message *</label>
          <textarea
            id="message"
            name="message"
            required
            rows="6"
            placeholder="Tell us about your project..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary">
          Send Message
        </button>
      </form>
    </section>

    <!-- Contact Information Sidebar -->
    <aside class="contact-info">
      <h2>Get in Touch</h2>

      <!-- CRITICAL: NAP must match COMPANY_INFO and LocalBusiness schema exactly -->
      <div class="info-block">
        <h3>📍 Office Location</h3>
        <p>
          <a
            href={`https://maps.google.com/?q=${COMPANY_INFO.address.street}, ${COMPANY_INFO.address.city}`}
            target="_blank"
            rel="noopener"
          >
            {COMPANY_INFO.address.street}<br />
            {COMPANY_INFO.address.city}, {COMPANY_INFO.address.region} {COMPANY_INFO.address.postalCode}<br />
            {COMPANY_INFO.address.country}
          </a>
        </p>
      </div>

      <div class="info-block">
        <h3>📞 Phone</h3>
        <p>
          <a href={`tel:${COMPANY_INFO.phone}`}>
            {COMPANY_INFO.phone}
          </a>
        </p>
      </div>

      <div class="info-block">
        <h3>✉️ Email</h3>
        <p>
          <a href={`mailto:${COMPANY_INFO.email}`}>
            {COMPANY_INFO.email}
          </a>
        </p>
      </div>

      <div class="info-block">
        <h3>🕒 Business Hours</h3>
        <p>
          Monday - Friday: [9:00 AM - 5:00 PM]<br />
          Saturday: [Closed or hours]<br />
          Sunday: Closed
        </p>
        <!-- Update with your actual hours matching the schema -->
      </div>

      <!-- Social Media Links -->
      <div class="info-block">
        <h3>Follow Us</h3>
        <div class="social-links">
          {COMPANY_INFO.socialMedia.linkedin && (
            <a href={COMPANY_INFO.socialMedia.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn">
              [LinkedIn Icon]
            </a>
          )}
          {COMPANY_INFO.socialMedia.facebook && (
            <a href={COMPANY_INFO.socialMedia.facebook} target="_blank" rel="noopener" aria-label="Facebook">
              [Facebook Icon]
            </a>
          )}
          {COMPANY_INFO.socialMedia.instagram && (
            <a href={COMPANY_INFO.socialMedia.instagram} target="_blank" rel="noopener" aria-label="Instagram">
              [Instagram Icon]
            </a>
          )}
          {/* Add other social platforms */}
        </div>
      </div>
    </aside>
  </div>

  <!-- Optional: Embedded Map -->
  <section class="map-section">
    <h2>Find Us</h2>
    <!-- Google Maps Embed -->
    {COMPANY_INFO.geo && (
      <iframe
        src={`https://maps.google.com/maps?q=${COMPANY_INFO.geo.latitude},${COMPANY_INFO.geo.longitude}&z=15&output=embed`}
        width="100%"
        height="450"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Office Location Map"
      ></iframe>
    )}
  </section>

  <!-- Optional: FAQ Section -->
  <section class="contact-faq">
    <h2>Common Questions</h2>
    <div class="faq-item">
      <h3>How quickly will you respond?</h3>
      <p>[Your response time commitment]</p>
      <!-- Example: "We typically respond within 24 business hours." -->
    </div>
    <div class="faq-item">
      <h3>Do you offer free consultations?</h3>
      <p>[Your consultation policy]</p>
      <!-- Example: "Yes! We offer a free 30-minute consultation to discuss your project." -->
    </div>
    <div class="faq-item">
      <h3>What areas do you serve?</h3>
      <p>[Your service area]</p>
      <!-- Example: "We serve clients throughout Texas, with a focus on the Austin metro area." -->
    </div>
  </section>
</MainLayout>
```

**⚠️ CRITICAL Contact Page Requirements:**

**NAP Consistency (Most Important for Local SEO):**

- Name, Address, Phone MUST be identical across:
  - Contact page
  - Footer on all pages
  - LocalBusiness schema
  - Google Business Profile
  - All directory listings

**Example of Consistent NAP:**

```
✅ CORRECT (All Identical):
DesignCo Agency
123 Main Street, Suite 200
Austin, TX 78701
(512) 555-0123

❌ INCORRECT (Inconsistent):
Contact Page: "123 Main St, Ste 200"
Footer: "123 Main Street #200"
Schema: "123 Main Street, Suite 200"
Google: "123 Main St Suite 200"
```

**LocalBusiness Schema Types:**

Choose the most specific `@type` for your business:

- `LocalBusiness` - Generic local business
- `Dentist` / `Physician` - Healthcare
- `Restaurant` - Food service
- `Store` - Retail
- `AutoDealer`, `RealEstateAgent`, etc. - Industry-specific

**Form Best Practices:**

- Keep forms short (3-5 fields max for initial contact)
- Mark required fields with `*`
- Include privacy statement/GDPR compliance if applicable
- Add CAPTCHA to prevent spam (Google reCAPTCHA)
- Send confirmation email after submission
- Include clear call-to-action on submit button

---

## Optimization Checklist

### ✅ Technical SEO Base

- [ ] SSL certificate (HTTPS) active
- [ ] Sitemap.xml generated and submitted to Google Search Console
- [ ] robots.txt properly configured (allow AI crawlers: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot)
- [ ] Page speed optimized (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Responsive and mobile-first design
- [ ] Clean and descriptive URLs (Spanish, lowercase, hyphens)
- [ ] Web architecture: all pages max 3 clicks from homepage

### ✅ On-Page SEO (All Pages)

- [ ] Unique meta title (50-60 characters)
- [ ] Persuasive meta description (150-160 characters)
- [ ] Only one H1 per page
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] Images with descriptive Spanish filenames
- [ ] Complete alt text on all images (Spanish, descriptive)
- [ ] Internal links with descriptive anchor text
- [ ] Unique and original content (not duplicated)
- [ ] Content in Spanish (es-CO)

### ✅ Page-Specific SEO

#### Homepage (`/`)

- [ ] Uses `generatePageSEO()`
- [ ] ORGANIZATION_SCHEMA and WEBSITE_SCHEMA emitted once (MainLayout adds them)
- [ ] Features all primary keywords in H1 and intro paragraph
- [ ] Links to all main service pages
- [ ] Includes company stats/social proof

#### Service Pages (`/services/*`)

- [ ] If the page shows an FAQ section (questions from `faqs.ts` or the brief), it emits `generateFAQSchema()`
- [ ] Breadcrumb schema implemented
- [ ] Direct answer in first 50-100 words
- [ ] Lists and/or comparison tables included
- [ ] E-E-A-T signals (experience stats, certifications)
- [ ] CTA to contact page

#### About Page

- [ ] Implements `generatePersonSchema()` for founder
- [ ] Company history with founding date
- [ ] Founder biography with credentials
- [ ] Certifications list (Google Analytics, ISO, NTC)
- [ ] Experience stats (years, projects)
- [ ] Social proof/testimonials if available

#### Projects Page (`/proyectos`)

- [ ] Descriptive project titles with keywords
- [ ] Location information for each project
- [ ] Service type specified
- [ ] Results/metrics when possible
- [ ] Optimized images with descriptive alt text

#### Contact Page (`/contacto`)

- [ ] LocalBusiness schema implemented
- [ ] NAP (Name, Address, Phone) matches COMPANY_INFO exactly
- [ ] Contact form functional
- [ ] Map with correct coordinates
- [ ] Office hours specified
- [ ] Social media links (from COMPANY_INFO.socialMedia)

### ✅ AEO (Answer Engine Optimization)

- [ ] FAQPage schema only where a visible FAQ section shows the questions (from `faqs.ts` or the brief, never invented)
- [ ] Direct answers in first 50-100 words
- [ ] Bulleted and numbered lists used
- [ ] Comparison tables for complex data
- [ ] Headings phrased as the natural-language questions customers ask

### ✅ GEO (Generative Engine Optimization)

- [ ] Conversational and natural Spanish language
- [ ] Modular content in self-contained chunks
- [ ] Entities clearly defined in schema
- [ ] Schema only where it describes something visible and true on the page
- [ ] E-E-A-T demonstrated (experience, certifications, founder bio)
- [ ] Content updated within last 90 days (check dates)
- [ ] Founder/team information with credentials
- [ ] Client testimonials and social proof

### ✅ Schema Markup

- [ ] **Homepage**: ORGANIZATION_SCHEMA + WEBSITE_SCHEMA
- [ ] **Service Pages**: Service Schema + Breadcrumb Schema (+ FAQ Schema only with a visible FAQ section)
- [ ] **About Page**: Person Schema (founder) + Breadcrumb Schema
- [ ] **Contact Page**: LocalBusiness Schema + Breadcrumb Schema
- [ ] **Projects Page**: Breadcrumb Schema (minimum)
- [ ] All schemas validated with [Schema Markup Validator](https://validator.schema.org/)

### ✅ Schema Property Validation — Known Pitfalls

These are schema.org type-mismatch warnings that Google's Rich Results Test and validator.schema.org will flag. Audit any schema you write against this list.

#### ❌ `geo` on `Organization`

`geo` (with `GeoCoordinates`) is **not** a property of `Organization`. It belongs to `Place` and its subtypes (e.g. `LocalBusiness`).

**Wrong:**
```json
{
  "@type": "Organization",
  "geo": { "@type": "GeoCoordinates", "latitude": 4.711, "longitude": -74.07 }
}
```

**Correct — put `geo` only on `LocalBusiness` (or a subtype):**
```json
{
  "@type": "LocalBusiness",
  "geo": { "@type": "GeoCoordinates", "latitude": 4.711, "longitude": -74.07 }
}
```

#### ❌ `position` on `Offer`

`position` is a property of `ListItem`, **not** `Offer`. Placing it directly on an `Offer` inside an `OfferCatalog.itemListElement` will trigger a schema.org warning.

**Wrong:**
```json
{
  "@type": "OfferCatalog",
  "itemListElement": [
    { "@type": "Offer", "position": 1, "itemOffered": { ... } }
  ]
}
```

**Correct — wrap each `Offer` in a `ListItem`, carry `position` there:**
```json
{
  "@type": "OfferCatalog",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": "..." }
      }
    }
  ]
}
```

### ✅ AI Crawlers Configuration

Verify in `robots.txt` that these user-agents are allowed:

- [ ] GPTBot (OpenAI ChatGPT)
- [ ] ChatGPT-User (OpenAI)
- [ ] ClaudeBot (Anthropic)
- [ ] Google-Extended (Google Gemini)
- [ ] PerplexityBot (Perplexity)
- [ ] CCBot (Common Crawl)

---

## Metrics and Measurement

### 📊 Traditional KPIs (SEO)

| Metric               | Tool                  | Target                       | Current Status |
| -------------------- | --------------------- | ---------------------------- | -------------- |
| **Organic Traffic**  | Google Analytics 4    | +20% quarterly               | [Track]        |
| **Keyword Rankings** | Semrush/Ahrefs        | Top 10 for primary keywords  | [Track]        |
| **Organic CTR**      | Google Search Console | >3%                          | [Track]        |
| **Backlinks**        | Ahrefs                | +50 quality backlinks/year   | [Track]        |
| **Core Web Vitals**  | PageSpeed Insights    | LCP<2.5s, INP<200ms, CLS<0.1 | [Track]        |
| **Pages Indexed**    | Google Search Console | All main pages               | [Track]        |

**Priority Keywords to Track:**

- [Primary keyword per service + location]
- [Add specific long-tail keywords per service]

### 📊 New KPIs (AEO/GEO)

| Metric                            | Tool                               | Target              | Current Status |
| --------------------------------- | ---------------------------------- | ------------------- | -------------- |
| **"People Also Ask" Appearances** | Manual/Semrush                     | 10+ PAAs            | [Track]        |
| **AI Citation Frequency**         | Manual (ChatGPT/Perplexity search) | 10+ mentions/month  | [Track]        |
| **Share of Voice in AI Answers**  | Manual                             | >25% on core topics | [Track]        |
| **Mention Sentiment**             | Manual analysis                    | 80%+ positive       | [Track]        |
| **Schema Implementation**         | Rich Results Test                  | 100% of pages       | [Track]        |

**How to Track AI Citations:**

1. Weekly searches in ChatGPT: "best [your service] companies in [your location]"
2. Weekly searches in Perplexity: "[your service] [your location]"
3. Document: Is [Company Name] mentioned? Is it cited as a source?
4. Track sentiment: positive, neutral, or negative mention

### 🔧 Essential Tools

1. **Google Search Console**:
   - Monitor impressions, clicks, average position
   - Check for indexing issues
   - Submit sitemap
   - Monitor mobile usability

2. **Google Analytics 4**:
   - Track traffic sources
   - Monitor user behavior
   - Set up conversion goals (contact form submissions)
   - Track engagement metrics

3. **Semrush or Ahrefs**:
   - Keyword tracking
   - Backlink analysis
   - Technical SEO audits
   - Competitor analysis

4. **PageSpeed Insights**:
   - Core Web Vitals monitoring
   - Performance recommendations
   - Mobile vs desktop performance

5. **Schema Markup Validator** (https://validator.schema.org/):
   - Validate all JSON-LD schemas
   - Check for errors before deployment

6. **Google Rich Results Test** (https://search.google.com/test/rich-results):
   - Test specific pages for rich result eligibility
   - Verify FAQ schema, Service schema, etc.

### 📅 Maintenance Calendar

| Frequency         | Task                                              | Responsible   | Notes                           |
| ----------------- | ------------------------------------------------- | ------------- | ------------------------------- |
| **Daily**         | Monitor Google Search Console for critical errors | Dev/SEO       | Check for indexing issues       |
| **Weekly**        | Check AI citations (ChatGPT, Perplexity)          | Marketing     | Document mentions               |
| **Weekly**        | Monitor and respond to any customer reviews       | Marketing     | Build trust                     |
| **Bi-weekly**     | Check Core Web Vitals                             | Dev           | Ensure performance standards    |
| **Monthly**       | Traffic and rankings analysis                     | Marketing/SEO | Review GA4 + GSC reports        |
| **Monthly**       | Content freshness check                           | Content       | Update dates if content revised |
| **Quarterly**     | Full content audit and update                     | Content/SEO   | Update stats, add case studies  |
| **Quarterly**     | Keyword strategy review                           | SEO           | Adjust based on performance     |
| **Semi-annually** | Complete technical SEO audit                      | Dev/SEO       | Use Screaming Frog              |
| **Annually**      | Competitor analysis                               | Marketing/SEO | Benchmark against competition   |
| **Annually**      | Schema markup review                              | Dev           | Ensure all schemas current      |

---

## 🚨 Critical Errors to Avoid

### ❌ SEO Errors

1. **Keyword Stuffing**: Repeating keywords unnaturally in content

   ```html
   <!-- ❌ WRONG -->
   <h1>[Service] [Country] [Keyword] [Keyword] [City]</h1>

   <!-- ✅ CORRECT -->
   <h1>[Service] en [Country]</h1>
   ```

2. **Duplicate Content**: Copying content between pages or from other sites
   - Each service page must have unique content
   - Don't copy competitor content

3. **Identical Meta Titles**: Each page must have a unique title

   ```typescript
   // ❌ WRONG - All service pages have same title
   title: "Services | [Brand]";

   // ✅ CORRECT - Each service has unique title
   title: "[Service 1] [Location] | [Brand]";
   title: "[Service 2] [Location] | [Brand]";
   ```

4. **Broken Internal Links**: Regularly verify all links work
5. **Unoptimized Images**:
   - Generic names: `IMG_2034.jpg`
   - Missing alt text
   - Oversized files (>500KB)

6. **Inconsistent NAP**: Name, Address, Phone must be identical across:
   - Contact page
   - Footer
   - LocalBusiness schema
   - All match `COMPANY_INFO`

### ❌ AEO Errors

1. **Vague Answers**: Not directly answering the question

   ```html
   <!-- ❌ WRONG -->
   <p>
     Nuestros services son muy buenos y tenemos mucha experiencia. Contáctanos
     para más información.
   </p>

   <!-- ✅ CORRECT -->
   <p>
     [Answer the question in the first sentence: what it is, who it is for,
     and one concrete detail the client has confirmed.]
   </p>
   ```

2. **Improper Format**: Long paragraphs without structure
   - Use lists, tables, and short paragraphs
   - Break up walls of text

3. **Missing FAQ Schema**: Not implementing schema on FAQ sections
   - Always use `generateFAQSchema()` when the page shows a visible FAQ section (questions from `faqs.ts` or the brief)

### ❌ GEO Errors

1. **Over-optimization**: Robotic language filled with keywords

   ```html
   <!-- ❌ WRONG -->
   <p>
     [Service] [Country] [keyword] [keyword] [City] [Service] [keyword]
     [Service] [keyword] [Country].
   </p>

   <!-- ✅ CORRECT -->
   <p>
     [One or two sentences written the way you would explain it to a client:
     who you are, what you do, and where.]
   </p>
   ```

2. **Lack of E-E-A-T**: Not demonstrating experience or authority
   - Always include: years of experience, certifications, project count
   - Add founder bio with credentials
   - Include client testimonials

3. **Outdated Content**: Not updating information
   - Review and update content every 90 days
   - Update modification dates in schema

4. **Dependent Chunks**: Paragraphs that don't work independently

   ```html
   <!-- ❌ WRONG -->
   <p>Este proceso es muy importante.</p>
   <p>Por eso lo hacemos así.</p>

   <!-- ✅ CORRECT -->
   <p>
     [A paragraph that names its subject instead of "this process", so it
     still makes sense when quoted on its own.]
   </p>
   ```

5. **Missing Schema**: Not implementing JSON-LD for what a page shows
   - A schema goes on a page only when it describes something visible and true on that page
   - Use appropriate schema types per page

### ❌ Configuration Errors

1. **Hardcoding Company Info**: Never hardcode company data

   ```astro
   <!-- ❌ WRONG -->
   <p>Teléfono: [hardcoded phone number]</p>

   <!-- ✅ CORRECT -->
   ---
   import { COMPANY_INFO } from "@/config/seo";
   ---
   <p>Teléfono: {COMPANY_INFO.phone}</p>
   ```

2. **Not Using Schema Generators**: Creating schemas manually
   - When `src/config/seo.ts` has a generator for the type, use it (e.g. `generateBreadcrumbSchema()`, `generateFAQSchema()`, `generatePersonSchema()`)

---

## 📚 Additional Resources

### Official Documentation

- [Google Search Central](https://developers.google.com/search) - Google's official SEO documentation
- [Schema.org](https://schema.org/) - Structured data vocabulary
- [Core Web Vitals](https://web.dev/vitals/) - Performance metrics guide
- [Google E-E-A-T Guidelines](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) - Quality rater guidelines

### Validation Tools

- [Rich Results Test](https://search.google.com/test/rich-results) - Test rich snippets eligibility
- [Schema Markup Validator](https://validator.schema.org/) - Validate JSON-LD
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Mobile optimization check
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance and Core Web Vitals

### Learning Resources

- [Google Search Central Blog](https://developers.google.com/search/blog) - Latest SEO updates
- [Moz SEO Learning Center](https://moz.com/learn/seo) - SEO fundamentals
- [Ahrefs Blog](https://ahrefs.com/blog/) - Advanced SEO tactics

---

## Technical SEO Appendix

> Reference patterns for edge cases not covered in the main patterns: robots.txt configuration, URL design, mobile CSS requirements, and international/multi-language sites.

---

### 🤖 robots.txt Patterns

The `robots.txt` file controls which pages crawlers index. Two critical risks to avoid: **blocking pages you want indexed** and **blocking resources crawlers need to render pages** (JS, CSS, images).

```text
# /robots.txt
User-agent: *
Allow: /

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# ⚠️ NEVER block JS/CSS/images needed for rendering:
# ❌ Disallow: /static/
# ❌ Disallow: /_astro/
# Google must render the page to evaluate it — blocking assets hides content.

Sitemap: https://example.com/sitemap.xml
```

**Allow AI crawlers explicitly** (critical for GEO in 2026+):

```text
# OpenAI
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

# Google (Gemini/AI Overviews)
User-agent: Google-Extended
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Common Crawl (training data)
User-agent: CCBot
Allow: /
```

**Meta robots for individual pages:**

```html
<!-- Default — indexable, links followed -->
<meta name="robots" content="index, follow">

<!-- Noindex specific pages (thank-you, login, staging) -->
<meta name="robots" content="noindex, nofollow">

<!-- Control snippet length in search results -->
<meta name="robots" content="max-snippet:150, max-image-preview:large">
```

---

### 🔗 URL Structure Reference

URLs are a minor ranking signal but a strong usability and trust signal. Keep them readable, short, and keyword-relevant.

**Patterns:**

```
✅ Good URLs:
https://example.com/services/web-design
https://example.com/blog/how-to-choose-a-cms

❌ Poor URLs:
https://example.com/p?id=12345           ← parameters instead of paths
https://example.com/services/item/category/subcategory/web-design-2026-best-deal  ← too long
https://example.com/Services/Web_Design  ← uppercase, underscores
```

**Rules:**

| Rule | Correct | Incorrect |
|------|---------|-----------|
| Separator | hyphens (`-`) | underscores (`_`) |
| Case | lowercase | Mixed or UPPERCASE |
| Length | < 75 characters | > 100 characters |
| Parameters | avoid when possible | `/page?id=12&cat=5` |
| Keywords | include naturally | generic (`/page1`) |
| Protocol | HTTPS always | HTTP |

**Canonical URL** — always self-reference to prevent duplicate content penalties:

```html
<!-- On every page, the canonical must match the exact URL shown in the browser -->
<link rel="canonical" href="https://example.com/services/web-design">
```

**Pagination** — for paginated lists (blog, projects):

```html
<!-- page 2 of /projects -->
<link rel="canonical" href="https://example.com/projects">
<!-- or use rel="prev" / rel="next" for explicit series -->
<link rel="prev" href="https://example.com/projects?page=1">
<link rel="next" href="https://example.com/projects?page=3">
```

---

### 📱 Mobile Technical Details

Google uses mobile-first indexing — the mobile version of a page is what gets indexed. These CSS minimums ensure compliance.

**Viewport meta tag** (required):

```html
<!-- ✅ Correct — responsive -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- ❌ Incorrect — fixed width forces horizontal scroll on mobile -->
<meta name="viewport" content="width=1024">
```

**Tap targets** — links and buttons must be large enough to tap without precision:

```css
/* ❌ Too small — 44×44px is the minimum recommended by Google */
.small-link {
  padding: 4px;
  font-size: 12px;
}

/* ✅ Adequate tap target */
.mobile-link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  min-width: 48px;
  padding: 12px 16px;
  font-size: 16px;
}
```

**Font size** — text smaller than 16px forces users to zoom, which hurts usability scores:

```css
/* ❌ Forces zoom on mobile */
body { font-size: 12px; }

/* ✅ Readable without zooming */
body {
  font-size: 16px;
  line-height: 1.5;
}
```

**Spacing between tap targets** — avoid elements too close together:

```css
/* Minimum 8px gap between tappable elements */
.nav-links a + a {
  margin-left: 8px;
}
```

---

### 🌍 International SEO (Multi-language Sites)

Use these patterns when the project targets multiple languages or countries. If the current project is single-language, skip this section.

**Language declaration** (required in all cases):

```html
<!-- Single language -->
<html lang="en">

<!-- Language + region variant -->
<html lang="es-CO">   <!-- Spanish, Colombia -->
<html lang="en-US">   <!-- English, United States -->
```

**Hreflang tags** — tell Google which language/country version to show to which user:

```html
<!-- Add these inside <head> on every language variant of the page -->
<link rel="alternate" hreflang="en"    href="https://example.com/page">
<link rel="alternate" hreflang="es"    href="https://example.com/es/page">
<link rel="alternate" hreflang="es-CO" href="https://example.com/co/page">
<!-- x-default = fallback for countries/languages not explicitly listed -->
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

**Hreflang rules:**
- Every language variant must link to **all other variants**, including itself
- The `x-default` tag is required — point it to the default/international version
- URLs must be absolute (include `https://`)
- Must also be included in the XML sitemap

**Astro implementation** — use `generateSEOWithAlternates()` from `src/config/seo.ts`:

```typescript
const seoProps = generateSEOWithAlternates({
  title: "...",
  canonical: "/page",
  alternates: [
    { hreflang: "en", href: "https://example.com/page" },
    { hreflang: "es", href: "https://example.com/es/page" },
    { hreflang: "x-default", href: "https://example.com/page" },
  ]
});
```

**NAP (Name, Address, Phone) per locale** — if serving different regions with different contact info, each locale must have its own `LocalBusiness` schema with region-specific NAP data. Inconsistent NAP across locales hurts local rankings in each market.

---

## 🎯 Quick Reference Guide

### When Creating a New Page

1. **Choose the right pattern** from [Implementation Patterns](#implementation-patterns)
2. **Import necessary functions**:
   ```typescript
   import { generatePageSEO, generate[Type]Schema, generateBreadcrumbSchema } from "@/config/seo";
   import { COMPANY_INFO } from "@/config/seo";
   ```
3. **Generate SEO props**:
   ```typescript
   // generatePageSEO appends " | COMPANY_INFO.name" to the title
   const seoProps = generatePageSEO({
     title: "[Unique Title]",
     description: "[150-160 characters with keywords and CTA]",
     image: "/images/[page-specific-og-image].jpg",
   });
   ```
4. **Create appropriate schemas** (only for what the page shows):
   - Service page: Service + Breadcrumb (+ FAQ only with a visible FAQ section)
   - About page: Person + Breadcrumb
   - Contact page: LocalBusiness + Breadcrumb
   - Every page: Organization + Website (added by MainLayout)
5. **Structure content**:
   - H1 (only one)
   - Direct answer (first 50-100 words)
   - Modular paragraphs
   - Lists and/or tables
   - FAQ section (questions from `faqs.ts` or the brief, never invented)
   - E-E-A-T signals
6. **Validate before deploying**:
   - Check schema with [validator.schema.org](https://validator.schema.org/)
   - Test with Rich Results Test
   - Verify mobile responsiveness
   - Check Core Web Vitals

### SEO vs AEO vs GEO Quick Decision Tree

**Question**: What do I optimize for?

- **Traditional Google rankings?** → Focus on **SEO**
  - Keywords in title, headings, URL
  - Quality backlinks
  - Technical performance

- **Questions people ask search engines and voice assistants?** → Focus on **AEO**
  - Direct answers in 50-100 words
  - Question-format headings
  - Lists and tables

- **AI chatbot citations?** → Focus on **GEO**
  - Natural language
  - Self-contained chunks
  - E-E-A-T signals
  - Comprehensive entity context

**Best approach**: Implement all three simultaneously using the patterns in this guide.

---

## 🎓 Understanding the AI Era

### The Paradigm Shift

Traditional SEO focused on **ranking for clicks**. The new era is about **being the source of truth** for AI systems.

### Why This Matters

Your competitors who ignore AEO/GEO will become invisible as users increasingly rely on:

- **ChatGPT** for research questions
- **Perplexity** for factual queries
- **Google AI Overviews** for search summaries
- **Voice assistants** for quick answers

By implementing this guide, your company will:

1. ✅ **Be cited** when someone asks AI: "best [your service] companies in [your location]"
2. ✅ **Rank in traditional search** for primary keywords
3. ✅ **Build lasting authority** through E-E-A-T signals

---

**Last Updated**: March 9, 2026
**Version**: 1.0
**Guide Type**: Universal SEO/AEO/GEO Reference
**Status**: ✅ Ready for Any Project
