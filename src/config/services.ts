// =============================================================================
// SERVICES CONFIGURATION
// src/config/services.ts
// =============================================================================

export interface Service {
  slug: string;
  title: string;
  description: string;
  seoDescription: string;
  image?: string;
  icon?: string;
  benefits?: string[];
}

// Services - filled per client from the brief
export const services: Service[] = [];
