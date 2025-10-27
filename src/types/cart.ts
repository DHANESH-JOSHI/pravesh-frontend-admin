import { z } from "zod";
import { productSchema } from "./product"; // assuming you already have a productSchema

// ✅ CartItem Schema
export const cartItemSchema = z.object({
  _id: z.string(),
  product: z.union([z.string(), productSchema.partial()]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  totalPrice: z.number().nonnegative(),
});

// ✅ Cart Schema
export const cartSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  items: z.array(cartItemSchema),
  totalAmount: z.number().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ AddToCart Schema
export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// ✅ UpdateCartItem Schema
export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// ✅ CartSummary Schema
export const cartSummarySchema = z.object({
  totalItems: z.number().int().nonnegative(),
  totalAmount: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  discount: z.number().nonnegative(),
});

// ✅ Export Types
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddToCart = z.infer<typeof addToCartSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
export type CartSummary = z.infer<typeof cartSummarySchema>;
