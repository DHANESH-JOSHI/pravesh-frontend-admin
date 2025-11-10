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

export default function BrandDetailPage() {
  const router = useTransitionRouter()
  const params = useParams();
  const brandId = params.id as string;
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => await brandService.getById(brandId),
    enabled: !!brandId,
  });

  const brand = data?.data;

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
                className="w-full h-48 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
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
                  <label className="text-sm font-medium">Total Products</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {brand.products?.length || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Active Products</label>
                  <p className="text-2xl font-bold text-green-600">
                    {brand.products?.filter(p => !p.isDeleted).length || 0}
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

      {/* Products by Brand */}
      {brand.products && brand.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products by {brand.name} ({brand.products.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(brand.products || [])
                    .slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
                    .map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="w-40">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ):<ImageIcon/>}
                        </TableCell>
                        <TableCell className="font-medium w-32">
                          {product.sku}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{product.originalPrice}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            product.isDeleted ? "destructive" :
                              "secondary"
                          }>
                            {product.isDeleted ? "inactive" : "active"}
                          </Badge>
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