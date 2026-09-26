import type { SEOProps } from 'astro-seo';
import type { FAQItem } from './faqs';

// Site URL — from astro.config.mjs `site`; build every absolute URL from it

const SITE = import.meta.env.SITE;

// Types

export type JSONLDSchema = Record<string, unknown>;

export interface CompanyInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address?: {
    street?: string;
    city: string;
    region: string;
    postalCode?: string;
    countryCode: string; // ISO 3166-1 alpha-2
  };
  geo?: { latitude: number; longitude: number };
  logo: string;
  image: string;
  foundingDate?: string;
  founders?: string[];
  socialMedia: Record<string, string>; // profile URLs only → sameAs
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

// Company config — customize per project. Replace every marked placeholder from the
// brief / client-gaps.md. Optional fields ship absent: add them only when the client has them.

export const COMPANY_INFO: CompanyInfo = {
  name: '[CLIENTE] nombre del negocio',
  description: '[CLIENTE] descripción breve del negocio',
  phone: '[CLIENTE] teléfono con indicativo de país',
  email: '[CLIENTE] correo de contacto',
  whatsapp: '[CLIENTE] enlace wa.me con el número y el mensaje',
  address: {
    city: '[CLIENTE] ciudad',
    region: '[CLIENTE] departamento o región',
    countryCode: '[CLIENTE] código de país ISO 3166-1 alfa-2',
  },
  logo: '/images/logo.svg',
  image: '/images/og-image.png',
  socialMedia: {},
};

// Use when title and description are explicitly known at the page level.
// Sets no page URL — astro-seo derives it and og:url from Astro.url/Astro.site.

export function generatePageSEO(options: {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): SEOProps {
  const fullTitle = `${options.title} | ${COMPANY_INFO.name}`;
  const imageUrl = new URL(options.image ?? COMPANY_INFO.image, SITE).href;

  return {
    title: fullTitle,
    description: options.description,
    noindex: options.noindex ?? false,
    openGraph: {
      basic: {
        title: fullTitle,
        type: 'website',
        image: imageUrl,
      },
      optional: {
        description: options.description,
        siteName: COMPANY_INFO.name,
        locale: 'es_CO',
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: options.description,
      image: imageUrl,
    },
    extend: {
      meta: [
        { name: 'author', content: COMPANY_INFO.name },
      ],
    },
  };
}

// sameAs and address are emitted only when COMPANY_INFO has them.

export const ORGANIZATION_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': new URL('#organization', SITE).href,
  name: COMPANY_INFO.name,
  description: COMPANY_INFO.description,
  url: new URL('/', SITE).href,
  logo: new URL(COMPANY_INFO.logo, SITE).href,
  image: new URL(COMPANY_INFO.image, SITE).href,
  telephone: COMPANY_INFO.phone,
  email: COMPANY_INFO.email,
  ...(Object.keys(COMPANY_INFO.socialMedia).length > 0 && {
    sameAs: Object.values(COMPANY_INFO.socialMedia),
  }),
  ...(COMPANY_INFO.address && {
    address: {
      '@type': 'PostalAddress',
      ...(COMPANY_INFO.address.street && { streetAddress: COMPANY_INFO.address.street }),
      addressLocality: COMPANY_INFO.address.city,
      addressRegion: COMPANY_INFO.address.region,
      ...(COMPANY_INFO.address.postalCode && { postalCode: COMPANY_INFO.address.postalCode }),
      addressCountry: COMPANY_INFO.address.countryCode,
    },
  }),
};

export const WEBSITE_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': new URL('#website', SITE).href,
  name: COMPANY_INFO.name,
  description: COMPANY_INFO.description,
  url: new URL('/', SITE).href,
  inLanguage: 'es-CO',
  publisher: {
    '@id': new URL('#organization', SITE).href,
  },
};

export function generateFAQSchema(faqs: FAQItem[]): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, SITE).href,
    })),
  };
}

// Generic professional/expert schema — use for any service business where a named person
// is the primary trust signal (lawyer, doctor, consultant, coach, architect, etc.)
// Covers E-E-A-T requirements for YMYL verticals without being domain-specific.

export interface ProfessionalPerson {
  name: string;
  alternateName?: string[];
  description: string;
  jobTitle: string;
  occupationName: string;
  occupationCity?: string;
  image?: string;
  url?: string;
  email?: string;
  phone?: string;
  knowsAbout: string[];
  credentials?: string[];
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    [key: string]: string | undefined;
  };
  address: {
    street?: string;
    city: string;
    region: string;
    postalCode?: string;
    countryCode: string;
  };
}

// Anchors the person to the organization via worksFor and generates sameAs from all provided socials.
// Pass `credentials` (e.g. ["MBA", "Certified Coach"]) for richer knowsAbout signals.

export function generatePersonSchema(person: ProfessionalPerson): JSONLDSchema {
  const sameAs: string[] = [];
  if (person.socialMedia) {
    Object.values(person.socialMedia).forEach((url) => {
      if (url) sameAs.push(url);
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': new URL(`#${person.name.toLowerCase().replace(/\s+/g, '-')}`, SITE).href,
    name: person.name,
    ...(person.alternateName && person.alternateName.length > 0 && { alternateName: person.alternateName }),
    description: person.description,
    jobTitle: person.jobTitle,
    hasOccupation: {
      '@type': 'Occupation',
      name: person.occupationName,
      ...(person.occupationCity && {
        occupationLocation: {
          '@type': 'City',
          name: person.occupationCity,
        },
      }),
    },
    worksFor: {
      '@id': new URL('#organization', SITE).href,
    },
    ...(person.image && { image: new URL(person.image, SITE).href }),
    ...(person.url && { url: new URL(person.url, SITE).href }),
    ...(person.email && { email: person.email }),
    ...(person.phone && { telephone: person.phone }),
    knowsAbout: [...person.knowsAbout, ...(person.credentials ?? [])],
    address: {
      '@type': 'PostalAddress',
      ...(person.address.street && { streetAddress: person.address.street }),
      addressLocality: person.address.city,
      addressRegion: person.address.region,
      ...(person.address.postalCode && { postalCode: person.address.postalCode }),
      addressCountry: person.address.countryCode,
    },
    ...(sameAs.length > 0 && { sameAs }),
  };
}
