"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
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
import { CategoryFormDialog } from "./form-dialog";
import { Category, CreateCategory, UpdateCategory } from "@/types";
import { categoryService } from "@/services/category.service";

export function CategoriesTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["categories", { page, limit }],
    queryFn: async () => await categoryService.getAll(undefined, page, limit),
  });

  const categories = data?.data?.categories ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category: Category) =>
          category.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      ),
    [categories, searchTerm],
  );

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete category. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateCategory) => {
      if (!editingCategory) return;
      const data = await categoryService.update(editingCategory?._id!, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
    onError: () => {
      toast.error("Failed to update category. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateCategory) => {
      const data = await categoryService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create category. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Categories"
          count={filteredCategories?.length ?? 0}
          countNoun="category"
          isFetching={isFetching}
          onRefresh={refetch}
          onCreate={() => setIsCreateDialogOpen(true)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search categories..."
          pageSize={limit}
          onChangePageSize={(v) => {
            const n = Number(v);
            setLimit(n);
            setPage(1);
          }}
        />
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Parent Category</TableHead>
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
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6">
                    <EmptyState
                      title="No categories found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredCategories.map((category: Category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <Image
                          src={
                            category.image ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={category.title}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={category.title}>
                          {category.title}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={category.parentCategory?._id}>
                          {category.parentCategory?.title || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.updatedAt}
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
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                setEditingCategory(category)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setIsOpen(true);
                                pendingDeleteSlug =
                                  category._id;
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

      <CategoryFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) =>
          createMutation.mutate({
            ...data,
            image: data.image!,
          })
        }
        isLoading={createMutation.isPending}
      />

      <CategoryFormDialog
        key={editingCategory?._id || "edit-dialog"}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={editingCategory || undefined}
        isLoading={updatemutation.isPending}
      />

      <CustomAlertDialog
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onContinue={() => {
          if (pendingDeleteSlug)
            deleteMutation.mutate(pendingDeleteSlug);
        }}
      />
    </Card>
  );
}

let pendingDeleteSlug: string | null = null;
