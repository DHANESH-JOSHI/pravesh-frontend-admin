"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, CheckCircle2 } from "lucide-react";
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
import { messageService } from "@/services/message.service";
import { Message, MessagesQueryOptions } from "@/types/message";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "next-view-transitions";
import { isFiltersSelected } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { CustomAlertDialog } from "@/components/dashboard/common/custom-alert-dialog";
import { Badge } from "@/components/ui/badge";
import { invalidateMessageQueries } from "@/lib/invalidate-queries";

export function MessagesTable() {
  const [appliedFilters, setAppliedFilters] = useState<MessagesQueryOptions>({ page: 1, limit: 8 });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["messages", appliedFilters],
    queryFn: async () =>
      await messageService.getAll(appliedFilters),
  });

  const queryClient = useQueryClient();

  const messages = data?.data?.messages ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const total = data?.data?.total ?? 0;
  const deleteMutation = useMutation({
    mutationFn: messageService.delete,
    onSuccess: ({ message }, deletedMessageId) => {
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
      toast.success(message ?? "Message deleted successfully");
      invalidateMessageQueries(queryClient, deletedMessageId);
    },
    onError: (error: any) => {
      setIsDeleteDialogOpen(false);
      toast.error(error.response?.data?.message ?? "Failed to delete message. Please try again.");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: messageService.resolve,
    onSuccess: ({ message }, messageId) => {
      toast.success(message ?? "Message resolved successfully");
      invalidateMessageQueries(queryClient, messageId);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to resolve message. Please try again.");
    },
  });

  function resetFilters() {
    setAppliedFilters((prev) => ({ page: 1, search: "", limit: prev.limit, status: undefined }));
  }

  const hasFiltersSelected = isFiltersSelected(appliedFilters);

  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };

  const handleResolve = (message: Message) => {
    if (message.status === "open") {
      resolveMutation.mutate(message._id);
    } else {
      toast.error("Message is already resolved");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded border bg-secondary/10 p-4  ">
        <div className="flex flex-col gap-2">
          <TableHeaderControls
            title="Messages"
            count={messages?.length ?? 0}
            countNoun="message"
            isFetching={isFetching}
            onRefreshAction={refetch}
            searchTerm={appliedFilters.search || ""}
            onSearchAction={(v) => setAppliedFilters((f) => ({ ...f, search: v, page: 1 }))}
            searchPlaceholder="Search messages..."
            pageSize={appliedFilters.limit}
            onChangePageSizeAction={(v) => setAppliedFilters((f) => ({ ...f, limit: Number(v), page: 1 }))}
          />

          <div className="flex gap-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={appliedFilters.status || "all"}
                onValueChange={(v) => setAppliedFilters((d) => ({ ...d, status: v === "all" ? undefined : v as "open" | "resolved", page: 1 }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-end">
              {hasFiltersSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="relative rounded border bg-background/50  overflow-hidden">

          <CommonOverlaySpinner show={isFetching && !isLoading} />
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow className="[&>th]:py-3">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoadingRows
                  rows={6}
                  columns={[
                    "h-5 w-32",
                    "h-5 w-40",
                    "h-5 w-40",
                    "h-5 w-48",
                    "h-6 w-20",
                    "h-5 w-24",
                    "h-8 w-24 rounded",
                  ]}
                />
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-6">
                    <EmptyState
                      title="No messages found"
                      description="Try a different search."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {messages.map((message: Message) => (
                    <TableRow key={message._id}>
                      <TableCell className="font-medium">
                        {message.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {message.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {message.subject || "No subject"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs">
                        <div className="truncate" title={message.message}>
                          {message.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={message.status === "resolved" ? "default" : "secondary"}>
                          {message.status === "resolved" ? "Resolved" : "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {message.createdAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger>
                              <Link href={`/messages/${message._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              View
                            </TooltipContent>
                          </Tooltip>
                          {message.status === "open" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResolve(message)}
                                  disabled={resolveMutation.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Resolve
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(message)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Delete
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationControls
          total={total}
          limit={appliedFilters.limit || 8}
          page={appliedFilters.page || 1}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setAppliedFilters(prev => ({ ...prev, page: Math.max(1, (prev.page ?? 0) - 1) }))}
          onNext={() => setAppliedFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 0) + 1) }))}
          onPageChange={(p) => setAppliedFilters(prev => ({ ...prev, page: p }))}
        />
      </div>

      <CustomAlertDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onContinue={() => {
          if (selectedMessage) {
            deleteMutation.mutate(selectedMessage._id);
          }
        }}
        title="Delete Message"
        isLoading={deleteMutation.isPending}
        description={`Are you sure you want to delete the message from ${selectedMessage?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
