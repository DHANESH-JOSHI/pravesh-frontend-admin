import { z } from "zod";
import { Category, PaginatedData, Product } from ".";

export const createBrandSchema = z.object({
  name: z.string(),
  categoryIds: z.array(z.string()).optional(),
  image: z.instanceof(File).optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type Brand = {
  _id: string;
  name: string;
  image: string;
  categories: (string | Partial<Category>)[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // relations
  productCount?: number;
  products?: Partial<Product>[];
};
export type CreateBrand = z.infer<typeof createBrandSchema>;
export type UpdateBrand = z.infer<typeof updateBrandSchema>;


interface PaginatedBrands extends PaginatedData {
  brands: Brand[];
}

interface BrandQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: string;
  categoryId?: string;
  sort?: string;
  order?: string,
}

export type { PaginatedBrands, BrandQueryOptions };