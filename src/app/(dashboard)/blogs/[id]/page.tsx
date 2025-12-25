"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Loader } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { blogService } from "@/services/blog.service";
import { Blog } from "@/types/blog";
import { Badge } from "@/components/ui/badge";

export default function BlogDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => await blogService.getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  const blog: Blog | undefined = data?.data;

  if (isLoading) {
    return <Loader />
  }

  if (isError || !blog) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Blog not found</h1>
          <p className="text-muted-foreground">The blog you're looking for doesn't exist.</p>
          <Link href="/blogs">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
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
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{blog.title || "Blog Post"}</h1>
        </div>
        <Badge variant={!blog.isPublished ? "destructive" : "secondary"}>
          {!blog.isPublished ? "In Draft" : "Published"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {blog.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blog.featuredImage && (
            <div className="mb-4">
              <Image src={blog.featuredImage} alt={blog.title} width={1200} height={400} className="w-full h-auto rounded" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> <span>{blog.createdAt ?? "—"}</span>
            </div>

            <div className="flex items-center gap-2">
              {(blog.tags || []).map((t) => (
                <Badge key={t} >{t}</Badge>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <article className="prose max-w-none">
            {/* assuming blog.content is HTML; if markdown, convert before rendering */}
            <div dangerouslySetInnerHTML={{ __html: blog.content || "<p>No content</p>" }} />
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
