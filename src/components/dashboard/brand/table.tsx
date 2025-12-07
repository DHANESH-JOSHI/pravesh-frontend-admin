"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Eye, Image } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
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
import { BrandFormDialog } from "./form-dialog";
import { brandService } from "@/services/brand.service";
import { Brand, CreateBrand, UpdateBrand, BrandQueryOptions } from "@/types/brand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BrandsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<BrandQueryOptions>({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["brands", appliedFilters],
    queryFn: async () =>
      await brandService.getAll(appliedFilters),
  });

  const brands = data?.data?.brands ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: ({ message }) => {
      setIsOpen(false);
      toast.success(message ?? "Brand deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response.data.message ?? "Failed to delete brand. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBrand) => {
      const data = await brandService.update(editingBrand?._id!, values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Brand updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setEditingBrand(null);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to update brand. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBrand) => {
      const data = await brandService.create(values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Brand created successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to create brand. Please try again.");
    },
  });

  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
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


          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={appliedFilters.isDeleted}
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
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-12 w-12 rounded",
                    "h-5 w-48",
                    "h-5 w-16",
                    "h-5 w-16",
                    "h-5 w-24",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
                  ]}
                />
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
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
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                            <Image className="text-muted-foreground" />
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
                        {new Date(brand.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(brand.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/brands/${brand._id}`} className="flex items-center justify-center">
                                  <Eye className="h-4 w-4" />
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
                                onClick={() => setEditingBrand(brand)}
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
                                  pendingDeleteId = brand._id;
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
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls
          limit={appliedFilters.limit || 8}
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </div>

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
    </div>
  );
}

let pendingDeleteId: string | null = null;
