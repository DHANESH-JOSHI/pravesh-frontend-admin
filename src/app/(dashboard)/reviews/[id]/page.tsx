"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, User, Package, Calendar, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review";
import { Link } from "next-view-transitions";

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: async () => await reviewService.getById(reviewId),
    enabled: !!reviewId,
  });

  const review = data?.data as Review;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="animate-pulse">
          <div className="h-8 rounded w-1/4 mb-4"></div>
          <div className="h-64 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Review not found</h1>
          <p className="text-muted-foreground">The review you're looking for doesn't exist.</p>
          <Link href="/reviews">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reviews
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = typeof review.user === 'object' ? review.user : null;
  const product = typeof review.product === 'object' ? review.product : null;
  const productBrand = product?.brand && typeof product.brand === 'object' ? product.brand : null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      <div className="flex items-center gap-4">
        <Link href="/reviews">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reviews
          </Button>
        </Link><h1 className="text-xl font-bold">{review._id}</h1>
      </div>


      {/* Review Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {review.rating}/5
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{review.createdAt}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </label>
                <p className="text-sm">{review.updatedAt}</p>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <>
              <Separator className="my-6" />
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comment
                </label>
                <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator className="my-6" />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Review ID</p>
              <p className="font-mono text-xs">{review._id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-lg font-semibold">{user.name || "Unknown User"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="font-mono text-sm">{user.email || "N/A"}</p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-start items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      {product && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <p className="text-lg font-semibold">{product.name || "Unknown Product"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Brand</label>
                <p className="text-sm">{productBrand?.name || "N/A"}</p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex justify-start items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                <p className="font-mono text-xs">{product._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}