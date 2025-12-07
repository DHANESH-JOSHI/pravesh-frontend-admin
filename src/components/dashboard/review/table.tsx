"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
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
import { reviewService } from "@/services/review.service";
import { Review, ReviewQueryOptions } from "@/types/review";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, User } from "@/types";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";
import { useDebounce } from "use-debounce";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export function ReviewsTable() {
  const [appliedFilters, setAppliedFilters] = useState<ReviewQueryOptions>({ page: 1, limit: 8 });
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reviews", appliedFilters],
    queryFn: async () =>
      await reviewService.getAllReviews(appliedFilters),
  });

  const [userSearch, setUserSearch] = useState(appliedFilters.user || "");
  const [debouncedUser] = useDebounce(userSearch, 500);

  const [productSearch, setProductSearch] = useState(appliedFilters.product || "");
  const [debouncedProduct] = useDebounce(productSearch, 500);

  const reviews = data?.data?.reviews ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }
  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      user: debouncedUser.trim() || undefined,
      product: debouncedProduct.trim() || undefined,
      page: 1,
    }));
  }, [debouncedUser.trim(), debouncedProduct.trim()]);

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
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

          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Rating</label>
              <Select
                value={appliedFilters.rating?.toString() || ""}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, rating: v === "all" ? undefined : Number(v) }))}
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">User</label>
              <input
                type="text"
                placeholder="User ID or name"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Product</label>
              <input
                type="text"
                placeholder="Product ID or name"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded"
              />
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
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-5 w-32",
                    "h-5 w-40",
                    "h-5 w-16",
                    "h-5 w-48",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
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
                        <Tooltip>
                          <TooltipTrigger className="w-full flex justify-center">
                            <Link href={`/reviews/${review._id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            View
                          </TooltipContent>
                        </Tooltip>
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
    </div >
  );
}