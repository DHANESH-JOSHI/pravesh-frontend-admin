"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { orderLogService } from "@/services/order-log.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, FileText, Eye, List, Edit, CheckCircle, Package, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Link } from "next-view-transitions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { useEffect, useRef } from "react";

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

  const getActionConfig = (action: string) => {
    const configs: Record<string, { color: string; icon: typeof Eye; label: string }> = {
      status_update: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", icon: CheckCircle, label: "Status" },
      items_updated: { color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300", icon: Package, label: "Items" },
      feedback_updated: { color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", icon: Edit, label: "Feedback" },
      view: { color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", icon: Eye, label: "Viewed" },
      view_list: { color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300", icon: List, label: "List View" },
    };
    return configs[action] || { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: FileText, label: action.replace(/_/g, " ") };
  };

  const HighlightText = ({ text }: { text: string }) => {
    // Order statuses to highlight
    const statuses = [
      'received',
      'approved',
      'cancelled',
      'confirmed',
      'shipped',
      'out for delivery',
      'out_for_delivery',
      'delivered',
      'refunded'
    ];
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Create regex patterns for each status (handle both spaces and underscores)
    const patterns = statuses.map(status => {
      // Escape special regex characters and replace spaces/underscores with flexible matching
      const escaped = status.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return escaped.replace(/[\s_]+/g, '[\\s_]+');
    });

    const regex = new RegExp(`\\b(${patterns.join('|')})\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add highlighted status
      parts.push(
        <span key={`highlight-${keyCounter++}`} className="font-semibold text-foreground">
          {match[0]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return <>{parts.length > 0 ? parts : text}</>;
  };

  const formatMessage = (log: any) => {
    const adminName = typeof log.admin === "object" ? log.admin?.name : "Unknown";
    const adminId = typeof log.admin === "object" ? log.admin?._id : log.admin;
    const orderId = typeof log.order === "object" ? log.order?._id : log.order;
    const orderRef = orderId ? String(orderId).slice(-8) : null;

    const OrderLink = ({ id }: { id: string }) => (
      <Link
        href={`/orders/${id}`}
        className="underline text-primary hover:text-primary/80 font-medium font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        #{id.slice(-8)}
      </Link>
    );

    switch (log.action) {
      case "status_update":
        if (log.oldValue && log.newValue) {
          return (
            <>
              <HighlightText text="Changed status from" /> {String(log.oldValue).replace(/_/g, " ")} to {String(log.newValue).replace(/_/g, " ")}
              {orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(orderId)} /></>}
            </>
          );
        }
        return (
          <>
            <HighlightText text="Updated order status" />{orderRef && <> <OrderLink id={String(orderId)} /></>}
          </>
        );
      
      case "view":
        return (
          <>
            <HighlightText text="Viewed order" /> {orderRef ? <OrderLink id={String(orderId)} /> : ""}
          </>
        );
      
      case "view_list":
        const query = log.metadata?.query;
        if (query?.status) {
          return (
            <>
              <HighlightText text="Viewed orders filtered by" /> {String(query.status).replace(/_/g, " ")}
            </>
          );
        }
        if (query?.user) {
          return (
            <>
              <HighlightText text="Searched orders" /> for "{query.user}"
            </>
          );
        }
        return (
          <>
            <HighlightText text="Viewed all orders" />
          </>
        );
      
      case "items_updated":
        if (log.field) {
          return (
            <>
              <HighlightText text="Updated" /> {log.field}{orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(orderId)} /></>}
            </>
          );
        }
        return (
          <>
            <HighlightText text="Updated order items" />{orderRef && <> <OrderLink id={String(orderId)} /></>}
          </>
        );
      
      case "feedback_updated":
        return (
          <>
            <HighlightText text="Updated feedback" />{orderRef && <> for <HighlightText text="order" /> <OrderLink id={String(orderId)} /></>}
          </>
        );
      
      default:
        const defaultText = log.description || `${log.action.replace(/_/g, " ")}${orderRef ? ` order #${orderRef}` : ""}`;
        return (
          <>
            <HighlightText text={defaultText} />{orderRef && <> <OrderLink id={String(orderId)} /></>}
          </>
        );
    }
  };

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
              {logs.map((log) => {
                const actionConfig = getActionConfig(log.action);
                const ActionIcon = actionConfig.icon;
                const orderId = typeof log.order === "object" ? log.order?._id : log.order;

                return (
                  <TooltipProvider key={log._id}>
                    <div className="group relative p-2.5 rounded-md border border-border/50 bg-card hover:bg-accent/30 hover:border-accent transition-all">
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1.5 rounded-md ${actionConfig.color} shrink-0`}>
                          <ActionIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 sm:flex-nowrap gap-1.5">
                            <p className="text-xs text-foreground leading-relaxed sm:whitespace-nowrap sm:flex-1 sm:min-w-0 sm:overflow-hidden sm:text-ellipsis">
                              {formatMessage(log)}
                              {log.metadata?.cached && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 ml-1.5 text-amber-600 dark:text-amber-400">
                                      <Database className="w-3 h-3" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Data served from cache</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:shrink-0 sm:mt-0">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                );
              })}
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

