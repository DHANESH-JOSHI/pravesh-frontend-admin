"use client";

import { useQuery } from "@tanstack/react-query";
import { orderLogService, UserLogAnalytics } from "@/services/order-log.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Eye,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle,
  Package,
  Edit,
  List,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Link } from "next-view-transitions";

interface StaffLogsAnalyticsProps {
  staffId: string;
}

export function StaffLogsAnalytics({ staffId }: StaffLogsAnalyticsProps) {
  const [days, setDays] = useState("30");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["user-log-analytics", staffId, days],
    queryFn: async () => {
      const response = await orderLogService.getUserLogAnalytics(staffId, parseInt(days));
      return response.data;
    },
    enabled: !!staffId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No analytics data available
        </CardContent>
      </Card>
    );
  }

  const actionBreakdownChart = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "hsl(var(--background))",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: analytics.actionBreakdown.map((item) => ({
          value: item.count,
          name: item.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        })),
      },
    ],
  };

  const dailyActivityChart = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["Total Actions", "Views", "Updates"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: analytics.dailyActivity.map((d) => d.date),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Total Actions",
        type: "line",
        smooth: true,
        data: analytics.dailyActivity.map((d) => d.count),
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "Views",
        type: "line",
        smooth: true,
        data: analytics.dailyActivity.map((d) => d.views),
        itemStyle: { color: "#10b981" },
      },
      {
        name: "Updates",
        type: "line",
        smooth: true,
        data: analytics.dailyActivity.map((d) => d.updates),
        itemStyle: { color: "#f59e0b" },
      },
    ],
  };

  const hourlyActivityChart = {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: analytics.hourlyActivity.map((h) => `${h.hour}:00`),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        data: analytics.hourlyActivity.map((h) => h.count),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#8b5cf6" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{analytics.summary.totalActions}</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-2xl font-bold">{analytics.summary.views}</p>
              </div>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status Updates</p>
                <p className="text-2xl font-bold">{analytics.summary.statusUpdates}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Item Updates</p>
                <p className="text-2xl font-bold">{analytics.summary.itemUpdates}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Feedback Updates</p>
                <p className="text-2xl font-bold">{analytics.summary.feedbackUpdates}</p>
              </div>
              <Edit className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">List Views</p>
                <p className="text-2xl font-bold">{analytics.summary.listViews}</p>
              </div>
              <List className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Analytics
            </CardTitle>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Action Breakdown</h3>
            <ReactECharts
              option={actionBreakdownChart}
              style={{ height: "300px" }}
              opts={{ renderer: "svg" }}
            />
          </div>

          {/* Daily Activity */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Daily Activity</h3>
            <ReactECharts
              option={dailyActivityChart}
              style={{ height: "300px" }}
              opts={{ renderer: "svg" }}
            />
          </div>

          {/* Hourly Activity */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Hourly Activity Pattern</h3>
            <ReactECharts
              option={hourlyActivityChart}
              style={{ height: "300px" }}
              opts={{ renderer: "svg" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Most Viewed Orders */}
      {analytics.mostViewedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Most Viewed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>View Count</TableHead>
                    <TableHead>Last Viewed</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.mostViewedOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-sm">
                        #{String(order.orderId).slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.viewCount}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.lastViewed), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/orders/${order.orderId}`}>
                          <button className="text-primary hover:underline text-sm">
                            View
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

