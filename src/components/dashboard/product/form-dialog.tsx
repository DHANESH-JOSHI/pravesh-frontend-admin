"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Plus, Trash, Upload, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
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
import { Badge } from "@/components/ui/badge";
import { cn, generateSlug } from "@/lib/utils";
import { toast } from "sonner";
import {
  type Product,
  type CreateProduct,
  updateProductSchema,
  createProductSchema,
} from "@/types/product";
import { FormDialogProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import z from "zod";
import { CategoryTreeSingleSelect } from "@/components/category-tree-single-select";
import { BrandSingleSelect } from "@/components/brand-select";
import { unitService } from "@/services/unit.service";
import { Unit } from "@/types/unit";

export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateProduct, Product>) {
  const isEditMode = !!initialData;
  const specsArraySchema = z.array(z.object({ 
    key: z.string(), 
    value: z.union([z.string(), z.array(z.string())])
  })).optional();
  const variantsArraySchema = z.array(z.object({ 
    key: z.string(), 
    value: z.string()
  })).optional();
  const formSchema = (isEditMode ? updateProductSchema : createProductSchema).extend({
    specifications: specsArraySchema,
    variants: variantsArraySchema,
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
      slug: initialData?.slug || "",
      categoryId: initialData?.category as string || "",
      brandId: initialData?.brand as string || "",
      thumbnail: undefined,
      specifications: initialData?.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ 
        key, 
        value: Array.isArray(value) ? value.join(', ') : value 
      })) : [],
      variants: initialData?.variants ? Object.entries(initialData.variants).map(([key, value]) => ({ 
        key, 
        value: Array.isArray(value) ? value.join(', ') : value 
      })) : [],
      units: initialData?.units && initialData.units.length > 0 
        ? initialData.units.map((u: any) => typeof u === 'object' && u !== null ? (u._id || u) : u)
        : [],
      tags: initialData?.tags || [],
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
    },
  });
  useEffect(()=>{
    if(open){
      form.reset()
      setThumbnailPreview(null)
    }

  },[open,form])

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications"
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants"
  });


  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        brandId: (initialData.brand as Brand)?._id || initialData.brand,
        categoryId: (initialData.category as Category)?._id || initialData.category,
        specifications: initialData.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ 
          key, 
          value: Array.isArray(value) ? value.join(', ') : value 
        })) : [],
        variants: initialData.variants ? Object.entries(initialData.variants).map(([key, value]) => ({ 
          key, 
          value: Array.isArray(value) ? value.join(', ') : value 
        })) : [],
        units: initialData.units 
          ? initialData.units.map((u: any) => typeof u === 'object' && u !== null ? (u._id || u) : u)
          : [],
        tags: initialData.tags || [],
        thumbnail: undefined,
      })
      if (initialData.thumbnail) {
        setThumbnailPreview(initialData.thumbnail)
      }
    }
  }, [initialData, form])

  const handleSubmit = (data: CreateProduct) => {
    const specsArr: { key: string; value: string | string[] }[] = Array.isArray(data.specifications)
      ? data.specifications
      : data.specifications
        ? Object.entries(data.specifications).map(([key, value]) => ({ key, value }))
        : [];
    const specsRecord = specsArr.reduce((acc: Record<string, string | string[]>, s) => {
      if (s?.key) {
        const value = s.value ?? "";
        if (typeof value === 'string' && value.includes(',')) {
          const arrayValue = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
          acc[s.key] = arrayValue.length > 1 ? arrayValue : arrayValue[0] || "";
        } else if (Array.isArray(value)) {
          acc[s.key] = value;
        } else {
          acc[s.key] = value;
        }
      }
      return acc;
    }, {});

    const variantsArr: { key: string; value: string }[] = Array.isArray(data.variants)
      ? data.variants
      : data.variants
        ? Object.entries(data.variants).map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(', ') : value }))
        : [];
    const variantsRecord = variantsArr.reduce((acc: Record<string, string[]>, v) => {
      if (v?.key) {
        const value = v.value ?? "";
        if (value.includes(',')) {
          const arrayValue = value.split(',').map(val => val.trim()).filter(val => val.length > 0);
          if (arrayValue.length > 0) {
            acc[v.key] = arrayValue;
          }
        } else if (value.trim()) {
          acc[v.key] = [value.trim()];
        }
      }
      return acc;
    }, {});
    
    const unitsArr = Array.isArray(data.units) ? data.units.filter(u => u && String(u).trim()) : [];
    
    if (unitsArr.length === 0) {
      throw new Error('At least one unit is required');
    }
    
    const transformedData = {
      ...data,
      specifications: specsRecord,
      variants: Object.keys(variantsRecord).length > 0 ? variantsRecord : undefined,
      units: unitsArr.map(u => String(u)),
    };
    onSubmit(transformedData);
  }

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
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full flex flex-col h-full"
          >
            <ScrollArea className="grow p-4 -mx-4">


              <div className="flex flex-col gap-6 md:flex-row md:gap-8 w-full">
                <div className="space-y-6 md:w-1/2">
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
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/*<FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />*/}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Category *</FormLabel>
                        <CategoryTreeSingleSelect
                          value={field.value || null}
                          action={(val) => field.onChange(val)}
                        />
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
                        <BrandSingleSelect
                          control={form.control}
                          value={field.value || null}
                          action={(val) => field.onChange(val)}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Available Units *</FormLabel>
                        <FormControl>
                          <UnitsMultiSelect 
                            value={field.value || []} 
                            onChange={(unitIds) => field.onChange(unitIds)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/*<FormField
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
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} autoComplete="off" />
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
                  />*/}
                  
                  <KeyValueFormArray name="variants" title="Variants (e.g., Size, Color)" form={form} fields={variantFields} append={appendVariant} remove={removeVariant} isVariant={true} />
                </div>
                <div className="space-y-6 md:w-1/2">
                  <KeyValueFormArray name="specifications" title="Specifications" form={form} fields={specFields} append={appendSpec} remove={removeSpec} />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <TagsInput value={field.value || []} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Card className="p-4 space-y-4">
                    <h3 className="text-lg font-medium">Flags</h3>
                    <div className="flex flex-wrap gap-6">
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded border p-3 shadow-sm">
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
                          <FormItem className="flex flex-row items-center justify-between rounded border p-3 shadow-sm">
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
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={() => (
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

                  {/*<FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem className="space-y-2">
                        <FormLabel>Images</FormLabel>
                        <Card className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                          <CardContent className="p-6">
                            {imagesPreviews.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {imagesPreviews.map((src, index) => (
                                  <div key={index} className="relative">
                                    <Image
                                      src={src}
                                      alt={`Image ${index + 1}`}
                                      width={100}
                                      height={100}
                                      className="w-full h-24 object-cover rounded"
                                    />
                                    {index >= initialImagesCount && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="absolute top-1 right-1 h-6 w-6 p-0"
                                        onClick={() => removeImage(index)}
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded h-24">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => imagesRef.current?.click()}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add More
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    Upload product images
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2 bg-accent"
                                    onClick={() => imagesRef.current?.click()}
                                  >
                                    <Upload className="h-4 w-4" />
                                    Choose Images
                                  </Button>
                                </div>
                              </div>
                            )}
                            <Input
                              ref={imagesRef}
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={(e) => handleImagesChange(e.target.files)}
                            />
                          </CardContent>
                        </Card>
                        <FormMessage />
                      </FormItem>
                    )}
                  />*/}
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


export function BrandSearchableSelect({ value, action }: { value: string; action: (id: string, slug?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(inputValue);
  }, [inputValue, debouncedSetSearch]);

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brands", { search }],
    queryFn: () => brandService.getAll({
      page: 1,
      limit: 20,
      search: search,
    }),
    enabled: open,
  });

  const { data: selectedBrandData } = useQuery({
    queryKey: ["brand", value],
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 min-w-sm flex flex-col max-h-[300px]">
        <Command shouldFilter={false} className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center border-b px-3 shrink-0">
            <CommandInput placeholder="Search brand..." value={inputValue} onValueChange={setInputValue} className="flex-1 border-0" />
          </div>
          <CommandEmpty className="py-4">{isLoadingBrands ? "Searching..." : "No brand found."}</CommandEmpty>
          <CommandGroup className="flex-1 overflow-y-auto min-h-0">
            {brands.map((brand) => (
              <CommandItem key={brand._id} value={brand._id} onSelect={(currentValue) => { 
                if (currentValue === value) {
                  action("", "");
                } else {
                  action(currentValue, brand.slug);
                }
                setOpen(false); 
              }}>
                <Check className={cn("mr-2 h-4 w-4", value === brand._id ? "opacity-100" : "opacity-0")} />
                {brand.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        <div className="flex items-center justify-end border-t px-3 py-1.5 bg-background shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KeyValueFormArray({ name, title, form, fields, append, remove, isVariant = false }: { name: "specifications" | "variants", title: string, form: any, fields: any[], append: any, remove: any, isVariant?: boolean }) {
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
                    <Input placeholder={isVariant ? "Variant Name (e.g., Color, Size)" : "Key"} {...field} autoComplete="off" />
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
                    <Input 
                      placeholder={isVariant ? "Values (comma-separated, e.g., S, M, L)" : "Value (use comma to separate multiple values)"}
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val);
                      }}
                      autoComplete="off"
                    />
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

function UnitsMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const selectedUnitIds = Array.isArray(value) ? value : [];

  const { data: unitsData, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await unitService.getAll({ limit: 1000, isDeleted: "false" });
      return response.data?.units || [];
    },
  });

  const units: Unit[] = unitsData || [];

  const selectedUnits = units.filter(u => selectedUnitIds.includes(u._id));

  const toggleUnit = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      onChange(selectedUnitIds.filter(id => id !== unitId));
    } else {
      onChange([...selectedUnitIds, unitId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUnits.length > 0
            ? `${selectedUnits.length} unit(s) selected`
            : "Select units..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 flex flex-col max-h-[300px]" align="start">
        <Command className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center border-b px-3 shrink-0">
            <CommandInput placeholder="Search units..." className="flex-1 border-0" />
          </div>
          <CommandEmpty className="py-4">
            {isLoading ? "Loading units..." : "No units found."}
          </CommandEmpty>
          <CommandGroup className="flex-1 overflow-y-auto min-h-0">
            {units.map((unit) => (
              <CommandItem
                key={unit._id}
                value={unit.name}
                onSelect={() => {
                  toggleUnit(unit._id);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUnitIds.includes(unit._id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {unit.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        <div className="flex items-center justify-end border-t px-3 py-1.5 bg-background shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setOpen(false)}
          >
            OK
          </Button>
        </div>
      </PopoverContent>
      {selectedUnits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUnits.map((unit) => (
            <Badge
              key={unit._id}
              variant={"secondary"}
              className="inline-flex items-center gap-1.5 pr-1"
            >
              <span>{unit.name}</span>
              <button
                type="button"
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                onClick={() => toggleUnit(unit._id)}
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Popover>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const tags = Array.isArray(value) ? value : [];

  function addTagFromInput() {
    const t = input.trim();
    if (!t) return;
    if (!tags.includes(t)) {
      onChange([...tags, t]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    } else if (e.key === "Backspace" && input === "" && tags.length) {
      // remove last tag on backspace when input empty
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t, i) => (
          <Badge key={i} variant="secondary" className="inline-flex items-center gap-1.5 pr-1">
            <span>{t}</span>
            <button
              type="button"
              className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
              onClick={() => onChange(tags.filter((x) => x !== t))}
            >
              <X className="h-3 w-3 text-destructive" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Type tag and press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTagFromInput()}
        autoComplete="off"
      />
    </div>
  );
}
