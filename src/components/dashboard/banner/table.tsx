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
import { BannerFormDialog } from "./form-dialog";
import { bannerService } from "@/services/banner.service";
import { Banner, CreateBanner, UpdateBanner } from "@/types/banner";
export function BannersTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => await bannerService.getAllBanners(),
  });

  const banners = data?.data ?? [];
  const filteredBanners = useMemo(
    () =>
      banners.filter(
        (banner: Banner) =>
          banner.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [banners, searchTerm],
  );

  const deleteMutation = useMutation({
    mutationFn: bannerService.delete,
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Banner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["banners"], exact: false });
    },
    onError: () => {
      setIsOpen(false);
      toast.error("Failed to delete banner. Please try again.");
    },
  });

  const updatemutation = useMutation({
    mutationFn: async (values: UpdateBanner) => {
      if (!editingBanner) return;
      const data = await bannerService.update(editingBanner?._id!, values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Banner updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setEditingBanner(null);
    },
    onError: () => {
      toast.error("Failed to update banner. Please try again.");
    },
  });
  const createMutation = useMutation({
    mutationFn: async (values: CreateBanner) => {
      const data = await bannerService.create(values);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Banner created successfully!");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create banner. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <TableHeaderControls
          title="Banners"
          count={filteredBanners?.length ?? 0}
          countNoun="banner"
          isFetching={isFetching}
          onRefresh={refetch}
          onCreate={() => setIsCreateDialogOpen(true)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          searchPlaceholder="Search banners..."
        />
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Order</TableHead>
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
              ) : filteredBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <EmptyState
                      title="No banners found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredBanners.map((banner: Banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        <Image
                          src={
                            banner.image ||
                            "/placeholder.svg"
                          }
                          width={50}
                          height={50}
                          alt={banner.title}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={banner.title}>
                          {banner.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {banner.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {banner.order}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {banner.updatedAt}
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
                                setEditingBanner(banner)
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
                                  banner._id;
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

      <BannerFormDialog
        isLoading={createMutation.isPending}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data as CreateBanner)}
      />

      <BannerFormDialog
        isLoading={updatemutation.isPending}
        key={editingBanner?._id || "edit-dialog"}
        open={!!editingBanner}
        onOpenChange={(open) => !open && setEditingBanner(null)}
        onSubmit={(data) => updatemutation.mutate(data as UpdateBanner)}
        initialData={editingBanner || undefined}
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
