import { z } from "zod";
import { User } from "./user"; // assuming you have a Zod userSchema
import { PaginatedData } from ".";

export const createAddressSchema = z.object({
  fullname: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type Address = {
  _id: string;
  user: string | Partial<User>;
  fullname: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CreateAddress = z.infer<typeof createAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;

export interface PaginatedAddresses extends PaginatedData {
  addresses: Address[];
}


export interface AddressQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  user?: string;
  isDeleted?: boolean;
}