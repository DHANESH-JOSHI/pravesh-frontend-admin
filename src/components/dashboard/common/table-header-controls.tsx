"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { RefreshButton } from "@/components/dashboard/common/refresh-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageSizeSelect from "@/components/dashboard/common/page-size-select";
type Props = {
  title?: string;
  count: number;
  countNoun: string;
  isFetching: boolean;
  onRefreshAction: () => void;
  onCreateAction?: () => void;
  searchTerm: string;
  onSearchAction: (v: string) => void;
  searchPlaceholder: string;
  pageSize?: number;
  onChangePageSizeAction?: (v: string) => void;
};

export function TableHeaderControls({
  title,
  count,
  countNoun,
  isFetching,
  onRefreshAction,
  onCreateAction,
  searchTerm,
  onSearchAction,
  searchPlaceholder,
  pageSize,
  onChangePageSizeAction,
}: Props) {
  const [inputValue, setInputValue] = useState(searchTerm);
  const debouncedOnSearch = useDebouncedCallback(onSearchAction, 300);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedOnSearch(value);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <RefreshButton spinning={isFetching} onClick={onRefreshAction} />
          {onCreateAction && (
            <Button
              onClick={onCreateAction}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create {countNoun.charAt(0).toUpperCase() + countNoun.slice(1)}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-sm">
          {count} {countNoun.endsWith("y") && count !== 1 ? countNoun.slice(0, -1) : countNoun}
          {count !== 1 ? countNoun.endsWith("s") ? "es" : countNoun.endsWith("h") ? "es" : countNoun.endsWith("y") ? "ies" : countNoun.endsWith("i") ? "es" : "s" : ""}
        </Badge>
        {pageSize && onChangePageSizeAction && (
          <div className="ml-auto flex items-center gap-2">
            <PageSizeSelect value={pageSize} action={onChangePageSizeAction} />
          </div>
        )}
      </div>
    </>
  );
}

export default TableHeaderControls;
