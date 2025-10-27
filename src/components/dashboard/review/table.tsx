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
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review";
export function ReviewsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["reviews", { page, limit }],
    queryFn: async () => await reviewService.getAllReviews(page, limit),
  });

  const reviews = data?.data?.reviews ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const filteredReviews = useMemo(
    () =>
      reviews.filter(
        (review: Review) =>
          review.comment?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [reviews, searchTerm],
  );

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



  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Reviews"
          count={filteredReviews?.length ?? 0}
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
              ) : filteredReviews.length === 0 ? (
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
                  {filteredReviews.map((review: Review) => (
                    <TableRow key={review._id}>
                      <TableCell className="font-medium">
                        {typeof review.user === 'object' ? review.user.name : review.user}
                      </TableCell>
                      <TableCell className="font-medium">
                        {typeof review.product === 'object' ? review.product.name : review.product}
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
