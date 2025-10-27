"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Trash, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Category, CreateCategory, FormDialogProps, UpdateCategory, createCategorySchema, updateCategorySchema } from "@/types";

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateCategory, Category>) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const form = useForm<CreateCategory>({
    resolver: zodResolver(
      createCategorySchema
    ),
    defaultValues: {
      title: initialData?.title || "",
      image: undefined,
      parentCategoryId: initialData?.parentCategory?._id || "",
    },
  });

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (file: File | undefined) => {
    form.setValue("image", file as any, { shouldDirty: true });
    if (imagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(imagePreview);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            {/* Left: Fields */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Image</FormLabel>
                  <Card className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                    <CardContent className="p-6">
                      {imagePreview ? (
                        <div className="relative">
                          <Image
                            src={
                              imagePreview ||
                              "/placeholder.svg"
                            }
                            alt="Image"
                            width={100}
                            height={100}
                            className="w-full h-40 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              handleFileChange(
                                undefined,
                              )
                            }
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Upload an
                              image for
                              your category
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-2 bg-accent"
                              onClick={() =>
                                imageRef.current?.click()
                              }
                            >
                              <Upload className="h-4 w-4" />
                              Choose Image
                            </Button>
                            <FormControl>
                              <Input
                                ref={
                                  imageRef
                                }
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(
                                  e,
                                ) =>
                                  handleFileChange(
                                    e
                                      .target
                                      .files?.[0],
                                  )
                                }
                              />
                            </FormControl>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : initialData ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
