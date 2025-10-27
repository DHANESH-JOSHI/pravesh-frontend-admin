"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
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
import { CustomAlertDialog } from "../common/custom-alert-dialog";
import { ProductFormDialog } from "./form-dialog";
import { productService } from "@/services/product.service";
import { Product, CreateProduct, UpdateProduct } from "@/types/product";
export function ProductsTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["products", { page, limit }],
    queryFn: async () => await productService.getAll({ page, limit }),
  });

  const products = data?.data?.products ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product: Product) =>
          product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete product. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateProduct) => {
      if (!editingProduct) return;
      const data = await productService.update(editingProduct?._id!, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateProduct) => {
      const data = await productService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create product. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Products"
          count={filteredProducts?.length ?? 0}
          countNoun="product"
          isFetching={isFetching}
          onRefresh={refetch}
          onCreate={() => setIsCreateDialogOpen(true)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search products..."
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
                <TableHead>Thumbnail</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
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
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No products found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredProducts.map((product: Product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Image
                          src={
                            product.thumbnail ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={product.name}>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{product.finalPrice}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.stock}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.updatedAt}
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
                                setEditingProduct(product)
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
                                  product._id;
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
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={(p) => setPage(p)}
        />
      </CardContent>

      <ProductFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as CreateProduct)}
      />

      <ProductFormDialog
        isLoading={updatemutation.isPending}
        key={editingProduct?._id || "edit-dialog"}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onSubmit={(data) => updatemutation.mutate(data as UpdateProduct)}
        initialData={editingProduct || undefined}
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
