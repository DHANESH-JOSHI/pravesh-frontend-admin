"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Eye, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomAlertDialog } from "../common/custom-alert-dialog";
import { ProductFormDialog } from "./form-dialog";
import { productService } from "@/services/product.service";
import { Product, CreateProduct, UpdateProduct, QueryOptions } from "@/types/product";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { isFiltersSelected } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { Link } from "next-view-transitions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { invalidateProductQueries } from "@/lib/invalidate-queries";

export function ProductsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<QueryOptions>({ page: 1, limit: 8 });
  const [filterSearch, setFilterSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: filtersResp } = useQuery({
    queryKey: ["product-filters"],
    queryFn: () => productService.getFilters(),
  });
  const filters = filtersResp?.data ?? { categories: [], brands: [], sizes: [], colors: [] };
  const categories = filters?.categories ?? [];
  const brands = filters.brands ?? [];
  // const sizesOptions = filters.sizes ?? [];
  // const colorsOptions = filters.colors ?? [];
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", appliedFilters],
    queryFn: async () =>
      await productService.getAll(appliedFilters),
  });



  const products = data?.data?.products ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: ({ message }, deletedProductId) => {
      setIsOpen(false);
      toast.success(message ?? "Product deleted successfully");
      invalidateProductQueries(queryClient, { productId: deletedProductId });
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response.data.message ?? "Failed to delete product. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateProduct) => {
      const data = await productService.update(editingProduct?._id!, values);
      return data;
    },
    onSuccess: ({ message, data: updatedProduct }) => {
      toast.success(message ?? "Product updated successfully!");
      const oldCategoryId = typeof editingProduct?.category === 'string' ? editingProduct.category : editingProduct?.category?._id;
      const newCategoryId = typeof updatedProduct?.category === 'string' ? updatedProduct.category : updatedProduct?.category?._id;
      const oldBrandId = typeof editingProduct?.brand === 'string' ? editingProduct.brand : editingProduct?.brand?._id;
      const newBrandId = typeof updatedProduct?.brand === 'string' ? updatedProduct.brand : updatedProduct?.brand?._id;
      invalidateProductQueries(queryClient, {
        productId: editingProduct?._id,
        productSlug: updatedProduct?.slug,
        oldSlug: editingProduct?.slug,
        categoryId: newCategoryId,
        oldCategoryId: oldCategoryId,
        brandId: newBrandId,
        oldBrandId: oldBrandId,
      });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to update product. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateProduct) => {
      const data = await productService.create(values);
      return data;
    },
    onSuccess: ({ message, data: createdProduct }) => {
      toast.success(message ?? "Product created successfully!");
      invalidateProductQueries(queryClient, {
        productId: createdProduct?._id,
        categoryId: typeof createdProduct?.category === 'string' ? createdProduct.category : createdProduct?.category?._id,
        brandId: typeof createdProduct?.brand === 'string' ? createdProduct.brand : createdProduct?.brand?._id,
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to create product. Please try again.");
    },
  });

  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
    setFilterSearch("");
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);
  return (
    <div className="space-y-4">
      {/* Header + Controls */}
      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Products"
            count={products?.length ?? 0}
            countNoun="product"
            isFetching={isFetching}
            onRefreshAction={refetch}
            onCreateAction={() => setIsCreateDialogOpen(true)}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search products..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
          />

          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Category
              </label>
              <Select value={appliedFilters.categoryId || ""} onValueChange={(v) => setAppliedFilters((d) => ({ ...d, categoryId: v || undefined }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => (c.title ?? "").toLowerCase().includes(filterSearch.toLowerCase()))
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">

              <label className="text-xs text-muted-foreground">
                Brand
              </label>
              <Select value={appliedFilters.brandId || ""} onValueChange={(v) => setAppliedFilters((d) => ({ ...d, brandId: v || undefined }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {brands
                    .filter((b) => (b.name ?? "").toLowerCase().includes(filterSearch.toLowerCase()))
                    .map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={appliedFilters.isDeleted || ""}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, isDeleted: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-end">
              {hasFiltersSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="relative rounded border bg-background/50  overflow-hidden">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="[&>th]:py-3">
                <TableHead className="w-24">Thumbnail</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>New Arrival</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-12 w-12 rounded",
                    "h-5 w-24",
                    "h-5 w-48",
                    "h-5 w-24",
                    "h-5 w-24",
                    "h-5 w-20",
                    "h-6 w-16",
                    "h-6 w-16",
                    "h-4 w-4 rounded",
                  ]}
                />
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-6">
                    <EmptyState
                      title="No products found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => {
                  const brandName = typeof product.brand === "string" ? product.brand : product.brand?.name ?? "N/A";
                  const categoryName = typeof product.category === "string" ? product.category : (product.category as Category)?.title ?? "N/A";
                  return (
                    <TableRow
                      key={product._id}
                      className="group transition-colors hover:bg-muted/40"
                    >
                      <TableCell>
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail || "/placeholder.svg"}
                            width={56}
                            height={56}
                            alt={product.name}
                            className="h-12 w-12 rounded object-cover ring-1 ring-border/50"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center ring-1 ring-border/50">
                            <ImageIcon className="text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-left">{product.sku}</TableCell>
                      <TableCell className="font-medium max-w-[256px] text-left">
                        <div className="truncate" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground truncate w-20">{brandName}</TableCell>
                      <TableCell className="text-muted-foreground truncate w-20">{categoryName}</TableCell>
                      <TableCell className="text-center font-semibold">
                        <Badge variant="outline" className="bg-background/40">
                          {product.isNewArrival ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        <Badge variant="outline" className="bg-background/40">
                          {product.isFeatured ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/products/${product._id}`} className="flex items-center justify-center">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View</p>
                            </TooltipContent>
                          </Tooltip>
                          {!product.isDeleted && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted/60 transition-colors"
                                  onClick={() => setEditingProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive rounded-lg hover:bg-muted/60 transition-colors"
                                onClick={() => {
                                  setIsOpen(true);
                                  pendingDeleteId = product._id;
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationControls
          limit={appliedFilters.limit || 8}
              total={total}
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </div>

      <ProductFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as CreateProduct)}
      />

      <ProductFormDialog
        isLoading={updatemutation.isPending}
        key={editingProduct?._id || "edit-dialog"}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onSubmit={(data) => updatemutation.mutate(data as UpdateProduct)}
        initialData={editingProduct || undefined}
      />

      <CustomAlertDialog
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onContinue={() => {
          if (pendingDeleteId)
            deleteMutation.mutate(pendingDeleteId);
        }}
      />
    </div >
  );
}

let pendingDeleteId: string | null = null;
