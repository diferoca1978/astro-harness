import { linkList } from "@/utils/llms";
import { getAllPosts } from "@/utils/posts";

const posts = await getAllPosts();

export const EXTRA_SECTIONS: string[] = [
  linkList(
    "Blog",
    posts.map((post) => ({
      title: post.data.title,
      url: `/llms/${post.id}.txt`,
      notes: post.data.description,
    })),
  ),
];
