"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Trash2, Funnel, X, Check, Eye } from "lucide-react";
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
import { CustomAlertDialog } from "../common/custom-alert-dialog";
import { userService } from "@/services/user.service";
import { Register, User, UserQueryOptions } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { UserFormDialog } from "./form-dialog";
import { isFiltersSelected } from "@/lib/utils";
export function UsersTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<UserQueryOptions>({ page: 1, limit: 8 });
  const [appliedFilters, setAppliedFilters] = useState<UserQueryOptions>({ page: 1, limit: 8 });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["users", appliedFilters],
    queryFn: async () =>
      await userService.getAll(appliedFilters),
  });

  const users = data?.data?.users ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: userService.deleteById,
    onSuccess: ({ message }) => {
      setIsOpen(false);
      toast.success(message ?? "User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
    onError: (error: any) => {
      setIsOpen(false);
      toast.error(error.response.data.message ?? "Failed to delete user. Please try again.");
    },
  });

  const createMutation = useMutation({
    mutationFn: userService.createVerifiedUser,
    onSuccess: ({ message }) => {
      toast.success(message ?? "User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.response.data.message ?? "Failed to create user. Please try again.");
    },
  });

  function applyFilters() {
    const sanitized: UserQueryOptions = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit }));
  }

  const hasFiltersSelected = isFiltersSelected(filterDraft);

  return (
     <div className="space-y-6">

      <div className="flex flex-col gap-4 rounded border bg-background/50 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Users"
            count={users?.length ?? 0}
            countNoun="user"
            isFetching={isFetching}
            onCreateAction={() => setCreateDialogOpen(true)}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search users..."
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
            <div className="mt-3 p-4  border rounded shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Role</label>
                  <Select
                    value={filterDraft.role || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, role: v === "all" ? undefined : v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Deleted Status</label>
                  <Select
                    value={filterDraft.isDeleted}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, isDeleted: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Active</SelectItem>
                      <SelectItem value="true">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
            <div className="relative rounded border bg-background/50 backdrop-blur-sm overflow-hidden">

          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader className="bg-muted/40">
            <TableRow className="[&>th]:py-3">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16">Actions</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <EmptyState
                      title="No users found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {users.map((user: User) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.role}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
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
                            <DropdownMenuItem asChild>
                              <Link href={`/users/${user._id}`} className="gap-2">
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setIsOpen(true);
                                pendingDeleteId =
                                  user._id;
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
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      <UserFormDialog
        isLoading={createMutation.isPending}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data) => {
          if (data.email == "") {
            delete data.email;
          }
          if (data.img == "") {
            delete data.img;
          }
          createMutation.mutate(data as Register)
        }}
      />

      <CustomAlertDialog
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onContinue={() => {
          if (pendingDeleteId)
            deleteMutation.mutate(pendingDeleteId);
        }}
      />
    </div>
  );
}

let pendingDeleteId: string | null = null;
