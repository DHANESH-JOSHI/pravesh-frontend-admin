"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Funnel, X, Check } from "lucide-react";
import { useState } from "react";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reviewService } from "@/services/review.service";
import { Review, ReviewQueryOptions } from "@/types/review";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User } from "@/types";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";
export function ReviewsTable() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<ReviewQueryOptions>({ page: 1, limit: 8 });
  const [appliedFilters, setAppliedFilters] = useState<ReviewQueryOptions>({ page: 1, limit: 8 });
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reviews", appliedFilters],
    queryFn: async () =>
      await reviewService.getAllReviews(appliedFilters),
  });

  const reviews = data?.data?.reviews ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function applyFilters() {
    const sanitized: ReviewQueryOptions = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(filterDraft);

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 rounded border bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Reviews"
            count={reviews?.length ?? 0}
            countNoun="review"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search reviews..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
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
            <div className="mt-3 p-4  border rounded shadow-sm">
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
                    className="w-full px-3 py-2 text-sm border rounded"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Product</label>
                  <input
                    type="text"
                    placeholder="Product ID or name"
                    value={filterDraft.product || ""}
                    onChange={(e) => setFilterDraft((d) => ({ ...d, product: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-sm border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="relative rounded border bg-background/50 backdrop-blur-sm overflow-hidden">

        <CommonOverlaySpinner show={isFetching && !isLoading} />
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="[&>th]:py-3">
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
                  "h-12 w-40 rounded",
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
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/reviews/${review._id}`}>
                        <Button variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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
    </div>
  );
}