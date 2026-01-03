"use client";
import { useEffect, useState, useRef } from "react";
import { useTransitionRouter } from "next-view-transitions";
import instance from "@/lib/axios";
import { ApiResponse, User } from "@/types";
import Loader from "@/components/ui/loader";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useTransitionRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Check authentication and role on every navigation
    (async () => {
      // Prevent multiple redirects in the same render cycle
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;
      
      try {
        const res = await instance.get<ApiResponse<User>>("/users/me");
        const userRole = res.data?.data?.role;
        if (userRole === "user") {
          // User is authenticated and has correct role
          setLoading(false);
        } else if (userRole === "admin" || userRole === "staff") {
          // Admin/staff trying to access user dashboard - redirect to admin dashboard
          router.replace("/");
        } else {
          // Invalid role or not authenticated
          router.replace("/user-login");
        }
      } catch (e) {
        // Not authenticated
        router.replace("/user-login");
      } finally {
        setLoading(false);
      }
    })();
    
    // Reset the ref when router changes (new navigation)
    return () => {
      hasCheckedRef.current = false;
    };
  }, [router]);

  if (loading) {
    return <Loader text="Loading..." />;
  }

  return <>{children}</>;
}
