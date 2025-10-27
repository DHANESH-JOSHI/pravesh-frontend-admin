import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Props = {
    page: number;
    totalPages: number;
    isFetching?: boolean;
    onPrev: () => void;
    onNext: () => void;
    onPageChange?: (page: number) => void;
};

export function PaginationControls({
    page,
    totalPages,
    isFetching,
    onPrev,
    onNext,
    onPageChange,
}: Props) {
    const tp = Math.max(1, totalPages);

    function getItems() {
        if (tp <= 5) {
            return Array.from({ length: tp }, (_, i) => i + 1) as Array<number | "ellipsis">;
        }
        if (page <= 3) {
            return [1, 2, 3, "ellipsis"] as Array<number | "ellipsis">;
        }
        if (page >= tp - 2) {
            return ["ellipsis", tp - 2, tp - 1, tp] as Array<number | "ellipsis">;
        }
        return ["ellipsis", page - 1, page, page + 1, "ellipsis"] as Array<number | "ellipsis">;
    }

    const items = getItems();
    return (
        <div className="mt-6 flex items-center justify-center">
            <span className="sr-only">Page {page} of {tp}</span>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={onPrev}
                            aria-disabled={page <= 1 || !!isFetching}
                        >
                            Previous
                        </PaginationPrevious>
                    </PaginationItem>
                    {items.map((it, idx) => (
                        <PaginationItem key={`${it}-${idx}`}>
                            {it === "ellipsis" ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={it === page}
                                    aria-current={it === page ? "page" : undefined}
                                    aria-disabled={!!isFetching || it === page || !onPageChange}
                                    onClick={() => onPageChange && onPageChange(it)}
                                >
                                    {it}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            onClick={onNext}
                            aria-disabled={page >= tp || !!isFetching}
                        >
                            Next
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
