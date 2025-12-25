"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, CheckCircle, Package, Edit, List, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "next-view-transitions";
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
import { orderLogService, OrderLog } from "@/services/order-log.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isFiltersSelected } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth";

interface LogQueryOptions {
  page?: number;
  limit?: number;
  action?: string;
  field?: string;
  staffId?: string;
  search?: string;
}

export function LogsTable() {
  const { user } = useAuth();
  const [appliedFilters, setAppliedFilters] = useState<LogQueryOptions>({ 
    page: 1, 
    limit: 8,
    action: undefined,
    field: undefined,
    staffId: user?.role === "staff" ? user._id : undefined,
    search: undefined,
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["order-logs", appliedFilters],
    queryFn: async () => {
      const response = await orderLogService.getAll({
        page: appliedFilters.page || 1,
        limit: appliedFilters.limit || 8,
        staffId: appliedFilters.staffId,
        action: appliedFilters.action && appliedFilters.action !== "all" ? appliedFilters.action : undefined,
        field: appliedFilters.field && appliedFilters.field !== "all" ? appliedFilters.field : undefined,
        search: appliedFilters.search && appliedFilters.search.trim() ? appliedFilters.search.trim() : undefined,
      });
      return response.data;
    },
  });

  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const filteredLogs = logs;

  function resetFilters() {
    setAppliedFilters((prev) => ({ 
      page: 1, 
      limit: prev.limit,
      staffId: user?.role === "staff" ? user._id : undefined,
      action: undefined,
      field: undefined,
      search: undefined,
    }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  const getActionBadgeClassName = (action: string, field?: string) => {
    switch (action) {
      case "update":
        if (field === "status") return "border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30";
        if (field === "items") return "border-purple-500 text-purple-700 dark:border-purple-400 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30";
        if (field === "feedback") return "border-green-500 text-green-700 dark:border-green-400 dark:text-green-300 bg-green-50 dark:bg-green-950/30";
        return "border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-gray-950/30";
      case "view":
        return "border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30";
      case "list":
        return "border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30";
      default:
        return "border-gray-500 text-gray-700 dark:border-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-gray-950/30";
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === "object") return JSON.stringify(value).substring(0, 50) + "...";
    return String(value);
  };

  const formatActionName = (action: string): string => {
    return action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Order Logs"
            count={filteredLogs?.length ?? 0}
            countNoun="log"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search by order number or staff name/email..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
          />

          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Action</label>
              <Select
                value={appliedFilters.action || "all"}
                onValueChange={(v) => {
                  const newAction = v === "all" ? undefined : v;
                  setAppliedFilters((d) => {
                    const updates: LogQueryOptions = { ...d, action: newAction, page: 1 };
                    if (newAction !== "update" && newAction !== undefined) {
                      updates.field = undefined;
                    }
                    return updates;
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Field</label>
              <Select
                value={appliedFilters.field || "all"}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, field: v === "all" ? undefined : v, page: 1 }))}
                disabled={(appliedFilters.action !== "update" && appliedFilters.action !== undefined) || appliedFilters.action === undefined}
              >
                <SelectTrigger 
                  className="w-full" 
                  disabled={(appliedFilters.action !== "update" && appliedFilters.action !== undefined) || appliedFilters.action === undefined}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="items">Items</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
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
                  <TableHead className="min-w-[120px]">Action</TableHead>
                  <TableHead className="min-w-[150px]">Staff Member</TableHead>
                  <TableHead className="min-w-[100px]">Field</TableHead>
                  <TableHead className="min-w-[150px]">Old Value</TableHead>
                  <TableHead className="min-w-[150px]">New Value</TableHead>
                  <TableHead className="min-w-[120px]">Order Number</TableHead>
                  <TableHead className="min-w-[120px]">Time</TableHead>
                  <TableHead className="w-20 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableLoadingRows
                    rows={6}
                    columns={[
                      "h-5 w-32",
                      "h-5 w-32",
                      "h-5 w-20",
                      "h-5 w-32",
                      "h-5 w-32",
                      "h-5 w-24",
                      "h-5 w-24",
                      "h-4 w-4 rounded",
                    ]}
                  />
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-6">
                      <EmptyState
                        title="No logs found"
                        description="Try adjusting your filters."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredLogs.map((log: OrderLog) => {
                      const admin = typeof log.admin === "object" ? log.admin : null;
                      const order = typeof log.order === "object" ? log.order : null;
                      const orderIdValue = typeof log.order === "object" ? log.order?._id : log.order;

                      return (
                        <TableRow key={log._id}>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`text-xs font-medium capitalize ${getActionBadgeClassName(log.action, log.field)}`}
                            >
                              {formatActionName(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell className="min-w-0">
                            {admin ? (
                              <Link
                                href={`/users/${admin._id}`}
                                className="text-primary hover:underline font-medium text-sm"
                              >
                                {admin.name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                            {admin?.email && (
                              <div className="text-xs text-muted-foreground truncate" title={admin.email}>
                                {admin.email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.field ? (
                              <Badge variant="outline" className="text-xs">
                                {log.field}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="truncate text-xs" title={formatValue(log.oldValue)}>
                              {log.oldValue !== undefined ? (
                                <span className="text-red-600 dark:text-red-400">
                                  {formatValue(log.oldValue)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="truncate text-xs" title={formatValue(log.newValue)}>
                              {log.newValue !== undefined ? (
                                <span className="text-green-600 dark:text-green-400">
                                  {formatValue(log.newValue)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {orderIdValue ? (
                              <Link
                                href={`/orders/${orderIdValue}`}
                                className="text-primary hover:underline font-medium text-xs"
                              >
                                {order && typeof order === "object" && order.orderNumber
                                  ? order.orderNumber
                                  : String(orderIdValue).substring(0, 8)}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(log.createdAt).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="w-20 px-2 text-center">
                            <Tooltip>
                              <TooltipTrigger className="w-full flex justify-center">
                                <Link href={`/logs/${log._id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                View Details
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
    </div>
  );
}

