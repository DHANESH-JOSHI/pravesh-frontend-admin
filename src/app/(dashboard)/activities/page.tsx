"use client";

import { PageHeader } from "@/components/dashboard/common/page-header";
import { OrderLogsPanel } from "@/components/dashboard/order/order-logs-panel";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Users,
  Eye,
  BarChart3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "next-view-transitions";

interface StaffActivity {
  name: string;
  email?: string;
  role: string;
  totalActions: number;
  views: number;
  statusUpdates: number;
  itemUpdates: number;
  listViews: number;
  lastActivity: string | null;
}

interface ActionBreakdown {
  action: string;
  count: number;
  uniqueAdminsCount: number;
}

interface HourlyActivity {
  hour: number;
  count: number;
}

interface DailyActivity {
  date: string;
  count: number;
  views: number;
  updates: number;
}

interface MostViewedOrder {
  orderId: string;
  viewCount: number;
  uniqueViewersCount: number;
  lastViewed: string;
}

interface AllAnalytics {
  staffActivity: StaffActivity[];
  actionBreakdown: ActionBreakdown[];
  hourlyActivity: HourlyActivity[];
  dailyActivity: DailyActivity[];
  mostViewedOrders: MostViewedOrder[];
}

export default function OrderLogsPage() {
  const [days, setDays] = useState("7");
  const [dailyDays, setDailyDays] = useState("30");

  // Single unified API call instead of 5 separate calls
  // Auto-refresh every 30 seconds (analytics don't need real-time updates like activity logs)
  const { data: analytics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["order-logs-analytics", "all", days, dailyDays],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<AllAnalytics>>(
        `/order-logs/analytics/all`,
        { params: { days, dailyDays } }
      );
      return response.data.data;
    },
  });

  // Extract data from unified response
  const staffActivity = analytics?.staffActivity;
  const actionBreakdown = analytics?.actionBreakdown;
  const hourlyActivity = analytics?.hourlyActivity;
  const dailyActivity = analytics?.dailyActivity;
  const mostViewed = analytics?.mostViewedOrders;

  const hourlyChartOption = {
    title: {
      text: "Activity by Hour",
      left: "center",
      textStyle: { fontSize: 14, fontWeight: 600 },
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const param = params[0];
        return `${param.value} actions at ${param.name}:00`;
      },
    },
    xAxis: {
      type: "category",
      data: hourlyActivity?.map((d) => `${d.hour}:00`) || [],
      name: "Hour",
    },
    yAxis: {
      type: "value",
      name: "Actions",
    },
    series: [
      {
        data: hourlyActivity?.map((d) => d.count) || [],
        type: "bar",
        smooth: true,
        itemStyle: {
          color: "#3b82f6",
        },
      },
    ],
    grid: {
      left: "10%",
      right: "10%",
      top: "15%",
      bottom: "10%",
    },
  };

  const actionBreakdownOption = {
    // title: {
    //   text: "Action Distribution",
    //   left: "5%",
    //   top: "2%",
    //   textStyle: { fontSize: 14, fontWeight: 800 },
    //   textAlign: "left",
    //   padding: [0, 0, 15, 0],
    // },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const name = params.name.length > 12
              ? params.name.substring(0, 12) + '...'
              : params.name;
            return `${name}\n${params.percent}%`;
          },
          fontSize: 10,
          lineHeight: 14,
          position: "outside",
          distanceToLabelLine: 5,
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 8,
          smooth: 0.2,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 11,
            fontWeight: "bold",
          },
          scale: true,
          scaleSize: 5,
        },
        data: actionBreakdown?.map((item) => ({
          value: item.count,
          name: item.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        })) || [],
      },
    ],
    grid: {
      left: "5%",
      right: "5%",
      top: "30%",
      bottom: "18%",
    },
  };

  const dailyChartOption = {
    title: {
      text: "Daily Activity",
      left: "center",
      textStyle: { fontSize: 14, fontWeight: 600 },
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Total", "Views", "Updates"],
      bottom: 0,
      textStyle: { fontSize: 10 },
    },
    xAxis: {
      type: "category",
      data: dailyActivity?.map((d) => {
        const date = new Date(d.date);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }) || [],
    },
    yAxis: {
      type: "value",
      name: "Count",
    },
    series: [
      {
        name: "Total",
        type: "line",
        data: dailyActivity?.map((d) => d.count) || [],
        smooth: true,
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "Views",
        type: "line",
        data: dailyActivity?.map((d) => d.views) || [],
        smooth: true,
        itemStyle: { color: "#f59e0b" },
      },
      {
        name: "Updates",
        type: "line",
        data: dailyActivity?.map((d) => d.updates) || [],
        smooth: true,
        itemStyle: { color: "#10b981" },
      },
    ],
    grid: {
      left: "10%",
      right: "10%",
      top: "15%",
      bottom: "20%",
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-3 sm:px-4 lg:px-6 mx-auto w-full max-w-[1800px]">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Order Activity & Analytics"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left Column */}
        <div className="space-y-2">
          <OrderLogsPanel />
          
          {/* Most Viewed Orders */}
          {isLoading ? (
            <Card>
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[300px] w-full">
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : mostViewed && (
            <Card>
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Most Viewed Orders
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {days === "1" ? "24h" : `${days}d`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[300px] w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Order</TableHead>
                          <TableHead className="text-xs text-center">Views</TableHead>
                          <TableHead className="text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mostViewed.length > 0 ? (
                          mostViewed.slice(0, 5).map((order) => (
                            <TableRow key={order.orderId}>
                              <TableCell className="text-xs font-medium">
                                View Details
                              </TableCell>
                              <TableCell className="text-center text-xs font-semibold">
                                {order.viewCount}
                              </TableCell>
                              <TableCell>
                                <Link
                                  href={`/orders/${order.orderId}`}
                                  className="text-primary hover:underline text-xs"
                                >
                                  View →
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-4">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Daily Activity Chart - Only show for periods longer than 1 day */}
          {isLoading && parseInt(dailyDays) > 1 ? (
            <Card>
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <Skeleton className="h-[280px] w-full" />
              </CardContent>
            </Card>
          ) : !isLoading && parseInt(dailyDays) > 1 && (
            <Card>
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Daily Activity Trend
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Daily Trend: {dailyDays === "7" ? "Last 7 days" : dailyDays === "30" ? "Last 30 days" : `Last ${dailyDays} days`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <ReactECharts
                  option={dailyChartOption}
                  style={{ height: "280px", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {/* Time Range Selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Time Range</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Activity Period</label>
                  <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24h</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Daily Trend</label>
                  <Select value={dailyDays} onValueChange={setDailyDays}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Activity Summary */}
          {isLoading ? (
            <Card>
              <CardHeader className="pb-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b">
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-4 w-8 mx-2" />
                        <Skeleton className="h-4 w-8 mx-2" />
                        <Skeleton className="h-4 w-8 mx-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <>
              {staffActivity && staffActivity.length > 0 && (
                <Card>
                  <CardHeader className="pb-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Staff Activity
                      </CardTitle>
                      <span className="text-[10px] text-muted-foreground">
                        {days === "1" ? "24h" : `${days}d`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[400px] w-full">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Staff</TableHead>
                              <TableHead className="text-xs text-center">Total</TableHead>
                              <TableHead className="text-xs text-center">Views</TableHead>
                              <TableHead className="text-xs text-center">Updates</TableHead>
                              <TableHead className="text-xs">Last Activity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {staffActivity.map((staff) => (
                              <TableRow key={staff.name}>
                                <TableCell className="text-xs">
                                  <div>
                                    <div className="font-medium">{staff.name}</div>
                                    {staff.email && (
                                      <div className="text-[10px] text-muted-foreground">{staff.email}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center text-xs font-semibold">
                                  {staff.totalActions}
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  {staff.views + staff.listViews}
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  {staff.statusUpdates + staff.itemUpdates}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {staff.lastActivity
                                    ? formatDistanceToNow(new Date(staff.lastActivity), { addSuffix: true })
                                    : "Never"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Activity by Hour - Only show for short periods */}
              {isLoading && parseInt(days) <= 7 ? (
                <Card>
                  <CardHeader className="pb-1.5">
                    <Skeleton className="h-3 w-32" />
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <Skeleton className="h-[200px] w-full" />
                  </CardContent>
                </Card>
              ) : parseInt(days) <= 7 && hourlyActivity && (
                <Card>
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-xs text-muted-foreground font-normal">
                      Activity by Hour
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <ReactECharts option={hourlyChartOption} style={{ height: "200px" }} />
                  </CardContent>
                </Card>
              )}

              {/* Action Breakdown Chart */}
              {isLoading ? (
                <Card>
                  <CardHeader className="pb-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <Skeleton className="h-[280px] w-full" />
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Action Breakdown
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {days === "1" ? "Last 24h" : `Last ${days} days`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <ReactECharts option={actionBreakdownOption} style={{ height: "280px" }} />
                    {actionBreakdown && actionBreakdown.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Action</TableHead>
                                <TableHead className="text-xs text-center">Count</TableHead>
                                <TableHead className="text-xs text-center">Staff</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {actionBreakdown.map((action) => (
                                <TableRow key={action.action}>
                                  <TableCell className="text-xs capitalize">
                                    {action.action.replace(/_/g, " ")}
                                  </TableCell>
                                  <TableCell className="text-center text-xs font-semibold">
                                    {action.count}
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {action.uniqueAdminsCount}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
