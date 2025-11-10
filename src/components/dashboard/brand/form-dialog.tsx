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
import {
  type Brand,
  type CreateBrand,
  createBrandSchema,
  type UpdateBrand,
  updateBrandSchema,
} from "@/types/brand";
import { Category, FormDialogProps } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { categoryService } from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function BrandFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateBrand | UpdateBrand, Brand>) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null,
  );
  const form = useForm<UpdateBrand | CreateBrand>({
    resolver: zodResolver(
      initialData ? updateBrandSchema : createBrandSchema,
    ),
    defaultValues: {
      name: initialData?.name || "",
      categoryId: typeof initialData?.category === "string" ? initialData?.category : ((initialData?.category as Category)?._id ?? ""),
      image: undefined,
    },
  });

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
            {initialData ? "Edit Brand" : "Create Brand"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter brand name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Category *</FormLabel>
                  <CategorySearchableSelect value={field.value || ""} action={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={() => (
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
                              your brand
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

export function CategorySearchableSelect({ value, action }: { value: string; action: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(inputValue);
  }, [inputValue, debouncedSetSearch]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", "search", search],
    queryFn: () => categoryService.getAll({
      page: 1,
      limit: 20,
      search,
      isParent: true
    }),
    enabled: open,
  });

  const { data: selectedCategoryData } = useQuery({
    queryKey: ["categories", value],
    queryFn: () => categoryService.getById(value),
    enabled: !!value && !open,
  });

  const categories: Category[] = categoriesData?.data?.categories ?? [];
  const selectedCategory = categories.find((p) => p._id === value) ?? selectedCategoryData?.data;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-left" >
          {value ? selectedCategory?.title ?? "Select category..." : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 min-w-sm">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search category..." value={inputValue} onValueChange={setInputValue} />
          <CommandEmpty>{isLoadingCategories ? "Searching..." : "No category found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {categories.map((category) => (
                <CommandItem key={category._id} value={category._id} onSelect={(currentValue) => { action(currentValue === value ? "" : currentValue); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === category._id ? "opacity-100" : "opacity-0")} />
                  {category.title}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
