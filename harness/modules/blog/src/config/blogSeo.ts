import { generateBusinessRef, type JSONLDSchema } from "@/config/seo";
import { COMPANY_INFO } from "@/config/companyInfo";
import { siteUrl, mediaUrl } from "@/utils/url";
import type { BlogPost } from "@/utils/posts";

export function generateBlogSchema(posts: BlogPost[]): JSONLDSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": siteUrl("/blog/#blog"),
    name: `Blog | ${COMPANY_INFO.name}`,
    url: siteUrl("/blog/"),
    publisher: generateBusinessRef(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": siteUrl(`/blog/${post.id}/#blogposting`),
      headline: post.data.title,
      url: siteUrl(`/blog/${post.id}/`),
    })),
  };
}

export function generateBlogPostingSchema(post: BlogPost): JSONLDSchema {
  const { title, description, image, publishDate, modifiedDate } = post.data;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": siteUrl(`/blog/${post.id}/#blogposting`),
    headline: title,
    description,
    image: mediaUrl(image.src),
    datePublished: publishDate.toISOString(),
    dateModified: modifiedDate.toISOString(),
    url: siteUrl(`/blog/${post.id}/`),
    isPartOf: {
      "@type": "Blog",
      "@id": siteUrl("/blog/#blog"),
      name: `Blog | ${COMPANY_INFO.name}`,
      url: siteUrl("/blog/"),
    },
    publisher: generateBusinessRef(),
  };
}
