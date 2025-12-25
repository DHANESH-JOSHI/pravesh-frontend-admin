"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { orderLogService } from "@/services/order-log.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { LogItem } from "@/components/dashboard/logs/log-item";

export function OrderLogsPanel() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(30);
  const REFETCH_INTERVAL = 30000; // 30 seconds

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["recent-order-logs"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await orderLogService.getAll({
        page: pageParam as number,
        limit: 50,
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.page >= lastPage.totalPages) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    refetchInterval: REFETCH_INTERVAL,
  });

  const logs = data?.pages.flatMap((page) => page?.logs || []) || [];
  const totalLogs = data?.pages[0]?.total || logs.length;

  useEffect(() => {
    if (isLoading) return;
    
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && data) {
      setCountdown(30);
    }
  }, [data, isLoading]);

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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Real-time Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs font-mono">
                    {countdown}s
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Auto-refresh in {countdown} seconds</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="text-xs">{totalLogs}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No activity yet
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)] max-h-[600px] min-h-[400px] w-full">
            <div className="space-y-1.5 pr-2">
              {logs.map((log) => (
                <LogItem key={log._id} log={log} iconSize="sm" padding="sm" />
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

