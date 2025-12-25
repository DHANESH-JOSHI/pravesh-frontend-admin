"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransitionRouter } from "next-view-transitions";
import { ReactNode } from "react";

interface DetailPageHeaderProps {
  title?: string | null;
  moduleName: string; // e.g., "Order", "User", "Product"
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  backUrl?: string; // Optional specific back URL, defaults to router.back()
  actions?: ReactNode; // Optional action buttons (e.g., Edit button)
}

export function DetailPageHeader({
  title,
  moduleName,
  badge,
  backUrl,
  actions,
}: DetailPageHeaderProps) {
  const router = useTransitionRouter();
  const displayTitle = title || `${moduleName} Details`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (backUrl ? router.push(backUrl) : router.back())}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-lg sm:text-xl font-bold truncate min-w-0">{displayTitle}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <Badge variant={badge.variant || "secondary"} className="text-xs sm:text-sm">{badge.label}</Badge>
        )}
        {actions}
      </div>
    </div>
  );
}

