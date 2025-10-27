import { z } from "zod";

// ✅ Category Schema
const baseCategorySchema = z.object({
  _id: z.string(),
  title: z.string(),
  image: z.string().optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export const categorySchema = baseCategorySchema.extend({
  parentCategory: baseCategorySchema.nullable(),
  children: z.array(baseCategorySchema).optional(),
});

// ✅ CreateCategory Schema
export const createCategorySchema = z.object({
  title: z.string(),
  image: z.instanceof(File).optional(),
  parentCategoryId: z.string().optional(),
});

// ✅ UpdateCategory Schema
export const updateCategorySchema = createCategorySchema.partial();

// ✅ Export Types
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
