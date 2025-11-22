"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Trash, Upload } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type Banner,
  type CreateBanner,
  createBannerSchema,
  type UpdateBanner,
  updateBannerSchema,
  bannerTypeSchema,
} from "@/types/banner";
import { FormDialogProps, Product } from "@/types";
import { BrandSearchableSelect } from "../product/form-dialog";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CategoryTreeSingleSelect } from "@/components/category-tree-single-select";

export function BannerFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateBanner | UpdateBanner, Banner>) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const form = useForm<UpdateBanner | CreateBanner>({
    resolver: zodResolver(
      initialData ? updateBannerSchema : createBannerSchema,
    ),
    defaultValues: {
      title: initialData?.title || "",
      image: undefined,
      targetUrl: initialData?.targetUrl || "",
      type: initialData?.type,
      targetId: initialData?.targetId || "",
      order: initialData?.order || 0,
    },
  });
  useEffect(() => {
    if (open) {
      form.reset()
      setImagePreview(null)
    }

  }, [open, form])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (file: File | undefined) => {
    form.setValue("image", file, { shouldDirty: true });
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
            {initialData ? "Edit Banner" : "Create Banner"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter banner title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bannerTypeSchema.options.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {["offer", "external"].includes(form.watch("type") ?? "") && (<>
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Redirect Url</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Redirect Url..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>)}
            {["brand", "category", "product"].includes(form.watch("type") ?? "") &&
              (<FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Redirect ID</FormLabel>
                    {form.watch("type") === "brand" ? (
                      <BrandSearchableSelect value={field.value || ""} action={field.onChange} />
                    ) : form.watch("type") === "category" ? (
                      <CategoryTreeSingleSelect value={field.value || ""} action={field.onChange} />
                    ) : form.watch("type") === "product" ? (
                      <ProductSearchableSelect value={field.value || ""} action={field.onChange} />
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />)
            }
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter priority level..."
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel>Image *</FormLabel>
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
                              your banner
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

export function ProductSearchableSelect({ value, action }: { value: string; action: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(inputValue);
  }, [inputValue, debouncedSetSearch]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", { page: 1, limit: 20, search }],
    queryFn: () => productService.getAll({
      page: 1,
      limit: 20,
      search,
    }),
    enabled: open,
  });

  const { data: selectedProductData } = useQuery({
    queryKey: ["products", value],
    queryFn: () => productService.getById(value),
    enabled: !!value && !open,
  });

  const products: Product[] = productsData?.data?.products ?? [];
  const selectedProduct = products.find((p) => p._id === value) ?? selectedProductData?.data;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? selectedProduct?.name ?? "Select product..." : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 min-w-sm">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search product..." value={inputValue} onValueChange={setInputValue} />
          <CommandEmpty>{isLoadingProducts ? "Searching..." : "No product found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {products.map((product) => (
                <CommandItem key={product._id} value={product._id} onSelect={(currentValue) => { action(currentValue === value ? "" : currentValue); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === product._id ? "opacity-100" : "opacity-0")} />
                  {product.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}