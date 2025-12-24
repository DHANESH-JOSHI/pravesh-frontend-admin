"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon, Loader } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { bannerService } from "@/services/banner.service";
import { Banner } from "@/types/banner";
import { Badge } from "@/components/ui/badge";

export default function BannerDetailPage() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = useParams();
  const router = useTransitionRouter()
  const id = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["banner", id],
    queryFn: async () => await bannerService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const banner: Banner | undefined = data?.data;

  if (isLoading) {
    return <Loader />
  }

  if (isError || !banner) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Banner not found</h1>
          <p className="text-muted-foreground">The banner you're looking for doesn't exist.</p>
          <Link href="/banners">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Banners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const makeUrl = (type: string, { id, url }: { id?: string, url?: string }) => {
    switch (type) {
      case "product":
        return `${baseUrl}/products${id ? `/${id}` : ""}`;
      case "category":
        return `${baseUrl}/categories${id ? `/${id}` : ""}`;
      case "brand":
        return `${baseUrl}/brands${id ? `/${id}` : ""}`;
      default:
        return url || "_";
    }
  }

  const redirectUrl = makeUrl(banner.type, { id: banner.targetId, url: banner.targetUrl });

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{banner._id}</h1>
        </div>
        <Badge variant={banner.isDeleted ? "destructive" : "secondary"}>
          {banner.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {banner.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {banner.image ? (
            <div className="mb-4">
              <Image src={banner.image} alt={banner.title} width={1200} height={400} className="w-full h-auto rounded" />
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-6 w-6" /> No image
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium">{banner.type ?? "—"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Priority</div>
              <div className="font-medium">{banner.order ?? "—"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Link</div>
              <div className="font-medium flex items-center gap-2">
                <a href={redirectUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> <p className="text-sm">{redirectUrl}</p>
                </a>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="font-medium">{!banner.isDeleted ? "Yes" : "No"}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-muted-foreground">Created At</div>
              <div className="font-medium">{banner.createdAt ?? "—"}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-muted-foreground">Updated At</div>
              <div className="font-medium">{banner.updatedAt ?? "—"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
