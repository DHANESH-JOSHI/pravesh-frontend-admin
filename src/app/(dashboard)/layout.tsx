"use client"
import { AppSidebar } from "@/components/dashboard/sidebar";
import Loader from "@/components/ui/loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import { useEffect, useState, useRef } from "react";
import { BreadcrumbHeader } from "@/components/dashboard/common/breadcrumb-header";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import instance from "@/lib/axios";
import { ApiResponse, User } from "@/types";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useTransitionRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar_state");
    setDefaultOpen(stored === "true" || stored === null);
  }, []);

  useEffect(() => {
    // First check actual session to see if a regular user is logged in
    (async () => {
      // Prevent multiple redirects
      if (hasRedirectedRef.current) return;
      
      try {
        const res = await instance.get<ApiResponse<User>>("/users/me");
        const userRole = res.data?.data?.role;
        if (userRole === "user") {
          // Regular user trying to access admin dashboard - redirect to user dashboard
          hasRedirectedRef.current = true;
          router.replace("/user-dashboard");
          return;
        }
      } catch (e) {
        // Not authenticated or error - will be handled by AuthProvider check below
      } finally {
        setCheckingSession(false);
      }
    })();
    
    // Reset redirect flag when router changes
    return () => {
      hasRedirectedRef.current = false;
    };
  }, [router]);

  useEffect(() => {
    if (checkingSession) return; // Wait for session check to complete
    if (hasRedirectedRef.current) return; // Already redirected
    
    // If no user is authenticated, redirect to login
    if (!loading && !user) {
      hasRedirectedRef.current = true;
      router.replace("/login");
      return;
    }
    // Redirect regular users to their dashboard (they're logged in but shouldn't access admin dashboard)
    if (!loading && user && user.role === "user") {
      hasRedirectedRef.current = true;
      router.replace("/user-dashboard");
      return;
    }
    if (!loading && user?.role === "staff") {
      const hasAccess = pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/profile");
      if (!hasAccess) {
        router.replace("/orders");
      }
    }
  }, [user, loading, pathname, router, checkingSession]);

  if (loading || checkingSession) {
    return <Loader text="Loading..." />;
  }
  if (!user) {
    return null;
  }
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <main className="grow">
        <BreadcrumbHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}