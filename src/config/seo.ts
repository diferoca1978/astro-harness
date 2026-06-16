import type { SEOProps } from 'astro-seo';
import type { Service } from './services';
import { services } from './services';
import type { Author } from './authorBio';
import { AUTHORS, getAuthorByName } from './authorBio';
import type { FAQItem } from './faqs';

// Types

export type JSONLDSchema = Record<string, unknown>;

export interface CompanyInfo {
  name: string;
  description: string;
  url: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  logo: string;
  image: string;
  foundingDate: string;
  founders?: string[];
  socialMedia: Record<string, string>;
}

export interface MainKeywords {
  primary: string[];
  secondary: string[];
  tertiary: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  publishDate: Date;
  modifiedDate?: Date;
  tags?: string[];
  image: string;
  author?: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface DynamicSEOOptions {
  pageType: string;
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  location?: string;
  customData?: Record<string, string>;
  image?: string;
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToOptions {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration, e.g. 'PT30M', 'P2W'
  estimatedCost?: {
    currency: string;
    value: string;
  };
  image?: string;
  supply?: string[];
}

// Company config — customize per project

export const COMPANY_INFO: CompanyInfo = {
  name: 'Tu Agencia Digital',
  description: 'Transformamos tu presencia digital con estrategia, propósito y autenticidad. Diseño web, marketing digital y contenido que refleja tu verdadera esencia.',
  url: 'https://tuagencia.com',
  phone: '+57-300-000-0000',
  email: 'contacto@tuagencia.com',
  address: {
    street: 'Calle Principal 123',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
    country: 'Colombia',
    countryCode: 'CO',
  },
  geo: {
    latitude: 4.7109886,
    longitude: -74.072092,
  },
  logo: '/images/logo.svg',
  image: '/images/og-image.png',
  foundingDate: '2025',
  founders: ['Nombre Fundador 1', 'Nombre Fundador 2'],
  socialMedia: {
    instagram: 'https://www.instagram.com/tuagencia',
    linkedin: 'https://www.linkedin.com/company/tuagencia',
    tiktok: 'https://www.tiktok.com/@tuagencia',
    whatsapp: 'https://api.whatsapp.com/send?phone=573000000000&text=Hola%20buen%20d%C3%ADa%2C%0AEstoy%20interesado%2Fa%20en%20sus%20servicios',
  },
};

// Used in JSON-LD and content strategy only — not in meta keywords tag (deprecated since 2009)

export const MAIN_KEYWORDS: MainKeywords = {
  primary: [
    'agencia de marketing digital Colombia',
    'diseño web estratégico Colombia',
    'presencia digital auténtica',
  ],
  secondary: [
    'personal branding digital',
    'rediseño web profesional',
    'estrategia de contenido digital',
    'marketing digital para profesionales',
  ],
  tertiary: [
    'diseño web en Astro Colombia',
    'optimización web Bogotá',
    'branding auténtico Colombia',
    'SEO para profesionales independientes',
    'community manager Colombia',
  ],
};

// Default SEO — used as fallback in the main layout

export const DEFAULT_SEO: SEOProps = {
  title: `${COMPANY_INFO.name} | Agencia de Marketing Digital y Diseño Web en Colombia`,
  description: COMPANY_INFO.description,
  canonical: COMPANY_INFO.url,
  openGraph: {
    basic: {
      title: `${COMPANY_INFO.name} | Transformamos tu presencia digital con propósito`,
      type: 'website',
      image: `${COMPANY_INFO.url}${COMPANY_INFO.image}`,
      url: COMPANY_INFO.url,
    },
    optional: {
      description: COMPANY_INFO.description,
      siteName: COMPANY_INFO.name,
      locale: 'es_CO',
    },
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shine_agencia',
    creator: '@shine_agencia',
    title: `${COMPANY_INFO.name} | Transformamos tu presencia digital con propósito`,
    description: COMPANY_INFO.description,
    image: `${COMPANY_INFO.url}${COMPANY_INFO.image}`,
  },
  extend: {
    meta: [
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: COMPANY_INFO.name },
      { name: 'theme-color', content: '#FFD97D' },
      { name: 'msapplication-TileColor', content: '#FFD97D' },
      { httpEquiv: 'Content-Language', content: 'es-CO' },
      { name: 'geo.region', content: 'CO-DC' },
      { name: 'geo.placename', content: `${COMPANY_INFO.address.city}, ${COMPANY_INFO.address.country}` },
    ],
  },
};

// Use when title and description are explicitly known at the page level

export function generatePageSEO(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): SEOProps {
  const normalizedPath = options.path.endsWith('/') ? options.path : options.path + '/';
  const fullUrl = `${COMPANY_INFO.url}${normalizedPath}`;
  const fullTitle = `${options.title} | ${COMPANY_INFO.name}`;
  const imageUrl = `${COMPANY_INFO.url}${options.image ?? COMPANY_INFO.image}`;

  return {
    title: fullTitle,
    description: options.description,
    canonical: fullUrl,
    noindex: options.noindex ?? false,
    openGraph: {
      basic: {
        title: fullTitle,
        type: 'website',
        image: imageUrl,
        url: fullUrl,
      },
      optional: {
        description: options.description,
        siteName: COMPANY_INFO.name,
        locale: 'es_CO',
      },
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shine_agencia',
      creator: '@shine_agencia',
      title: fullTitle,
      description: options.description,
      image: imageUrl,
    },
    extend: {
      meta: [
        { name: 'author', content: COMPANY_INFO.name },
        { name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow' },
        { name: 'theme-color', content: '#FFD97D' },
        { httpEquiv: 'Content-Language', content: 'es-CO' },
      ],
    },
  };
}

// Auto-generates title and description from pageType — avoids repetition across .astro files

export function generateDynamicSEO(options: DynamicSEOOptions): SEOProps {
  const baseVars = {
    company: COMPANY_INFO.name,
    primaryKeyword: MAIN_KEYWORDS.primary[0] ?? '',
    location: options.location ?? COMPANY_INFO.address.city,
    cta: 'Transformamos tu presencia digital.',
    ...options.customData,
  };

  const title = options.title ?? generateDynamicTitle(options, baseVars);
  const description = options.description ?? generateDynamicDescription(options, baseVars);
  const canonical = options.canonical ?? `/${options.pageType}/`;
  const fullUrl = canonical.startsWith('http') ? canonical : `${COMPANY_INFO.url}${canonical}`;
  const imageUrl = `${COMPANY_INFO.url}${options.image ?? COMPANY_INFO.image}`;

  return {
    title,
    description,
    canonical: fullUrl,
    noindex: options.noindex ?? false,
    openGraph: {
      basic: {
        title,
        type: 'website',
        image: imageUrl,
        url: fullUrl,
      },
      optional: {
        description,
        siteName: COMPANY_INFO.name,
        locale: 'es_CO',
      },
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shine_agencia',
      creator: '@shine_agencia',
      title,
      description,
      image: imageUrl,
    },
    extend: {
      meta: [
        { name: 'author', content: COMPANY_INFO.name },
        { name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow' },
        { name: 'theme-color', content: '#FFD97D' },
        { httpEquiv: 'Content-Language', content: 'es-CO' },
      ],
    },
  };
}

function generateDynamicTitle(options: DynamicSEOOptions, vars: Record<string, string>): string {
  const map: Record<string, string> = {
    home: `${vars.company} | ${vars.primaryKeyword}`,
    about: `Quiénes Somos | ${vars.company}`,
    nosotros: `Quiénes Somos | ${vars.company}`,
    services: `Servicios de Marketing Digital y Diseño Web | ${vars.company}`,
    servicios: `Servicios de Marketing Digital y Diseño Web | ${vars.company}`,
    contact: `Contacto | ${vars.company}`,
    contacto: `Contacto | ${vars.company}`,
    blog: `Blog de Marketing Digital | ${vars.company}`,
    faq: `Preguntas Frecuentes | ${vars.company}`,
    privacy: `Política de Privacidad | ${vars.company}`,
    terms: `Términos de Servicio | ${vars.company}`,
  };

  if (map[options.pageType]) return map[options.pageType]!;

  const formatted = options.pageType
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `${formatted} | ${vars.company}`;
}

function generateDynamicDescription(options: DynamicSEOOptions, vars: Record<string, string>): string {
  const map: Record<string, string> = {
    home: COMPANY_INFO.description,
    about: `Conoce al equipo detrás de ${vars.company}. Profesionales apasionados por el marketing digital auténtico y el diseño web estratégico en Colombia.`,
    nosotros: `Conoce al equipo detrás de ${vars.company}. Profesionales apasionados por el marketing digital auténtico y el diseño web estratégico en Colombia.`,
    services: `Servicios de diseño web, marketing digital y estrategia de contenido para profesionales y empresas en Colombia. Presencia digital con propósito.`,
    servicios: `Servicios de diseño web, marketing digital y estrategia de contenido para profesionales y empresas en Colombia. Presencia digital con propósito.`,
    contact: `¿Listo para transformar tu presencia digital? Contáctanos y descubre cómo ${vars.company} puede ayudarte a brillar con propósito.`,
    contacto: `¿Listo para transformar tu presencia digital? Contáctanos y descubre cómo ${vars.company} puede ayudarte a brillar con propósito.`,
    blog: `Guías prácticas, reflexiones honestas y consejos estratégicos para construir tu presencia digital con paz y propósito.`,
    faq: `Preguntas frecuentes sobre diseño web, marketing digital y presencia online. Resolvemos tus dudas sobre nuestros servicios en ${vars.company}.`,
  };

  if (map[options.pageType]) return map[options.pageType]!;

  return `${vars.company}: expertos en ${vars.primaryKeyword} en ${vars.location}. ${vars.cta}`;
}

export function generateServiceSEO(service: Service): SEOProps {
  const serviceUrl = `${COMPANY_INFO.url}/servicios/${service.slug}/`;
  const pageTitle = `${service.title} | ${COMPANY_INFO.name}`;

  return {
    title: pageTitle,
    description: service.seoDescription,
    canonical: serviceUrl,
    noindex: false,
    openGraph: {
      basic: {
        title: pageTitle,
        type: 'website',
        image: `${COMPANY_INFO.url}${service.image ?? COMPANY_INFO.image}`,
        url: serviceUrl,
      },
      optional: {
        description: service.seoDescription,
        siteName: COMPANY_INFO.name,
        locale: 'es_CO',
      },
    },
    twitter: {
      card: 'summary_large_image',
      site: '@shine_agencia',
      creator: '@shine_agencia',
      title: pageTitle,
      description: service.seoDescription,
      image: `${COMPANY_INFO.url}${service.image ?? COMPANY_INFO.image}`,
    },
    extend: {
      meta: [
        { name: 'author', content: COMPANY_INFO.name },
        { name: 'robots', content: 'index, follow' },
        { httpEquiv: 'Content-Language', content: 'es-CO' },
      ],
    },
  };
}

export const ORGANIZATION_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${COMPANY_INFO.url}#organization`,
  name: COMPANY_INFO.name,
  alternateName: ['Shine', 'Shine Agencia Digital'],
  description: COMPANY_INFO.description,
  slogan: 'No necesitas gritar para ser escuchado',
  url: COMPANY_INFO.url,
  logo: `${COMPANY_INFO.url}${COMPANY_INFO.logo}`,
  image: `${COMPANY_INFO.url}${COMPANY_INFO.image}`,
  foundingDate: COMPANY_INFO.foundingDate,
  telephone: COMPANY_INFO.phone,
  email: COMPANY_INFO.email,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY_INFO.address.street,
    addressLocality: COMPANY_INFO.address.city,
    addressRegion: COMPANY_INFO.address.region,
    postalCode: COMPANY_INFO.address.postalCode,
    addressCountry: {
      '@type': 'Country',
      name: COMPANY_INFO.address.country,
    },
  },
  ...(COMPANY_INFO.geo && {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_INFO.geo.latitude,
      longitude: COMPANY_INFO.geo.longitude,
    },
  }),
  founders: COMPANY_INFO.founders?.map((founder) => ({
    '@type': 'Person',
    name: founder,
  })),
  sameAs: Object.values(COMPANY_INFO.socialMedia).filter(Boolean),
  serviceType: 'Servicios de Marketing Digital y Diseño Web',
  areaServed: [
    {
      '@type': 'Country',
      name: 'Colombia',
      sameAs: 'https://es.wikipedia.org/wiki/Colombia',
    },
    { '@type': 'City', name: 'Bogotá' },
  ],
  knowsAbout: [
    ...MAIN_KEYWORDS.primary,
    ...MAIN_KEYWORDS.secondary,
    ...MAIN_KEYWORDS.tertiary,
    'Astro Framework',
    'UX/UI Design',
    'SEO técnico',
    'Branding Auténtico',
    'Community Management',
    'LinkedIn Optimization',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Transformación Digital Auténtica',
    description: 'Servicios especializados en diseño web estratégico y marketing digital para profesionales y empresas que buscan crecer con autenticidad',
    itemListElement: services.map((service, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'Service',
        '@id': `${COMPANY_INFO.url}/servicios/${service.slug}#service`,
        name: service.title,
        description: service.seoDescription,
        url: `${COMPANY_INFO.url}/servicios/${service.slug}`,
        provider: {
          '@id': `${COMPANY_INFO.url}#organization`,
        },
      },
    })),
  },
};

export const WEBSITE_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${COMPANY_INFO.url}#website`,
  name: COMPANY_INFO.name,
  alternateName: `${COMPANY_INFO.name} | Transformamos tu presencia digital con propósito`,
  description: COMPANY_INFO.description,
  url: COMPANY_INFO.url,
  inLanguage: 'es-CO',
  copyrightYear: new Date().getFullYear(),
  copyrightHolder: {
    '@type': 'Organization',
    name: COMPANY_INFO.name,
  },
  publisher: {
    '@id': `${COMPANY_INFO.url}#organization`,
  },
  mainEntity: {
    '@id': `${COMPANY_INFO.url}#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${COMPANY_INFO.url}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const BLOG_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${COMPANY_INFO.url}/blog#blog`,
  name: `Blog - ${COMPANY_INFO.name}`,
  description: 'Guías prácticas, reflexiones honestas y consejos estratégicos para construir tu presencia digital con paz y propósito',
  url: `${COMPANY_INFO.url}/blog`,
  inLanguage: 'es-CO',
  author: {
    '@id': `${COMPANY_INFO.url}#organization`,
  },
  publisher: {
    '@id': `${COMPANY_INFO.url}#organization`,
  },
  about: {
    '@type': 'Thing',
    name: MAIN_KEYWORDS.primary[0],
  },
};

// Resolves author from registry for full E-E-A-T signals. Includes ImageObject with dimensions.

export function generateBlogPostSchema(post: BlogPost): JSONLDSchema {
  const author = getAuthorByName(post.author ?? '');

  const sameAs: string[] = [];
  if (author.socialMedia?.linkedin) sameAs.push(author.socialMedia.linkedin);
  if (author.socialMedia?.instagram) sameAs.push(author.socialMedia.instagram);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${COMPANY_INFO.url}/blog/${post.id}#article`,
    headline: post.title,
    description: post.description,
    url: `${COMPANY_INFO.url}/blog/${post.id}`,
    datePublished: post.publishDate.toISOString(),
    ...(post.modifiedDate && { dateModified: post.modifiedDate.toISOString() }),
    author: {
      '@type': 'Person',
      '@id': `${COMPANY_INFO.url}/nosotros#${author.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: author.name,
      description: author.bio,
      jobTitle: author.role,
      ...(author.image && { image: `${COMPANY_INFO.url}${author.image}` }),
      ...(author.url && { url: `${COMPANY_INFO.url}${author.url}` }),
      ...(author.credentials && { knowsAbout: author.credentials }),
      ...(sameAs.length > 0 && { sameAs }),
      worksFor: {
        '@id': `${COMPANY_INFO.url}#organization`,
      },
    },
    publisher: {
      '@id': `${COMPANY_INFO.url}#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${COMPANY_INFO.url}/blog/${post.id}`,
    },
    image: {
      '@type': 'ImageObject',
      url: `${COMPANY_INFO.url}${post.image}`,
      width: 1200,
      height: 630,
    },
    keywords: post.tags?.join(', ') ?? MAIN_KEYWORDS.primary.join(', '),
    inLanguage: 'es-CO',
    isPartOf: {
      '@id': `${COMPANY_INFO.url}/blog#blog`,
    },
    articleSection: MAIN_KEYWORDS.primary[0],
    about: {
      '@type': 'Thing',
      name: 'Marketing Digital Auténtico',
    },
  };
}

// Includes availableChannel for local SEO signals on service pages

export function generateServiceSchema(service: Service): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${COMPANY_INFO.url}/servicios/${service.slug}#service`,
    name: service.title,
    description: service.seoDescription,
    serviceType: service.title,
    url: `${COMPANY_INFO.url}/servicios/${service.slug}`,
    provider: {
      '@id': `${COMPANY_INFO.url}#organization`,
    },
    areaServed: [
      { '@type': 'Country', name: 'Colombia' },
      { '@type': 'City', name: 'Bogotá' },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${COMPANY_INFO.url}/servicios/${service.slug}`,
      servicePhone: COMPANY_INFO.phone,
      serviceLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: COMPANY_INFO.address.city,
          addressCountry: COMPANY_INFO.address.countryCode,
        },
      },
    },
    ...(service.image && {
      image: {
        '@type': 'ImageObject',
        url: `${COMPANY_INFO.url}${service.image}`,
      },
    }),
    ...(service.benefits && service.benefits.length > 0 && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `${service.title} - Beneficios`,
        itemListElement: service.benefits.map((benefit: string, index: number) => ({
          '@type': 'Offer',
          position: index + 1,
          itemOffered: {
            '@type': 'Service',
            name: benefit,
          },
        })),
      },
    }),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${COMPANY_INFO.url}/servicios/${service.slug}`,
      seller: {
        '@id': `${COMPANY_INFO.url}#organization`,
      },
    },
    isPartOf: {
      '@type': 'WebPage',
      '@id': `${COMPANY_INFO.url}/servicios`,
      name: 'Servicios',
    },
  };
}

export const LOCAL_BUSINESS_SCHEMA: JSONLDSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${COMPANY_INFO.url}#localbusiness`,
  name: COMPANY_INFO.name,
  description: COMPANY_INFO.description,
  url: COMPANY_INFO.url,
  telephone: COMPANY_INFO.phone,
  email: COMPANY_INFO.email,
  logo: `${COMPANY_INFO.url}${COMPANY_INFO.logo}`,
  image: `${COMPANY_INFO.url}${COMPANY_INFO.image}`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY_INFO.address.street,
    addressLocality: COMPANY_INFO.address.city,
    addressRegion: COMPANY_INFO.address.region,
    postalCode: COMPANY_INFO.address.postalCode,
    addressCountry: COMPANY_INFO.address.countryCode,
  },
  ...(COMPANY_INFO.geo && {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_INFO.geo.latitude,
      longitude: COMPANY_INFO.geo.longitude,
    },
  }),
  sameAs: Object.values(COMPANY_INFO.socialMedia).filter(Boolean),
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
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

// Links the FAQ to a specific page via isPartOf — use on service or landing pages

export function generateFAQSchemaWithPage(
  faqs: FAQItem[],
  pageUrl: string,
  pageName: string,
): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    name: `Preguntas Frecuentes - ${pageName}`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    isPartOf: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
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
      item: `${COMPANY_INFO.url}${crumb.path}`,
    })),
  };
}

export function generateHowToSchema(options: HowToOptions): JSONLDSchema {
  const schema: JSONLDSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: `${COMPANY_INFO.url}${step.image}` }),
      ...(step.url && { url: `${COMPANY_INFO.url}${step.url}` }),
    })),
  };

  if (options.totalTime) schema.totalTime = options.totalTime;

  if (options.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: options.estimatedCost.currency,
      value: options.estimatedCost.value,
    };
  }

  if (options.image) schema.image = `${COMPANY_INFO.url}${options.image}`;

  if (options.supply && options.supply.length > 0) {
    schema.supply = options.supply.map((item) => ({
      '@type': 'HowToSupply',
      name: item,
    }));
  }

  return schema;
}

// Anchors the HowTo to a specific page or blog post via mainEntityOfPage

export function generateHowToSchemaWithPage(options: HowToOptions, pageUrl: string): JSONLDSchema {
  return {
    ...generateHowToSchema(options),
    '@id': `${pageUrl}#howto`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };
}

// Use on /nosotros and blog posts to establish author authority in Google's Knowledge Graph

export function generateAuthorSchema(author: Author): JSONLDSchema {
  const sameAs: string[] = [];
  if (author.socialMedia?.linkedin) sameAs.push(author.socialMedia.linkedin);
  if (author.socialMedia?.instagram) sameAs.push(author.socialMedia.instagram);
  if (author.socialMedia?.twitter) sameAs.push(author.socialMedia.twitter);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${COMPANY_INFO.url}/nosotros#${author.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: author.name,
    description: author.bio,
    jobTitle: author.role,
    ...(author.image && { image: `${COMPANY_INFO.url}${author.image}` }),
    ...(author.url && { url: `${COMPANY_INFO.url}${author.url}` }),
    worksFor: {
      '@id': `${COMPANY_INFO.url}#organization`,
    },
    knowsAbout: author.credentials,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function generateAllAuthorsSchemas(): JSONLDSchema[] {
  return AUTHORS.map((author) => generateAuthorSchema(author));
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
    '@id': `${COMPANY_INFO.url}#${person.name.toLowerCase().replace(/\s+/g, '-')}`,
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
      '@id': `${COMPANY_INFO.url}#organization`,
    },
    ...(person.image && { image: `${COMPANY_INFO.url}${person.image}` }),
    ...(person.url && { url: `${COMPANY_INFO.url}${person.url}` }),
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

// Calculates aggregateRating automatically from the reviews array

export function generateReviewsSchema(
  reviews: Array<{
    author: string;
    text: string;
    rating: number;
    datePublished: number; // Unix timestamp
    image?: string;
    platform: string;
  }>,
): JSONLDSchema {
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${COMPANY_INFO.url}#organization-reviews`,
    name: COMPANY_INFO.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
        ...(review.image && { image: review.image }),
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: review.text,
      datePublished: new Date(review.datePublished * 1000).toISOString(),
      publisher: {
        '@type': 'Organization',
        name: review.platform,
      },
    })),
  };
}

// Adapts Google Places API review format to the generic reviews schema

export function generateGoogleReviewsSchema(
  reviews: Array<{
    author_name: string;
    text: string;
    rating: number;
    datePublished: number;
    author_url?: string;
    profile_photo_url?: string | { src: string };
  }>,
): JSONLDSchema {
  const formatted = reviews.map((review) => ({
    author: review.author_name,
    text: review.text,
    rating: review.rating,
    datePublished: review.datePublished,
    image: typeof review.profile_photo_url === 'string'
      ? review.profile_photo_url
      : review.profile_photo_url?.src,
    platform: 'Google',
  }));

  return generateReviewsSchema(formatted);
}

// Base schemas for the main layout

export const ALL_BASE_SCHEMAS = {
  organization: ORGANIZATION_SCHEMA,
  website: WEBSITE_SCHEMA,
  blog: BLOG_SCHEMA,
  localBusiness: LOCAL_BUSINESS_SCHEMA,
};