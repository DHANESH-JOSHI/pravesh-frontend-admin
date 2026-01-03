"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, User, Calendar, MessageSquare, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { messageService } from "@/services/message.service";
import { Message } from "@/types/message";
import { Link, useTransitionRouter } from "next-view-transitions";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import { CustomAlertDialog } from "@/components/dashboard/common/custom-alert-dialog";
import { useState } from "react";
import { invalidateMessageQueries } from "@/lib/invalidate-queries";
import { DetailPageHeader } from "@/components/dashboard/common/detail-page-header";

export default function MessageDetailPage() {
  const router = useTransitionRouter();
  const params = useParams();
  const messageId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["message", messageId],
    queryFn: async () => await messageService.getById(messageId),
    enabled: !!messageId,
  });

  const message = data?.data as Message;

  const resolveMutation = useMutation({
    mutationFn: messageService.resolve,
    onSuccess: ({ message }) => {
      toast.success(message ?? "Message resolved successfully");
      invalidateMessageQueries(queryClient, messageId);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to resolve message. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: messageService.delete,
    onSuccess: ({ message }) => {
      setDeleteDialogOpen(false);
      toast.success(message ?? "Message deleted successfully");
      invalidateMessageQueries(queryClient, messageId);
      // Use replace to avoid adding to history and prevent transition conflicts
      router.replace("/messages");
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      toast.error(error.response?.data?.message ?? "Failed to delete message. Please try again.");
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !message) {
    return (
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Message not found</h1>
          <p className="text-muted-foreground">The message you're looking for doesn't exist.</p>
          <Link href="/messages">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 sm:max-w-6xl mx-auto w-full p-3 sm:p-4 lg:p-6 min-w-0 overflow-x-hidden">
      <DetailPageHeader
        title={message.subject}
        moduleName="Message"
        badge={{
          label: message.status === "resolved" ? "Resolved" : "Open",
          variant: message.status === "resolved" ? "default" : "secondary",
        }}
        actions={
          <>
            {message.status === "open" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resolveMutation.mutate(message._id)}
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </>
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        }
      />

      {/* Message Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Message Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </label>
                <p className="text-lg font-semibold">{message.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="font-mono text-sm">{message.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{new Date(message.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </label>
                <p className="text-sm">{new Date(message.updatedAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message.subject && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium">Subject</label>
                <p className="text-lg font-semibold">{message.subject}</p>
              </div>
              <Separator className="my-4" />
            </>
          )}
          <div>
            <label className="text-sm font-medium">Message</label>
            <div className="mt-2 p-4 bg-muted/50 rounded">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onContinue={() => deleteMutation.mutate(message._id)}
        title="Delete Message"
        description={`Are you sure you want to delete the message from ${message.name}? This action cannot be undone.`}
      />
    </div>
  );
}

