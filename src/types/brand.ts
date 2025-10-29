import { z } from "zod";
import { PaginatedData, Product } from ".";

export const createBrandSchema = z.object({
  name: z.string(),
  image: z.instanceof(File).optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export type Brand = {
  _id: string;
  name: string;
  image: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // relations
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
}

export type { PaginatedBrands, BrandQueryOptions };