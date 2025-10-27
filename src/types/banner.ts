import { z } from "zod";

// ✅ Enum Schema
export const bannerTypeSchema = z.enum(["product", "category", "offer", "external"]);
export type BannerType = z.infer<typeof bannerTypeSchema>;

// ✅ Banner Schema
export const bannerSchema = z.object({
  _id: z.string(),
  title: z.string(),
  image: z.string(), // stored as URL or path
  targetUrl: z.string().url().optional(),
  type: bannerTypeSchema,
  targetId: z.string().optional(),
  isDeleted: z.boolean(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ CreateBanner Schema
export const createBannerSchema = z.object({
  title: z.string(),
  image: z.instanceof(File),
  targetUrl: z.string().url().optional(),
  type: bannerTypeSchema.optional(),
  targetId: z.string().optional(),
  order: z.number().optional(),
});

// ✅ UpdateBanner Schema
export const updateBannerSchema = createBannerSchema.partial();

// ✅ Export Types
export type Banner = z.infer<typeof bannerSchema>;
export type CreateBanner = z.infer<typeof createBannerSchema>;
export type UpdateBanner = z.infer<typeof updateBannerSchema>;
