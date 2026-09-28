import type { APIRoute } from "astro";
import { COMPANY_INFO } from "@/config/companyInfo";
import { faqs } from "@/config/faqs";
import { services } from "@/config/services";
import { siteUrl } from "@/utils/url";
import { header, linkList, llmsTxt, EXTRA_SECTIONS } from "@/utils/llms";

export const GET: APIRoute = () => {
  const sections = [
    linkList("Sitio", [
      {
        title: COMPANY_INFO.name,
        url: siteUrl("/"),
        notes: COMPANY_INFO.description,
      },
    ]),
    linkList(
      "Servicios",
      services.map((s) => ({ title: s.title, notes: s.seoDescription })),
    ),
    linkList(
      "Preguntas frecuentes",
      faqs.map((f) => ({ title: f.question, notes: f.answer })),
    ),
    ...EXTRA_SECTIONS,
  ];

  const body = llmsTxt(
    header(COMPANY_INFO.name, COMPANY_INFO.description),
    sections,
  );

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
