import { z } from "zod";
import { Brand, Category, PaginatedData, Review } from ".";

export const stockStatusSchema = z.enum(["in-stock", "out-of-stock", "low-stock"]);
export const productStatusSchema = z.enum(["active", "inactive", "discontinued"]);
export const discountTypeSchema = z.enum(["percentage", "fixed"]);
export const unitSchema = z.enum([
  "bag",
  "piece",
  "kg",
  "tonne",
  "litre",
  "bundle",
  "meter",
  "box",
  "packet",
  "set",
]);
export type stockStatus = z.infer<typeof stockStatusSchema>;
export type productStatus = z.infer<typeof productStatusSchema>;
export type discountType = z.infer<typeof discountTypeSchema>;
export type unit = z.infer<typeof unitSchema>;

export const queryOptionsSchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  stockStatus: stockStatusSchema.optional(),
  status: productStatusSchema.optional(),

  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isDiscount: z.boolean().optional(),
  isDeleted: z.boolean().optional(),

  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
});
export type QueryOptions = z.infer<typeof queryOptionsSchema>;

export const createProductSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  sku: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string(),

  thumbnail: z.instanceof(File).optional(),
  images: z.array(z.instanceof(File)).optional(),

  originalPrice: z.number().nonnegative(),
  discountValue: z.number().nonnegative().optional(),
  discountType: discountTypeSchema.optional(),
  finalPrice: z.number().nonnegative().optional(),

  stock: z.number().int().nonnegative(),
  unit: unitSchema,
  minStock: z.number().int().nonnegative().optional(),

  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),

  tags: z.array(z.string()).optional(),

  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
});
export type CreateProduct = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type Product = {
  _id: string;
  name: string,
  sku: string,
  slug: string,
  description?: string,
  shortDescription?: string,
  brand?: string | Partial<Brand>,
  category: string | Partial<Category>,
  thumbnail: string,
  images: string[],
  originalPrice: number,
  discountValue: number,
  discountType: discountType,
  finalPrice: number,
  stock: number,
  status: productStatus,
  stockStatus: stockStatus,
  unit: unit,
  minStock: number,
  features?: string[],
  specifications: Record<string, string>,
  tags: string[],
  isFeatured: boolean,
  isNewArrival: boolean,
  isDiscount: boolean,
  reviewCount: number,
  rating: number,
  totalSold: number,
  salesCount: number,
  createdAt: string,
  updatedAt: string,
  isDeleted: boolean,
  // relations
  reviews?: Partial<Review>[];
};


interface PaginatedProducts extends PaginatedData {
  products: Product[];
}

interface ProductFilters {
  categories: { _id: string; title: string }[];
  brands: { _id: string; name: string }[];
  priceRange: { minPrice: number; maxPrice: number };
  colors: string[];
  sizes: string[];
};

export type { PaginatedProducts, ProductFilters };