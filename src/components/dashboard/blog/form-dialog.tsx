"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Trash, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
import {
  type Blog,
  type CreateBlog,
  createBlogSchema,
} from "@/types";
import BlogEditor from "./editor";
import { Switch } from "@/components/ui/switch";
import { FormDialogProps } from "@/types";

export function BlogFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateBlog, Blog>) {
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(
    initialData?.featuredImage || null,
  );
  const form = useForm<CreateBlog>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      content: initialData?.content ?? "",
      title: initialData?.title ?? "",
      featuredImage: undefined,
      tags: initialData?.tags ?? [],
      isPublished: initialData?.isPublished ?? false,
    },
  });
  useEffect(() => {
    if (open) {
      form.reset()
    }

  }, [open, form])
  useEffect(() => {
    return () => {
      if (featuredImagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(featuredImagePreview);
    };
  }, [featuredImagePreview]);

  const handleFileChange = (file: File | undefined) => {
    form.setValue("featuredImage", file, { shouldDirty: true });
    if (featuredImagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(featuredImagePreview);
    if (file) {
      setFeaturedImagePreview(URL.createObjectURL(file));
    } else {
      setFeaturedImagePreview(null);
    }
  };
  return (<>{open && <div className="fixed inset-0 bg-black/50 pointer-events-none z-40" />}
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="w-full min-w-[80%] xl:min-w-5xl mx-auto max-h-[70vh] overflow-y-auto z-50"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Edit Blog" : "Create Blog"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <div className="flex flex-col gap-6 md:flex-row md:gap-8 w-full">
              {/* Left: Fields */}
              <div className="space-y-6 md:w-2/5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter blog title..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <Input placeholder="Enter tags, comma separated" defaultValue={Array.isArray(field.value) ? field.value.join(', ') : ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Published</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={() => (
                    <FormItem className="space-y-2">
                      <FormLabel>Thumbnail *</FormLabel>
                      <Card className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                        <CardContent className="p-6">
                          {featuredImagePreview ? (
                            <div className="relative">
                              <Image
                                src={
                                  featuredImagePreview ||
                                  "/placeholder.svg"
                                }
                                alt="Featured Image"
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
                                  Upload a
                                  thumbnail
                                  image for
                                  your blog
                                  post
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="gap-2 bg-accent"
                                  onClick={() =>
                                    featuredImageRef.current?.click()
                                  }
                                >
                                  <Upload className="h-4 w-4" />
                                  Choose Image
                                </Button>
                                <FormControl>
                                  <Input
                                    ref={
                                      featuredImageRef
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
              </div>
              {/* Right: Editor */}
              <div className="md:w-3/5">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Content *</FormLabel>
                      <FormControl className="w-full">
                        <div className="w-full border rounded-lg bg-background p-1 shadow-sm h-[95%] mx-auto">
                          <BlogEditor
                            value={field.value || ""}
                            onChange={(value) =>
                              form.setValue(
                                "content",
                                value,
                                {
                                  shouldDirty: true,
                                },
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
  </>
  );
}
