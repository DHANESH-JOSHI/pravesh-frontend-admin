import { z } from "zod";
import { userSchema } from "./user"; // adjust import path as needed
import { productSchema } from "./product"; // adjust import path as needed

/* -----------------------------
   SCHEMA: Wishlist
----------------------------- */
export const wishlistSchema = z.object({
  _id: z.string(),
  user: z.union([z.string(), userSchema.partial()]), // can be ID or partial user
  items: z.array(z.union([z.string(), productSchema.partial()])),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Wishlist = z.infer<typeof wishlistSchema>;
