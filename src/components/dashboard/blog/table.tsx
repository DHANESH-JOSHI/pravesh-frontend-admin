"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
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
import { BlogFormDialog } from "./form-dialog";
import { blogService } from "@/services/blog.service";
import { Blog, CreateBlog, UpdateBlog, BlogQueryOptions } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { Badge } from "@/components/ui/badge";
import { isFiltersSelected } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export function BlogsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<BlogQueryOptions>({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["blogs", appliedFilters],
    queryFn: async () =>
      await blogService.getAllPosts(appliedFilters),
  });

  const blogs = data?.data?.blogs ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: blogService.delete,
    onSuccess: ({ message }, deletedBlogId) => {
      setIsOpen(false);
      toast.success(message ?? "Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blogs"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["blog", deletedBlogId] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response?.data?.message ?? "Failed to delete blog. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBlog) => {
      const data = await blogService.update(editingBlog?._id!, values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Blog updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", editingBlog?._id] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      setEditingBlog(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update blog. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBlog) => {
      const data = await blogService.create(values);
      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Blog created successfully!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to create blog. Please try again.");
    },
  });
  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);


  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Blogs"
            count={blogs?.length ?? 0}
            countNoun="blog"
            isFetching={isFetching}
            onRefreshAction={refetch}
            onCreateAction={() => setIsCreateDialogOpen(true)}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search blogs..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
          />

          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Published Status</label>
              <Select
                value={appliedFilters.isPublished || ""}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, isPublished: v === "all" ? undefined : v }))}
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
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                {!appliedFilters?.isDeleted && <TableHead className="w-16 text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-12 w-12 rounded",
                    "h-5 w-48",
                    "h-5 w-32",
                    "h-5 w-24",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
                  ]}
                />
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No blogs found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {blogs.map((blog: Blog) => (
                    <TableRow key={blog._id}>
                      <TableCell>
                        <img
                          src={
                            blog.featuredImage ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={blog.title}
                          className="h-12 w-12 rounded object-cover"
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
                      <TableCell className="font-semibold"><Badge variant="outline">{blog.isPublished ? 'Yes' : 'No'}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(blog.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/blogs/${blog._id}`} className="flex items-center justify-center">
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
                                onClick={() => setEditingBlog(blog)}
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
                                  pendingDeleteId = blog._id;
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
          total={total}
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </div>

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
        key={editingBlog?._id || "edit-dialog"}
        open={!!editingBlog}
        onOpenChange={(open) => !open && setEditingBlog(null)}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={editingBlog || undefined}
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
