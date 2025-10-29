"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Tag, Calendar } from "lucide-react";
import { Link } from "next-view-transitions"
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { productService } from "@/services/product.service";
import { Product } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => await productService.getById(productId),
    enabled: !!productId,
  });

  const product = data?.data as Product;

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

  const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;
  const categoryName = typeof product.category === 'object' ? product.category?.title : product.category;

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in-stock": return "bg-green-100 text-green-800";
      case "low-stock": return "bg-yellow-100 text-yellow-800";
      case "out-of-stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "discontinued": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
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
              {product.images && product.images.length > 0 && (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
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
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <p>{brandName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p>{categoryName || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <p>{product.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mr-3">Status</label>
                  <Badge className={getProductStatusColor(product.status)}>
                    {product.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium mr-3">Stock Status</label>
                  <Badge className={getStockStatusColor(product.stockStatus)}>
                    {product.stockStatus.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium">Original Price</label>
              <p className="text-2xl font-bold">₹{product.originalPrice.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Final Price</label>
              <p className="text-2xl font-bold text-green-600">₹{product.finalPrice.toFixed(2)}</p>
            </div>
            {product.discountValue > 0 && (
              <div>
                <label className="text-sm font-medium">Discount</label>
                <p className="text-lg font-semibold text-red-600">
                  {product.discountType === "percentage"
                    ? `${product.discountValue}%`
                    : `₹${product.discountValue.toFixed(2)}`
                  }
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Savings</label>
              <p className="text-lg font-semibold text-green-600">
                ₹{(product.originalPrice - product.finalPrice).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Information */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </div>
        </CardContent>
      </Card>

      {/* Description and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Features and Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

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
            {product.isDiscount && (
              <Badge variant="destructive">
                <Tag className="h-3 w-3 mr-1" />
                On Discount
              </Badge>
            )}
            {product.isDeleted && (
              <Badge variant="destructive">
                Deleted
              </Badge>
            )}
          </div>
          {(!product.isFeatured && !product.isNewArrival && !product.isDiscount && !product.isDeleted) && (
            <p className="text-muted-foreground">No special flags</p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p>{product.createdAt}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Updated:</span>
              <p>{product.updatedAt}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Sales Count:</span>
              <p>{product.salesCount}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Product ID:</span>
              <p className="font-mono text-xs">{product._id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}