"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
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
  const total = data?.data?.total ?? 0;
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
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
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
        <div className="relative rounded border bg-background/50 overflow-hidden">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <div className="overflow-x-auto">
          <Table className="w-full table-auto">
            <TableHeader className="bg-primary/5">
              <TableRow className="[&>th]:py-3">
                <TableHead className="min-w-[140px]">Order Number</TableHead>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[150px]">Email</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="text-center whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Updated</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-5 w-32",
                    "h-5 w-40",
                    "h-6 w-20",
                    "h-6 w-20",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
                  ]}
                />
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No orders found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {orders.map((order: Order) => {
                    const user = order.user as User | null | undefined;
                    return (
                    <TableRow key={order._id}>
                      <TableCell className="min-w-0 font-medium font-mono text-sm">
                        {order.orderNumber || "N/A"}
                      </TableCell>
                      <TableCell className="min-w-0 font-medium">
                        <div className="truncate" title={user?.name || "Unknown User"}>
                          {user?.name || "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 text-sm">
                        <div className="truncate" title={user?.email || "N/A"}>
                          {user?.email || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="min-w-0 text-center whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {order.isCustomOrder ? "Custom" : "Regular"}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0 text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(order.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="w-20 px-2 text-center">
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
                    );
                  })}
                </>
              )}
            </TableBody>
          </Table>
          </div>
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
    </div >
  );
}