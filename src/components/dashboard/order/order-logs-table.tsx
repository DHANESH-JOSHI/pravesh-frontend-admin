"use client";

import { useQuery } from "@tanstack/react-query";
import { orderLogService, OrderLog } from "@/services/order-log.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FileText, RefreshCw, Eye, CheckCircle, Package, Edit, List, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { useAuth } from "@/providers/auth";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";

interface OrderLogsTableProps {
  orderId?: string; // If provided, show logs for specific order
  staffId?: string; // If provided, show logs for specific staff
  showFilters?: boolean; // Show filter controls
}

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "update", label: "Update" },
  { value: "view", label: "View" },
  { value: "list", label: "List View" },
];

const FIELD_OPTIONS = [
  { value: "all", label: "All Fields" },
  { value: "status", label: "Status" },
  { value: "items", label: "Items" },
  { value: "feedback", label: "Feedback" },
];

export function OrderLogsTable({ orderId, staffId, showFilters = true }: OrderLogsTableProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");

  // For staff users, only show their own logs
  const effectiveStaffId = user?.role === "staff" ? user._id : staffId;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["order-logs", orderId, effectiveStaffId, page, limit, actionFilter, fieldFilter],
    queryFn: async () => {
      const response = await orderLogService.getAll({
        page,
        limit,
        orderId: orderId || undefined,
        staffId: effectiveStaffId || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        field: fieldFilter !== "all" ? fieldFilter : undefined,
      });
      return response.data;
    },
    enabled: true,
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // No need for client-side filtering as it's handled by the backend
  const filteredLogs = logs;

  const getActionIcon = (action: string, field?: string) => {
    switch (action) {
      case "update":
        if (field === "status") return CheckCircle;
        if (field === "items") return Package;
        if (field === "feedback") return Edit;
        return Edit;
      case "view":
        return Eye;
      case "list":
        return List;
      default:
        return FileText;
    }
  };

  const getActionBadgeVariant = (action: string, field?: string): "default" | "secondary" | "destructive" | "outline" => {
    // All actions will use outline variant, colors come from className
    return "outline";
  };

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            {orderId ? "Activity Log" : effectiveStaffId ? "Activity Log" : "Order Activity Logs"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="text-xs">{total}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Action</label>
              <Select 
                value={actionFilter} 
                onValueChange={(value) => {
                  setActionFilter(value);
                  if (value !== "update" && value !== "all") {
                    setFieldFilter("all");
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Field</label>
              <Select 
                value={fieldFilter} 
                onValueChange={setFieldFilter}
                disabled={actionFilter !== "update" && actionFilter !== "all"}
              >
                <SelectTrigger className="w-[180px]" disabled={actionFilter !== "update" && actionFilter !== "all"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Page Size</label>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Action</TableHead>
                {!effectiveStaffId && <TableHead>Staff Member</TableHead>}
                <TableHead>Field</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
                {!orderId && <TableHead>Order Number</TableHead>}
                <TableHead>Time</TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={(() => {
                    let cols = 6; // Action, Field, Old Value, New Value, Time, Actions
                    if (!effectiveStaffId) cols++; // Staff Member
                    if (!orderId) cols++; // Order Number
                    return cols;
                  })()} className="p-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(() => {
                    let cols = 6; // Action, Field, Old Value, New Value, Time, Actions
                    if (!effectiveStaffId) cols++; // Staff Member
                    if (!orderId) cols++; // Order Number
                    return cols;
                  })()} className="p-6 text-center text-muted-foreground">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: OrderLog) => {
                  const admin = typeof log.admin === "object" ? log.admin : null;
                  const order = typeof log.order === "object" ? log.order : null;
                  const orderIdValue = typeof log.order === "object" ? log.order?._id : log.order;

                  return (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Badge 
                          variant={getActionBadgeVariant(log.action, log.field)}
                          className={`text-xs font-medium capitalize ${getActionBadgeClassName(log.action, log.field)}`}
                        >
                          {formatActionName(log.action)}
                        </Badge>
                      </TableCell>
                      {!effectiveStaffId && (
                        <TableCell>
                          {admin ? (
                            <Link
                              href={`/users/${admin._id}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {admin.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                          {admin?.email && (
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {log.field ? (
                          <Badge variant="outline" className="text-xs">
                            {log.field}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
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
                      <TableCell className="max-w-[200px]">
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
                      {!orderId && (
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
                      )}
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="w-20 px-2 text-center">
                        <Link href={`/logs/${log._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!orderId && totalPages > 1 && (
          <div className="mt-4">
            <PaginationControls
              total={total}
              limit={limit}
              page={page}
              totalPages={totalPages}
              isFetching={isFetching}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

