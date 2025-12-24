"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { orderLogService } from "@/services/order-log.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { LogItem } from "@/components/dashboard/logs/log-item";

interface StaffLogsPanelProps {
  staffId: string;
}

export function StaffLogsPanel({ staffId }: StaffLogsPanelProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["staff-logs", staffId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await orderLogService.getLogsByStaff(staffId, 50, pageParam as number);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    refetchInterval: 5000,
    enabled: !!staffId,
  });

  const logs = data?.pages.flatMap((page) => page?.logs || []) || [];
  const totalLogs = data?.pages[0]?.total || logs.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Recent Activity
          </CardTitle>
          <Badge variant="outline" className="text-xs">{totalLogs}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No activity yet
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1.5 pr-2">
              {logs.map((log) => (
                <LogItem key={log._id} log={log} />
              ))}
              {/* Observer target for infinite scroll */}
              <div ref={observerTarget} className="h-4 flex items-center justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {!hasNextPage && logs.length > 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  No more logs to load
                </div>
              )}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

