"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Palette } from "lucide-react";
import { useState } from "react";
import { Link } from "next-view-transitions"
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderService } from "@/services/order.service";
import { Order, OrderQueryOptions } from "@/types/order";
import { User } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isFiltersSelected } from "@/lib/utils";
import { StatusBadge } from "@/app/(dashboard)/page";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export function OrdersTable() {
  const [appliedFilters, setAppliedFilters] = useState<OrderQueryOptions>({ page: 1, limit: 8 });
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["orders", appliedFilters],
    queryFn: async () =>
      await orderService.getAllOrders(appliedFilters),
  });

  const orders = data?.data?.orders ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, user: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Orders"
            count={orders?.length ?? 0}
            countNoun="order"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.user || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, user: v, page: 1 }))}
            searchPlaceholder="Search orders by user..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
          />

          <div className="flex gap-6">

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={appliedFilters.status || ""}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, status: v === "all" ? undefined : v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="awaiting_confirmation">Awaiting Confirmation</SelectItem>
                  <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Order Type</label>
              <Select
                value={appliedFilters.isCustomOrder || ""}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, isCustomOrder: v === "all" ? undefined : v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Custom</SelectItem>
                  <SelectItem value="false">Regular</SelectItem>
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
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
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
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <EmptyState
                      title="No orders found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {orders.map((order: Order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          {order._id}
                          {order.isCustomOrder && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              <Palette className="h-3 w-3 mr-1" />
                              Custom
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(order.user as User).name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger className="w-full flex justify-center">
                            <Link href={`/orders/${order._id}`}>
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