"use client";
import { useEffect, useRef } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth";
import Loader from "@/components/ui/loader";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const router = useTransitionRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    if (loading) return;

    const isUserDashboardRoute = pathname.startsWith("/user-dashboard");
    
    if (!isUserDashboardRoute) {
      hasRedirectedRef.current = false;
      return;
    }

    if (lastPathnameRef.current !== pathname) {
      hasRedirectedRef.current = false;
      lastPathnameRef.current = pathname;
    }

    if (!user) {
      if (pathname !== "/user-login" && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/user-login");
      }
      return;
    }

    if (user.role === "user") {
      hasRedirectedRef.current = false;
      return;
    }

    if (user.role === "admin") {
      if (pathname !== "/" && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/");
      }
      return;
    }

    if (user.role === "staff") {
      if (pathname !== "/orders" && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/orders");
      }
      return;
    }

    if (pathname !== "/user-login" && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/user-login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (!user || user.role !== "user") {
    return null; // Will redirect
  }

  return <>{children}</>;
}
