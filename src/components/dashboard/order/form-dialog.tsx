"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Trash, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  AdminUpdateOrder,
  type Order,
  adminUpdateOrderSchema,
} from "@/types/order";
import { FormDialogProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

export function OrderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: FormDialogProps<AdminUpdateOrder, Order>) {
  const [tempItems, setTempItems] = useState(initialData?.items || []);
  const form = useForm<AdminUpdateOrder>({
    resolver: zodResolver(adminUpdateOrderSchema),
    defaultValues: {
      feedback: initialData?.feedback || "",
      items: initialData?.items?.map((item) => {
        const product = item.product as Product | null | undefined;
        return {
          product: product?._id || '',
          quantity: item.quantity,
          unit: item.unit || '',
          variantSelections: item.variantSelections || {},
        };
      }).filter(item => item.product) || [],
    },
  });
  useEffect(() => {
    if (open && initialData?.items) {
      form.reset({
        feedback: initialData?.feedback || "",
        items: initialData.items.map((item) => {
          const product = item.product as Product | null | undefined;
          return {
            product: product?._id || '',
            quantity: item.quantity,
            unit: item.unit || '',
            variantSelections: item.variantSelections || {},
          };
        }).filter(item => item.product),
      });
      
      const fetchProducts = async () => {
        const itemsWithProducts = await Promise.all(
          initialData.items.map(async (item) => {
            const productId = typeof item.product === 'string' ? item.product : item.product?._id;
            if (productId) {
              try {
                const productResponse = await productService.getById(productId);
                return {
                  ...item,
                  product: productResponse.data as Partial<Product>,
                };
              } catch (error) {
                console.error(`Failed to fetch product ${productId}:`, error);
                return item;
              }
            }
            return item;
          })
        );
        setTempItems(itemsWithProducts);
      };
      fetchProducts();
    } else if (open) {
      form.reset({
        feedback: "",
        items: [],
      });
      setTempItems([]);
    }
  }, [open, initialData, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  useEffect(() => {
    setImagePreview(initialData?.image || null);
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith?.("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[calc(100vw-2rem)] sm:w-full">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-bold">
            Edit Order
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide"
          >
            {initialData?.isCustomOrder && <FormItem className="space-y-2">
              <FormLabel>Image</FormLabel>
              <div className="flex items-center gap-4">
                <div className="relative w-28 h-28 rounded border flex items-center justify-center overflow-hidden bg-muted group">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background"
                        onClick={() => setIsImageFullscreen(true)}
                      >
                        <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-sm text-muted-foreground">
                      <ImageIcon />
                      <span>No image</span>
                    </div>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>}

            <FormItem className="space-y-2">
              <FormLabel>Items</FormLabel>
              <Card className="w-full shadow-sm overflow-hidden">
                <CardContent className="p-4 overflow-x-hidden">
                  {fields.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No items</div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((item, index) => {
                        const product = (tempItems && tempItems[index]?.product) as Product | undefined;
                        const variants = product?.variants || {};
                        const hasVariants = Object.keys(variants).length > 0;
                        
                        return (
                          <div key={item.id} className="space-y-2 border rounded-lg p-3 w-full overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0 max-w-full">
                              <FormField
                                control={form.control}
                                name={`items.${index}.product`}
                                render={() => (
                                  <FormItem className="flex flex-col flex-1 min-w-0 w-full sm:w-auto">
                                    <ProductSearchableSelect
                                      product={(tempItems && tempItems[index]?.product) as Product ?? null}
                                  onChange={(v, productData) => {
                                    form.setValue(`items.${index}.product`, v);
                                    form.setValue(`items.${index}.variantSelections`, {});
                                    const currentItems = tempItems || [];
                                    const updatedItems = [...currentItems];
                                    updatedItems[index] = {
                                      ...updatedItems[index],
                                      product: productData || updatedItems[index]?.product,
                                    };
                                    setTempItems(updatedItems);
                                  }}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.unit`}
                                render={({ field }) => {
                                  const availableUnits = product?.units || [];
                                  const getUnitName = (unit: string | Partial<{ _id: string; name: string }>): string => {
                                    if (typeof unit === 'string') return unit;
                                    if (typeof unit === 'object' && unit !== null && unit.name) return unit.name;
                                    return '';
                                  };
                                  const getUnitValue = (unit: string | Partial<{ _id: string; name: string }>): string => {
                                    return getUnitName(unit);
                                  };
                                  const currentUnitValue = field.value || '';
                                  const unitNames = availableUnits.map(getUnitName).filter(Boolean);
                                  const isValidUnit = currentUnitValue && unitNames.includes(currentUnitValue);
                                  
                                  return (
                                    <FormItem className="w-full sm:w-24 shrink-0">
                                      <Select
                                        value={isValidUnit ? currentUnitValue : ''}
                                        onValueChange={field.onChange}
                                        disabled={!product || availableUnits.length === 0}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Unit" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {availableUnits.map((u, idx) => {
                                            const unitName = getUnitName(u);
                                            const unitValue = getUnitValue(u);
                                            if (!unitName) return null;
                                            return (
                                              <SelectItem key={typeof u === 'string' ? u : (u._id || idx)} value={unitValue}>
                                                {unitName}
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem className="w-full sm:w-20 shrink-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Qty"
                                        {...field}
                                        autoComplete="off"
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className="w-full"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {hasVariants && (
                              <FormField
                                control={form.control}
                                name={`items.${index}.variantSelections`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="space-y-2">
                                      {Object.entries(variants).map(([variantKey, variantOptions]) => (
                                        <div key={variantKey} className="flex items-center gap-2 min-w-0">
                                          <label className="text-sm font-medium w-20 capitalize shrink-0">
                                            {variantKey}:
                                          </label>
                                          <Select
                                            value={field.value?.[variantKey] || ''}
                                            onValueChange={(value) => {
                                              const currentSelections = field.value || {};
                                              field.onChange({
                                                ...currentSelections,
                                                [variantKey]: value,
                                              });
                                            }}
                                          >
                                            <SelectTrigger className="flex-1 min-w-0">
                                              <SelectValue placeholder={`Select ${variantKey}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {variantOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                  {option}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      ))}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                            <div className="flex justify-end pt-2 border-t">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  remove(index)
                                  const currentItems = tempItems || [];
                                  setTempItems(currentItems.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Remove Item
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ product: "", quantity: 1, unit: "" })}
              >
                Add Item
              </Button>
            </FormItem>

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Feedback (optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full rounded border px-3 py-2 text-sm"
                      rows={4}
                      placeholder="Add feedback for this order (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    {/* Fullscreen Image Dialog */}
    {imagePreview && (
      <Dialog open={isImageFullscreen} onOpenChange={setIsImageFullscreen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-2 sm:p-4 z-[100] sm:max-w-[95vw]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Fullscreen Order Image</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 hover:bg-background"
              onClick={() => setIsImageFullscreen(false)}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <img
              src={imagePreview || ''}
              alt="Fullscreen preview"
              className="max-w-full max-h-full w-auto h-auto object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
}

function ProductSearchableSelect({ product, onChange }: { product: Partial<Product> | null; onChange: (value: string, productData?: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(product?._id || "");
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSetSearch(search);
  }, [search, debouncedSetSearch]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", { search }],
    queryFn: () => productService.getAll({ search, limit: 20 }),
    enabled: open,
  });

  const products: Product[] = productsData?.data?.products ?? [];
  if (product && !products.find((p) => p._id === product._id)) products.push(product as Product);

  const selectedProduct = products.find((p) => p._id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-0 max-w-full"
        >
          <span className="truncate flex-1 text-left min-w-0">
            {selectedId ? selectedProduct?.name : "Select product..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 flex flex-col max-h-[300px]">
        <Command shouldFilter={false} className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center border-b px-3 shrink-0">
            <CommandInput
              placeholder="Search product..."
              value={search}
              onValueChange={setSearch}
              className="flex-1 border-0"
            />
          </div>
          <CommandEmpty className="py-4">
            {isLoadingProducts ? "Searching..." : "No product found."}
          </CommandEmpty>
          <CommandGroup className="flex-1 overflow-y-auto min-h-0">
            {products.map((p) => (
              <CommandItem
                key={p._id}
                value={p._id}
                onSelect={(p) => {
                  const selectedProduct = products.find(prod => prod._id === p);
                  onChange(p, selectedProduct);
                  setSelectedId(p)
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    product?._id === p._id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>
                </div>
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
