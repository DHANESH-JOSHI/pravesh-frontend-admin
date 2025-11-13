"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, ImageIcon, Loader2, Trash } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  AdminUpdateOrder,
  type Order,
  adminUpdateOrderSchema,
  orderStatusSchema,
} from "@/types/order";
import { FormDialogProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      status: initialData?.status,
      items: initialData?.items?.map((item) => ({
        product: (item.product as Product)._id,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  });
  useEffect(() => {
    if (open) {
      form.reset()
      setTempItems(initialData?.items || []);
    }
  }, [open, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Order
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orderStatusSchema.options.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {initialData?.isCustomOrder && <FormItem className="space-y-2">
              <FormLabel>Image</FormLabel>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
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
              <Card className="w-full shadow-sm">
                <CardContent className="p-4">
                  {fields.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No items</div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.product`}
                            render={() => (
                              <FormItem className="flex flex-col grow">
                                <ProductSearchableSelect
                                  product={tempItems?.[index]?.product as Product ?? null}
                                  onChange={(v) => {
                                    form.setValue(`items.${index}.product`, v);
                                  }}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              remove(index)
                              setTempItems(tempItems?.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ product: "", quantity: 1, price: 0 })}
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
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      rows={4}
                      placeholder="Add feedback for this order (optional)"
                    />
                  </FormControl>
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
              <Button type="submit">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProductSearchableSelect({ product, onChange }: { product: Partial<Product> | null; onChange: (value: string) => void }) {
  console.log({ product })
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
          className="w-full justify-between"
        >
          {selectedId ? selectedProduct?.name : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search product..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoadingProducts ? "Searching..." : "No product found."}
          </CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-48">
              {products.map((p) => (
                <CommandItem
                  key={p._id}
                  value={p._id}
                  onSelect={(p) => {
                    onChange(p);
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
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
