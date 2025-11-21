"use client";

import { useEffect, useState } from "react";
import { Control, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { brandService } from "@/services/brand.service";
import { Check, ChevronsUpDown } from "lucide-react";
import { FormControl } from "@/components/ui/form";

export function BrandSingleSelect({
  control,
  value,
  action,
}: {
  control: Control;
  value: string | null;
  action: (value: string | null) => void;
}) {
  const categoryId = useWatch({ control, name: "categoryId" });
  const [open, setOpen] = useState(false);

  const {
    data: brandData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["brands", categoryId],
    queryFn: () => brandService.getAll({ categoryId }),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  });

  const brands = brandData?.data?.brands || [];

  useEffect(() => {
    if (categoryId) {
      refetch();
    }
  }, [categoryId, refetch]);

  const selectedBrand = brands.find((b) => b._id === value);

  return (
    <FormControl>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={!categoryId}
            className="justify-between w-full text-sm"
          >
            {categoryId
              ? value
                ? selectedBrand?.name || "Select brand..."
                : "Select brand..."
              : "Select category first..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-1.5 h-[330px] shadow-md rounded min-w-md">
          {!categoryId ? (
            <div className="text-center text-muted-foreground text-sm py-6">
              Please select a category first
            </div>
          ) : isLoading || isFetching ? (
            <div className="text-center text-muted-foreground text-sm py-6">
              Loading brands...
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-6">
              No brands found for this category
            </div>
          ) : (
            <ScrollArea className="h-full p-1">
              {brands.map((brand) => (
                <div
                  key={brand._id}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-accent/60 transition",
                    value === brand._id && "bg-accent/40 font-medium"
                  )}
                  onClick={() => {
                    if (value === brand._id) {
                      action(null);
                    } else {
                      action(brand._id);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4 transition-opacity",
                        value === brand._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{brand.name}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
    </FormControl>
  );
}
