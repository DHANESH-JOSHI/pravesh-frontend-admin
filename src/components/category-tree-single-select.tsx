"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { Node } from "./category-tree-select";

export function CategoryTreeSingleSelect({
  value,
  action,
}: {
  value: string | null;
  action: (id: string | null, slug?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoryService.getTree(),
    staleTime: 1000 * 60 * 10,
  });

  const tree = data?.data as unknown as Node[] || [];

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelect = useCallback(
    (node: Node) => {
      const hasChildren = node.children && node.children.length > 0;
      if (hasChildren) return;

      if (value === node._id) {
        action(null, undefined);
      } else {
        action(node._id, node.slug);
      }
      setOpen(false);
    },
    [value, action]
  );

  const renderTree = (nodes: Node[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expanded.includes(node._id);
      const isSelected = value === node._id;

      return (
        <div key={node._id} className="select-none">
          <div
            className={cn(
              "flex items-center justify-between rounded hover:bg-accent/60 px-2 py-1.5 text-sm transition",
              !hasChildren && "cursor-pointer",
              isSelected && "bg-accent/30 font-medium"
            )}
            style={{ paddingLeft: `${depth * 16}px` }}
            onClick={() => handleSelect(node)}
          >
            <div className="flex items-center gap-2">
              <Check
                className={cn(
                  "h-4 w-4 transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span
                className={cn(
                  hasChildren ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {node.title}
              </span>
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node._id);
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="border-l border-border ml-4 mt-1">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const selectedCategory = (() => {
    const findSelected = (nodes: Node[]): Node | null => {
      for (const n of nodes) {
        if (n._id === value) return n;
        if (n.children) {
          const found = findSelected(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findSelected(tree);
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between w-full text-sm"
        >
          {selectedCategory ? selectedCategory.title : "Select category.."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 h-[330px] shadow-md rounded min-w-md flex flex-col">
        <ScrollArea className="flex-1 pr-1.5 p-1.5">
          {isLoading ? (
            <p className="text-center text-muted-foreground text-sm py-6">
              Loading categories...
            </p>
          ) : tree.length > 0 ? (
            renderTree(tree)
          ) : (
            <p className="text-center text-muted-foreground text-sm py-6">
              No categories found
            </p>
          )}
        </ScrollArea>
        <div className="flex items-center justify-end border-t px-3 py-1.5 shrink-0 bg-background">
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
