import { User } from "./user";
import { Product } from "./product";

export type Wishlist = {
  _id: string;
  user: string | Partial<User>;
  items: Array<string | Partial<Product>>;
  createdAt: string;
  updatedAt: string;
};
