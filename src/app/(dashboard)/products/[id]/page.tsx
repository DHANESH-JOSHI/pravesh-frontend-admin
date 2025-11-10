"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Calendar, MessageSquare, Eye, UserIcon } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions"
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { Brand, Category, User } from "@/types";
import Loader from "@/components/ui/loader";

export default function ProductDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const productId = params.id as string;
  const [reviewsPage, setReviewsPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => await productService.getById(productId),
    enabled: !!productId,
  });

  const product = data?.data as Product;
  const reviews = product?.reviews || [];
  const totalReviews = reviews?.length || 0;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const brandId = (product.brand as Brand)?._id || product.brand as string;
  const brandName = (product.brand as Brand)?.name || "N/A";
  const category = product.category as Category;

  // const getStockStatusColor = (status: string) => {
  //   switch (status) {
  //     case "in-stock": return "bg-green-100 text-green-800";
  //     case "low-stock": return "bg-yellow-100 text-yellow-800";
  //     case "out-of-stock": return "bg-red-100 text-red-800";
  //     default: return "bg-gray-100 text-gray-800";
  //   }
  // };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{product._id}</h1>
        </div>
        <Badge variant={product.isDeleted ? "destructive" : "secondary"}>
          {product.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.thumbnail && (
                <div>
                  <p className="text-sm font-medium mb-2">Thumbnail</p>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
              {/*{product.images && product.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Gallery ({product.images.length} images)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                  {product.images.length > 4 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{product.images.length - 4} more images
                    </p>
                  )}
                </div>
              )}*/}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <p className="font-mono text-sm">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <p className="font-mono text-sm">{product.slug}</p>
                </div>
                <div className="space-x-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Link href={`/brands/${brandId}`}>
                    <Button variant={brandId ? 'link' : 'ghost'} size="sm" onClick={(e) => {
                      if (!brandId) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}>
                      {brandName}
                    </Button>
                  </Link>
                </div>
                <div className="space-x-2">
                  <label className="text-sm font-medium">Category</label>
                  <Link href={`/categories/${category._id}`}>
                    <Button variant="link" size="sm">
                      {category.title}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <p>{product.unit}</p>
                </div>
                {/*<div>
                  <label className="text-sm font-medium mr-3">Stock Status</label>
                  <Badge className={getStockStatusColor(product.stockStatus)}>
                    {product.stockStatus.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>*/}
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm">({product.rating}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Review Count</label>
                  <p>{product.reviewCount}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Created:</span>
                <p>{product.createdAt}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Updated:</span>
                <p>{product.updatedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Sale Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div>
              <label className="text-sm font-medium">Original Price</label>
              <p className="text-2xl font-bold">₹{product.originalPrice.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Total Sold</label>
              <p className="text-2xl">{product.totalSold}</p>
            </div>
            <div>
              <span className="font-medium text-sm">Sales Count:</span>
              <p className="text-2xl">{product.salesCount}</p>
            </div>
            {/*<div>
              <label className="text-sm font-medium">Final Price</label>
              <p className="text-2xl font-bold text-green-600">₹{product.finalPrice.toFixed(2)}</p>
            </div>*/}
            {/*{product.discountValue > 0 && (
              <div>
                <label className="text-sm font-medium">Discount</label>
                <p className="text-lg font-semibold text-red-600">
                  {product.discountType === "percentage"
                    ? `${product.discountValue}%`
                    : `₹${product.discountValue.toFixed(2)}`
                  }
                </p>
              </div>
            )}*/}
            {/*<div>
              <label className="text-sm font-medium">Savings</label>
              <p className="text-lg font-semibold text-green-600">
                ₹{(product.originalPrice - product.finalPrice).toFixed(2)}
              </p>
            </div>*/}
          </div>
        </CardContent>
      </Card>

      {/* Stock Information */}
      {/*<Card>
        <CardHeader>
          <CardTitle>Sale Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium">Current Stock</label>
              <p className="text-2xl font-bold">{product.stock}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Stock</label>
              <p className="text-xl">{product.minStock}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Total Sold</label>
              <p className="text-xl">{product.totalSold}</p>
            </div>
            <div>
              <span className="font-medium text-sm">Sales Count:</span>
              <p>{product.salesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>*/}

      {/* Description and Details */}
      {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {product.description ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No description available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Short Description</CardTitle>
          </CardHeader>
          <CardContent>
            {product.shortDescription ? (
              <p className="text-sm">{product.shortDescription}</p>
            ) : (
              <p className="text-muted-foreground">No short description available</p>
            )}
          </CardContent>
        </Card>
      </div>*/}

      {/* Features and Tags */}
      {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {product.features && product.features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {product.tags && product.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>*/}

      {/* Specifications */}
      {
        product.specifications && Object.keys(product.specifications).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex justify-between items-center py-3 px-4 rounded-lg ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                      }`}
                  >
                    <span className="font-medium text-sm">{key}</span>
                    <span className="text-sm text-muted-foreground font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Special Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Special Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {product.isFeatured && (
              <Badge variant="default">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.isNewArrival && (
              <Badge variant="default">
                <Calendar className="h-3 w-3 mr-1" />
                New Arrival
              </Badge>
            )}
            {/*{product.isDiscount && (
              <Badge variant="destructive">
                <Tag className="h-3 w-3 mr-1" />
                On Discount
              </Badge>
            )}*/}
            {product.isDeleted && (
              <Badge variant="destructive">
                Deleted
              </Badge>
            )}
          </div>
          {(!product.isFeatured && !product.isNewArrival && !product.isDeleted) && (
            <p className="text-muted-foreground">No special flags</p>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews ({totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(review.user as User)?.img ? (
                              <img
                                src={(review.user as User).img}
                                alt={(review.user as User)?.name || "User"}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                                <UserIcon className="h-3 w-3" />
                              </div>
                            )}
                            <span className="font-medium">{(review.user as User)?.name || "Anonymous"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating ?? 0)}
                            <span className="text-sm text-muted-foreground ml-1">({review.rating})</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.comment || "No comment"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {review.createdAt}
                        </TableCell>
                        <TableCell>
                          <Link href={`/reviews/${review._id}`}>
                            <Button variant="ghost">
                              <Eye className="h-4 w-4 mr-2" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalReviews > itemsPerPage && (
                <div className="mt-4">
                  <PaginationControls
                    page={reviewsPage}
                    totalPages={Math.ceil(totalReviews / itemsPerPage)}
                    isFetching={false}
                    onPrev={() => setReviewsPage((p) => Math.max(1, p - 1))}
                    onNext={() => setReviewsPage((p) => Math.min(Math.ceil(totalReviews / itemsPerPage), p + 1))}
                    onPageChange={setReviewsPage}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">No reviews yet</p>
          )}
        </CardContent>
      </Card>
    </div >
  );
}