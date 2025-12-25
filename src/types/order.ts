import { z } from "zod";
import { Address } from "./address";
import { Product } from "./product";
import { PaginatedData, User } from ".";

export const orderStatusSchema = z.enum([
  "received",
  "accepted",
  "approved",
  "cancelled",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;


export const orderUpdateItemSchema = z.object({
  product: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  variantSelections: z.record(z.string(), z.string()).optional(),
});
type OrderItem = {
  product: string | Partial<Product>;
  quantity: number;
  unit: string; // required - unit selected when order was placed
  variantSelections?: Record<string, string>; // Selected variants when order was placed
}

type OrderHistoryItem = {
  status: OrderStatus;
  timestamp: Date;
  updatedBy?: string | { _id: string; name: string; email?: string; role: string };
}

export type Order = {
  _id: string;
  user: string | Partial<User>;
  items: OrderItem[];
  shippingAddress: string | Partial<Address>;
  status: OrderStatus;
  history: OrderHistoryItem[];
  isCustomOrder: boolean;
  image?: string;
  feedback?: string;
  orderNumber?: string; // Display number in format ORD-YYYY-MM-DD-NNNNNN
  acceptedBy?: string | Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export const createOrderSchema = z.object({
  shippingAddressId: z.string(),
});

export const createCustomOrderSchema = z.object({
  image: z.instanceof(File),
});

export const adminUpdateOrderSchema = z.object({
  items: z
    .array(
      orderUpdateItemSchema
    )
    .optional(),
  feedback: z.string().optional(),
});

export type CreateOrder = z.infer<typeof createOrderSchema>;
export type CreateCustomOrder = z.infer<typeof createCustomOrderSchema>;
export type AdminUpdateOrder = z.infer<typeof adminUpdateOrderSchema>;

interface PaginatedOrders extends PaginatedData {
  orders: Order[];
}
interface OrderQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  user?: string;
  isCustomOrder?: string;
}

export type { PaginatedOrders, OrderQueryOptions };