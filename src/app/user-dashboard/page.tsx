"use client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTransitionRouter } from "next-view-transitions";
import { useMutation } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import instance from "@/lib/axios";
import { ApiResponse, User } from "@/types";
import Loader from "@/components/ui/loader";

export default function UserDashboardPage() {
  const router = useTransitionRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    (async () => {
      try {
        const res = await instance.get<ApiResponse<User>>("/users/me");
        const userRole = res.data?.data?.role;
        if (userRole === "user" && res.data?.data) {
          setUser(res.data.data);
        } else if (userRole === "admin" || userRole === "staff") {
          // If admin/staff is logged in, redirect to admin dashboard
          router.replace("/");
        } else {
          router.replace("/user-login");
        }
      } catch (e) {
        router.replace("/user-login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteMe(),
    onSuccess: ({ message }) => {
      toast.success(message ?? "Account deleted successfully");
      // Clear cookies and redirect
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      router.push("/user-login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete account. Please try again.");
      setShowDeleteDialog(false);
    },
  });

  if (loading) {
    return <Loader text="Loading..." />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            disabled={deleteAccountMutation.isPending}
            className="h-12 px-8"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Me
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all associated data including orders, reviews, addresses, and cart items.
              You will be logged out and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
