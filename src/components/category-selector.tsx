'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { categoryService } from '@/services/category.service';
import { ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  title: string;
}

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  /** If brand is selected, this is brand.category._id */
  initialCategoryId: string | null;
  /** Optional brand name for better UX */
  brandName?: string;
}

/**
 * 🧩 CategorySelector — Modern + Brand-Aware Version (No animation)
 */
export function CategorySelector({
  value,
  onChange,
  initialCategoryId,
}: CategorySelectorProps) {
  const [levels, setLevels] = useState<{ parentId: string | null; selected?: Category }[]>([
    { parentId: initialCategoryId },
  ]);

  const currentParentId = levels[levels.length - 1]?.parentId ?? null;

  /** Fetch categories for the current parent */
  const { data: categories = [], isFetching } = useQuery({
    queryKey: ['categories', 'children', currentParentId ?? 'root'],
    queryFn: async () => {
      let categories;
      if (currentParentId) {
        const res = await categoryService.getChilds(currentParentId);
        categories = res.data || [];
      } else {
        const res = await categoryService.getAll({ isParent: true });
        categories = res.data?.categories || [];
      }
      if (categories.length == 0) {
        onChange(currentParentId!)
        setLevels([{ parentId: currentParentId }])
      }
      return categories;
    },
    staleTime: 1000 * 60 * 5,
  });

  /** 🧭 If brand is selected, fetch its base category info */
  useEffect(() => {
    setLevels([{ parentId: initialCategoryId }]);
  }, [initialCategoryId]);

  /** Handle selection */
  const handleSelect = async (category: Category, levelIndex: number) => {
    const res = await categoryService.getChilds(category._id);
    const children = res.data || [];

    // Update current selection
    setLevels((prev) => {
      const newLevels = [...prev];
      newLevels[levelIndex] = { ...newLevels[levelIndex], selected: category };
      return newLevels;
    });

    if (children.length > 0) {
      setLevels((prev) => [
        ...prev.slice(0, levelIndex + 1),
        { parentId: category._id },
      ]);
    } else {
      onChange(category._id);
      setLevels((prev) => prev.slice(0, levelIndex + 1));
    }
  };

  /** Breadcrumb click */
  const goBackToLevel = (index: number) => {
    setLevels((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className="space-y-4">
      {/* 🧭 Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {/* If brand base category exists */}
          {currentParentId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => setLevels([{ parentId: currentParentId }])}
                  className="cursor-pointer font-semibold text-foreground"
                >
                  {value}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {/* Only show separator if we have more levels */}
              {levels.some((l) => l.selected) && <BreadcrumbSeparator />}
            </>
          )}

          {/* For each selected category */}
          {levels
            .map((l) => l.selected)
            .filter(Boolean)
            .map((cat, i, arr) => (
              <React.Fragment key={cat!._id}>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => goBackToLevel(i)}
                    className={cn(
                      "cursor-pointer hover:underline transition-colors",
                      i === arr.length - 1 && "text-foreground font-semibold"
                    )}
                  >
                    {cat!.title}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* Separator between items */}
                {i < arr.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* 🧩 Category Grid */}
      <div className="w-full rounded-xl border bg-card shadow-sm p-4">
        {isFetching ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Card
                key={cat._id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:bg-muted/50 border-muted hover:border-primary/50",
                  value === cat._id && "border-primary bg-primary/5"
                )}
                onClick={() => handleSelect(cat, levels.length - 1)}
              >
                <CardContent className="flex items-center justify-between py-2 px-3">
                  <span className="text-sm font-medium truncate">{cat.title}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">
            No subcategories
          </p>
        )}
      </div>
    </div>
  );
}
