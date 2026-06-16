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

export const services: Service[] = [
  {
    slug: "diseno-web",
    title: "Diseño Web",
    description:
      "Creamos sitios web impresionantes y orientados a la conversión que reflejan la identidad de tu marca y conectan con tu audiencia.",
    seoDescription:
      "Diseño web estratégico que convierte visitantes en clientes para empresas en Colombia.",
    image: "/images/services/diseno-web.jpg",
    icon: "palette",
    benefits: [
      "Diseño responsivo personalizado",
      "Estructura optimizada para SEO",
      "Velocidad de carga rápida",
      "Navegación intuitiva",
    ],
  },
  {
    slug: "marketing-digital",
    title: "Marketing Digital",
    description:
      "Estrategias de marketing digital auténticas que conectan con tu audiencia y generan resultados reales.",
    seoDescription:
      "Estrategias de marketing digital auténticas que conectan con tu audiencia y generan resultados medibles.",
    image: "/images/services/marketing-digital.jpg",
    icon: "megaphone",
    benefits: [
      "Gestión de redes sociales",
      "Estrategia de contenido",
      "Email marketing",
      "Analítica y reportes",
    ],
  },
  {
    slug: "optimizacion-seo",
    title: "Optimización SEO",
    description:
      "SEO técnico y de contenido para mejorar tu visibilidad en motores de búsqueda y atraer tráfico orgánico.",
    seoDescription:
      "SEO técnico y de contenido para mejorar tu visibilidad en Google y atraer tráfico cualificado.",
    image: "/images/services/optimizacion-seo.jpg",
    icon: "search",
    benefits: [
      "Investigación de palabras clave",
      "Optimización on-page",
      "Auditoría SEO técnica",
      "Estrategia de link building",
    ],
  },
];
