import { z } from "zod";
import { Address } from "./address";
import { Product } from "./product";
import { PaginatedData, User } from ".";

export const orderStatusSchema = z.enum([
  "received",
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
  price: z.number().min(1, "Price must be at least 0"),
});
type OrderItem = {
  product: string | Partial<Product>;
  quantity: number;
  price: number;
}

type OrderHistoryItem = {
  status: OrderStatus;
  timestamp: Date;
}

export type Order = {
  _id: string;
  user: string | Partial<User>;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string | Partial<Address>;
  status: OrderStatus;
  history: OrderHistoryItem[];
  isCustomOrder: boolean;
  image?: string;
  feedback?: string;
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