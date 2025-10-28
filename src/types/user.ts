import { z } from "zod";
import { PaginatedData } from ".";

export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  role: z.enum(["user", "admin"]),
  email: z.email().optional(),
  img: z.string().optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;


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