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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { useMutation } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { z } from "zod";
import instance from "@/lib/axios";
import { ApiResponse, User } from "@/types";

const loginSchema = z.object({
  phoneOrEmail: z.string().min(1, "Phone or email is required"),
  password: z.string().min(1, "Password is required"),
});

type Login = z.infer<typeof loginSchema>;

export default function UserLoginPage() {
  const router = useTransitionRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    (async () => {
      try {
        const res = await instance.get<ApiResponse<User>>("/users/me");
        const userRole = res.data?.data?.role;
        if (userRole === "user" && res.data?.data) {
          setUser(res.data.data);
          router.replace("/user-dashboard");
        } else if (userRole === "admin" || userRole === "staff") {
          // If admin/staff is logged in, redirect to admin dashboard
          router.replace("/");
        }
      } catch (e) {
        // Not logged in, continue with login page
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

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
      setUser(data.user);
      toast.success(message ?? "Logged in");
      router.push("/user-dashboard");
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
        </CardContent>
      </Card>
    </div>
  );
}
