import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export function toLabel(seg: string): string {
  if (!seg) return "";
  const raw = seg.replace(/[-_]+/g, " ").trim();
  const upper = raw.toUpperCase();

  const acronyms: Record<string, string> = {
    FAQ: "FAQ",
    FAQS: "FAQs",
    ID: "ID",
    API: "API",
    UI: "UI",
    UX: "UX",
    CSR: "CSR",
    SSR: "SSR",
    SSG: "SSG",
    SEO: "SEO",
    ADMIN: "Admin",
  };

  if (acronyms[upper]) return acronyms[upper];

  return raw
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}