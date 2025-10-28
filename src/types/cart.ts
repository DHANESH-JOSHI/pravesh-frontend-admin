import { Product } from "./product"; // assuming you already have a productSchema
import { PaginatedData, User } from ".";

export type CartItem = {
  product: string | Partial<Product>;
  quantity: number;
};

export type Cart = {
  _id: string;
  user: string | Partial<User>;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};
export interface PaginatedCarts extends PaginatedData {
  carts: Cart[];
}

export type CartQueryOptions = {
  user?: string;
  page?: number;
  limit?: number;
};