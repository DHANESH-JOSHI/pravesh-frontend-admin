import { z } from "zod";

export const loginSchema = z.object({
  phoneOrEmail: z.string(),
  password: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phoneOrEmail: z.string(),
  otp: z.string(),
});


export type Login = z.infer<typeof loginSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;