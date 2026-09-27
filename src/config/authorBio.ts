// People: authors and founders, for E-E-A-T. One model, filled per client from the brief.
// seo.ts builds each Person JSON-LD node from it (generatePersonSchema).

export interface Author {
  slug: string; // ASCII kebab-case, unique, stable: the Person @id is <site>/#person-<slug>
  name: string;
  role: string;
  bio: string;
  image?: string; // a path on this site or an https:// URL
  credentials: string[]; // shown on the page for E-E-A-T, not emitted in the JSON-LD
  socialMedia?: Record<string, string>; // profile URLs only → sameAs
  url?: string; // the author's page on this site, as a path
}

export const AUTHORS: Author[] = [];
