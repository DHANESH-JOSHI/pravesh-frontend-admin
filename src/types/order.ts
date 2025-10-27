import { z } from "zod";
import { addressSchema } from "./address";
import { productSchema } from "./product";

// ✅ Enum Schema
export const orderStatusSchema = z.enum([
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "awaiting_confirmation",
  "awaiting_payment",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

// ✅ OrderItem Schema
export const orderItemSchema = z.object({
  product: z.union([z.string(), productSchema.partial()]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().nonnegative(),
});

// ✅ Order Schema
export const orderSchema = z.object({
  _id: z.string(),
  user: z.string(),
  items: z.array(orderItemSchema),
  totalAmount: z.number().nonnegative(),
  shippingAddress: z.union([z.string(), addressSchema.partial()]),
  status: orderStatusSchema,
  isCustomOrder: z.boolean(),
  image: z.string().nullable(),
  feedback: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ CreateOrder Schema
export const createOrderSchema = z.object({
  shippingAddressId: z.string(),
});

// ✅ CreateCustomOrder Schema
export const createCustomOrderSchema = z.object({
  image: z.instanceof(File),
});

// ✅ AdminUpdateOrder Schema
export const adminUpdateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .optional(),
  status: orderStatusSchema.optional(),
  feedback: z.string().optional(),
});

// ✅ OrderQuery Schema
export const orderQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  status: orderStatusSchema.optional(),
  isCustomOrder: z.boolean().optional(),
});

// ✅ Export Types
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type CreateCustomOrder = z.infer<typeof createCustomOrderSchema>;
export type AdminUpdateOrder = z.infer<typeof adminUpdateOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
