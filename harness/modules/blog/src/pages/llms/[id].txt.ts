import type { APIRoute } from "astro";
import { getAllPosts } from "@/utils/posts";
import { header, doc } from "@/utils/llms";
import { siteUrl } from "@/utils/url";

export const getStaticPaths = async () => {
  const posts = await getAllPosts();
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props }) => {
  const { post } = props as {
    post: Awaited<ReturnType<typeof getAllPosts>>[number];
  };
  const { title, description, publishDate, modifiedDate } = post.data;
  const body = [
    header(title, description),
    doc({ title: "URL", notes: siteUrl(`/blog/${post.id}/`) }),
    doc({
      title: "Published",
      notes: publishDate.toISOString().slice(0, 10),
    }),
    doc({ title: "Updated", notes: modifiedDate.toISOString().slice(0, 10) }),
    "",
    post.body ?? "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
