// =============================================================================
// FAQS CONFIGURATION
// src/config/faqs.ts
// =============================================================================

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// General FAQs - for main FAQ page
export const generalFAQs: FAQItem[] = [
  {
    question: "¿Qué servicios ofrecen?",
    answer:
      "Ofrecemos diseño web estratégico, marketing digital, optimización SEO y gestión de redes sociales para profesionales y empresas que buscan crecer con autenticidad.",
    category: "general",
  },
  {
    question: "¿Cómo puedo contactarlos?",
    answer:
      "Puedes contactarnos a través del formulario en nuestra página de contacto, por email a rocio.shineagencia@gmail.com o directamente por WhatsApp.",
    category: "general",
  },
  {
    question: "¿Trabajan con clientes internacionales?",
    answer:
      "Sí, trabajamos con clientes de toda Latinoamérica y el mundo de manera remota, adaptándonos a diferentes zonas horarias.",
    category: "general",
  },
  {
    question: "¿Cuánto tiempo toma completar un proyecto web?",
    answer:
      "El tiempo varía según el alcance del proyecto. Un sitio web corporativo típico toma entre 4-6 semanas, mientras que proyectos más complejos pueden tomar 8-12 semanas.",
    category: "general",
  },
];

// Pricing FAQs
export const pricingFAQs: FAQItem[] = [
  {
    question: "¿Cuánto cuesta un proyecto?",
    answer:
      "Los precios varían según el alcance del proyecto. Sitios web corporativos desde $1,500 USD, marketing digital desde $500 USD/mes. Contáctanos para una cotización personalizada.",
    category: "pricing",
  },
  {
    question: "¿Ofrecen planes de pago?",
    answer: "Sí, ofrecemos planes de pago flexibles para proyectos grandes. Podemos dividir el pago en 2-3 cuotas según el cronograma del proyecto.",
    category: "pricing",
  },
  {
    question: "¿Incluyen mantenimiento en el precio?",
    answer:
      "Ofrecemos un mes de mantenimiento gratuito después del lanzamiento. Luego, tenemos planes de mantenimiento mensuales desde $100 USD que incluyen actualizaciones y soporte.",
    category: "pricing",
  },
];

// All FAQs combined
export const allFAQs: FAQItem[] = [...generalFAQs, ...pricingFAQs];

// Helper function to get FAQs by category
export function getFAQsByCategory(category: string): FAQItem[] {
  return allFAQs.filter((faq) => faq.category === category);
}
