// =============================================================================
// AUTHORS CONFIGURATION
// src/config/authorBio.ts
// =============================================================================

export interface Author {
  /** Author's full name */
  name: string;
  /** Role in the company */
  role: string;
  /** Short bio (1-2 sentences) to display in posts */
  bio: string;
  /** Author's image URL (optional) */
  image?: string;
  /** Credentials or specialties */
  credentials: string[];
  /** Author's social media links */
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  /** Author's profile URL on the site (optional) */
  url?: string;
}

/**
 * Authors array
 * The name must exactly match post.author from CMS
 */
export const AUTHORS: Author[] = [
  {
    name: "María González",
    role: "Co-fundadora & Estratega de Marca",
    bio: "Especialista en estrategia de marca con más de 10 años ayudando a empresas a construir conexiones auténticas con su audiencia.",
    image: "/images/team/maria-gonzalez.jpg",
    credentials: ["Estrategia de Marca", "Marketing Digital", "Creación de Contenido"],
    socialMedia: {
      instagram: "https://www.instagram.com/mariagonzalez/",
      linkedin: "https://www.linkedin.com/in/mariagonzalez/",
    },
    url: "/nosotros#maria-gonzalez",
  },
  {
    name: "Carlos Rodríguez",
    role: "Co-fundador & Desarrollador Web",
    bio: "Desarrollador full-stack especializado en sitios web de alto rendimiento con tecnologías modernas y optimización SEO.",
    image: "/images/team/carlos-rodriguez.jpg",
    credentials: [
      "Desarrollo Web",
      "Optimización de Rendimiento",
      "SEO Técnico",
    ],
    socialMedia: {
      linkedin: "https://www.linkedin.com/in/carlosrodriguez/",
      twitter: "https://twitter.com/carlosrodriguez",
    },
    url: "/nosotros#carlos-rodriguez",
  },
];

/**
 * Default author when no match is found
 * Uses organization as generic author
 */
export const DEFAULT_AUTHOR: Author = {
  name: "Tu Agencia Digital",
  role: "Digital Agency",
  bio: "Transformamos tu presencia digital con estrategia, propósito y autenticidad. Diseño web, marketing digital y contenido que refleja tu verdadera esencia.",
  credentials: ["Digital Marketing", "Web Design", "Brand Strategy"],
  socialMedia: {
    linkedin: "https://www.linkedin.com/company/tuagencia",
    instagram: "https://www.instagram.com/tuagencia",
  },
};

/**
 * Get author by name
 * Returns DEFAULT_AUTHOR if not found
 */
export function getAuthorByName(name: string): Author {
  return AUTHORS.find((author) => author.name === name) || DEFAULT_AUTHOR;
}
