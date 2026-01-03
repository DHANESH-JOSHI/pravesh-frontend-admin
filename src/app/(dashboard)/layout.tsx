"use client"
import { AppSidebar } from "@/components/dashboard/sidebar";
import Loader from "@/components/ui/loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import { useEffect, useState, useRef } from "react";
import { BreadcrumbHeader } from "@/components/dashboard/common/breadcrumb-header";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const router = useTransitionRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  const lastPathnameRef = useRef(pathname);
  const redirectingToRef = useRef<string | null>(null);
  const lastUserRoleRef = useRef<string | null>(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar_state");
    setDefaultOpen(stored === "true" || stored === null);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const isDashboardRoute = pathname !== "/login" && 
                             pathname !== "/user-login" && 
                             !pathname.startsWith("/user-dashboard");
    
    if (!isDashboardRoute) {
      redirectingToRef.current = null;
      isRedirectingRef.current = false;
      hasRedirectedRef.current = false;
      return;
    }
    
    if (isRedirectingRef.current) {
      return;
    }

    const userRole = user?.role || null;
    if (lastUserRoleRef.current !== userRole) {
      lastUserRoleRef.current = userRole;
      hasRedirectedRef.current = false;
      redirectingToRef.current = null;
      isRedirectingRef.current = false;
    }

    if (redirectingToRef.current && redirectingToRef.current !== pathname) {
      return;
    }

    const pathnameChanged = lastPathnameRef.current !== pathname;
    if (pathnameChanged) {
      lastPathnameRef.current = pathname;
      if (redirectingToRef.current === pathname || 
          (user?.role === "staff" && (pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/profile"))) ||
          (user?.role === "user" && pathname === "/user-dashboard") ||
          (user?.role === "admin") ||
          (!user && pathname === "/login")) {
        hasRedirectedRef.current = false;
        redirectingToRef.current = null;
        isRedirectingRef.current = false;
      }
    }

    if (!user) {
      if (pathname !== "/login" && !hasRedirectedRef.current && redirectingToRef.current !== "/login" && !isRedirectingRef.current) {
        isRedirectingRef.current = true;
        hasRedirectedRef.current = true;
        redirectingToRef.current = "/login";
        router.replace("/login");
      }
      return;
    }

    if (user.role === "user") {
      if (pathname === "/user-dashboard" || pathname.startsWith("/user-dashboard/")) {
        redirectingToRef.current = null;
        hasRedirectedRef.current = false;
        isRedirectingRef.current = false;
        return;
      }
      
      if (!isRedirectingRef.current && redirectingToRef.current !== "/user-dashboard") {
        isRedirectingRef.current = true;
        redirectingToRef.current = "/user-dashboard";
        router.replace("/user-dashboard");
      }
      return;
    }

    if (user.role === "staff") {
      const hasAccess = pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/profile");
      
      if (hasAccess) {
        redirectingToRef.current = null;
        hasRedirectedRef.current = false;
        isRedirectingRef.current = false;
        return;
      }
      
      if (!isRedirectingRef.current && redirectingToRef.current !== "/orders") {
        isRedirectingRef.current = true;
        redirectingToRef.current = "/orders";
        router.replace("/orders");
      }
      return;
    }

    hasRedirectedRef.current = false;
  }, [user, loading, pathname, router]);

  if (loading) {
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