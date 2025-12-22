"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Tag, Package, Image as ImageIcon, Eye } from "lucide-react";
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

import { brandService } from "@/services/brand.service";
import { Link, useTransitionRouter } from "next-view-transitions";
import Loader from "@/components/ui/loader";
import Image from "next/image";

export default function BrandDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const brandId = params.id as string;
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => await brandService.getById(brandId),
    enabled: !!brandId,
  });

  const brand = data?.data;
  const total = brand?.products?.length || 0;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !brand) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Brand not found</h1>
          <p className="text-muted-foreground">The brand you're looking for doesn't exist.</p>
          <Link href="/brands">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Brands
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{brand._id}</h1>
        </div>
        <Badge variant={brand.isDeleted ? "destructive" : "secondary"}>
          {brand.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      {/* Brand Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Brand Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brand.image ? (
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-48 object-contain rounded border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                <Tag className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brand Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Brand Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Name</label>
                <p className="text-lg font-semibold">{brand.name}</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Total Categories</label>
                  <p className="text-2xl font-bold text-green-600">
                    {brand.categories.length || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Products</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {brand.products?.length || 0}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Created:</span>
                  <p>{brand.createdAt}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Updated:</span>
                  <p>{brand.updatedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Categories by Brand */}
      {brand.categories && brand.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Categories ({brand.categories.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(brand.categories || [])
                    .map((category: any) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">
                          {category.path.join(" > ")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.title}
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.createdAt}
                        </TableCell>
                        <TableCell className="font-medium">
                          {category.updatedAt}
                        </TableCell>
                        <TableCell>
                          <Link href={`/categories/${category._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products by Brand */}
      {brand.products && brand.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products ({brand.products.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(brand.products || [])
                    .slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
                    .map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="w-16">
                          {product.thumbnail ? <Image
                            src={product.thumbnail || "/placeholder.svg"}
                            width={56}
                            height={56}
                            alt={product.name || "Product"}
                            className="h-12 w-12 rounded object-cover"
                          /> : <div className="h-12 w-12 rounded bg-muted flex items-center justify-center"><ImageIcon className="text-muted-foreground" /></div>}
                        </TableCell>
                        <TableCell className="font-medium w-16">
                          {product.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{product.createdAt}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{product.updatedAt}
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {(brand.products || []).length > itemsPerPage && (
              <div className="mt-4">
                <PaginationControls
                  total={total}
                  limit={itemsPerPage}
                  page={productsPage}
                  totalPages={Math.ceil((brand.products || []).length / itemsPerPage)}
                  isFetching={false}
                  onPrev={() => setProductsPage((p) => Math.max(1, p - 1))}
                  onNext={() => setProductsPage((p) => Math.min(Math.ceil((brand.products || []).length / itemsPerPage), p + 1))}
                  onPageChange={setProductsPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}