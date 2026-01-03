"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { VerifyOtp, verifyOtpSchema } from "@/types";
import { authService } from "@/services/auth.service";
import { useTransitionRouter } from "next-view-transitions";
import { useAuth } from "@/providers/auth";

export function InputOTPForm({ phoneOrEmail }: { phoneOrEmail: string }) {
  const { login } = useAuth();
  const router = useTransitionRouter();
  const form = useForm<VerifyOtp>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phoneOrEmail,
      otp: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: VerifyOtp) => {
      const data = await authService.loginViaOtp(values.phoneOrEmail, values.otp)
      return data;
    },
    onSuccess: ({ data }) => {
      if (!data) return;
      login(data);
      toast.success("Login successful!");
      // Redirect will be handled by useEffect in login page when user state updates
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Invalid OTP. Please try again.")
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutate(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP : </FormLabel>
              <FormControl className="flex flex-col items-center">
                <InputOTP
                  maxLength={6}
                  minLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  autoComplete="one-time-code"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full bg-accent hover:bg-accent/80 text-primary"
        >
          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify OTP →"}
        </Button>
      </form>
    </Form>
  );
}
