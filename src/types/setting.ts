import { z } from "zod";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}

export interface PrivacyPolicy {
  introduction?: string;
  informationWeCollect?: string[];
  howWeUseInformation?: string[];
  informationSharing?: string[];
  dataSecurity?: string;
  userRights?: string[];
  cookies?: string;
  thirdPartyServices?: string[];
  changesToPolicy?: string;
}

export interface ReturnsRefunds {
  introduction?: string;
  returnEligibility?: string[];
  returnTimeframe?: string;
  returnProcess?: string[];
  refundPolicy?: string;
  nonRefundableItems?: string[];
  exchangePolicy?: string;
  returnShipping?: string;
  refundProcessingTime?: string;
}

export interface Setting {
  _id?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  mapAddress?: string;
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
  privacyPolicy?: PrivacyPolicy;
  returnsRefunds?: ReturnsRefunds;
  createdAt?: string;
  updatedAt?: string;
}

export const updateSettingSchema = z.object({
  businessName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  mapAddress: z.string().optional(),
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
  privacyPolicy: z.object({
    introduction: z.string().optional(),
    informationWeCollect: z.array(z.string()).optional(),
    howWeUseInformation: z.array(z.string()).optional(),
    informationSharing: z.array(z.string()).optional(),
    dataSecurity: z.string().optional(),
    userRights: z.array(z.string()).optional(),
    cookies: z.string().optional(),
    thirdPartyServices: z.array(z.string()).optional(),
    changesToPolicy: z.string().optional(),
  }).optional(),
  returnsRefunds: z.object({
    introduction: z.string().optional(),
    returnEligibility: z.array(z.string()).optional(),
    returnTimeframe: z.string().optional(),
    returnProcess: z.array(z.string()).optional(),
    refundPolicy: z.string().optional(),
    nonRefundableItems: z.array(z.string()).optional(),
    exchangePolicy: z.string().optional(),
    returnShipping: z.string().optional(),
    refundProcessingTime: z.string().optional(),
  }).optional(),
});

export type UpdateSetting = z.infer<typeof updateSettingSchema>;

