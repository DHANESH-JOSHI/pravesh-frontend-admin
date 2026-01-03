"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
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
import { UnitFormDialog } from "./form-dialog";
import { unitService } from "@/services/unit.service";
import { Unit } from "@/types/unit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isFiltersSelected } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UnitQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export function UnitsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<UnitQueryOptions>({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["units", appliedFilters],
    queryFn: async () =>
      await unitService.getAll(appliedFilters),
  });

  const units = data?.data?.units ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;
  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  const deleteMutation = useMutation({
    mutationFn: unitService.delete,
    onSuccess: ({ message }, deletedUnitId) => {
      setIsOpen(false);
      toast.success(message ?? "Unit deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response?.data?.message ?? "Failed to delete unit. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: { name?: string }) => {
      const data = await unitService.update(editingUnit?._id!, values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Unit updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setEditingUnit(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update unit. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const data = await unitService.create(values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Unit created successfully!");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create unit. Please try again.");
    },
  });

  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Units"
            count={units?.length ?? 0}
            countNoun="unit"
            isFetching={isFetching}
            onRefreshAction={refetch}
            onCreateAction={() => setIsCreateDialogOpen(true)}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search units..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => { const n = Number(v); setAppliedFilters((f) => ({ ...f, limit: n, page: 1 })); }}
          />


          <div className="flex gap-6">
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
          <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader className="bg-primary/5">
              <TableRow className="[&>th]:py-3">
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="whitespace-nowrap">Updated</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-5 w-48",
                    "h-5 w-24",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
                  ]}
                />
              ) : units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      title="No units found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {units.map((unit: Unit) => (
                    <TableRow key={unit._id}>
                      <TableCell className="min-w-0 font-medium">
                        <div className="truncate" title={unit.name}>
                          {unit.name}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 text-muted-foreground text-sm whitespace-nowrap">
                        {unit.createdAt}
                      </TableCell>
                      <TableCell className="min-w-0 text-muted-foreground text-sm whitespace-nowrap">
                        {unit.updatedAt}
                      </TableCell>
                      <TableCell className="w-20 px-2 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          {!unit.isDeleted && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted/60 transition-colors"
                                  onClick={() => setEditingUnit(unit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {appliedFilters.isDeleted !== "true" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive rounded-lg hover:bg-muted/60 transition-colors"
                                onClick={() => {
                                  setIsOpen(true);
                                  pendingDeleteId = unit._id;
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
          </div>
        </div>
        <PaginationControls
          total={total}
          limit={appliedFilters.limit || 8}
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </div>

      <UnitFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as { name: string })}
      />

      <UnitFormDialog
        isLoading={updatemutation.isPending}
        key={editingUnit?._id || "edit-dialog"}
        open={!!editingUnit}
        onOpenChange={(open) => !open && setEditingUnit(null)}
        onSubmit={(data) => updatemutation.mutate(data as { name?: string })}
        initialData={editingUnit || undefined}
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

