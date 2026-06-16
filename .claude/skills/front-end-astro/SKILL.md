---
name: front-end-astro
description: Create distinctive, production-grade Astro components and pages using HTML and Tailwind CSS. Use this skill when working with Astro projects to build web components, landing pages, sections, or UI elements. This skill specializes in Astro's component syntax (.astro files) with HTML structure and Tailwind CSS styling only - NO React, Vue, Solid, or Preact frameworks. Always reads CLAUDE.md for project context before starting work.
---

Produce real, working Astro components with exceptional attention to aesthetic details. Avoid generic "AI slop" aesthetics.

## Workflow

**STEP 1: Load Project Context**

Read the following files to understand the project before writing any code:

1. `CLAUDE.md` — project overview, component conventions, path aliases, tech stack
2. `src/styles/global.css` — color palette (CSS custom properties, `@theme`), typography tokens, base styles
3. `package.json` — confirm GSAP and other relevant dependencies are installed

From these, extract: component directory structure, color tokens, font families, path aliases (`@/*`), and whether GSAP is present.

**STEP 2: Design Thinking**

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Astro component requirements, responsive design needs, accessibility standards.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

**STEP 3: Implementation**

Implement Astro components (.astro files) that are:

- Pure HTML structure with Tailwind CSS utility classes
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Astro Component Constraints

- **NO framework components**: Do NOT use React, Vue, Solid, Preact, or any UI framework syntax
- **HTML + Tailwind only**: Structure with semantic HTML, style with Tailwind utility classes
- **NO inline styles**: NEVER use `style=""` attributes on any element. All styling must be done exclusively via Tailwind CSS utility classes.
- **NO arbitrary values**: NEVER use `h-[220px]` arbitrary values on any utitility class.
- **NO animations**: If GSAP is installed in the project, do NOT add animations — these are handled in separate utility files
- **Respect project structure**: Follow component organization from CLAUDE.md (global/, landing/, perPage/, ui/)
- **Tailwind CSS v4 gradient syntax**: NEVER use `bg-gradient-to-*` (deprecated v3 syntax). ALWAYS use `bg-linear-to-*` instead. Examples: `bg-linear-to-br`, `bg-linear-to-r`, `bg-linear-to-t`. This applies to all gradient direction utilities.
- **Images via Astro Image component**: ALWAYS use `<Image />` (or `<Picture />`) imported from `astro:assets` for every image. NEVER use a raw `<img>` tag. This enforces Astro's built-in image optimization (format conversion, lazy loading, correct dimensions). The `alt` attribute is required on every `<Image />`.
- **SVG icons - NO inline SVGs**: NEVER write inline `<svg>` markup directly in components. ALWAYS import SVG files from the assets directory and use them as components. Example: `import arrowIcon from "@/assets/icons/arrow.svg"` then use as `<arrowIcon class="h-6 w-6" />`. This keeps components clean, enables SVG reuse, and allows for proper optimization. If an SVG asset doesn't exist, create it and put it into `@/assets/icons/`, but DO NOT create inline SVG markup.

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: FIRST read `src/styles/global.css` to understand existing font families and typography system. Use the project's established fonts and type scale. Never use redundant utility classes on text tags if these are set in `src/styles/global.css` (@layer base {}) object. Only suggest new fonts if the project lacks a clear typography system. Avoid generic fonts like Arial and Inter; prefer distinctive choices that match the project's aesthetic direction.
- **Color & Theme**: FIRST read `src/styles/global.css` to understand the existing color palette, CSS custom properties, and theme system. Use the project's established colors and design tokens. Build components that align with the existing aesthetic direction. Only suggest new colors if they complement the established palette or if no theme exists.
- **Motion**: ONLY if GSAP is NOT installed - use tailwind CSS animations/transitions for micro-interactions. If GSAP is present, skip animations entirely (handled separately). Focus on TailwindCSS hover states, transitions, and transforms.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density. Leverage Tailwind's grid and flexbox utilities.
- **Backgrounds & Visual Details**: Create atmosphere and depth with Tailwind gradient utilities, background patterns, shadows, borders. Use backdrop-blur, opacity layers, and decorative SVG elements.

**NEVER use generic AI-generated aesthetics:**

- Overused fonts: Inter, Roboto, Arial, Space Grotesk, system fonts
- Cliched colors: purple gradients on white backgrounds
- Predictable layouts and cookie-cutter component patterns

Vary between light/dark themes, different fonts, different aesthetics across generations. Make unexpected choices that feel genuinely designed for the context.

**Match complexity to vision**: Maximalist designs need elaborate markup with layered elements. Minimalist designs need restraint, precision, and careful spacing. The key is executing the chosen direction well.

## Example Component

```astro
---
import { Image } from "astro:assets";

interface Props {
  heading: string;
  description: string;
  image?: ImageMetadata;
}

const { heading, description, image } = Astro.props;
---

<article
  class="relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-50 to-orange-100 p-8 shadow-xl"
>
  <div
    class="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl"
  >
  </div>

  <div class="relative z-10">
    <h3
      class="mb-4 font-serif text-4xl font-bold tracking-tight text-slate-900"
    >
      {heading}
    </h3>
    <p class="max-w-prose text-lg leading-relaxed text-slate-700">
      {description}
    </p>
  </div>

  {
    image && (
      <div class="mt-6">
        <Image
          src={image}
          alt={heading}
          priority
          class="h-full w-full object-cover"
        />
      </div>
    )
  }
</article>
```
