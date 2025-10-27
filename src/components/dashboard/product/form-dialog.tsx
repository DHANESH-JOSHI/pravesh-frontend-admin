"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Plus, Trash, Upload } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, generateSlug } from "@/lib/utils";
import {
  type Product,
  type CreateProduct,
  updateProductSchema,
  createProductSchema,
} from "@/types/product";
import { FormDialogProps } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import { categoryService } from "@/services/category.service";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { discountTypeSchema, unitSchema } from "@/types/product";
import Image from "next/image";


export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateProduct, Product>) {
  const isEditMode = !!initialData;

  const formSchema = (isEditMode ? updateProductSchema : createProductSchema).extend({
    specifications: createProductSchema.shape.specifications.array().optional(),
  });

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null,
  );
  const form = useForm<any>({
    resolver: zodResolver(
      formSchema
    ),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      categoryId: initialData?.category as string || "",
      brandId: initialData?.brand as string || "",
      originalPrice: initialData?.originalPrice || 0,
      discountType: initialData?.discountType || undefined,
      discountValue: initialData?.discountValue || 0,
      stock: initialData?.stock || 0,
      thumbnail: undefined,
      features: initialData?.features || [],
      specifications: initialData?.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value })) : [],
      unit: initialData?.unit || undefined,
      minStock: initialData?.minStock || 0,
      tags: initialData?.tags || [],
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
      seoKeywords: initialData?.seoKeywords || [],
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control: form.control,
    name: "features"
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications"
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        brandId: (initialData.brand as Brand)?._id || initialData.brand,
        categoryId: (initialData.category as Category)?._id || initialData.category,
        features: initialData.features || [],
        specifications: initialData.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value })) : [],
        tags: initialData.tags || [],
        seoKeywords: initialData.seoKeywords || [],
        thumbnail: undefined, // do not reset file input
      })
      if (initialData.thumbnail) {
        setThumbnailPreview(initialData.thumbnail)
      }
    }
  }, [initialData, form])

  const nameValue = form.watch("name");
  useEffect(() => {
    form.setValue("slug", generateSlug(nameValue || ""), {
      shouldDirty: true,
    });
  }, [nameValue, form]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:"))
        URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const handleFileChange = (file: File | undefined) => {
    form.setValue("thumbnail", file, { shouldDirty: true });
    if (thumbnailPreview?.startsWith("blob:"))
      URL.revokeObjectURL(thumbnailPreview);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      setThumbnailPreview(null);
    }
  };
  return (<>{open && <div className="fixed inset-0 bg-black/50 pointer-events-none z-40" />}
    <Dialog open={open} onOpenChange={onOpenChange} modal={false} >
      <DialogContent className="w-full min-w-[90%] xl:min-w-6xl mx-auto max-h-[90vh] overflow-y-auto z-50"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? "Edit Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data: any) => {
                const transformedData = {
                  ...data,
                  features: data.features,
                  specifications: data.specifications ? Object.fromEntries(data.specifications.filter((s: any) => s.key).map((s: { key: string, value: string }) => [s.key, s.value])) : undefined,
                };
                onSubmit(transformedData as CreateProduct);
              },
              (errors) => console.error("Form validation errors:", errors)
            )}
            className="w-full flex flex-col h-full"
          >
            <ScrollArea className="grow p-4 -mx-4">

              
              <div className="flex flex-col gap-6 md:flex-row md:gap-8 w-full">
                {/* Left: Fields */}
                <div className="space-y-6 md:w-2/5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product name..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitSchema.options.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product SKU..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Brand</FormLabel>
                        <BrandSearchableSelect value={field.value || ""} onChange={field.onChange} />
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
                        <CategorySearchableSelect value={field.value || ""} onChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price..."
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
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {discountTypeSchema.options.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Stock *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter stock..."
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
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Thumbnail</FormLabel>
                        <Card className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                          <CardContent className="p-6">
                            {thumbnailPreview ? (
                              <div className="relative">
                                <Image
                                  src={
                                    thumbnailPreview ||
                                    "/placeholder.svg"
                                  }
                                  alt="Thumbnail"
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
                                    your product
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2 bg-accent"
                                    onClick={() =>
                                      thumbnailRef.current?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4" />
                                    Choose Image
                                  </Button>
                                  <FormControl>
                                    <Input
                                      ref={
                                        thumbnailRef
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
                {/* Right: Description */}
                <div className="space-y-6 md:w-3/5">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Description</FormLabel>
                        <FormControl className="w-full">
                          <Textarea
                            placeholder="Enter full product description..."
                            className="h-40"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Short Description</FormLabel>
                        <FormControl className="w-full">
                          <Textarea
                            placeholder="Enter a short description..."
                            className="h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StringArrayFormArray name="features" title="Features" form={form} fields={featureFields} append={appendFeature} remove={removeFeature} />
                  <KeyValueFormArray name="specifications" title="Specifications" form={form} fields={specFields} append={appendSpec} remove={removeSpec} />

                  <Card className="p-4 space-y-4">
                    <h3 className="text-lg font-medium">SEO</h3>
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <Input placeholder="Enter SEO title" {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description</FormLabel>
                          <Textarea placeholder="Enter SEO description" {...field} />
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
                          <Input placeholder="Enter tags, comma separated" defaultValue={field.value.join(', ')} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords</FormLabel>
                          <Input placeholder="Enter keywords, comma separated" defaultValue={field.value.join(', ')} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Card className="p-4 space-y-4">
                    <h3 className="text-lg font-medium">Flags</h3>
                    <div className="flex flex-wrap gap-6">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className="mr-4">Featured</FormLabel>
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
                        name="isNewArrival"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className="mr-4">New Arrival</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
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


function BrandSearchableSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brands", "search", search],
    queryFn: () => brandService.getAll(search, 1, 20),
    enabled: open,
  });

  const { data: selectedBrandData } = useQuery({
    queryKey: ["brands", value],
    queryFn: () => brandService.getById(value),
    enabled: !!value && !open,
  });

  const brands: Brand[] = brandsData?.data?.brands ?? [];
  const selectedBrand = brands.find((p) => p._id === value) ?? selectedBrandData?.data;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? selectedBrand?.name ?? "Select brand..." : "Select brand..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search brand..." value={search} onValueChange={setSearch} />
          <CommandEmpty>{isLoadingBrands ? "Searching..." : "No brand found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {brands.map((brand) => (
                <CommandItem key={brand._id} value={brand._id} onSelect={(currentValue) => { onChange(currentValue === value ? "" : currentValue); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === brand._id ? "opacity-100" : "opacity-0")} />
                  {brand.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CategorySearchableSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", "search", search],
    queryFn: () => categoryService.getAll(search, 1, 20),
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search category..." value={search} onValueChange={setSearch} />
          <CommandEmpty>{isLoadingCategories ? "Searching..." : "No category found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {categories.map((category) => (
                <CommandItem key={category._id} value={category._id} onSelect={(currentValue) => { onChange(currentValue === value ? "" : currentValue); setOpen(false); }}>
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

function KeyValueFormArray({ name, title, form, fields, append, remove }: { name: "specifications", title: string, form: any, fields: any[], append: any, remove: any }) {
  return (
    <FormItem>
      <FormLabel>{title}</FormLabel>
      <Card className="p-4 space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <FormField
              control={form.control}
              name={`${name}.${index}.key`}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input placeholder="Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${name}.${index}.value`}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append({ key: "", value: "" })}
        >
          <Plus className="h-4 w-4" />
          Add {title}
        </Button>
      </Card>
    </FormItem>
  )
}

function StringArrayFormArray({ name, title, form, fields, append, remove }: { name: "features", title: string, form: any, fields: any[], append: any, remove: any }) {
  return (
    <FormItem>
      <FormLabel>{title}</FormLabel>
      <Card className="p-4 space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <FormField
              control={form.control}
              name={`${name}.${index}`}
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input placeholder="Feature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append("")}
        >
          <Plus className="h-4 w-4" />
          Add {title}
        </Button>
      </Card>
    </FormItem>
  )
}
