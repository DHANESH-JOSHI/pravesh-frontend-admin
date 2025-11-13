"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2, Eye, Funnel, X, Check, Folder } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
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
import { BrandFormDialog } from "./form-dialog";
import { brandService } from "@/services/brand.service";
import { Brand, CreateBrand, UpdateBrand, BrandQueryOptions } from "@/types/brand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";

export function BrandsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<BrandQueryOptions>({ page: 1, limit: 10 });
  const [appliedFilters, setAppliedFilters] = useState<BrandQueryOptions>({ page: 1, limit: 10 });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["brands", appliedFilters],
    queryFn: async () =>
      await brandService.getAll(appliedFilters),
  });

  const brands = data?.data?.brands ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function applyFilters() {
    const sanitized: BrandQueryOptions = Object.entries(filterDraft).reduce((acc, [k, v]) => {
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed !== "" && trimmed !== "all") (acc as Record<string, unknown>)[k] = trimmed;
      } else {
        (acc as Record<string, unknown>)[k] = v;
      }
      return acc;
    }, {} as Record<string, unknown>);
    setAppliedFilters((prev) => ({ ...sanitized, page: 1, limit: prev.limit }));
  }

  function resetFilters() {
    setFilterDraft({});
    setAppliedFilters({ page: 1, search: "", limit: 10 });
  }

  const hasFiltersSelected = isFiltersSelected(filterDraft);

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Brand deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete brand. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBrand) => {
      if (!editingBrand) return;
      const data = await brandService.update(editingBrand._id, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Brand updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setEditingBrand(null);
    },
    onError: () => {
      toast.error("Failed to update brand. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBrand) => {
      const data = await brandService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Brand created successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create brand. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Brands"
            count={brands?.length ?? 0}
            countNoun="brand"
            isFetching={isFetching}
            onRefreshAction={refetch}
            onCreateAction={() => setIsCreateDialogOpen(true)}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search brands..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => { const n = Number(v); setAppliedFilters((f) => ({ ...f, limit: n, page: 1 })); }}
          />

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
            <div className="mt-3 p-4  border rounded-lg shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Deleted Status</label>
                  <Select
                    value={filterDraft.isDeleted}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, isDeleted: v }))}
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created</TableHead>
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
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      title="No brands found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {brands.map((brand: Brand) => (
                    <TableRow key={brand._id}>
                      <TableCell>
                        {brand.image ? (
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={brand.name}>
                          {brand.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={brand.name}>
                          {brand.categories.length}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {brand.productCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {brand.createdAt}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {brand.updatedAt}
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
                              <Link href={`/brands/${brand._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                setEditingBrand(brand)
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
                                  brand._id;
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
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </CardContent>

      <BrandFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as CreateBrand)}
      />

      <BrandFormDialog
        isLoading={updatemutation.isPending}
        key={editingBrand?._id || "edit-dialog"}
        open={!!editingBrand}
        onOpenChange={(open) => !open && setEditingBrand(null)}
        onSubmit={(data) => updatemutation.mutate(data as UpdateBrand)}
        initialData={editingBrand || undefined}
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
