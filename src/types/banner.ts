import { z } from "zod";
import { PaginatedData } from ".";

export const bannerTypeSchema = z.enum(["product", "category", "offer", "external"]);
export type BannerType = z.infer<typeof bannerTypeSchema>;

export const createBannerSchema = z.object({
  title: z.string(),
  image: z.instanceof(File),
  targetUrl: z.string().optional(),
  type: bannerTypeSchema.optional(),
  targetId: z.string().optional(),
  order: z.number().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export type Banner = {
  _id: string;
  title: string;
  image: string;
  targetUrl?: string;
  type: BannerType;
  targetId?: string;
  isDeleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateBanner = z.infer<typeof createBannerSchema>;
export type UpdateBanner = z.infer<typeof updateBannerSchema>;


interface BannerQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isDeleted?: string;
}

interface PaginatedBanners extends PaginatedData {
  banners: Banner[];
}

export type { BannerQueryOptions, PaginatedBanners };