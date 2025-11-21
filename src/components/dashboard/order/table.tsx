"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Palette, Funnel, X, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "next-view-transitions"
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
export function OrdersTable() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<OrderQueryOptions>({ page: 1, limit: 8 });
  const [appliedFilters, setAppliedFilters] = useState<OrderQueryOptions>({ page: 1, limit: 8 });
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["orders", appliedFilters],
    queryFn: async () =>
      await orderService.getAllOrders(appliedFilters),
  });

  const orders = data?.data?.orders ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function applyFilters() {
    const sanitized: OrderQueryOptions = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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
    setAppliedFilters((prev) => ({ page: 1, user: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(filterDraft);

  return (
    <Card>
      <CardHeader>
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
            <div className="mt-3 p-4 border rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={filterDraft.status || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, status: v === "all" ? undefined : v }))}
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
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Order Type</label>
                  <Select
                    value={filterDraft.isCustomOrder || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, isCustomOrder: v === "all" ? undefined : v }))}
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
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
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
                        {order.status}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.updatedAt}
                      </TableCell>
                      <TableCell>
                        <Link href={`/orders/${order._id}`}>
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
      </CardContent>
    </Card>
  );
}