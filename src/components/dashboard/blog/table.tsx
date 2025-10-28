"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2, Funnel, X, Check } from "lucide-react";
import Image from "next/image";
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
import { BlogFormDialog } from "./form-dialog";
import { blogService } from "@/services/blog.service";
import { Blog, CreateBlog, UpdateBlog, BlogQueryOptions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function BlogsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<Partial<BlogQueryOptions>>({});
  const [appliedFilters, setAppliedFilters] = useState<Partial<BlogQueryOptions>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["blogs", { page, limit, filters: appliedFilters, searchTerm }],
    queryFn: async () =>
      await blogService.getAllPosts({
        page,
        limit,
        search: searchTerm || undefined,
        ...appliedFilters,
      }),
  });

  const blogs = data?.data?.blogs ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: blogService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blogs"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete blog. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBlog) => {
      if (!editingBlog) return;
      const data = await blogService.update(editingBlog.slug, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Blog updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setEditingBlog(null);
    },
    onError: () => {
      toast.error("Failed to update blog. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBlog) => {
      const data = await blogService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Blog created successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create blog. Please try again.");
    },
  });

  function applyFilters() {
    const sanitized: Partial<BlogQueryOptions> = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Blogs"
            count={blogs?.length ?? 0}
            countNoun="blog"
            isFetching={isFetching}
            onRefresh={refetch}
            onCreate={() => setIsCreateDialogOpen(true)}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            searchPlaceholder="Search blogs..."
            pageSize={limit}
            onChangePageSize={(v) => {
              const n = Number(v);
              setLimit(n);
              setPage(1);
            }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Published Status</label>
                  <Select
                    value={filterDraft.isPublished || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, isPublished: v === "all" ? undefined : v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Published</SelectItem>
                      <SelectItem value="false">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
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
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-6">
                    <EmptyState
                      title="No blogs found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {blogs.map((blog: Blog) => (
                    <TableRow key={blog.slug}>
                      <TableCell>
                        <Image
                          src={
                            blog.featuredImage ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={blog.title}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={blog.title}>
                          {blog.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {blog.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {blog.updatedAt}
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
                                setEditingBlog(blog)
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
                                  blog.slug;
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

      <BlogFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) =>
          createMutation.mutate({
            ...data,
            featuredImage: data.featuredImage!,
          })
        }
      />

      <BlogFormDialog
        isLoading={updatemutation.isPending}
        key={editingBlog?.slug || "edit-dialog"}
        open={!!editingBlog}
        onOpenChange={(open) => !open && setEditingBlog(null)}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={editingBlog || undefined}
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
