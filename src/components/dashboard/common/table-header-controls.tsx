"use client";

import { Plus, Search } from "lucide-react";
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
    onRefresh: () => void;
    onCreate?: () => void;
    searchTerm: string;
    onSearch: (v: string) => void;
    searchPlaceholder: string;
    pageSize?: number;
    onChangePageSize?: (v: string) => void;
};

export function TableHeaderControls({
    title,
    count,
    countNoun,
    isFetching,
    onRefresh,
    onCreate,
    searchTerm,
    onSearch,
    searchPlaceholder,
    pageSize,
    onChangePageSize,
}: Props) {
    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="flex items-center gap-2">
                    <RefreshButton spinning={isFetching} onClick={onRefresh} />
                    {onCreate && (
                        <Button
                            onClick={onCreate}
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
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Badge variant="secondary" className="text-sm">
                    {count} {countNoun}
                    {count !== 1 ? "s" : ""}
                </Badge>
                {pageSize && onChangePageSize && (
                    <div className="ml-auto flex items-center gap-2">
                        <PageSizeSelect value={pageSize} onChange={onChangePageSize} />
                    </div>
                )}
            </div>
        </>
    );
}

export default TableHeaderControls;
