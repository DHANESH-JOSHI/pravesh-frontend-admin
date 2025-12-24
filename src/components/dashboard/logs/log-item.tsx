"use client";

import { Clock, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getActionConfig, formatLogMessage } from "@/lib/log-utils";

interface LogItemProps {
  log: any;
  showAdminName?: boolean;
  currentOrderId?: string;
  iconSize?: "sm" | "md";
  padding?: "sm" | "md";
}

export function LogItem({ 
  log, 
  showAdminName = true, 
  currentOrderId,
  iconSize = "md",
  padding = "md"
}: LogItemProps) {
  const actionConfig = getActionConfig(log.action);
  const ActionIcon = actionConfig.icon;
  const iconClass = iconSize === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const paddingClass = padding === "sm" ? "p-2" : "p-2.5";
  const gapClass = padding === "sm" ? "gap-2" : "gap-2.5";

  return (
    <TooltipProvider>
      <div className={`group relative ${paddingClass} rounded-md border border-border/50 bg-card hover:bg-accent/30 hover:border-accent transition-all`}>
        <div className={`flex items-center ${gapClass}`}>
          <div className={`mt-0.5 p-1.5 rounded-md ${actionConfig.color} shrink-0`}>
            <ActionIcon className={iconClass} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 sm:flex-nowrap gap-1.5">
              <p className="text-xs text-foreground leading-relaxed sm:whitespace-nowrap sm:flex-1 sm:min-w-0 sm:overflow-hidden sm:text-ellipsis">
                {formatLogMessage(log, { showAdminName, currentOrderId })}
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
}

