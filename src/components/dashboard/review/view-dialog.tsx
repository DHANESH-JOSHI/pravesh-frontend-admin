"use client";

import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Review } from "@/types/review";

interface ReviewViewDialogProps {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewViewDialog({
  review,
  open,
  onOpenChange,
}: ReviewViewDialogProps) {
  if (!review) return null;

  const userName = typeof review.user === 'object' ? review.user.name : review.user;
  const userEmail = typeof review.user === 'object' ? review.user.email : '';
  const productName = typeof review.product === 'object' ? review.product.name : review.product;
  const productBrand = typeof review.product === 'object' && review.product.brand
    ? (typeof review.product.brand === 'object' ? review.product.brand.name : review.product.brand)
    : '';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              User Information
            </h3>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-medium">
                {userName || "Unknown User"}
              </p>
              {userEmail && (
                <p className="text-sm text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Product Information
            </h3>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-medium">
                {productName || "Unknown Product"}
              </p>
              {productBrand && (
                <p className="text-sm text-muted-foreground">
                  Brand: {productBrand}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Rating
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex">
                {renderStars(review.rating)}
              </div>
              <Badge variant="secondary">
                {review.rating}/5
              </Badge>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Comment
              </h3>
              <div className="bg-muted/50 rounded p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p>{review.createdAt}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Updated:</span>
              <p>{review.updatedAt}</p>
            </div>
          </div>

          {/* Review ID */}
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Review ID:
            </span>
            <p className="text-xs font-mono mt-1">{review._id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}