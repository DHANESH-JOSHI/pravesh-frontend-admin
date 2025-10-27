"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal } from "lucide-react";
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
import { OrderFormDialog } from "./form-dialog";
import { orderService } from "@/services/order.service";
import { Order, AdminUpdateOrder } from "@/types/order";
export function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["orders", { page, limit }],
    queryFn: async () => await orderService.getAllOrders({ page, limit }),
  });

  const orders = data?.data?.orders ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order: Order) =>
          order._id
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [orders, searchTerm],
  );

  const updatemutation = useMutation({
    mutationFn: async (values: AdminUpdateOrder) => {
      if (!editingOrder) return;
      const data = await orderService.adminUpdate(editingOrder?._id!, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setEditingOrder(null);
    },
    onError: () => {
      toast.error("Failed to update order. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Orders"
          count={filteredOrders?.length ?? 0}
          countNoun="order"
          isFetching={isFetching}
          onRefresh={refetch}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search orders..."
          pageSize={limit}
          onChangePageSize={(v) => {
            const n = Number(v);
            setLimit(n);
            setPage(1);
          }}
          onCreate={()=>{}}
        />
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
              ) : filteredOrders.length === 0 ? (
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
                  {filteredOrders.map((order: Order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-sm">
                        {order._id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.user}
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
                              className="gap-2"
                              onClick={() =>
                                setEditingOrder(order)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Edit
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

      <OrderFormDialog
        isLoading={updatemutation.isPending}
        key={editingOrder?._id || "edit-dialog"}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        onSubmit={(data) => updatemutation.mutate(data)}
        initialData={editingOrder || undefined}
      />
    </Card>
  );
}