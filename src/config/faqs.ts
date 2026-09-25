// =============================================================================
// FAQS CONFIGURATION
// src/config/faqs.ts
// =============================================================================

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// FAQs - filled per client from the brief
export const faqs: FAQItem[] = [];
