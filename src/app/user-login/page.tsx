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
import { Loader2, Lock } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { useMutation } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { z } from "zod";
import instance from "@/lib/axios";
import { ApiResponse, User } from "@/types";
import { useAuth } from "@/providers/auth";

const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, "Phone or email is required"),
  password: z.string().min(1, "Password is required"),
});

type Login = z.infer<typeof loginSchema>;

export default function UserLoginPage() {
  const router = useTransitionRouter();
  const { user, loading, login } = useAuth();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasRedirectedRef.current) return;

    if (user) {
      const userRole = user.role;
      hasRedirectedRef.current = true;
      if (userRole === "user") {
        router.replace("/user-dashboard");
      } else if (userRole === "admin") {
        router.replace("/");
      } else if (userRole === "staff") {
        router.replace("/orders");
      }
    }
  }, [user, loading, router]);

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneOrEmail: "",
      password: "",
    },
  });

  const { mutate: loginWithPassword, isPending: isLoggingIn } = useMutation({
    mutationFn: async (data: Login) => {
      const response = await instance.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/login", data);
      return response.data;
    },
    onSuccess: ({ data, message }) => {
      if (!data?.user) return;
      login(data.user); // Update AuthProvider
      toast.success(message ?? "Logged in");
      // Redirect will be handled by useEffect when user state updates from AuthProvider
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to login. Check credentials and try again.");
    },
  });

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">User Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => loginWithPassword(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="phoneOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone or Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone or email"
                        {...field}
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Lock className="mr-2 h-4 w-4" />
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Are you an admin or staff?
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Go to Admin Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
