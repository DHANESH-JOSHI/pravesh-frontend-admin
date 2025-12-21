"use client"
import { AppSidebar } from "@/components/dashboard/sidebar";
import Loader from "@/components/ui/loader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import { useEffect, useState } from "react";
import { BreadcrumbHeader } from "@/components/dashboard/common/breadcrumb-header";
import { useTransitionRouter } from "next-view-transitions";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const router = useTransitionRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sidebar_state");
    setDefaultOpen(stored === "true" || stored === null);
  }, []);
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);
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