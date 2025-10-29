"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Trash2, Eye, Funnel, X, Check } from "lucide-react";
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
import { reviewService } from "@/services/review.service";
import { Review, ReviewQueryOptions } from "@/types/review";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User } from "@/types";
import { Link } from "next-view-transitions";
export function ReviewsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<Partial<ReviewQueryOptions>>({});
  const [appliedFilters, setAppliedFilters] = useState<Partial<ReviewQueryOptions>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reviews", { page, limit, filters: appliedFilters, searchTerm }],
    queryFn: async () =>
      await reviewService.getAllReviews({
        page,
        limit,
        search: searchTerm || undefined,
        ...appliedFilters,
      }),
  });

  const reviews = data?.data?.reviews ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: reviewService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete review. Please try again.");
    },
  });

  function applyFilters() {
    const sanitized: Partial<ReviewQueryOptions> = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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
            title="Reviews"
            count={reviews?.length ?? 0}
            countNoun="review"
            isFetching={isFetching}
            onRefresh={refetch}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            searchPlaceholder="Search reviews..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Rating</label>
                  <Select
                    value={filterDraft.rating?.toString() || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, rating: v === "all" ? undefined : Number(v) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="5">5 stars</SelectItem>
                      <SelectItem value="4">4 stars</SelectItem>
                      <SelectItem value="3">3 stars</SelectItem>
                      <SelectItem value="2">2 stars</SelectItem>
                      <SelectItem value="1">1 star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">User</label>
                  <input
                    type="text"
                    placeholder="User ID or name"
                    value={filterDraft.user || ""}
                    onChange={(e) => setFilterDraft((d) => ({ ...d, user: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Product</label>
                  <input
                    type="text"
                    placeholder="Product ID or name"
                    value={filterDraft.product || ""}
                    onChange={(e) => setFilterDraft((d) => ({ ...d, product: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
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
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Created</TableHead>
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
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <EmptyState
                      title="No reviews found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {reviews.map((review: Review) => (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        {(review.user as User).name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(review.product as Product).name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {review.rating}/5
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        <div className="truncate" title={review.comment}>
                          {review.comment || "No comment"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {review.createdAt}
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
                              <Link href={`/reviews/${review._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setIsOpen(true);
                                pendingDeleteId =
                                  review._id;
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
