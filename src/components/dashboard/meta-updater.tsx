"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingService } from "@/services/setting.service";

export function MetaUpdater() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => await settingService.get(),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  const settings = data?.data;

  useEffect(() => {
    if (settings) {
      const logoUrl = settings.logo || "https://img.freepik.com/premium-vector/white-logo-construction-project-called-construction_856308-794.jpg?semt=ais_hybrid&w=740&q=80";
      const businessName = settings.businessName || "Pravesh Hardware Dashboard";
      const description = settings.aboutDescription || "Admin dashboard for Pravesh Hardware";

      // Update favicon
      let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = logoUrl;

      // Update apple-touch-icon
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = logoUrl;

      // Update title
      document.title = businessName;

      // Update or create meta tags
      const updateMetaTag = (property: string, content: string, isProperty = false) => {
        const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement("meta");
          if (isProperty) {
            meta.setAttribute("property", property);
          } else {
            meta.setAttribute("name", property);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
      };

      updateMetaTag("description", description);
      updateMetaTag("og:title", businessName, true);
      updateMetaTag("og:description", description, true);
      updateMetaTag("og:image", logoUrl, true);
      updateMetaTag("og:type", "website", true);
      updateMetaTag("twitter:card", "summary_large_image");
      updateMetaTag("twitter:image", logoUrl);
    }
  }, [settings]);

  return null;
}
