import { z } from "zod";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}

export interface Setting {
  _id?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  socialLinks?: SocialLinks;
  aboutTitle?: string;
  aboutDescription?: string;
  yearsOfExperience?: string;
  happyCustomers?: string;
  productsAvailable?: string;
  citiesServed?: string;
  workingHours?: string;
  whyChooseUs?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const updateSettingSchema = z.object({
  businessName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.union([z.instanceof(File), z.string()]).optional(),
  socialLinks: z.object({
    facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
    youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  }).optional(),
  aboutTitle: z.string().optional(),
  aboutDescription: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  happyCustomers: z.string().optional(),
  productsAvailable: z.string().optional(),
  citiesServed: z.string().optional(),
  workingHours: z.string().optional(),
  whyChooseUs: z.string().optional(),
});

export type UpdateSetting = z.infer<typeof updateSettingSchema>;

