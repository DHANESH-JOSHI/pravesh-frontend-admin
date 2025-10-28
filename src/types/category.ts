import { z } from "zod";
import { PaginatedData } from ".";

export const createCategorySchema = z.object({
  title: z.string(),
  image: z.instanceof(File).optional(),
  parentCategoryId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type Category = {
  _id: string;
  title: string;
  image?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  parentCategory?: string | Partial<Category>;
  children?: Partial<Category>[];
};
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;


interface PaginatedCategories extends PaginatedData {
  categories: Category[];
}

interface CategoryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: string;
}
export type { PaginatedCategories, CategoryQueryOptions };