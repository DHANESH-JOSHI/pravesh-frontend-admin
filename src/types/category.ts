import { z } from "zod";
import { Brand, PaginatedData, Product } from ".";

export const createCategorySchema = z.object({
  title: z.string(),
  // image: z.instanceof(File).optional(),
  parentCategoryId: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type Category = {
  _id: string;
  title: string;
  image?: string;
  isDeleted: boolean;
  path:string[];
  createdAt: string;
  updatedAt: string;
  brands: (string | Partial<Brand>)[];
  parentCategory?: string | Partial<Category>;
  // relations
  childCount?: number;
  productCount?: number;
  brandCount?: number;
  children?: Partial<Category>[];
  products?: Partial<Product>[];
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
  parentCategoryId?: string;
  brandId?: string;
  sort?: string;
  order?: string,
}
export type { PaginatedCategories, CategoryQueryOptions };