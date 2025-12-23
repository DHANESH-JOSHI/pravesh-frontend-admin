"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Plus, Trash, Upload } from "lucide-react";
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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, generateSlug } from "@/lib/utils";
import {
  type Product,
  type CreateProduct,
  updateProductSchema,
  createProductSchema,
} from "@/types/product";
import { FormDialogProps } from "@/types";
// import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { unitSchema } from "@/types/product";
import Image from "next/image";
import z from "zod";
import { CategoryTreeSingleSelect } from "@/components/category-tree-single-select";
import { BrandSingleSelect } from "@/components/brand-select";

export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<CreateProduct, Product>) {
  const isEditMode = !!initialData;
  const specsArraySchema = z.array(z.object({ key: z.string(), value: z.string() })).optional();
  const unitsArraySchema = z.array(z.object({ 
    unit: z.string().nonempty("Unit name is required")
  })).min(1, "At least one unit is required");
  const formSchema = (isEditMode ? updateProductSchema : createProductSchema).extend({
    specifications: specsArraySchema,
    units: unitsArraySchema,
  });

  const thumbnailRef = useRef<HTMLInputElement>(null);
  // const imagesRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail || null,
  );
  // const [imagesPreviews, setImagesPreviews] = useState<string[]>(
  //   initialData?.images || [],
  // );
  // const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  // const initialImagesCount = initialData?.images?.length || 0;
  const form = useForm<any>({
    resolver: zodResolver(
      formSchema
    ),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      // description: initialData?.description || "",
      // shortDescription: initialData?.shortDescription || "",
      categoryId: initialData?.category as string || "",
      brandId: initialData?.brand as string || "",
      // discountType: initialData?.discountType || undefined,
      // discountValue: initialData?.discountValue || 0,
      // stock: initialData?.stock || 0,
      thumbnail: undefined,
      // images: undefined,
      // features: initialData?.features || [],
      specifications: initialData?.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value })) : [],
      units: initialData?.units && initialData.units.length > 0 ? initialData.units : [],
      // minStock: initialData?.minStock || 0,
      tags: initialData?.tags || [],
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
    },
  });

  // const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
  //   control: form.control,
  //   name: "features" as any
  // });
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


  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        brandId: (initialData.brand as Brand)?._id || initialData.brand,
        categoryId: (initialData.category as Category)?._id || initialData.category,
        // features: initialData.features || [],
        specifications: initialData.specifications ? Object.entries(initialData.specifications).map(([key, value]) => ({ key, value })) : [],
        units: initialData.units || [],
        tags: initialData.tags || [],
        thumbnail: undefined,
        // images: undefined,
      })
      if (initialData.thumbnail) {
        setThumbnailPreview(initialData.thumbnail)
      }
      // setImagesPreviews(initialData.images || []);
      // setImagesFiles([]);
    }
  }, [initialData, form])

  const handleSubmit = (data: CreateProduct) => {
    const specsArr: { key: string; value: string }[] = Array.isArray(data.specifications)
      ? data.specifications
      : data.specifications
        ? Object.entries(data.specifications).map(([key, value]) => ({ key, value }))
        : [];
    const specsRecord = specsArr.reduce((acc: Record<string, string>, s) => {
      if (s?.key) acc[s.key] = s.value ?? "";
      return acc;
    }, {});
    
    // Process units array - filter out empty units
    const unitsArr = Array.isArray(data.units) ? data.units.filter(u => u.unit && u.unit.trim()) : [];
    
    if (unitsArr.length === 0) {
      throw new Error('At least one unit is required');
    }
    
    const transformedData = {
      ...data,
      // features: data.features ?? [],
      specifications: specsRecord,
      units: unitsArr,
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
      // imagesPreviews.filter(p => p.startsWith("blob:")).forEach(URL.revokeObjectURL);
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

  // const handleImagesChange = (files: FileList | null) => {
  //   if (!files) return;
  //   const newFiles = Array.from(files);
  //   setImagesFiles(prev => [...prev, ...newFiles]);
  //   const newPreviews = newFiles.map(f => URL.createObjectURL(f));
  //   setImagesPreviews(prev => [...prev, ...newPreviews]);
  //   form.setValue("images", [...imagesFiles, ...newFiles], { shouldDirty: true });
  // };

  // const removeImage = (index: number) => {
  //   const newPreviews = [...imagesPreviews];
  //   const newFiles = [...imagesFiles];
  //   if (index < initialImagesCount) {
  //     return;
  //   }
  //   const fileIndex = index - initialImagesCount;
  //   if (newPreviews[index]?.startsWith("blob:")) URL.revokeObjectURL(newPreviews[index]);
  //   newPreviews.splice(index, 1);
  //   newFiles.splice(fileIndex, 1);
  //   setImagesPreviews(newPreviews);
  //   setImagesFiles(newFiles);
  //   form.setValue("images", newFiles, { shouldDirty: true });
  // };
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
                {/* Left: Fields */}
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
                          />
                        </FormControl>
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
                          <UnitsInput 
                            value={field.value || []} 
                            onChange={(units) => field.onChange(units)} 
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
                  />*/}
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
                </div>
                {/* Right: Additional Fields */}
                <div className="space-y-6 md:w-1/2">
                  <KeyValueFormArray name="specifications" title="Specifications" form={form} fields={specFields} append={appendSpec} remove={removeSpec} />
                  {/* Tags input (editable chips) */}
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


export function BrandSearchableSelect({ value, action }: { value: string; action: (value: string) => void }) {
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 min-w-sm">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search brand..." value={inputValue} onValueChange={setInputValue} />
          <CommandEmpty>{isLoadingBrands ? "Searching..." : "No brand found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {brands.map((brand) => (
                <CommandItem key={brand._id} value={brand._id} onSelect={(currentValue) => { action(currentValue === value ? "" : currentValue); setOpen(false); }}>
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

// export function CategorySearchableSelect({ value, action }: { value: string; action: (value: string) => void }) {
//   const [open, setOpen] = useState(false);
//   const [inputValue, setInputValue] = useState("");
//   const [search, setSearch] = useState("");

//   const debouncedSetSearch = useDebouncedCallback((value: string) => {
//     setSearch(value);
//   }, 300);

//   useEffect(() => {
//     debouncedSetSearch(inputValue);
//   }, [inputValue, debouncedSetSearch]);

//   const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
//     queryKey: ["categories", "search", search],
//     queryFn: () => categoryService.getAll({
//       page: 1,
//       limit: 20,
//       search,
//     }),
//     enabled: open,
//   });

//   const { data: selectedCategoryData } = useQuery({
//     queryKey: ["categories", value],
//     queryFn: () => categoryService.getById(value),
//     enabled: !!value && !open,
//   });

//   const categories: Category[] = categoriesData?.data?.categories ?? [];
//   const selectedCategory = categories.find((p) => p._id === value) ?? selectedCategoryData?.data;

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between text-left" >
//           {value ? selectedCategory?.title ?? "Select category..." : "Select category..."}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[--radix-popover-trigger-width] p-0 min-w-sm">
//         <Command shouldFilter={false}>
//           <CommandInput placeholder="Search category..." value={inputValue} onValueChange={setInputValue} />
//           <CommandEmpty>{isLoadingCategories ? "Searching..." : "No category found."}</CommandEmpty>
//           <CommandGroup>
//             <ScrollArea className="h-48">
//               {categories.map((category) => (
//                 <CommandItem key={category._id} value={category._id} onSelect={(currentValue) => { action(currentValue === value ? "" : currentValue); setOpen(false); }}>
//                   <Check className={cn("mr-2 h-4 w-4", value === category._id ? "opacity-100" : "opacity-0")} />
//                   {category.title}
//                 </CommandItem>
//               ))}
//             </ScrollArea>
//           </CommandGroup>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

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

function UnitsInput({ value, onChange }: { value: { unit: string }[]; onChange: (v: { unit: string }[]) => void }) {
  const [input, setInput] = useState("");
  const units = Array.isArray(value) ? value : [];

  function addUnitFromInput() {
    const unitName = input.trim();
    if (!unitName) return;
    // Check if unit already exists (case-insensitive)
    const unitExists = units.some(u => u.unit.toLowerCase() === unitName.toLowerCase());
    if (!unitExists) {
      onChange([...units, { unit: unitName }]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addUnitFromInput();
    } else if (e.key === "Backspace" && input === "" && units.length) {
      // remove last unit on backspace when input empty
      onChange(units.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {units.map((u, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-muted/10 text-sm">
            <span>{u.unit}</span>
            <button
              type="button"
              className="text-destructive text-xs"
              onClick={() => onChange(units.filter((x, idx) => idx !== i))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Type unit (e.g., kg, packet, piece) and press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addUnitFromInput()}
      />
    </div>
  );
}

// function StringArrayFormArray({ name, title, form, fields, append, remove }: { name: "features", title: string, form: any, fields: any[], append: any, remove: any }) {
//   return (
//     <FormItem>
//       <FormLabel>{title}</FormLabel>
//       <Card className="p-4 space-y-4">
//         {fields.map((field, index) => (
//           <div key={field.id} className="flex items-center gap-4">
//             <FormField
//               control={form.control}
//               name={`${name}.${index}`}
//               render={({ field }) => (
//                 <FormItem className="grow">
//                   <FormControl>
//                     <Input placeholder="Feature" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
//               <Trash className="h-4 w-4 text-destructive" />
//             </Button>
//           </div>
//         ))}
//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           className="gap-2"
//           onClick={() => append("")}
//         >
//           <Plus className="h-4 w-4" />
//           Add {title}
//         </Button>
//       </Card>
//     </FormItem>
//   )
// }

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
          <span key={i} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-muted/10 text-sm">
            <span>{t}</span>
            <button
              type="button"
              className="text-destructive text-xs"
              onClick={() => onChange(tags.filter((x) => x !== t))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder="Type tag and press Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTagFromInput()}
      />
    </div>
  );
}
