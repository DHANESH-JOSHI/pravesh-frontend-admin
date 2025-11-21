"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye, Funnel, X, Check } from "lucide-react";
import { useState } from "react";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
import { PaginationControls } from "@/components/dashboard/common/pagination-controls";
import TableHeaderControls from "@/components/dashboard/common/table-header-controls";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addressService } from "@/services/address.service";
import { Address, AddressQueryOptions } from "@/types/address";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";

export function AddressesTable() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<AddressQueryOptions>({ page: 1, limit: 8 });
  const [appliedFilters, setAppliedFilters] = useState<AddressQueryOptions>({ page: 1, limit: 8 });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["addresses", appliedFilters],
    queryFn: async () =>
      await addressService.getAllAddresses(appliedFilters),
  });

  const addresses = data?.data?.addresses ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  function applyFilters() {
    const sanitized: AddressQueryOptions = Object.entries(filterDraft).reduce((acc, [k, v]) => {
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
            title="Addresses"
            count={addresses?.length ?? 0}
            countNoun="address"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search addresses..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">User</label>
                  <input
                    type="text"
                    placeholder="User ID or name"
                    value={filterDraft.user || ""}
                    onChange={(e) => setFilterDraft((d) => ({ ...d, user: e.target.value || undefined }))}
                    className="w-full px-3 py-2 text-sm border rounded"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Deleted Status</label>
                  <Select
                    value={filterDraft.isDeleted?.toString() || ""}
                    onValueChange={(v) => setFilterDraft((d) => ({ ...d, isDeleted: v === "true" }))}
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
          <TableHeader className="bg-secondary">
            <TableRow className="[&>th]:py-3">
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoadingRows
                rows={6}
                columns={[
                  "h-4 w-40",
                  "h-4 w-32",
                  "h-4 w-48",
                  "h-4 w-24",
                  "h-4 w-20",
                  "h-4 w-24",
                  "h-8 w-12 rounded",
                ]}
              />
            ) : addresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-6">
                  <EmptyState
                    title="No addresses found"
                    description="Try a different search."
                  />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {addresses.map((address: Address) => (
                  <TableRow key={address._id}>
                    <TableCell className="font-medium">
                      {address.fullname}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {address.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs">
                      <div className="truncate" title={`${address.line1}${address.line2 ? ', ' + address.line2 : ''}`}>
                        {address.line1}{address.line2 ? ', ' + address.line2 : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {address.city}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {address.state}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(address.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    {!address.isDeleted && <TableCell>
                      <Link href={`/addresses/${address._id}`}>
                        <Button variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>}
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
    </div>
  );
}