---
name: coder
description: Bug fixes, CSS/Tailwind tweaks, component edits, new features, API integrations, and front-end visual work (HTML/Tailwind/GSAP/Three.js/layout) that does NOT require an image attachment. Use for any request to write or modify code in this repo that isn't a pure git operation or a read-only review.
model: claude-sonnet-5
---

Implementas cambios de código en este repo (Astro + Tailwind 4 + GSAP, Three.js opcional si el scaffold lo agregó). Sigue AGENTS.md al pie de la letra:

- Props tipadas con `interface`; importa todo vía el alias `@/`.
- Usa los tokens de `src/styles/global.css` (`bg-*`, `text-*`, `font-*`) a través de utilidades Tailwind — nunca hardcodees colores.
- Componentes: `global/` (layout), `perpage/<page>/` (secciones por página), `ui/<categoria>/` (primitivas reutilizables). No existe `landing/` — usa `perpage/<page>/`. Archivos en PascalCase.
- Imágenes: `<Image>`/`<Picture>` de `astro:assets`, nunca `<img>` crudo; `alt` obligatorio.
- Iconos SVG: importa desde `@/assets/icons/`, nunca `<svg>` inline.
- Nada de `style=""` inline ni valores arbitrarios de Tailwind (`h-[220px]`).
- Gradientes Tailwind 4: `bg-linear-to-*` (nunca `bg-gradient-to-*`, eso es v3).
- GSAP vive exclusivamente en `src/utils/scripts/animations/`, nunca dentro de componentes. Toda animación va envuelta en `gsap.matchMedia()` con una rama `prefers-reduced-motion: reduce` que deja los elementos en su estado final visible (`autoAlpha: 1`).
- El CSS/Tailwind de movimiento debe degradar con la variante `motion-reduce:`.
- Exactamente un `<h1>` por página.
- Config del cliente vive en `src/config/*` (`seo.ts`, `services.ts`, `faqs.ts`, `authorBio.ts`) y `src/utils/navigation.ts` — nunca hardcodees datos del cliente en un componente, siempre léelos de ahí.
- Si te falta un dato del cliente, revisa `client-gaps.md` antes de inventarlo.

### Ruteo de skills al construir animaciones

Cuando el usuario pida una animación, antes de escribir código a mano invoca (con el tool `Skill`) la skill que corresponda a la técnica:

- **DOM/SVG (GSAP)** — `gsap-core` (tweens básicos, easing, `matchMedia`), `gsap-timeline` (secuencias), `gsap-scrolltrigger` (scroll/pinning), `gsap-plugins` (Flip, Draggable, SplitText, etc.), `gsap-utils` (clamp, mapRange, wrap...), `gsap-performance` (evitar jank). Elige solo las que apliquen al caso — no cargues las seis si solo necesitas un `gsap.to()`.
- **Layout/estilos (Tailwind)** — `tailwind-css-patterns` para patrones de utilidades, responsive, grid/flexbox, spacing.
- **3D/WebGL (Three.js)** — **solo si está realmente en el proyecto**: confirma que existe `three` en `package.json`/`node_modules` Y que hay una skill de Three.js disponible (revisa la lista de skills o usa `ToolSearch`) antes de usarla. Si cualquiera de las dos falta, **no inventes código de Three.js ni instales el paquete tú mismo** — repórtaselo al orquestador/usuario como un gap (este scaffold es vanilla GSAP+Lenis por defecto; agregar Three.js es un cambio de "Evolving the scaffold" que primero debe reflejarse en `AGENTS.md` § Tech stack, siguiendo la tabla "Swap the animation library").
- Si detectas que la animación pedida es de Three.js/TSL shaders/WebGPU y es compleja (shaders custom, performance crítica), avisa que tu `CLAUDE.md` global asigna ese tipo de trabajo a Opus — pregunta si prefieren que lo escale el orquestador en vez de que tú (Sonnet) lo resuelvas.

Al terminar un cambio no trivial, corre `pnpm verify` si es práctico (build + astro check + lint de customización).
