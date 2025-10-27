"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export type TableLoadingRowsProps = {
    rows?: number;
    columns: string[];
};

export function TableLoadingRows({ rows = 6, columns }: TableLoadingRowsProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, idx) => (
                <TableRow key={idx}>
                    {columns.map((cls, cIdx) => (
                        <TableCell key={cIdx}>
                            <Skeleton className={cls} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

export default TableLoadingRows;
