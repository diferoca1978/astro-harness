import type { SEOProps } from 'astro-seo';
import type { FAQItem } from './faqs';
import { AUTHORS, type Author } from './authorBio';
import { COMPANY_INFO, LOCALE } from './companyInfo';
import { mediaUrl, siteUrl } from '@/utils/url';

// Generators only. Client data lives in companyInfo.ts and authorBio.ts.

// Types

export type JSONLDSchema = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

// @ids shared by the nodes and the references to them.

function businessId(): string {
  return siteUrl('/#organization');
}

function personId(slug: string): string {
  return siteUrl(`/#person-${slug}`);
}

// sameAs from a map of profile URLs, only when the map has entries.

function sameAs(socialMedia: Record<string, string> = {}): { sameAs?: string[] } {
  const urls = Object.values(socialMedia);
  return urls.length > 0 ? { sameAs: urls } : {};
}

// Use when title and description are explicitly known at the page level.
// Sets no page URL — astro-seo derives it and og:url from Astro.url/Astro.site.
// og:locale is the locale with '-' replaced by '_' (default: LOCALE).

export function generatePageSEO(options: {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  locale?: string;
}): SEOProps {
  const fullTitle = `${options.title} | ${COMPANY_INFO.name}`;
  const imageUrl = mediaUrl(options.image ?? COMPANY_INFO.image);

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
        locale: (options.locale ?? LOCALE).replaceAll('-', '_'),
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

// The 404: a title and noindex only. No canonical (astro-seo emits none for null),
// no description, no Open Graph, no Twitter — and MainLayout emits no JSON-LD on noindex.

export function generateNotFoundSEO(options: { title: string }): SEOProps {
  return {
    title: `${options.title} | ${COMPANY_INFO.name}`,
    canonical: null,
    noindex: true,
  };
}

// The business node: Organization when `remote`, its LocalBusiness subtype when `local`.
// sameAs, address, geo, foundingDate and founder are emitted only when COMPANY_INFO has them.

export function generateBusinessSchema(): JSONLDSchema {
  const { business } = COMPANY_INFO;
  const founders = COMPANY_INFO.founders ?? [];

  return {
    '@context': 'https://schema.org',
    '@type': business.kind === 'local' ? business.type : 'Organization',
    '@id': businessId(),
    name: COMPANY_INFO.name,
    description: COMPANY_INFO.description,
    url: siteUrl('/'),
    logo: mediaUrl(COMPANY_INFO.logo),
    image: mediaUrl(COMPANY_INFO.image),
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    ...sameAs(COMPANY_INFO.socialMedia),
    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        ...(business.kind === 'local' && { streetAddress: business.address.street }),
        addressLocality: business.address.city,
        addressRegion: business.address.region,
        ...(business.kind === 'local' &&
          business.address.postalCode && { postalCode: business.address.postalCode }),
        addressCountry: business.address.countryCode,
      },
    }),
    ...(business.kind === 'local' &&
      business.geo && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: business.geo.latitude,
          longitude: business.geo.longitude,
        },
      }),
    ...(COMPANY_INFO.foundingDate && { foundingDate: COMPANY_INFO.foundingDate }),
    ...(founders.length > 0 && {
      founder: founders.map((slug) => ({ '@id': personId(slug) })),
    }),
  };
}

// A reference to the business, nested inside another node on an inner page
// (provider, publisher…), never its own block — so it has no @context.

export function generateBusinessRef(): JSONLDSchema {
  return {
    '@type': 'Organization',
    '@id': businessId(),
    name: COMPANY_INFO.name,
    url: siteUrl('/'),
  };
}

export function generateWebSiteSchema(locale: string = LOCALE): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteUrl('/#website'),
    name: COMPANY_INFO.name,
    description: COMPANY_INFO.description,
    url: siteUrl('/'),
    inLanguage: locale,
    publisher: {
      '@id': businessId(),
    },
  };
}

// A person from authorBio.ts, anchored to the business via worksFor.
// credentials stay on the page; the address belongs to the business, not the person.

export function generatePersonSchema(author: Author): JSONLDSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId(author.slug),
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    ...(author.image && { image: mediaUrl(author.image) }),
    ...(author.url && { url: siteUrl(author.url) }),
    ...sameAs(author.socialMedia),
    worksFor: {
      '@id': businessId(),
    },
  };
}

// The home page's blocks: the business, the WebSite and one Person per founder.

export function generateHomeSchemas(locale: string = LOCALE): JSONLDSchema[] {
  const persons = (COMPANY_INFO.founders ?? []).map((slug) => {
    const author = AUTHORS.find((candidate) => candidate.slug === slug);
    if (!author) {
      throw new Error(`generateHomeSchemas(): founder '${slug}' has no Author in authorBio.ts`);
    }
    return generatePersonSchema(author);
  });

  return [generateBusinessSchema(), generateWebSiteSchema(locale), ...persons];
}

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
      item: siteUrl(crumb.path),
    })),
  };
}
