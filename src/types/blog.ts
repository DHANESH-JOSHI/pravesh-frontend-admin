import { z } from "zod";

// ✅ Blog Schema
export const blogSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  featuredImage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ CreateBlog Schema
export const createBlogSchema = z.object({
  title: z.string(),
  content: z.string(),
  featuredImage: z.instanceof(File).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

// ✅ UpdateBlog Schema
export const updateBlogSchema = createBlogSchema.partial();

// ✅ Export Types
export type Blog = z.infer<typeof blogSchema>;
export type CreateBlog = z.infer<typeof createBlogSchema>;
export type UpdateBlog = z.infer<typeof updateBlogSchema>;
