import { z } from "zod";
import { userSchema } from "./user"; // assuming you have a Zod userSchema

// ✅ Address Schema
export const addressSchema = z.object({
  _id: z.string(),
  user: z.union([z.string(), userSchema.partial()]), // string or partial user
  fullname: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ✅ CreateAddress Schema
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

// ✅ UpdateAddress Schema
export const updateAddressSchema = createAddressSchema.partial();

// ✅ Export Types
export type Address = z.infer<typeof addressSchema>;
export type CreateAddress = z.infer<typeof createAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;
