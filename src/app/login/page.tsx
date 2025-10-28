"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { InputOTPForm } from "@/components/ui/otp-input";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth";
import Loader from "@/components/ui/loader";
import { useMutation } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { Login, loginSchema } from "@/types";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useTransitionRouter();
  const { loading, user } = useAuth();
  const [showOTP, setShowOTP] = useState(false);

  const [method, setMethod] = useState<"otp" | "password">("otp");

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneOrEmail: "",
      password: "",
    },
  });

  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (phoneOrEmail: string) => authService.requestForOtp(phoneOrEmail),
    onSuccess: () => {
      toast.success("OTP sent to your email");
      setShowOTP(true);
    },
    onError: () => {
      toast.error("Failed to send OTP. Please try again.");
    },
  });

  const { mutate: loginWithPassword, isPending: isLoggingIn } = useMutation({
    mutationFn: (data: Login) => {
      return authService.login(data);
    },
    onSuccess: () => {
      toast.success("Logged in");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to login. Check credentials and try again.");
    },
  });

  if (loading) {
    return <Loader text="Loading..." />
  }
  if (user) {
    return null;
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-tr from-secondary/20 via-secondary/60 to-secondary">
      <Card className="w-full max-w-md border border-border">
        {/* Header with steps */}
        <CardHeader className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Mail size={18} />
              </div>
              <span className="font-medium text-foreground">Email</span>
            </div>
            <div className="flex items-center gap-2 ">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow">
                <Shield size={18} className="text-green-600" />
              </div>
              <span className="font-medium text-foreground">Verify</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome back
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Sign in to admin dashboard
            </p>
          </div>
        </CardHeader>

        {/* Form */}
        <CardContent>
          {showOTP ? (
            <InputOTPForm phoneOrEmail={form.getValues("phoneOrEmail")} />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(({ phoneOrEmail, password }) => {
                  if (method === "otp") {
                    sendOtp(phoneOrEmail);
                  } else {
                    loginWithPassword({ phoneOrEmail, password });
                  }
                })}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="phoneOrEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone or Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={18}
                          />
                          <Input
                            placeholder="Enter your email"
                            className="pl-10 bg-input border-border focus-visible:ring-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {method === "password" && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="bg-input border-border focus-visible:ring-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  size="lg"
                  type="submit"
                  className="w-full"
                >
                  {(method === "otp" ? isSendingOtp : isLoggingIn) ? <Loader2 className="animate-spin h-4 w-4" /> : (method === "otp" ? "Send OTP →" : "Sign in")}
                </Button>
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setMethod(method === "otp" ? "password" : "otp")}
                >
                  {method === "otp" ? 'Use password instead' : 'Use OTP instead'}
                </Button>
              </form>
            </Form>
          )}

          <p className="mt-6 text-sm text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline text-foreground">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
