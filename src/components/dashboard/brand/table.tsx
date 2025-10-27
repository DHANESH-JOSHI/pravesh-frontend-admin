"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import TableLoadingRows from "@/components/dashboard/common/table-loading-rows";
import { EmptyState } from "@/components/dashboard/common/empty-state";
import { OverlaySpinner as CommonOverlaySpinner } from "@/components/dashboard/common/overlay-spinner";
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
import { BrandFormDialog } from "./form-dialog";
import { brandService } from "@/services/brand.service";
import { Brand, CreateBrand, UpdateBrand } from "@/types/brand";
export function BrandsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => await brandService.getAll(),
  });

  const brands = data?.data?.brands ?? [];
  const filteredBrands = useMemo(
    () => {
      return brands.filter(
        (brand: Brand) =>
          brand.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    },
    [brands, searchTerm],
  );

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Brand deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["brands"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete brand. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBrand) => {
      if (!editingBrand) return;
      const data = await brandService.update(editingBrand?._id!, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Brand updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setEditingBrand(null);
    },
    onError: () => {
      toast.error("Failed to update brand. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBrand) => {
      const data = await brandService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Brand created successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create brand. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Brands"
          count={filteredBrands?.length ?? 0}
          countNoun="brand"
          isFetching={isFetching}
          onRefresh={refetch}
          onCreate={() => setIsCreateDialogOpen(true)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search brands..."
        />
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
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
              ) : filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      title="No brands found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredBrands.map((brand: Brand) => (
                    <TableRow key={brand._id}>
                      <TableCell>
                        <Image
                          src={
                            brand.image ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={brand.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={brand.name}>
                          {brand.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {brand.updatedAt}
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
                                setEditingBrand(brand)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setIsOpen(true);
                                pendingDeleteId =
                                  brand._id;
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
      </CardContent>

      <BrandFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as CreateBrand)}
      />

      <BrandFormDialog
        isLoading={updatemutation.isPending}
        key={editingBrand?._id || "edit-dialog"}
        open={!!editingBrand}
        onOpenChange={(open) => !open && setEditingBrand(null)}
        onSubmit={(data) => updatemutation.mutate(data as UpdateBrand)}
        initialData={editingBrand || undefined}
      />

      <CustomAlertDialog
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onContinue={() => {
          if (pendingDeleteId)
            deleteMutation.mutate(pendingDeleteId);
        }}
      />
    </Card>
  );
}

let pendingDeleteId: string | null = null;
