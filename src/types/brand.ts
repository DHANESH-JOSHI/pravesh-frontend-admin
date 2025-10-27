import { z } from "zod";

// ✅ Brand Schema
export const brandSchema = z.object({
  _id: z.string(),
  name: z.string(),
  image: z.string(), // stored as URL or path
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ CreateBrand Schema
export const createBrandSchema = z.object({
  name: z.string(),
  image: z.instanceof(File).optional(),
});

// ✅ UpdateBrand Schema
export const updateBrandSchema = createBrandSchema.partial();

// ✅ Export Types
export type Brand = z.infer<typeof brandSchema>;
export type CreateBrand = z.infer<typeof createBrandSchema>;
export type UpdateBrand = z.infer<typeof updateBrandSchema>;
