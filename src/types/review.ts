import { z } from "zod";
import { productSchema } from "./product";
import { userSchema } from "./user";

/* -----------------------------
   REVIEW SCHEMAS
----------------------------- */
export const reviewSchema = z.object({
  _id: z.string(),
  user: z.union([z.string(), userSchema.partial()]),
  product: z.union([z.string(), productSchema.partial()]),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Review = z.infer<typeof reviewSchema>;

/* -----------------------------
   CREATE REVIEW
----------------------------- */
export const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
export type CreateReview = z.infer<typeof createReviewSchema>;

/* -----------------------------
   UPDATE REVIEW
----------------------------- */
export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});
export type UpdateReview = z.infer<typeof updateReviewSchema>;

/* -----------------------------
   REVIEW QUERY
----------------------------- */
export const reviewQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  productId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
