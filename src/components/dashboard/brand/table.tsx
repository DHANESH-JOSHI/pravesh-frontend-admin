"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2, Eye, Funnel, X, Check } from "lucide-react";
import Image from "next/image";
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
export function BrandsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<Partial<BrandQueryOptions>>({});
  const [appliedFilters, setAppliedFilters] = useState<Partial<BrandQueryOptions>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["brands", { page, limit, filters: appliedFilters, searchTerm }],
    queryFn: async () =>
      await brandService.getAll({
        search: searchTerm || undefined,
        page,
        limit,
        ...appliedFilters,
      }),
  });

  const brands = data?.data?.brands ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function applyFilters() {
    const sanitized: Partial<BrandQueryOptions> = Object.entries(filterDraft).reduce((acc, [k, v]) => {
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed !== "" && trimmed !== "all") (acc as Record<string, unknown>)[k] = trimmed;
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
  }

  const hasFiltersSelected = Object.entries(filterDraft).some(([, v]) => {
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Brand deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
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
            onRefresh={refetch}
            onCreate={() => setIsCreateDialogOpen(true)}
            searchTerm={searchTerm}
            onSearch={(v) => { setSearchTerm(v); setPage(1); }}
            searchPlaceholder="Search brands..."
            pageSize={limit}
            onChangePageSize={(v) => { const n = Number(v); setLimit(n); setPage(1); }}
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
            <div className="mt-3 p-4 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
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
                        {brand.image ? <Image
                          src={
                            brand.image ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={brand.name}
                          className="h-12 w-12 rounded-md object-cover text-center"
                        /> : <div className="h-12 w-12 flex items-center justify-center">N/A</div> }
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={brand.name}>
                          {brand.name}
                        </div>
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
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={(p) => setPage(p)}
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
