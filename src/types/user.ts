import z from "zod";
import { Address, Cart, Order, PaginatedData, Review, Wishlist } from ".";

export type User = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  img?: string;
  role: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // relations
  cart?: Partial<Cart>;
  addresses?: Partial<Address>[];
  wishlist?: Partial<Wishlist>;
  orders?: Partial<Order>[];
  reviews?: Partial<Review>[];
}

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z
    .string("Invalid email")
    .optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().min(10, "Phone number must be at least 10 characters long").max(10, "Phone number must be at most 10 characters long"),
  role: z.enum(["user", "staff"]),
  img: z.string().optional(),
})

export type Register = z.infer<typeof registerSchema>;


export interface PaginatedUsers extends PaginatedData {
  users: User[]
}

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  isDeleted?: string;
}