"use client"
import { AppSidebar } from "@/components/dashboard/sidebar";
import Loader from "@/components/ui/loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import { useEffect, useState } from "react";
import { BreadcrumbHeader } from "@/components/dashboard/common/breadcrumb-header";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const router = useTransitionRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar_state");
    setDefaultOpen(stored === "true" || stored === null);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    // Block regular users from accessing admin dashboard
    if (!loading && user && user.role === "user") {
      router.replace("/user-dashboard");
      return;
    }
    if (!loading && user?.role === "staff") {
      const hasAccess = pathname === "/orders" || pathname.startsWith("/orders/") || pathname.startsWith("/profile");
      if (!hasAccess) {
        router.replace("/orders");
      }
    }
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