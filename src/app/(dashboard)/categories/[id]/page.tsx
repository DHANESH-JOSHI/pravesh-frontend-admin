"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Folder, Package, Eye, Plus, ImageIcon, Edit, Trash2 } from "lucide-react";
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

import { categoryService } from "@/services/category.service";
import { Category, CreateCategory, UpdateCategory } from "@/types/category";
import { Link, useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";
import { CategoryFormDialog } from "@/components/dashboard/category/form-dialog";
import { CustomAlertDialog } from "@/components/dashboard/common/custom-alert-dialog";
import Loader from "@/components/ui/loader";
import { ApiResponse, Brand, Product } from "@/types";
import { productService } from "@/services/product.service";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { invalidateCategoryQueries } from "@/lib/invalidateQueries";

export default function CategoryDetailPage() {
  const queryClient = useQueryClient();
  const router = useTransitionRouter()
  const params = useParams();
  const categoryId = params.id as string;
  const [productsPage, setProductsPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const itemsPerPage = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => await categoryService.getById(categoryId),
    enabled: !!categoryId,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", categoryId],
    queryFn: async () => await productService.getAll({ categoryId }),
    enabled: !!categoryId,
  });

  const products = productsData?.data?.products as Product[] ?? [];

  const category = data?.data as Category;
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: ({ message }, deletedCategoryId) => {
      setIsOpen(false);
      toast.success(message ?? "Category deleted.");
      invalidateCategoryQueries(queryClient, deletedCategoryId);
      // Update local cache to remove deleted subcategory
      queryClient.setQueryData(["category", categoryId], (oldData: ApiResponse<Category>) => ({
        ...oldData,
        data: {
          ...oldData.data,
          children: oldData?.data?.children?.filter((child) => child._id !== pendingDeleteId) || []
        }
      }));
      setPendingDeleteId(null);
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response.data.message ?? "Failed to delete category.");
      setPendingDeleteId(null);
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateCategory) => {
      const data = await categoryService.update(editingCategory?._id!, values);
      return data;
    },
    onSuccess: ({ data: updatedCategory, message }) => {
      toast.success(message ?? "Category updated successfully!");
      invalidateCategoryQueries(queryClient, editingCategory?._id);
      // Update local cache for immediate UI update
      queryClient.setQueryData(["category", categoryId], (oldData: ApiResponse<Category>) => ({
        ...oldData,
        data: {
          ...oldData.data,
          children: oldData?.data?.children?.map((child) => {
            if (child._id === updatedCategory?._id) return updatedCategory;
            return child;
          })
        }
      }));
      setEditingCategory(null);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to update category.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateCategory) => {
      const data = await categoryService.create({ ...values, parentCategoryId: categoryId });
      return data;
    },
    onSuccess: ({ data: createdCategory, message }) => {
      toast.success(message ?? "Category created successfully!");
      invalidateCategoryQueries(queryClient, createdCategory?._id);
      // Update local cache for immediate UI update
      queryClient.setQueryData(["category", categoryId], (oldData: ApiResponse<Category>) => ({
        ...oldData,
        data: {
          ...oldData.data,
          children: [
            ...(oldData?.data?.children || []),
            createdCategory,
          ]
        }
      }));
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to create category.");
    },
  });
  if (isLoading || isProductsLoading) {
    return <Loader />;
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
          <Button variant="outline" size="sm" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{category._id}</h1>
        </div>
        <Badge variant={category.isDeleted ? "destructive" : "secondary"}>
          {category.isDeleted ? "Deleted" : "Active"}
        </Badge>
      </div>

      {/* Parent Category */}
      {
        category.parentCategory && (
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
                  {/*{typeof category.parentCategory === 'object' && category.parentCategory.image ? (
                    <img
                      src={category.parentCategory.image}
                      alt={category.parentCategory.title}
                      className="h-12 w-12 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <Folder className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}*/}
                  <div>
                    <p className="font-semibold text-lg">
                      {typeof category.parentCategory === 'object'
                        ? category.parentCategory.title
                        : category.parentCategory}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(category.parentCategory as Category)?._id}
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
        )
      }

      {/* Category Overview */}
      <div className="grid grid-cols-1 gap-6">
        {/* Category Image */}
        {/*<Card>
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
                className="w-full h-48 object-cover rounded border"
              />
            ) : (
              <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>*/}

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category Title</label>
                  <p className="text-lg font-semibold">{category.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Path</label>
                  <p className="text-lg font-semibold">{category.path.join(" > ")}</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Total Products</label>
                  <p className="text-2xl font-bold text-blue-600">
                    {products.length}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Subcategories ({category.children?.length ?? 0})
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Subcategory
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {
            category.children && category.children.length > 0 && (<div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(category.children || [])
                    .map((c: any) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium">
                          {c.slug}
                        </TableCell>
                        <TableCell className="font-medium">
                          {c.title}
                        </TableCell>
                        <TableCell className="font-medium">
                          {c.createdAt}
                        </TableCell>
                        <TableCell className="font-medium">
                          {c.updatedAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/categories/${c._id}`} className="flex items-center justify-center">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted/60 transition-colors">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted/60 transition-colors"
                                  onClick={() => setEditingCategory(c as Category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive rounded-lg hover:bg-muted/60 transition-colors"
                                  onClick={() => {
                                    setIsOpen(true);
                                    setPendingDeleteId(c._id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            )
          }
        </CardContent>
      </Card>

      {category.brands.length > 0 && <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Brands ({category.brands?.length ?? 0})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {
            category.brands && category.brands.length > 0 && (<div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(category.brands || [])
                    .map((b: any) => (
                      <TableRow key={b._id}>
                        <TableCell>
                          {b.image ? (
                            <img
                              src={b.image}
                              alt={b.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.slug}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.createdAt}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.updatedAt}
                        </TableCell>
                        <TableCell>
                          <Link href={`/brands/${b._id}`}>
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
            )
          }
        </CardContent>
      </Card>}

      {
        products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products ({products?.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Thumbnail</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>New Arrival</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="w-16 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
                      .map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            {product.thumbnail ? <Image
                              src={product.thumbnail || "/placeholder.svg"}
                              width={56}
                              height={56}
                              alt={product.name}
                              className="h-12 w-12 rounded object-cover"
                            /> : <div className="h-12 w-12 rounded bg-muted flex items-center justify-center"><ImageIcon className="text-muted-foreground" /></div>}
                          </TableCell>
                          <TableCell className="text-left">{product.sku}</TableCell>
                          <TableCell className="font-medium max-w-[256px] text-left">
                            <div className="truncate" title={product.name}>
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate w-20">
                            {typeof product.brand === "string" ? "N/A" : (product.brand as Brand)?.name ?? "N/A"}
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate w-20">
                            {typeof product.category === "string" ? "N/A" : (product.category as Category)?.title ?? "N/A"}
                          </TableCell>
                          <TableCell className="text-center font-semibold">₹{product.originalPrice}</TableCell>
                          <TableCell className="text-center font-semibold"><Badge variant="outline">{product.isNewArrival ? 'Yes' : 'No'}</Badge></TableCell>
                          <TableCell className="text-center font-semibold"><Badge variant="outline">{product.isFeatured ? 'Yes' : 'No'}</Badge></TableCell>
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
              {(category.products || []).length > itemsPerPage && (
                <div className="mt-4">
                  <PaginationControls
                    total={category.products?.length || 0}
                    limit={itemsPerPage}
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
        )
      }
      <CategoryFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) =>
          createMutation.mutate(data)
        }
        isLoading={createMutation.isPending}
        title="Create Subcategory"
      />

      <CategoryFormDialog
        key={editingCategory?._id || "edit-dialog"}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={editingCategory || undefined}
        isLoading={updatemutation.isPending}
        title="Edit Subcategory"
      />

      <CustomAlertDialog
        isOpen={isOpen}
        onCancel={() => {
          setIsOpen(false);
          setPendingDeleteId(null);
        }}
        onContinue={() => {
          if (pendingDeleteId)
            deleteMutation.mutate(pendingDeleteId);
        }}
      />
    </div >
  );
}
