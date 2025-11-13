"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { bannerService } from "@/services/banner.service";
import { Banner } from "@/types/banner";

export default function BannerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["banner", id],
    queryFn: async () => await bannerService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const banner: Banner | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse h-8 w-1/3 bg-muted rounded" />
        <div className="grid grid-cols-1 gap-6">
          <div className="h-64 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
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

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/banners">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Banner details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          <Link href={`/banners/${banner._id}/edit`}>
            <Button>Edit</Button>
          </Link>
        </div>
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
              <div className="text-sm text-muted-foreground">Order</div>
              <div className="font-medium">{banner.order ?? "—"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Link</div>
              <div className="font-medium flex items-center gap-2">
                {banner.targetUrl ? (
                  <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="underline">
                    <LinkIcon className="h-4 w-4" /> {banner.targetUrl}
                  </a>
                ) : (
                  "—"
                )}
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
