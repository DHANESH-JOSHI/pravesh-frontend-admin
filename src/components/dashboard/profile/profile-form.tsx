"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { toast } from "sonner";
import Loader from "@/components/ui/loader";
import { useAuth } from "@/providers/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  image: z.instanceof(File).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpdateProfile = z.infer<typeof updateProfileSchema>;
type UpdatePassword = z.infer<typeof updatePasswordSchema>;

export function ProfileForm() {
  const { user: currentUser, login, logout } = useAuth();
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await userService.getMe(),
    enabled: !!currentUser,
  });

  const user = data?.data as User | undefined;

  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      image: undefined,
    },
  });

  const passwordForm = useForm<UpdatePassword>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        image: undefined,
      });
      setImagePreview(user.img || null);
    }
  }, [user, form]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const updateMutation = useMutation({
    mutationFn: userService.update,
    onSuccess: ({ message, data: updatedUser }) => {
      toast.success(message ?? "Profile updated successfully");
      // Update the auth context with new user data
      if (updatedUser) {
        login(updatedUser);
      }
      // Reset image preview to the new image URL
      if (updatedUser?.img) {
        setImagePreview(updatedUser.img);
      }
      setHasNewImage(false);
      form.reset({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        image: undefined,
      });
      if (imageRef.current) {
        imageRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update profile. Please try again.");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.updatePassword(currentPassword, newPassword),
    onSuccess: ({ message }) => {
      toast.success(message ?? "Password updated successfully");
      passwordForm.reset();
      setShowPasswordForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update password. Please try again.");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteMe(),
    onSuccess: async ({ message }) => {
      toast.success(message ?? "Account deleted successfully");
      await logout();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete account. Please try again.");
      setShowDeleteDialog(false);
    },
  });

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }
    }
    
    form.setValue("image", file, { shouldDirty: true });
    if (imagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(imagePreview);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setHasNewImage(true);
    } else {
      setImagePreview(user?.img || null);
      setHasNewImage(false);
    }
  };

  const onSubmit = (data: UpdateProfile) => {
    const imageValue = form.getValues("image");
    const submitData: any = {
      name: data.name,
      email: data.email || "",
    };
    
    if (imageValue instanceof File) {
      submitData.image = imageValue;
    }
    
    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="relative w-32 h-32 border rounded-full overflow-hidden bg-muted">
                          <Image
                            src={imagePreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {imagePreview ? "Change Photo" : "Upload Photo"}
                        </Button>
                        {hasNewImage && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              handleFileChange(undefined);
                              form.setValue("image", undefined, { shouldDirty: true });
                              if (imageRef.current) imageRef.current.value = "";
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                        <input
                          ref={imageRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleFileChange(file);
                            field.onChange(file);
                          }}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name..." {...field} autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email..." {...field} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Update */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          {showPasswordForm ? (
            <CardContent>
              <Form {...passwordForm}>
                <div className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter current password..."
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password..."
                            {...field}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password..."
                            {...field}
                            autoComplete="new-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        passwordForm.reset();
                        setShowPasswordForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={passwordForm.handleSubmit((data) => {
                        updatePasswordMutation.mutate({
                          currentPassword: data.currentPassword,
                          newPassword: data.newPassword,
                        });
                      })}
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          ) : (
            <CardContent>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-between items-center">
          {!showPasswordForm && (
            <>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </>
                    )}
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
                    <AlertDialogCancel disabled={deleteAccountMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleteAccountMutation.isPending}
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={!form.formState.isDirty}
                onClick={() => {
                  form.reset({
                    name: user?.name || "",
                    email: user?.email || "",
                    image: undefined,
                  });
              setImagePreview(user?.img || null);
              setHasNewImage(false);
              if (imageRef.current) {
                imageRef.current.value = "";
              }
                }}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending || !form.formState.isDirty}
              >
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}

