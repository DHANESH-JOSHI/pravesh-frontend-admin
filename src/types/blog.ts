import { z } from "zod";
import { PaginatedData } from ".";

export const createBlogSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  content: z.string(),
  featuredImage: z.instanceof(File).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export type Blog = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  tags: string[] | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CreateBlog = z.infer<typeof createBlogSchema>;
export type UpdateBlog = z.infer<typeof updateBlogSchema>;


interface PaginatedBlogs extends PaginatedData {
  blogs: Blog[];
}

interface BlogQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: string;
  isDeleted?: string;
}

export type { PaginatedBlogs, BlogQueryOptions };