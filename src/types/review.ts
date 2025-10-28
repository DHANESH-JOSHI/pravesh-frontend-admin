import { User } from "./user";
import { PaginatedData, Product } from ".";
export type Review = {
  _id: string;
  user: string | Partial<User>;
  product: string | Partial<Product>;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

export interface ReviewQueryOptions {
  page?: number;
  limit?: number;
  rating?: number;
  user?: string;
  product?: string;
  search?: string;
}
export interface PaginatedReviews extends PaginatedData {
  reviews: Review[];
}
