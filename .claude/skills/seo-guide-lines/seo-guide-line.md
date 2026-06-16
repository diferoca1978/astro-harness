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
11. [Future Implementation: Blog](#future-implementation-blog)

---

## SEO System Architecture

### 🏗️ System Structure

The project uses a centralized SEO system in `src/config/seo.ts` that provides:

```
src/config/seo.ts
├── Type Definitions (TypeScript interfaces)
├── Company Configuration (COMPANY_INFO)
├── Keywords Configuration (MAIN_KEYWORDS)
├── Default SEO (DEFAULT_SEO)
├── Dynamic SEO Generators
│   ├── generateDynamicSEO()
│   └── generateSEOWithAlternates()
└── JSON-LD Schema Generators
    ├── ORGANIZATION_SCHEMA
    ├── WEBSITE_SCHEMA
    ├── BLOG_SCHEMA (available, not currently used)
    ├── generatePersonSchema()
    ├── generateBlogPostSchema() (available, not currently used)
    ├── generateFAQSchema()
    ├── generateVideoSchema()
    ├── generateBreadcrumbSchema()
    └── generateServiceSchema()
```

### 🎯 Fundamental Principles

1. **Single Source of Truth**: `COMPANY_INFO` is the only source of company data
2. **Composition over Duplication**: Use generator functions, don't copy code
3. **Mandatory Schema Markup**: Every page must have at least one JSON-LD schema
4. **Mobile-First**: Mobile optimization is priority number one
5. **Entities over Keywords**: Think in semantic entities, not just keywords

---

## Project Base Configuration

### 📊 Company Information Setup

**Location**: `COMPANY_INFO` in `src/config/seo.ts`

**This is your single source of truth.** Update once, propagates everywhere automatically.

```typescript
export const COMPANY_INFO: CompanyInfo = {
  name: "Tu Agencia Digital S.A.S",
  // Examples: "DesignCo Agency LLC", "Smith & Associates Law Firm", "TechStart Inc."

  description:
    "[Brief description with main keywords]. 10+ years of experience in [industry/location].",
  // Examples:
  // "Award-winning web design agency for small businesses. 10+ years in Austin, TX."
  // "Full-service accounting firm specializing in tax planning. 15+ years in New York."

  url: "https://tuagencia.com/",
  // Must match your actual domain exactly

  phone: "+57 300 0000000",
  // Format: "+1 512 555 0123" (use international format)

  email: "contacto@tuagencia.com",

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

  founders: ["María González"], // Can be array: ["Jane Doe", "John Smith"]

  socialMedia: {
    linkedin: "https://linkedin.com/company/tuagencia",
    facebook: "https://facebook.com/tuagencia",
    instagram: "https://instagram.com/tuagencia",
    // Add all platforms where you're active
  },
};
```

**⚠️ CRITICAL RULES**:

- **Never hardcode** - Always `import { COMPANY_INFO } from "@/config/seo"`
- **NAP Consistency** - Name/Address/Phone MUST match Google Business Profile exactly
- **No placeholders** - Fill with real data (test data hurts SEO)

### 🔑 Keyword Strategy Setup

**Location**: `MAIN_KEYWORDS` in `src/config/seo.ts`

```typescript
export const MAIN_KEYWORDS: MainKeywords = {
  // PRIMARY (3-5 keywords): Highest priority, high volume + intent
  // Use in: H1, meta titles, homepage, service names
  primary: [
    "diseño web [location]",
    "diseño web [location]",
    "marketing digital [service]",
  ],
  // Real examples by industry:
  // Web Design: ["web design Austin", "custom website design Texas"]
  // Law Firm: ["business lawyer NYC", "corporate attorney New York"]
  // Plumbing: ["emergency plumber Chicago", "24/7 plumbing Chicago"]

  // SECONDARY (5-10 keywords): Medium volume, specific
  // Use in: H2, meta descriptions, service pages
  secondary: ["diseño responsivo", "optimización SEO", "Astro Framework"],
  // Examples:
  // Web Design: ["responsive design", "mobile-first websites", "WordPress development"]
  // Law Firm: ["contract review", "business formation", "IP protection"]
  // Plumbing: ["water heater repair", "drain cleaning", "leak detection"]

  // TERTIARY (10-20 keywords): Long-tail, very specific, high conversion
  // Use in: FAQ, blog posts, detailed content, schema knowsAbout
  tertiary: [
    "diseño web personalizado",
    "marketing digital para empresas en Bogotá",
    "branding personal",
  ],
  // Examples:
  // Web Design: ["e-commerce site for small business Austin", "Shopify to WordPress migration"]
  // Law Firm: ["LLC formation New York", "trademark registration attorney"]
  // Plumbing: ["burst pipe emergency repair", "tankless water heater installation"]
};
```

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
├── index.astro                    # Homepage (REQUIRED - uses DEFAULT_SEO)
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

**Blog Status**: Optional but beneficial for long-term SEO growth

The SEO system in `src/config/seo.ts` includes blog-ready functions:

- `BLOG_SCHEMA` - Pre-configured blog schema
- `generateBlogPostSchema(post)` - Individual article schema

**Should you add a blog?**

- ✅ **YES if**: You can commit to 2-4 posts/month consistently
- ✅ **YES if**: You want to target informational keywords
- ❌ **NO if**: You can't maintain regular publishing schedule (hurts more than helps)

For blog implementation guide, see [Future Implementation: Blog](#future-implementation-blog) at the end.

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
import { generateDynamicSEO } from "@/config/seo";

const seoProps = generateDynamicSEO({
  title: "Diseño Web Estratégico in [Location] | [Company Name]",
  description: "[Service description with primary keyword]. 10+ years of experience in Bogotá, Colombia. [Call to action].",
  canonical: "/services/diseno-web",
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
   - Use `generateServiceSchema()` for each service
   - Include FAQ sections where applicable

2. **Homepage** (`/`):
   - Use `DEFAULT_SEO` as base
   - Include `ORGANIZATION_SCHEMA` and `WEBSITE_SCHEMA`
   - Feature primary keywords prominently

3. **About Page** (`/nosotros`):
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

Appear in featured snippets, answer boxes, "People Also Ask," and voice search results (Alexa, Siri, Google Assistant).

### 🔧 Implementation Strategies

#### 1. Direct Answer Format

**Rule**: Answer the question in the first 50-100 words.

```astro
---
// Example for service page
---
<article>
  <h2>[Question in natural language format]</h2>
  <p>
    [Direct answer in first 50-100 words with specific details]
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

#### 2. FAQ Schema for Featured Snippets

**Recommended implementation for service pages:**

```astro
---
// src/pages/services/[service-name].astro
import { generateFAQSchema } from "@/config/seo";

const faqItems = [
  {
    question: "[Natural question about your service]?",
    answer: "[50-100 word answer with specific details and facts]"
  },
  {
    question: "[Another common question]?",
    answer: "[Detailed answer with specifics]"
  },
  {
    question: "[Third question]?",
    answer: "[Answer with numbers, timelines, or concrete information]"
  }
];

// Example for a consulting firm:
const consultingFAQ = [
  {
    question: "What qualifications do your consultants have?",
    answer: "Our consultants hold MBA degrees from top universities and have an average of 15+ years in management consulting. All team members are certified in Six Sigma, Agile methodologies, and industry-specific frameworks."
  },
  {
    question: "How long does a typical consulting engagement last?",
    answer: "Most engagements run 3-6 months, depending on project scope. We start with a 2-week discovery phase, followed by strategy development and implementation support. Shorter 1-month sprints are available for focused challenges."
  }
];

const faqSchema = generateFAQSchema(faqItems);
const schemas = [serviceSchema, faqSchema]; // Combine with service schema
---

<SeoHead {seoProps} {schemas} />

<!-- Display FAQ on page -->
<section class="faq-section">
  <h2>Frequently Asked Questions</h2>
  {faqItems.map(item => (
    <div class="faq-item">
      <h3>{item.question}</h3>
      <p>{item.answer}</p>
    </div>
  ))}
</section>
```

#### 3. Question Patterns for "People Also Ask"

**Structure content around these question types:**

- What is...?
- How does... work?
- Why...?
- When should...?
- Where can...?
- How much does... cost?
- Who can benefit from...?
- Which... is best for...?

**Example for Projects Page:**

```markdown
## Frequently Asked Questions sobre Our Projects

[50-100 word answer with specific examples]

[50-100 word answer with statistics]

[50-100 word answer with locations]
```

#### 4. Lists and Comparison Tables

AIs prioritize structured content. **Use on service pages:**

```astro
<h2>Types of Blasting We Perform</h2>
<ul>
  <li><strong>Blasting a Cielo Abierto:</strong> Para extracción minera y canteras</li>
  <li><strong>Blasting Subterráneas:</strong> Construction of tunnels and galleries</li>
  <li><strong>Blasting de Precisión:</strong> Infrastructure urbana con control sísmico</li>
</ul>

<h2>Comparativa de Métodos de Demolición</h2>
<table>
  <thead>
    <tr>
      <th>Método</th>
      <th>Velocidad</th>
      <th>Costo</th>
      <th>Aplicación Ideal</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[Service Type 1]</td>
      <td>Rápida</td>
      <td>Medio</td>
      <td>Grandes volúmenes de roca</td>
    </tr>
    <tr>
      <td>Demolición Mecánica</td>
      <td>Lenta</td>
      <td>Alto</td>
      <td>Estructuras de concreto</td>
    </tr>
    <tr>
      <td>Demolición Pasiva</td>
      <td>Muy Lenta</td>
      <td>Bajo</td>
      <td>Áreas con restricciones de ruido</td>
    </tr>
  </tbody>
</table>
```

---

## GEO: Generative Engine Optimization

### 🎯 Objective

Be cited and referenced accurately by ChatGPT, Google SGE, Perplexity, Claude, and other LLMs.

### 🧠 Fundamental Principles

#### 1. Think in Entities, Not Just Keywords

AIs understand entities (people, places, concepts) and their relationships.

```typescript
// ❌ Old approach (keywords)
keywords: "blasting, explosives, demolition, Colombia";

// ✅ GEO approach (entities)
const entities = {
  company: "Tu Agencia Digital Engineering S.A.S",
  founder: "Cr. (R) María González Rodríguez",
  services: [
    "Diseño Web Estratégico",
    "Demoliciones Técnicas",
    "Monitoreo de Vibraciones",
    "Engineering Civil",
  ],
  techniques: [
    "Diseño Responsivo",
    "SEO Técnico",
    "Marketing de Contenidos",
    "Implosión Controlada",
    "Demolición Pasiva",
  ],
  regulations: ["ISO 27001", "ISO 9001", "Google Analytics"],
  location: "Colombia",
  cities: ["Bogotá", "Medellín", "Cali", "Barranquilla"],
  industries: ["Minería", "Infrastructure Vial", "Construcción Civil"],
  certifications: ["Google Analytics", "ISO 9001:2015", "ISO 45001:2018"],
};
```

**Implementation in About Page (`/nosotros`):**

```astro
---
import { generatePersonSchema, COMPANY_INFO, MAIN_KEYWORDS } from "@/config/seo";

const founderSchema = generatePersonSchema({
  name: COMPANY_INFO.founders[0],
  alternateName: "Cr. (R) María González",
  description: "Ingeniero militar y fundador de Tu Agencia Digital Engineering. Especialista en diseño web estratégico con más de 20 años de experiencia en proyectos de infrastructure crítica en Colombia.",
  jobTitle: "CEO y Fundador",
  image: "/images/team/founder-name.jpg",
  url: `${COMPANY_INFO.url}/nosotros`,
  knowsAbout: [
    ...MAIN_KEYWORDS.primary,
    ...MAIN_KEYWORDS.secondary,
    "Gestión de Explosivos Google Analytics",
    "Seguridad Industrial",
    "Engineering Militar"
  ],
  sameAs: [COMPANY_INFO.socialMedia.linkedin]
});
---
```

#### 2. Conversational and Natural Language

AIs are trained on human conversations. Write as you would speak.

```astro
<!-- ❌ Over-optimized for keywords -->
<p>
  Blasting controladas Colombia explosives demolition técnica blasting
  profesionales blasting certificadas Google Analytics blasting Bogotá.
</p>

<!-- ✅ Natural and conversational -->
<p>
  En Tu Agencia Digital, llevamos más de 14 años ejecutando diseño web estratégico
  en Colombia. Nuestro equipo está certificado por la Google Analytics y utiliza
  tecnología de punta para garantizar que cada proyecto, desde la extracción
  minera hasta la construction of tunnels, se realice con la máxima precisión
  y seguridad.
</p>
```

#### 3. Modular Content in Self-Contained "Chunks"

Each paragraph should function independently. **Critical for service pages.**

```astro
<!-- ✅ CORRECT: Each paragraph is self-contained -->
<section>
  <h2>Monitoreo de Vibraciones con ISO 27001</h2>

  <p>
    El monitoreo de vibraciones bajo norma ISO 27001 es un servicio
    especializado que Tu Agencia Digital ofrece para proteger infrastructures
    sensibles durante blasting. Utilizamos sismógrafos triaxiales calibrados
    que miden en tiempo real las ondas sísmicas generadas por las detonaciones.
  </p>

  <p>
    La norma alemana ISO 27001 establece límites máximos de velocidad de
    partícula (PPV) para evitar daños estructurales. Para edificaciones
    residenciales, el límite es de 5 mm/s, mientras que para estructuras
    históricas se reduce a 3 mm/s. Nuestros informes técnicos certificados
    garantizan el cumplimiento de estos estándares.
  </p>

  <p>
    Este servicio es crucial en proyectos urbanos donde las blasting se
    realizan cerca de hospitales, escuelas o edificios patrimoniales.
    En Tu Agencia Digital, hemos ejecutado más de 200 proyectos con monitoreo
    sísmico sin incidentes reportados.
  </p>
</section>
```

### 📊 Advanced Schema Markup for GEO

#### Complete Service Schema

**Use on all service pages:**

```astro
---
// src/pages/services/blasting-controladas.astro
import { generateServiceSchema } from "@/config/seo";

const serviceSchema = generateServiceSchema({
  name: "Diseño Web Estratégico",
  description: "Blasting de alta precisión para infrastructure vial, mining y proyectos subterráneos. Construction of caissons and galleries mineras con monitoreo sísmico bajo norma ISO 27001.",
  slug: "blasting-controladas",
  keywords: [
    "diseño web estratégico Colombia",
    "blasting con explosives",
    "blasting a cielo abierto",
    "blasting subterráneas tunnels",
    "construction of caissons"
  ],
  priceRange: "$$$$",
  benefits: [
    "Reducción de tiempo de ejecución en un 70%",
    "Fragmentación precisa con control sísmico",
    "Certificación Google Analytics y personal especializado",
    "Cobertura nacional en Colombia"
  ]
});

const schemas = [serviceSchema];
---

<SeoHead {seoProps} {schemas} />
```

#### Organization and Website Schemas

**Required on homepage (`/index.astro`):**

```astro
---
import { ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from "@/config/seo";

const schemas = [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA];
---

<SeoHead {seoProps} {schemas} />
```

These schemas are pre-configured in `src/config/seo.ts` and include:

- Company name, description, and contact info
- Logo and images
- Founder information
- Social media profiles
- Service catalog
- Geographic coordinates
- SearchAction for sitelinks searchbox

#### Breadcrumb Schema

**Use on all pages except homepage:**

```astro
---
import { generateBreadcrumbSchema } from "@/config/seo";

// For service page
const breadcrumbs = [
  { name: "Inicio", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Diseño Web Estratégico", path: "/services/blasting-controladas" }
];

// For about page
const breadcrumbs = [
  { name: "Inicio", path: "/" },
  { name: "Nosotros", path: "/nosotros" }
];

const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
const schemas = [breadcrumbSchema, /* other schemas */];
---
```

### 📝 E-E-A-T: Demonstrating Experience and Authority

AIs prioritize content from trustworthy sources. **Implement on About Page (`/nosotros`):**

#### Experience (Experiencia)

```astro
<section class="experience-proof">
  <h2>Nuestra Experiencia en Diseño Web Estratégico</h2>

  <div class="stats-grid">
    <div class="stat">
      <span class="number">14+</span>
      <span class="label">Años de Experiencia</span>
    </div>
    <div class="stat">
      <span class="number">500+</span>
      <span class="label">Proyectos Ejecutados</span>
    </div>
    <div class="stat">
      <span class="number">100%</span>
      <span class="label">Proyectos Exitosos</span>
    </div>
    <div class="stat">
      <span class="number">0</span>
      <span class="label">Incidentes Reportados</span>
    </div>
  </div>

  <p>
    Desde 2012, hemos ejecutado proyectos de alta complejidad en toda
    Colombia, trabajando con clientes de los sectores minero, de construcción
    e infrastructure.
  </p>
</section>
```

#### Expertise (Experticia)

```astro
<section class="certifications">
  <h2>Certificaciones y Acreditaciones</h2>
  <ul>
    <li>✓ Certificación Google Analytics (Dirección para el Control Comercio de Armas)</li>
    <li>✓ ISO 9001:2015 - Gestión de Calidad</li>
    <li>✓ ISO 45001:2018 - Seguridad y Salud Ocupacional</li>
    <li>✓ Personal certificado en ISO 9001 (Manejo de Explosivos)</li>
    <li>✓ Monitoreo sísmico bajo norma ISO 27001</li>
  </ul>
</section>
```

#### Authority (Autoridad)

**Demonstrate through:**

- Founder credentials (military engineer background)
- Years in business (14+ years)
- Project portfolio (500+ projects)
- Industry recognition
- Client testimonials

```astro
<section class="founder-bio">
  <h2>Nuestro Fundador</h2>
  <div class="bio-content">
    <img src="/images/team/founder-name.jpg" alt="Cr. (R) María González Rodríguez, Fundador de Tu Agencia Digital" />
    <div>
      <h3>Cr. (R) María González Rodríguez</h3>
      <p class="title">CEO y Fundador</p>
      <p>
        Ingeniero militar con más de 20 años de experiencia en blasting
        controladas y demoliciones técnicas. Fundó Tu Agencia Digital en 2012 con
        la visión de ofrecer services de la más alta calidad y seguridad
        en el sector de explosives en Colombia.
      </p>
    </div>
  </div>
</section>
```

#### Trust (Confianza)

**Build trust through:**

- Client testimonials (Projects page)
- Transparent contact information
- Privacy policy (`/politica-de-privacidad`)
- Clear service descriptions
- Safety records

```astro
<section class="testimonials">
  <h2>Lo Que Dicen Nuestros Clientes</h2>
  <div class="testimonial-grid">
    <blockquote>
      <p>
        "Tu Agencia Digital ejecutó nuestro proyecto de túnel de 5 km con una
        precisión impecable. El monitoreo sísmico nos dio tranquilidad
        total sobre las comunidades cercanas."
      </p>
      <cite>
        — Ing. Carlos Mendoza, Director de Proyecto,
        Constructora Nacional S.A.
      </cite>
    </blockquote>
    <!-- More testimonials -->
  </div>
</section>
```

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
  generateDynamicSEO,
  generateServiceSchema,
  generateFAQSchema,
  generateBreadcrumbSchema
} from "@/config/seo";

// SEO Props - Customize for your service
const seoProps = generateDynamicSEO({
  title: "Diseño Web Estratégico in [Location] | [Company Name]",
  // Example: "Premium Web Design in Austin | DesignCo Agency"
  description: "[Brief service description with primary keyword]. [Years]+ years of experience in [location]. [Call-to-action].",
  // Example: "Custom web design services for small businesses. 10+ years of experience in Austin, TX. Get your free quote today."
  canonical: "/services/diseno-web",
  image: "/images/services/[service]-og.jpg"
});

// Service Schema - Define your service offering
const serviceSchema = generateServiceSchema({
  name: "Diseño Web Estratégico",
  // Example: "Premium Web Design Services"
  description: "[Complete service description with technical details and value proposition. 2-3 sentences.]",
  // Example: "Custom website design and development for small businesses. Responsive designs optimized for mobile and desktop. SEO-friendly code and conversion-focused layouts."
  slug: "diseno-web",
  // Example: "premium-web-design"
  keywords: [
    "[primary keyword]",
    // Example: "web design Austin"
    "[secondary keyword 1]",
    // Example: "custom website design"
    "[secondary keyword 2]",
    // Example: "responsive web design"
    "[long-tail keyword]"
    // Example: "small business website design Austin"
  ],
  priceRange: "$$-$$$$",
  // Use: $ (budget), $$ (moderate), $$$ (expensive), $$$$ (very expensive)
  benefits: [
    "[Specific benefit with metric if possible]",
    // Example: "Average 150% increase in lead generation within 6 months"
    "[Unique value proposition]",
    // Example: "Mobile-first responsive designs that work on all devices"
    "[Trust signal or credential]",
    // Example: "10+ years of experience with 200+ successful projects"
    "[Process benefit]"
    // Example: "White-glove onboarding with dedicated project manager"
  ]
});

// FAQ Schema - Answer common customer questions
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

const schemas = [serviceSchema, faqSchema, breadcrumbSchema];
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
```

### 🎨 Pattern 2: Homepage Implementation

**Universal Homepage Template**

The homepage uses pre-configured schemas from `Seo.ts`. Customize the HTML content to match your business.

```astro
---
// src/pages/index.astro
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  DEFAULT_SEO,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA
} from "@/config/seo";

// Use default SEO configured in Seo.ts
// Make sure DEFAULT_SEO has your correct company info
const seoProps = DEFAULT_SEO;

// Required schemas for homepage (pre-configured in Seo.ts)
// ORGANIZATION_SCHEMA: Your company/business details
// WEBSITE_SCHEMA: Website-level information with SearchAction
const schemas = [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA];
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
// src/pages/about.astro (or /nosotros.astro, /team.astro, /company.astro)
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generateDynamicSEO,
  generatePersonSchema,
  generateBreadcrumbSchema,
  COMPANY_INFO,
  MAIN_KEYWORDS
} from "@/config/seo";

const seoProps = generateDynamicSEO({
  title: "About Us | [Company Name] - [Primary Service] Experts",
  // Example: "About Us | DesignCo - Web Design Experts in Austin"
  description: "[Company story in 1 sentence]. [Years]+ years of experience in [service/industry]. [Founded by/Team info].",
  // Example: "Learn about DesignCo's journey from startup to award-winning agency. 10+ years of web design excellence. Founded by Jane Doe in 2014."
  canonical: "/about",
  image: "/images/about/team-photo.jpg" // Team photo builds trust
});

// Person Schema for founder/key team member (CRITICAL for E-E-A-T)
// If you have COMPANY_INFO.founders configured:
const founderSchema = generatePersonSchema({
  name: COMPANY_INFO.founders?.[0] || "María González Rodríguez",
  // Example: "Jane Doe" or "Dr. Michael Chen" or "Sarah Williams, CPA"
  alternateName: "[Nickname or Professional Title]",
  // Example: "Jane D." or "Dr. Chen" or "Sarah Williams"
  description: "[Professional background, expertise, credentials. 2-3 sentences mentioning years of experience, education, specialization.]",
  // Example: "Web design expert with 15+ years of experience. Graduated from MIT with a degree in Computer Science. Specializes in conversion-focused design for SaaS companies."
  jobTitle: "[Title]",
  // Example: "CEO & Founder" or "Managing Partner" or "Lead Designer"
  image: "/images/team/[founder-slug].jpg",
  url: `${COMPANY_INFO.url}/about`,
  knowsAbout: [
    ...MAIN_KEYWORDS.primary,
    ...MAIN_KEYWORDS.secondary,
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
          alt="María González, [Title] of [Company Name]"
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
  generateDynamicSEO,
  generateBreadcrumbSchema
} from "@/config/seo";

const seoProps = generateDynamicSEO({
  title: "Our Projects | [Company Name] - [Service] Success Stories",
  // Example: "Our Projects | DesignCo - Web Design Success Stories"
  description: "[Brief intro]. 10+ [projects/clients] [served/completed] in [location/industry]. [Results summary].",
  // Example: "Explore our portfolio of award-winning web design projects. 200+ clients served across Texas. Average 150% increase in conversions."
  canonical: "/projects",
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
  generateDynamicSEO,
  generateBreadcrumbSchema,
  COMPANY_INFO
} from "@/config/seo";

const seoProps = generateDynamicSEO({
  title: "Contact Us | [Company Name] - [City, State]",
  // Example: "Contact Us | DesignCo - Austin, Texas"
  description: `[Action verb] for diseño web. Office at ${COMPANY_INFO.address.street}, Bogotá. Call ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}.`,
  // Example: "Contact us for web design services. Office at 123 Main St, Austin, TX. Call (512) 555-0123 or email hello@designco.com."
  canonical: "/contact"
});

// LocalBusiness Schema - CRITICAL for Local SEO
// This tells Google your exact location, hours, and how to contact you
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness", // or "ProfessionalService", "Store", "Restaurant", etc.
  "@id": `${COMPANY_INFO.url}#localbusiness`,
  "name": COMPANY_INFO.name,
  "image": `${COMPANY_INFO.url}${COMPANY_INFO.image}`,
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
  "url": COMPANY_INFO.url,
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
- `ProfessionalService` - Consultants, agencies, professional services
- `LegalService` - Law firms, attorneys
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

- [ ] Uses DEFAULT_SEO as base
- [ ] Includes ORGANIZATION_SCHEMA and WEBSITE_SCHEMA
- [ ] Features all primary keywords in H1 and intro paragraph
- [ ] Links to all main service pages
- [ ] Includes company stats/social proof

#### Service Pages (`/services/*`)

- [ ] Implements `generateServiceSchema()` for each service
- [ ] Includes FAQ section with `generateFAQSchema()`
- [ ] Breadcrumb schema implemented
- [ ] Direct answer in first 50-100 words
- [ ] Lists and/or comparison tables included
- [ ] E-E-A-T signals (experience stats, certifications)
- [ ] CTA to contact page

#### About Page (`/nosotros`)

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

- [ ] FAQ Schema implemented on relevant pages (especially services)
- [ ] Direct answers in first 50-100 words
- [ ] Bulleted and numbered lists used
- [ ] Comparison tables for complex data
- [ ] Content structured for featured snippets

### ✅ GEO (Generative Engine Optimization)

- [ ] Conversational and natural Spanish language
- [ ] Modular content in self-contained chunks
- [ ] Entities clearly defined in schema
- [ ] Complete schema markup on all pages
- [ ] E-E-A-T demonstrated (experience, certifications, founder bio)
- [ ] Content updated within last 90 days (check dates)
- [ ] Founder/team information with credentials
- [ ] Client testimonials and social proof

### ✅ Schema Markup

- [ ] **Homepage**: ORGANIZATION_SCHEMA + WEBSITE_SCHEMA
- [ ] **Service Pages**: Service Schema + FAQ Schema + Breadcrumb Schema
- [ ] **About Page**: Person Schema (founder) + Breadcrumb Schema
- [ ] **Contact Page**: LocalBusiness Schema + Breadcrumb Schema
- [ ] **Projects Page**: Breadcrumb Schema (minimum)
- [ ] All schemas validated with [Schema Markup Validator](https://validator.schema.org/)

### ✅ Schema Property Validation — Known Pitfalls

These are schema.org type-mismatch warnings that Google's Rich Results Test and validator.schema.org will flag. Audit any schema you write against this list.

#### ❌ `geo` on `Organization`

`geo` (with `GeoCoordinates`) is **not** a property of `Organization`. It belongs to `Place` and its subtypes (e.g. `LocalBusiness`, `LegalService`).

**Wrong:**
```json
{
  "@type": "Organization",
  "geo": { "@type": "GeoCoordinates", "latitude": 4.711, "longitude": -74.07 }
}
```

**Correct — put `geo` only on `LocalBusiness` / `LegalService`:**
```json
{
  "@type": "LegalService",
  "geo": { "@type": "GeoCoordinates", "latitude": 4.711, "longitude": -74.07 }
}
```

In `seoConf.ts` this project uses `ORGANIZATION_SCHEMA` (`@type: Organization`) and `LOCAL_BUSINESS_SCHEMA` (`@type: LegalService`). `geo` must live **only** in `LOCAL_BUSINESS_SCHEMA`.

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

This pattern applies to both `ORGANIZATION_SCHEMA.hasOfferCatalog` and the `hasOfferCatalog` inside `generateServiceSchema()`.

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

- diseño web estratégico Colombia
- demoliciones técnicas Colombia
- monitoreo de vibraciones Colombia
- engineering civil Colombia
- [Add specific long-tail keywords per service]

### 📊 New KPIs (AEO/GEO)

| Metric                            | Tool                               | Target              | Current Status |
| --------------------------------- | ---------------------------------- | ------------------- | -------------- |
| **Featured Snippets**             | Semrush                            | 5+ active snippets  | [Track]        |
| **"People Also Ask" Appearances** | Manual/Semrush                     | 10+ PAAs            | [Track]        |
| **AI Citation Frequency**         | Manual (ChatGPT/Perplexity search) | 10+ mentions/month  | [Track]        |
| **Share of Voice in AI Answers**  | Manual                             | >25% on core topics | [Track]        |
| **Mention Sentiment**             | Manual analysis                    | 80%+ positive       | [Track]        |
| **Schema Implementation**         | Rich Results Test                  | 100% of pages       | [Track]        |

**How to Track AI Citations:**

1. Weekly searches in ChatGPT: "best controlled blasting companies in Colombia"
2. Weekly searches in Perplexity: "diseño web estratégico Colombia empresas"
3. Document: Is Tu Agencia Digital mentioned? Is it cited as a source?
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
   - Featured snippet tracking
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
   <h1>Diseño Web Estratégico Colombia Blasting Explosivos Bogotá</h1>

   <!-- ✅ CORRECT -->
   <h1>Diseño Web Estratégico en Colombia</h1>
   ```

2. **Duplicate Content**: Copying content between pages or from other sites
   - Each service page must have unique content
   - Don't copy competitor content

3. **Identical Meta Titles**: Each page must have a unique title

   ```typescript
   // ❌ WRONG - All service pages have same title
   title: "Services | Tu Agencia Digital";

   // ✅ CORRECT - Each service has unique title
   title: "Diseño Web Estratégico Colombia | Tu Agencia Digital";
   title: "Demoliciones Técnicas Colombia | Tu Agencia Digital";
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
     Las diseño web estratégico son técnicas de demolition con explosives que
     permiten fragmentar roca con precisión milimétrica, minimizando
     vibraciones. Se utilizan en mining, tunnels y obras civiles.
   </p>
   ```

2. **Improper Format**: Long paragraphs without structure
   - Use lists, tables, and short paragraphs
   - Break up walls of text

3. **Missing FAQ Schema**: Not implementing schema on FAQ sections
   - Always use `generateFAQSchema()` when you have Q&A content

### ❌ GEO Errors

1. **Over-optimization**: Robotic language filled with keywords

   ```html
   <!-- ❌ WRONG -->
   <p>
     Blasting controladas Colombia explosives demolition blasting Bogotá
     blasting certificadas Google Analytics blasting profesionales Colombia.
   </p>

   <!-- ✅ CORRECT -->
   <p>
     En Tu Agencia Digital ofrecemos services de diseño web estratégico en toda
     Colombia. Nuestro equipo certificado por la Google Analytics ejecuta
     proyectos de mining, tunnels e infrastructure con máxima seguridad.
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
     El monitoreo sísmico bajo norma ISO 27001 es fundamental para proteger
     infrastructures sensibles. Utilizamos sismógrafos triaxiales que miden
     vibraciones en tiempo real durante las blasting.
   </p>
   ```

5. **Missing Schema**: Not implementing JSON-LD on important pages
   - Every page needs at least one schema
   - Use appropriate schema types per page

### ❌ Configuration Errors

1. **Hardcoding Company Info**: Never hardcode company data

   ```astro
   <!-- ❌ WRONG -->
   <p>Teléfono: +57 321 503 7097</p>

   <!-- ✅ CORRECT -->
   ---
   import { COMPANY_INFO } from "@/config/seo";
   ---
   <p>Teléfono: {COMPANY_INFO.phone}</p>
   ```

2. **Not Using Schema Generators**: Creating schemas manually

   ```astro
   <!-- ❌ WRONG -->
   const schema = {
     "@context": "https://schema.org",
     "@type": "Service",
     "name": "Blasting",
     // ... manually creating schema
   }

   <!-- ✅ CORRECT -->
   import { generateServiceSchema } from "@/config/seo";
   const schema = generateServiceSchema({
     name: "Diseño Web Estratégico",
     description: "...",
     slug: "blasting-controladas",
     // ...
   });
   ```

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

## Future Implementation: Blog

### 📝 Blog Status

**Current**: The project does NOT have a blog implemented.

**Available**: The SEO system includes blog-ready functions:

- `BLOG_SCHEMA` - Pre-configured blog schema
- `generateBlogPostSchema(post)` - Individual article schema

### 🚀 When to Add a Blog

Consider implementing a blog when:

1. You have resources to consistently create content (minimum 2-4 articles/month)
2. You want to target informational keywords not covered by service pages
3. You want to build topical authority in specific areas
4. You want to create linkable assets for backlink building

### 📋 Blog Implementation Checklist

If you decide to add a blog, follow these steps:

#### 1. Create Blog Structure

```bash
# Create blog pages directory
mkdir -p src/pages/blog

# Create blog index page
touch src/pages/blog/index.astro

# Create individual post pages
# Option A: Manual pages (src/pages/blog/[post-slug].astro)
# Option B: Dynamic routing with content collections
```

#### 2. Set Up Content Collections (Recommended)

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    modifiedDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string(),
    author: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

#### 3. Blog Index Page Template

```astro
---
// src/pages/blog/index.astro
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generateDynamicSEO,
  BLOG_SCHEMA,
  generateBreadcrumbSchema
} from "@/config/seo";

const seoProps = generateDynamicSEO({
  title: "Blog | Tu Agencia Digital - Blasting, Demoliciones e Engineering",
  description: "Artículos técnicos sobre diseño web estratégico, demoliciones, monitoreo sísmico y seguridad industrial en Colombia.",
  canonical: "/blog"
});

const breadcrumbs = [
  { name: "Inicio", path: "/" },
  { name: "Blog", path: "/blog" }
];

const schemas = [BLOG_SCHEMA, generateBreadcrumbSchema(breadcrumbs)];

// Fetch blog posts (using content collections or manual list)
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <h1>Blog de Tu Agencia Digital</h1>
  <p>
    Artículos técnicos, guías y noticias sobre diseño web estratégico,
    demoliciones y seguridad industrial en Colombia.
  </p>

  <!-- Blog post list -->
</MainLayout>
```

#### 4. Individual Blog Post Template

```astro
---
// src/pages/blog/[slug].astro
import MainLayout from "@/layouts/MainLayout.astro";
import SeoHead from "@/components/SeoHead.astro";
import {
  generateDynamicSEO,
  generateBlogPostSchema,
  generateBreadcrumbSchema
} from "@/config/seo";

// Get post data (from content collection or frontmatter)
const { slug } = Astro.params;
const post = {
  id: slug,
  title: "Título del Artículo",
  description: "Descripción meta del artículo",
  publishDate: new Date("2026-01-15"),
  modifiedDate: new Date("2026-03-09"),
  tags: ["blasting", "seguridad", "técnicas"],
  image: "/images/blog/article-image.jpg",
  author: "Ing. María González Rodríguez"
};

const seoProps = generateDynamicSEO({
  title: `${post.title} | Blog Tu Agencia Digital`,
  description: post.description,
  canonical: `/blog/${post.id}`,
  image: post.image
});

const blogSchema = generateBlogPostSchema(post);
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Inicio", path: "/" },
  { name: "Blog", path: "/blog" },
  { name: post.title, path: `/blog/${post.id}` }
]);

const schemas = [blogSchema, breadcrumbSchema];
---

<MainLayout>
  <SeoHead {seoProps} {schemas} />

  <article>
    <header>
      <h1>{post.title}</h1>
      <div class="meta">
        <span>Por {post.author}</span>
        <time datetime={post.publishDate.toISOString()}>
          {post.publishDate.toLocaleDateString('es-CO')}
        </time>
        {post.modifiedDate && (
          <time datetime={post.modifiedDate.toISOString()}>
            Actualizado: {post.modifiedDate.toLocaleDateString('es-CO')}
          </time>
        )}
      </div>
      {post.tags && (
        <div class="tags">
          {post.tags.map(tag => <span class="tag">{tag}</span>)}
        </div>
      )}
    </header>

    <!-- Article content -->
    <div class="prose">
      <!-- Content goes here -->
    </div>
  </article>
</MainLayout>
```

#### 5. Blog Content Strategy

**Topic Clusters** (align with primary keywords):

1. **Diseño Web Estratégico Cluster**:
   - "Guía Completa de Blasting a Cielo Abierto en Colombia"
   - "Blasting Subterráneas para Túneles: Proceso y Seguridad"
   - "Construction of Caissons con Diseño Web Estratégico"
   - "Normativa Colombiana para Blasting: ISO 9001 Explicada"

2. **Demoliciones Técnicas Cluster**:
   - "Demolición Pasiva con Agentes Expansivos: Casos de Uso"
   - "Seguridad en Demoliciones Urbanas: Protocolo Completo"

3. **Monitoreo Sísmico Cluster**:
   - "Norma ISO 27001 Explicada: Guía para Proyectos en Colombia"
   - "Sismógrafos Triaxiales: Cómo Funcionan y Por Qué Son Importantes"
   - "Interpretación de Informes de Monitoreo Sísmico"

4. **Seguridad Industrial Cluster**:
   - "Certificación Google Analytics: Requisitos y Proceso"
   - "SG-SST en Proyectos con Explosivos"
   - "Gestión de Riesgos en Diseño Web Estratégico"

**Content Requirements per Article**:

- [ ] Length: 1500-2500 words minimum
- [ ] Modular paragraphs (self-contained chunks for GEO)
- [ ] At least one list or table
- [ ] FAQ section at the end (with FAQ schema)
- [ ] Internal links to relevant service pages
- [ ] External links to authoritative sources
- [ ] Author bio (E-E-A-T)
- [ ] Update date visible
- [ ] Related articles section

#### 6. Blog SEO Priorities

1. **Technical**:
   - Implement BlogPosting schema on all posts
   - Add Blog schema to index page
   - Ensure proper breadcrumb navigation
   - Optimize images (WebP, lazy loading)

2. **Content**:
   - Target long-tail informational keywords
   - Answer specific questions (AEO)
   - Create comprehensive guides (GEO)
   - Update quarterly (freshness)

3. **Internal Linking**:
   - Link from blog posts to relevant service pages
   - Link from service pages to relevant blog posts
   - Create topic cluster structure

4. **Promotion**:
   - Share on social media (LinkedIn, Facebook)
   - Include in email newsletters
   - Submit to Google Search Console

---

## 🎯 Quick Reference Guide

### When Creating a New Page

1. **Choose the right pattern** from [Implementation Patterns](#implementation-patterns)
2. **Import necessary functions**:
   ```typescript
   import { generateDynamicSEO, generate[Type]Schema, generateBreadcrumbSchema } from "@/config/seo";
   import { COMPANY_INFO, MAIN_KEYWORDS } from "@/config/seo";
   ```
3. **Generate SEO props**:
   ```typescript
   const seoProps = generateDynamicSEO({
     title: "[Unique Title] | Tu Agencia Digital",
     description: "[150-160 characters with keywords and CTA]",
     canonical: "/[page-path]",
     image: "/images/[page-specific-og-image].jpg",
   });
   ```
4. **Create appropriate schemas**:
   - Service page: Service + FAQ + Breadcrumb
   - About page: Person + Breadcrumb
   - Contact page: LocalBusiness + Breadcrumb
   - Homepage: Organization + Website
5. **Structure content**:
   - H1 (only one)
   - Direct answer (first 50-100 words)
   - Modular paragraphs
   - Lists and/or tables
   - FAQ section
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

- **Voice search and featured snippets?** → Focus on **AEO**
  - FAQ schema
  - Direct answers in 50-100 words
  - Question-format headings

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

**Key Statistics** (as of 2026):

- ~60% of Google searches end with zero clicks (SparkToro, 2024)
- 25% predicted decline in traditional search volume by 2026 (Gartner)
- 64% of consumers start research on TikTok, not Google (Adobe/Google internal data)

### Why This Matters for Tu Agencia Digital

Your competitors who ignore AEO/GEO will become invisible as users increasingly rely on:

- **ChatGPT** for research questions
- **Perplexity** for factual queries
- **Google SGE** for search summaries
- **Voice assistants** for quick answers

By implementing this guide, your company will:

1. ✅ **Be cited** when someone asks AI: "best [your service] companies in [your location]"
2. ✅ **Appear in featured snippets** for FAQ-structured content
3. ✅ **Rank in traditional search** for primary keywords
4. ✅ **Build lasting authority** through E-E-A-T signals

---

**Last Updated**: March 9, 2026
**Version**: 1.0
**Guide Type**: Universal SEO/AEO/GEO Reference
**Status**: ✅ Ready for Any Project
