import { z } from "zod";
import { brandSchema } from "./brand";
import { categorySchema } from "./category";

/* -----------------------------
   ENUMS
----------------------------- */
export const stockStatusSchema = z.enum(["in-stock", "out-of-stock", "low-stock"]);
export const productStatusSchema = z.enum(["active ", "inactive", "discontinued"]);
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

/* -----------------------------
   QUERY OPTIONS
----------------------------- */
export const queryOptionsSchema = z.object({
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  inStock: z.boolean().optional(),
  stockStatus: stockStatusSchema.optional(),
  status: productStatusSchema.optional(),

  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isDiscount: z.boolean().optional(),
  isDeleted: z.boolean().optional(),

  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
});
export type QueryOptions = z.infer<typeof queryOptionsSchema>;

/* -----------------------------
   CREATE PRODUCT
----------------------------- */
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
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),

  shippingInfo: z.record(z.string(),z.string()).optional(),

  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isDiscount: z.boolean().optional(),
});
export type CreateProduct = z.infer<typeof createProductSchema>;

/* -----------------------------
   UPDATE PRODUCT
----------------------------- */
export const updateProductSchema = createProductSchema.partial();
export type UpdateProduct = z.infer<typeof updateProductSchema>;

/* -----------------------------
   PRODUCT
----------------------------- */
export const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  brand: z.union([z.string(), brandSchema.partial()]).optional(),
  category: z.union([z.string(), categorySchema.optional()]).optional(),

  thumbnail: z.string(),
  images: z.array(z.string()),

  originalPrice: z.number().nonnegative(),
  discountValue: z.number().nonnegative(),
  discountType: discountTypeSchema,
  finalPrice: z.number().nonnegative(),

  stock: z.number().int().nonnegative(),
  unit: unitSchema,
  minStock: z.number().int().nonnegative(),

  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(),z.string()),

  tags: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
  seoKeywords: z.array(z.string()),

  shippingInfo: z.record(z.string(),z.string()),

  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isDiscount: z.boolean(),

  reviewCount: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),

  totalSold: z.number().int().nonnegative(),
  salesCount: z.number().int().nonnegative(),

  createdAt: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean(),
});
export type Product = z.infer<typeof productSchema>;
