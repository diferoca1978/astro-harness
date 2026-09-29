// Client data: the company, its business kind and the site locale.
// Data and the types that shape it only, with no imports. The generators live in seo.ts.

// Locale — <html lang>, og:locale and WebSite.inLanguage derive from it.

export const LOCALE = 'es-CO'; // BCP 47

// The LocalBusiness subtypes a `local` business may use. Add a subtype when a client's
// brief needs one, and add it to LOCAL_BUSINESS_TYPES in harness/check-seo.mjs as well,
// or `local-address` will not check it.

export type LocalBusinessType = 'LocalBusiness' | 'LegalService';

// remote: the client receives no visitors at an address, so it cannot hold a street,
// a postal code or geo. local: a real address that the site shows.

export type Business =
  | {
      kind: 'remote';
      address?: { city: string; region: string; countryCode: string };
    }
  | {
      kind: 'local';
      type: LocalBusinessType;
      address: {
        street: string;
        city: string;
        region: string;
        postalCode?: string;
        countryCode: string; // ISO 3166-1 alpha-2
      };
      geo?: { latitude: number; longitude: number };
    };

export interface CompanyInfo {
  name: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  business: Business;
  logo: string; // a path on this site or an https:// URL
  image: string; // a path on this site or an https:// URL
  foundingDate?: string;
  founders?: string[]; // Author slugs from authorBio.ts, not names
  socialMedia: Record<string, string>; // profile URLs only → sameAs
}

// Company config — customize per project. Replace every marked placeholder from the
// brief / client-gaps.md. Optional fields ship absent: add them only when the client has them.

export const COMPANY_INFO: CompanyInfo = {
  name: '[CLIENTE] nombre del negocio',
  description: '[CLIENTE] descripción breve del negocio',
  phone: '[CLIENTE] teléfono con indicativo de país',
  email: '[CLIENTE] correo de contacto',
  whatsapp: '[CLIENTE] enlace wa.me con el número y el mensaje',
  business: {
    kind: 'remote',
    address: {
      city: '[CLIENTE] ciudad',
      region: '[CLIENTE] departamento o región',
      countryCode: '[CLIENTE] código de país ISO 3166-1 alfa-2',
    },
  },
  logo: '/images/logo.svg',
  image: '/images/og-image.png',
  socialMedia: {},
};
