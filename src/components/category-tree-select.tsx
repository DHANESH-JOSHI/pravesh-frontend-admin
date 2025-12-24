"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";


export type Node = {
  _id: string;
  title: string;
  slug: string;
  children: Node[];
};

export function CategoryTreeSelect({
  value,
  action,
}: {
  value: string[];
  action: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoryService.getTree(),
    staleTime: 1000 * 60 * 10,
  });

  const tree = data?.data as unknown as Node[] || [];

  const collectDescendantIds = useCallback((node: Node): string[] => {
    if (!node.children || node.children.length === 0) return [];
    return node.children.flatMap((c: Node) => [c._id, ...collectDescendantIds(c)]);
  }, []);

  const collectLeafIds = useCallback((node: Node): string[] => {
    if (!node.children || node.children.length === 0) return [node._id];
    return node.children.flatMap((c: Node) => collectLeafIds(c));
  }, []);

  const normalizeSelection = useCallback((selected: string[], nodes: Node[]) => {
    const selectedSet = new Set(selected);

    const visit = (n: Node): boolean => {
      if (!n.children || n.children.length === 0) {
        return selectedSet.has(n._id);
      }

      const childrenSelectedFlags = n.children.map((ch: Node) => visit(ch));
      if (childrenSelectedFlags.every(Boolean)) {
        const leafIds = collectLeafIds(n);
        leafIds.forEach((id) => selectedSet.delete(id));
        selectedSet.add(n._id);
        return true;
      }

      if (selectedSet.has(n._id)) {
        const leafIds = collectLeafIds(n);
        leafIds.forEach((id) => selectedSet.delete(id));
        return true;
      }

      return false;
    };

    // visit every root node
    nodes.forEach((root) => visit(root));

    return Array.from(selectedSet);
  }, [collectLeafIds]);

  // --------------------
  // Utility: find parent node given child id (search)
  // --------------------
  const findParent = useCallback((nodes: Node[], childId: string): Node | null => {
    for (const node of nodes) {
      if (node.children && node.children.some((c: Node) => c._id === childId)) {
        return node;
      }
      if (node.children) {
        const nested = findParent(node.children, childId);
        if (nested) return nested;
      }
    }
    return null;
  }, []);

  const toggleSelect = useCallback(
    (node: Node, parent: Node | null = null) => {
      const isSelected = value.includes(node._id);
      const parentNode = parent || findParent(tree, node._id);
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        if (isSelected) {
          const descendantIds = collectDescendantIds(node);
          const newVal = value.filter(
            (id) => id !== node._id && !descendantIds.includes(id)
          );
          action(normalizeSelection(newVal, tree));
        } else {
          const descendantIds = collectDescendantIds(node);
          const newVal = [
            ...value.filter((id) => !descendantIds.includes(id)),
            node._id,
          ];
          action(normalizeSelection(newVal, tree));
        }
        return;
      }

      if (isSelected) {
        const newVal = value.filter((id) => id !== node._id);
        action(normalizeSelection(newVal, tree));
        return;
      }

      if (parentNode && value.includes(parentNode._id)) {
        const siblings = parentNode.children || [];
        const remainingSiblings = siblings
          .filter((s: Node) => s._id !== node._id)
          .flatMap((s: Node) => collectLeafIds(s));

        const newVal = [
          ...value.filter((id) => id !== parentNode._id),
          ...remainingSiblings,
        ];

        action(normalizeSelection(Array.from(new Set(newVal)), tree));
        return;
      }

      const newVal = [...value, node._id];
      action(normalizeSelection(newVal, tree));
    },
    [value, tree, action, findParent, collectDescendantIds, collectLeafIds, normalizeSelection]
  );



  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isVisuallySelected = useCallback((node: Node) => {
    if (value.includes(node._id)) return true;
    const walker = (nodes: Node[]): boolean => {
      for (const n of nodes) {
        if (value.includes(n._id)) {
          const leaves = collectLeafIds(n);
          if (leaves.includes(node._id)) return true;
        }
        if (n.children && walker(n.children)) return true;
      }
      return false;
    };
    return walker(tree);
  }, [value, tree, collectLeafIds]);

  const renderTree = (nodes: Node[], parent: Node | null = null, depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expanded.includes(node._id);
      const visuallySelected = isVisuallySelected(node);

      return (
        <div key={node._id} className="select-none">
          <div
            className={cn(
              "flex items-center justify-between rounded hover:bg-accent/60 px-2 py-1.5 text-sm transition",
              visuallySelected && "bg-accent/30"
            )}
          >
            <div
              className="flex items-center gap-2 flex-1"
              style={{ paddingLeft: `${depth * 16}px` }}
            >
              <Checkbox
                checked={visuallySelected}
                onCheckedChange={() => toggleSelect(node, parent)}
                className="h-4 w-4"
              />
              <span
                onClick={() => toggleSelect(node, parent)}
                className="cursor-pointer select-none"
              >
                {node.title}
              </span>
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleExpand(node._id)}
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
              {renderTree(node.children, node, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between w-full text-sm"
        >
          {value.length > 0
            ? `${value.length} categor${value.length === 1 ? "y" : "ies"} selected`
            : "Select categories..."}
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
