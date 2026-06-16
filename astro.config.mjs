// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Placeholder — the provisioning script rewrites this per client
  // (sed s|site: 'https://.*'|...|). Required by robots.txt.ts and @astrojs/sitemap.
  site: 'https://example.com',

  fonts: [
    {
      name: "Plus Jakarta Sans",
      cssVariable: "--font-jakarta",
      provider: fontProviders.fontsource(),
    },
    {
      name: "Nunito",
      cssVariable: "--font-nunito",
      provider: fontProviders.fontsource(),
    },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify(),
  integrations: [sitemap()]
});