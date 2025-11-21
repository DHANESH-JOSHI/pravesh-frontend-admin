"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
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
import { WalletFormDialog } from "./form-dialog";
import { walletService } from "@/services/wallet.service";
import { Wallet } from "@/types/wallet";
import { User } from "@/types";

export function WalletsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["wallets", { page, limit, search: searchTerm }],
    queryFn: async () =>
      await walletService.getAll({
        page,
        limit,
        user: searchTerm
      }),
  });

  const wallets = data?.data?.wallets ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const addFundsMutation = useMutation({
    mutationFn: async (data: { userId: string; amount: number; description?: string }) => {
      const result = await walletService.addFunds(data);
      return result;
    },
    onSuccess: ({ message }) => {
      toast.success(message ?? "Funds added successfully!");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setEditingWallet(null);
      setViewOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to add funds. Please try again.");
    },
  });

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 rounded border bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Wallets"
            count={wallets?.length ?? 0}
            countNoun="wallet"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={searchTerm}
            onSearchAction={setSearchTerm}
            searchPlaceholder="Search wallets by user..."
            pageSize={limit}
            onChangePageSizeAction={(v) => {
              const n = Number(v);
              setLimit(n);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="relative rounded border bg-background/50 backdrop-blur-sm overflow-hidden">

        <CommonOverlaySpinner show={isFetching && !isLoading} />
        <Table>
          <TableHeader className="bg-secondary">
            <TableRow className="[&>th]:py-3">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Created</TableHead>
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
                  "h-4 w-24",
                  "h-4 w-24",
                  "h-4 w-16",
                  "h-4 w-24",
                  "h-4 w-24",
                  "h-8 w-12 rounded",
                ]}
              />
            ) : wallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-6">
                  <EmptyState
                    title="No wallets found"
                    description="Wallets will appear here when users register."
                  />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {wallets.map((wallet) => (
                  <TableRow key={wallet._id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {(wallet.user as User).name}
                    </TableCell>
                    <TableCell className="font-medium font-mono text-sm">
                      {(wallet.user as User).email}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-semibold">
                      ₹{wallet.balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wallet.transactions?.length || 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(wallet.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(wallet.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                            onClick={() => {
                              setViewOpen(true)
                              setEditingWallet(wallet)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setViewOpen(false)
                              setEditingWallet(wallet)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add Funds
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

      <WalletFormDialog
        isLoading={addFundsMutation.isPending}
        open={!!editingWallet && !viewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWallet(null);
            setViewOpen(false);
          }
        }}
        onSubmit={(data) => addFundsMutation.mutate({ ...data, userId: (editingWallet?.user as User)._id || data.userId })}
        wallet={editingWallet}
      />

      <WalletFormDialog
        isLoading={false}
        key={editingWallet?._id || "view-dialog"}
        open={!!editingWallet && !!viewOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingWallet(null);
            setViewOpen(false);
          }
        }}
        onSubmit={() => { }}
        wallet={editingWallet}
        viewOnly={true}
      />
    </div>
  );
}