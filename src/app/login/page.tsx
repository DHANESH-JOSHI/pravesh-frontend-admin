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
import { Loader2, Mail, Shield, Lock, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { InputOTPForm } from "@/components/ui/otp-input";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth";
import Loader from "@/components/ui/loader";
import { useMutation } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { Login, loginSchema } from "@/types";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useTransitionRouter();
  const { loading, user } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [method, setMethod] = useState<"otp" | "password">("otp");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const forgotPasswordForm = useForm<{ phoneOrEmail: string; otp?: string; newPassword?: string }>({
    defaultValues: {
      phoneOrEmail: "",
      otp: "",
      newPassword: "",
    },
  });

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneOrEmail: "",
      password: "",
    },
  });

  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (phoneOrEmail: string) => authService.requestForOtp(phoneOrEmail),
    onSuccess: ({ message }) => {
      toast.success(message ?? "OTP sent to your email");
      setShowOTP(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to send OTP.");
    },
  });

  const { mutate: loginWithPassword, isPending: isLoggingIn } = useMutation({
    mutationFn: async (data: Login) => {
      const response = await authService.login(data);
      return response;
    },
    onSuccess: ({ data, message }) => {
      if (!data) return;
      login(data);
      toast.success(message ?? "Logged in");
      // Navigation will be handled by useEffect when user state updates
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to login. Check credentials and try again.");
    },
  });

  const { mutate: requestResetOtp, isPending: isRequestingReset } = useMutation({
    mutationFn: (phoneOrEmail: string) => authService.requestForOtp(phoneOrEmail),
    onSuccess: ({ message }) => {
      toast.success(message ?? "OTP sent to your email");
      setShowResetPassword(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to send OTP.");
    },
  });

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: ({ otp, newPassword }: { otp: string; newPassword: string }) =>
      userService.resetPassword(otp, newPassword),
    onSuccess: ({ message }) => {
      toast.success(message ?? "Password reset successfully");
      setShowForgotPassword(false);
      setShowResetPassword(false);
      setResetEmail("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to reset password. Please try again.");
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
          {!showForgotPassword ? (
            <>
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
            </>
          ) : showResetPassword ? (
            <div className="text-center space-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow mx-auto mb-2">
                <Lock size={24} />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Reset Password
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Enter OTP and new password
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow mx-auto mb-2">
                <Lock size={24} />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Forgot Password
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                We'll send you an OTP to reset your password
              </p>
            </div>
          )}
        </CardHeader>

        {/* Form */}
        <CardContent>
          {showForgotPassword ? (
            showResetPassword ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to <span className="font-medium text-foreground">{resetEmail}</span>
                  </p>
                </div>
                <Form {...forgotPasswordForm}>
                  <form
                    onSubmit={forgotPasswordForm.handleSubmit((data) => {
                      if (data.otp && data.newPassword) {
                        resetPassword({ otp: data.otp, newPassword: data.newPassword });
                      }
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={forgotPasswordForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OTP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={forgotPasswordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      size="lg"
                      type="submit"
                      className="w-full"
                      disabled={isResettingPassword}
                    >
                      {isResettingPassword ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                    <Button
                      size="lg"
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowResetPassword(false);
                        forgotPasswordForm.reset();
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <div className="space-y-6">
                <Form {...forgotPasswordForm}>
                  <form
                    onSubmit={forgotPasswordForm.handleSubmit((data) => {
                      setResetEmail(data.phoneOrEmail);
                      requestResetOtp(data.phoneOrEmail);
                    })}
                    className="space-y-4"
                  >
                    <FormField
                      control={forgotPasswordForm.control}
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
                                placeholder="Enter your email or phone"
                                className="pl-10 bg-input border-border focus-visible:ring-primary"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      size="lg"
                      type="submit"
                      className="w-full"
                      disabled={isRequestingReset}
                    >
                      {isRequestingReset ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                    <Button
                      size="lg"
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowForgotPassword(false);
                        forgotPasswordForm.reset();
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </form>
                </Form>
              </div>
            )
          ) : showOTP ? (
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
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowForgotPassword(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Forgot Password?
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
