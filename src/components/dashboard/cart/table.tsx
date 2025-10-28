"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Eye } from "lucide-react";
import { useState } from "react";
import {Link} from "next-view-transitions"
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
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types/cart";
import { Product, User } from "@/types";

export function CartsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["carts", { page, limit, searchTerm }],
    queryFn: async () => await cartService.getAllCarts({
      page,
      limit,
      user:searchTerm
    }),
  });

  const carts = data?.data?.carts ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const paginatedCarts = carts.slice((page - 1) * limit, page * limit);

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Shopping Carts"
          count={carts?.length ?? 0}
          countNoun="cart"
          isFetching={isFetching}
          onRefresh={refetch}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search carts by user ID or name..."
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
                <TableHead>User Name</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-4 w-32",
                    "h-4 w-20",
                    "h-4 w-24",
                    "h-4 w-32",
                    "h-4 w-24",
                    "h-8 w-12 rounded",
                  ]}
                />
              ) : paginatedCarts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No carts found"
                      description="Shopping carts will appear here when users add items."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedCarts.map((cart: Cart) => (
                    <TableRow key={cart._id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {(cart.user as User).name}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        {cart.items.length}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-semibold">
                        ₹{cart.items.reduce((acc, item) => acc + (item.product as Product).finalPrice, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cart.updatedAt}
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
                              <Link href={`/carts/${cart._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
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
    </Card>
  );
}