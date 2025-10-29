"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Folder, Package, Image as ImageIcon, BarChart3, Eye, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";

import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { Link } from "next-view-transitions";

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => await categoryService.getById(categoryId),
    enabled: !!categoryId,
  });

  const category = data?.data as Category;

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

  if (error || !category) {
    return (
      <div className="flex flex-1 flex-col gap-6 sm:max-w-6xl mx-auto w-full p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Category not found</h1>
          <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
          <Link href="/categories">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
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
          <Link href="/categories">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{category._id}</h1>
        </div>
        <Badge variant={category.isDeleted ? "destructive" : "secondary"}>
          {category.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      {/* Parent Category */}
      {category.parentCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Parent Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {typeof category.parentCategory === 'object' && category.parentCategory.image ? (
                  <img
                    src={category.parentCategory.image}
                    alt={category.parentCategory.title}
                    className="h-12 w-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Folder className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {typeof category.parentCategory === 'object'
                      ? category.parentCategory.title
                      : category.parentCategory}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {typeof category.parentCategory === 'object'
                      ? `${category.parentCategory.children?.length || 0} subcategories • ${category.parentCategory.products?.length || 0} products`
                      : 'Parent category'}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/categories/${typeof category.parentCategory === 'object' ? category.parentCategory._id : category.parentCategory}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Parent Category
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Category Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {category.image ? (
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-48 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category Title</label>
                <p className="text-lg font-semibold">{category.title}</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Total Products</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {category.products?.length || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Subcategories</label>
                  <p className="text-2xl font-bold text-green-600">
                    {category.children?.length || 0}
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Created:</span>
                  <p>{category.createdAt}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Updated:</span>
                  <p>{category.updatedAt}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Subcategories ({category.children.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.children.map((child) => (
                    <TableRow key={child._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {child.image ? (
                            <img
                              src={child.image}
                              alt={child.title}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{child.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {child.products?.length || 0} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {child.children?.length || 0} subcategories
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={child.isDeleted ? "destructive" : "secondary"}>
                          {child.isDeleted ? "Deleted" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {child.createdAt}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/categories/${child._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products in Category */}
      {category.products && category.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products in Category ({category.products.length})
              </div>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View All Products
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(category.products || [])
                    .slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
                    .map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.thumbnail && (
                              <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium max-w-xs truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{product.finalPrice}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={
                            product.status === "active" ? "default" :
                              product.status === "inactive" ? "secondary" :
                                "destructive"
                          }>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Package className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {(category.products || []).length > itemsPerPage && (
              <div className="mt-4">
                <PaginationControls
                  page={productsPage}
                  totalPages={Math.ceil((category.products || []).length / itemsPerPage)}
                  isFetching={false}
                  onPrev={() => setProductsPage((p) => Math.max(1, p - 1))}
                  onNext={() => setProductsPage((p) => Math.min(Math.ceil((category.products || []).length / itemsPerPage), p + 1))}
                  onPageChange={setProductsPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {category.products?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {category.children?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Subcategories</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {category.products?.filter(p => p.stock && p.stock > 0).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">In Stock</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {category.products?.filter(p => p.stock === 0).length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}