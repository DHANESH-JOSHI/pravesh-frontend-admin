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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CartsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["carts", { page, limit, searchTerm }],
    queryFn: async () => await cartService.getAllCarts({
      page,
      limit,
      user: searchTerm
    }),
  });

  const carts = data?.data?.carts ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;
  const paginatedCarts = carts.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">

      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <TableHeaderControls
          title="Shopping Carts"
          count={carts?.length ?? 0}
          countNoun="cart"
          searchPlaceholder="Search carts by user..."
          isFetching={isFetching}
          onRefreshAction={refetch}
          searchTerm={searchTerm}
          onSearchAction={setSearchTerm}
          pageSize={limit}
          onChangePageSizeAction={(v) => {
            const n = Number(v);
            setLimit(n);
            setPage(1);
          }}
        />
      </div>
      <div>
        <div className="relative rounded border bg-background/50  overflow-hidden">

          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="[&>th]:py-3">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-5 w-32",
                    "h-5 w-20",
                    "h-5 w-24",
                    "h-5 w-32",
                    "h-5 w-24",
                    "h-4 w-4 rounded",
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
                  {paginatedCarts.map((cart: Cart) => {
                    const user = cart.user as User | null | undefined;
                    return (
                    <TableRow key={cart._id}>
                      <TableCell className="font-medium text-sm">
                        <div className="truncate" title={user?.name || "Unknown User"}>
                          {user?.name || "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <div className="truncate" title={user?.email || "N/A"}>
                          {user?.email || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        {cart.items.length}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-semibold">
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(cart.updatedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger className="w-full flex justify-center">
                            <Link href={`/carts/${cart._id}`}>
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
        <PaginationControls
          total={total}
          limit={limit}
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}