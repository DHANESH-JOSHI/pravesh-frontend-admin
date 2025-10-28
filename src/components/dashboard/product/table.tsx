"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2, Eye, Funnel, X, Check, Tag, Box, Palette, DollarSign } from "lucide-react";
import Image from "next/image";
import {Link} from "next-view-transitions"
import { useState } from "react";
import { toast } from "sonner";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ProductsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<Partial<QueryOptions>>({});
  const [appliedFilters, setAppliedFilters] = useState<Partial<QueryOptions>>({});
  const [filterSearch, setFilterSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: filtersResp, isLoading: filtersLoading } = useQuery({
    queryKey: ["product-filters"],
    queryFn: () => productService.getFilters()
  });
  const filters = filtersResp?.data ?? { categories: [], brands: [], sizes: [], colors: [], priceRange: { minPrice: 0, maxPrice: 0 } };
  const categories = filters?.categories ?? [];
  const brands = filters.brands ?? [];
  const sizesOptions = filters.sizes ?? [];
  const colorsOptions = filters.colors ?? [];
  const minPrice = filters.priceRange?.minPrice ?? 0;
  const maxPrice = filters.priceRange?.maxPrice ?? 0;
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", { page, limit, filters: appliedFilters, searchTerm }],
    queryFn: async () =>
      await productService.getAll({
        page,
        limit,
        search: searchTerm,
        ...appliedFilters,
      } as QueryOptions),
  });

  const products = data?.data?.products ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete product. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateProduct) => {
      if (!editingProduct) return;
      const data = await productService.update(editingProduct._id, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateProduct) => {
      const data = await productService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create product. Please try again.");
    },
  });

  function applyFilters() {
    // sanitize string values (trim) to avoid accidental trailing spaces that become '+' in query
    const sanitized: Partial<QueryOptions> = Object.entries(filterDraft).reduce((acc, [k, v]) => {
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed !== "") (acc as Record<string, unknown>)[k] = trimmed;
      } else {
        (acc as Record<string, unknown>)[k] = v;
      }
      return acc;
    }, {} as Record<string, unknown>);
    setAppliedFilters(sanitized);
    setPage(1);
  }
  function resetFilters() {
    setFilterDraft({});
    setAppliedFilters({});
    setPage(1);
    setSearchTerm("");
    setFilterSearch("");
  }

  const hasFiltersSelected = Object.entries(filterDraft).some(([, v]) => {
    if (v === undefined || v === null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Products"
            count={products?.length ?? 0}
            countNoun="product"
            isFetching={isFetching}
            onRefresh={refetch}
            onCreate={() => setIsCreateDialogOpen(true)}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            searchPlaceholder="Search products..."
            pageSize={limit}
            onChangePageSize={(v) => {
              const n = Number(v);
              setLimit(n);
              setPage(1);
            }}
          />

          {/* modern filter controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label="toggle filters"
                onClick={() => setIsFilterOpen((s) => !s)}
                className="flex items-center gap-1"
              >
                <Funnel className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {filtersLoading ? "Loading filters…" : `${categories.length} categories • ${brands.length} brands • ${colorsOptions.length} colors • ${sizesOptions.length} sizes`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasFiltersSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  aria-label="reset filters"
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="hidden md:inline text-sm">Reset</span>
                </Button>
              )}
              <Button
                size="sm"
                onClick={applyFilters}
                aria-label="apply filters"
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                <span className="hidden md:inline text-sm">Apply</span>
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mt-3 p-4 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Category
                  </label>
                  <Select value={filterDraft.categoryId || ""} onValueChange={(v) => setFilterDraft((d) => ({ ...d, categoryId: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
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

                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Box className="h-4 w-4" /> Brand
                  </label>
                  <Select value={filterDraft.brandId || ""} onValueChange={(v) => setFilterDraft((d) => ({ ...d, brandId: v || undefined }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Brand" />
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

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Price range
                    </label>
                    <div className="mt-2 px-3 py-2 rounded-md bg-muted/5">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <div>Min: ₹{filterDraft.minPrice ?? minPrice}</div>
                        <div>Max: ₹{filterDraft.maxPrice ?? maxPrice}</div>
                      </div>
                      <div className="py-2">
                        <Slider
                          min={minPrice}
                          max={maxPrice}
                          step={100}
                          value={[filterDraft.minPrice ?? minPrice, filterDraft.maxPrice ?? maxPrice]}
                          onValueChange={(value) => setFilterDraft((prev) => ({ ...prev, minPrice: value[0], maxPrice: value[1] }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Colors</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colorsOptions.slice(0, 20).map((col) => {
                        const selected = (filterDraft.colors || []).includes(col);
                        return (
                          <button
                            key={col}
                            onClick={() =>
                              setFilterDraft((d) => ({
                                ...d,
                                colors: selected ? (d.colors || []).filter((x) => x !== col) : Array.from(new Set([...(d.colors || []), col])),
                              }))
                            }
                            className={`px-2 py-1 rounded-full text-sm border ${selected ? "bg-primary text-white" : "bg-transparent"}`}
                            aria-pressed={selected}
                          >
                            <div className="flex items-center gap-2">
                              <Palette className="h-3 w-3" />
                              <span>{col}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Sizes</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizesOptions.slice(0, 20).map((sz) => {
                      const selected = (filterDraft.sizes || []).includes(sz);
                      return (
                        <button
                          key={sz}
                          onClick={() =>
                            setFilterDraft((d) => ({
                              ...d,
                              sizes: selected ? (d.sizes || []).filter((x) => x !== sz) : Array.from(new Set([...(d.sizes || []), sz])),
                            }))
                          }
                          className={`px-2 py-1 rounded-full text-sm border ${selected ? "bg-primary text-white" : "bg-transparent"}`}
                          aria-pressed={selected}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={filterDraft.status}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, status: v === "all" ? undefined : v as any }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-12 w-40 rounded-md",
                    "h-4 w-40",
                    "h-4 w-40",
                    "h-4 w-40",
                    "h-8 w-12 rounded",
                  ]}
                />
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No products found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {products.map((product: Product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Image
                          src={
                            product.thumbnail ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{product.finalPrice}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.updatedAt}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild className="gap-2">
                              <Link href={`/products/${product._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                setEditingProduct(product)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setIsOpen(true);
                                pendingDeleteId =
                                  product._id;
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={(p) => setPage(p)}
        />
      </CardContent>

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
    </Card>
  );
}

let pendingDeleteId: string | null = null;
