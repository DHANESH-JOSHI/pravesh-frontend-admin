'use client';
import * as echarts from "echarts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ReactECharts from "echarts-for-react";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/common/page-header';
import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/axios';
import { ApiResponse } from '@/types';
import Loader from '@/components/ui/loader';
import * as React from 'react';
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/auth';
import { useTransitionRouter } from 'next-view-transitions';

interface IDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;

  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  dailyOrdersCount: number;
  dailyUsersCount: number;

  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  outOfStockProducts: number;
  lowStockProductsCount: number;
  newProductsThisMonth: number;

  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    salesCount: number;
    reviewCount: number;
    rating: number;
  }>;

  trendingProducts: Array<{
    _id: string;
    name: string;
    salesCount: number;
    totalSold: number;
    reviewCount: number;
    rating: number;
  }>;
  topCategories: Array<{
    _id: string;
    name: string;
    totalSold: number;
  }>;
  monthlyOrders: Array<{
    month: string;
    orders: number;
  }>;
  orderStatusStats: { [key: string]: number };

  // totalReviews: number;
  // averageRating: number;
  // totalWishlistItems: number;
  // totalCartItems: number;
  // totalBlogs: number;
  // publishedBlogs: number;
  // activeUsers: number;
}

const PIE_COLORS = [
  'oklch(0.5583 0.1276 42.9956)',
  'oklch(0.6898 0.1581 290.4107)',
  'oklch(0.8816 0.0276 93.1280)',
  'oklch(0.8822 0.0403 298.1792)',
  'oklch(0.5608 0.1348 42.0584)',
];

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  const router = useTransitionRouter();
  
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<IDashboardStats>>(
        `/dashboard/stats`,
      );
      return response.data.data;
    },
  });

  React.useEffect(() => {
    if (!authLoading && user?.role === "staff") {
      router.replace("/orders");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loader text="Loading..." />;
  }

  if (user?.role === "staff") {
    return null;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-4 text-sm text-destructive shadow-sm">
          Error: {(error as any).message}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const FALLBACK_TRENDING_PRODUCTS = [
    { _id: '1', name: 'Wireless Headphones', salesCount: 245, totalSold: 320, reviewCount: 45, rating: 4.5 },
    { _id: '2', name: 'Smart Watch Pro', salesCount: 189, totalSold: 250, reviewCount: 38, rating: 4.3 },
    { _id: '3', name: 'Laptop Stand', salesCount: 156, totalSold: 200, reviewCount: 32, rating: 4.2 },
    { _id: '4', name: 'USB-C Cable', salesCount: 142, totalSold: 180, reviewCount: 28, rating: 4.0 },
    { _id: '5', name: 'Mechanical Keyboard', salesCount: 128, totalSold: 165, reviewCount: 25, rating: 4.4 },
    { _id: '6', name: 'Mouse Pad XL', salesCount: 115, totalSold: 150, reviewCount: 22, rating: 3.9 },
    { _id: '7', name: 'Webcam HD', salesCount: 98, totalSold: 130, reviewCount: 20, rating: 4.1 },
    { _id: '8', name: 'Monitor Stand', salesCount: 87, totalSold: 110, reviewCount: 18, rating: 3.8 },
  ];

  const FALLBACK_TOP_PRODUCTS = [
    { _id: '1', name: 'Wireless Headphones', totalSold: 320, salesCount: 245, reviewCount: 45, rating: 4.5 },
    { _id: '2', name: 'Smart Watch Pro', totalSold: 250, salesCount: 189, reviewCount: 38, rating: 4.3 },
    { _id: '3', name: 'Laptop Stand', totalSold: 200, salesCount: 156, reviewCount: 32, rating: 4.2 },
    { _id: '4', name: 'USB-C Cable', totalSold: 180, salesCount: 142, reviewCount: 28, rating: 4.0 },
    { _id: '5', name: 'Mechanical Keyboard', totalSold: 165, salesCount: 128, reviewCount: 25, rating: 4.4 },
    { _id: '6', name: 'Mouse Pad XL', totalSold: 150, salesCount: 115, reviewCount: 22, rating: 3.9 },
    { _id: '7', name: 'Webcam HD', totalSold: 130, salesCount: 98, reviewCount: 20, rating: 4.1 },
    { _id: '8', name: 'Monitor Stand', totalSold: 110, salesCount: 87, reviewCount: 18, rating: 3.8 },
    { _id: '9', name: 'Desk Organizer', totalSold: 95, salesCount: 75, reviewCount: 15, rating: 3.7 },
    { _id: '10', name: 'Cable Management', totalSold: 85, salesCount: 68, reviewCount: 12, rating: 3.6 },
  ];

  const FALLBACK_RECENT_ORDERS = [
    { _id: '1', user: { name: 'John Doe', email: 'john@example.com' }, status: 'DELIVERED', createdAt: '2024-01-15' },
    { _id: '2', user: { name: 'Jane Smith', email: 'jane@example.com' }, status: 'CONFIRMED', createdAt: '2024-01-14' },
    { _id: '3', user: { name: 'Bob Johnson', email: 'bob@example.com' }, status: 'PROCESSING', createdAt: '2024-01-13' },
    { _id: '4', user: { name: 'Alice Brown', email: 'alice@example.com' }, status: 'SHIPPED', createdAt: '2024-01-12' },
    { _id: '5', user: { name: 'Charlie Wilson', email: 'charlie@example.com' }, status: 'RECEIVED', createdAt: '2024-01-11' },
    { _id: '6', user: { name: 'Diana Lee', email: 'diana@example.com' }, status: 'DELIVERED', createdAt: '2024-01-10' },
  ];

  const FALLBACK_MONTHLY_ORDERS = [
    { month: '2024-01', orders: 45 },
    { month: '2024-02', orders: 52 },
    { month: '2024-03', orders: 38 },
    { month: '2024-04', orders: 61 },
    { month: '2024-05', orders: 48 },
    { month: '2024-06', orders: 55 },
    { month: '2024-07', orders: 42 },
    { month: '2024-08', orders: 58 },
    { month: '2024-09', orders: 49 },
    { month: '2024-10', orders: 53 },
    { month: '2024-11', orders: 47 },
    { month: '2024-12', orders: 51 },
  ];
  // ===== END FALLBACK DATA =====

  const orderStatusData = Object.entries(stats.orderStatusStats || {}).map(
    ([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
    }),
  );

  // Use fallback data if real data is empty (for testing)
  // Backend returns 10 items for each, use all of them
  const recentOrders = ((stats.recentOrders || []).length > 0 ? stats.recentOrders : FALLBACK_RECENT_ORDERS).slice(0, 10);
  const topProducts = ((stats.topProducts || []).length > 0 ? stats.topProducts : FALLBACK_TOP_PRODUCTS).slice(0, 10);
  const trendingProducts = ((stats.trendingProducts || []).length > 0 ? stats.trendingProducts : FALLBACK_TRENDING_PRODUCTS).slice(0, 10);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthlyOrdersData = (stats.monthlyOrders || []).length > 0 ? stats.monthlyOrders : FALLBACK_MONTHLY_ORDERS;
  const parsedData = monthlyOrdersData.map((item) => {
    if (!item || !item.month) return null;
    const [yearStr, monthStr] = item.month.split("-");

    const year = Number(yearStr);
    const monthIndex = Number(monthStr);

    if (isNaN(year) || isNaN(monthIndex)) return null;

    return {
      label: `${monthNames[monthIndex - 1]} ${year}`,
      month: monthIndex,
      year: year,
      orders: item.orders || 0,
    };
  }).filter(Boolean) as Array<{ label: string; month: number; year: number; orders: number }>;


  const latestYear = parsedData.length > 0 ? parsedData[0]?.year : new Date().getFullYear();

  const formattedOrdersData = Array.from({ length: 12 }, (_, i) => {
    const existing = parsedData.find(
      (d) => d.month === i + 1 && d.year === latestYear
    );

    return {
      month: monthNames[i].slice(0, 3),
      orders: existing?.orders || 0,
      fullLabel: `${monthNames[i]} ${latestYear}`,
    };
  });



  return (
    <div className="min-h-screen bg-background p-4 sm:px-6 sm:py-6 lg:px-8 overflow-x-hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 lg:gap-8 w-full">
        {/* Page header */}
        <header className="flex flex-col gap-2">
          <PageHeader title="Dashboard" />
          <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">
            A calm overview of your store performance. See orders and
            customers at a glance.
          </p>
        </header>

        {/* Primary KPI row */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 xl:grid-cols-3">
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            tone="emerald"
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={stats.totalUsers.toLocaleString()}
            tone="violet"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts.toLocaleString()}
            tone="amber"
          />
        </section>

        {/* Secondary KPIs (spacious row of 2) */}
        <section className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MiniMetricCard
            label="Daily Orders"
            value={stats.dailyOrdersCount.toString()}
            helper="Orders today"
            color="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            icon={ShoppingCart}
          />
          <MiniMetricCard
            label="Daily Users"
            value={stats.dailyUsersCount.toString()}
            helper="Users today"
            color="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
            icon={Users}
          />
          <MiniMetricCard
            label="New Users This Month"
            value={stats.newUsersThisMonth.toString()}
            helper="Customers added"
            color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          />
          <MiniMetricCard
            label="New Products This Month"
            value={stats.newProductsThisMonth.toString()}
            helper="Products added"
            color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
            icon={TrendingUp}
          />
        </section>


        <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm flex flex-col justify-between overflow-hidden">
          <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-0">Monthly Orders</h2>

          <div className="h-52 sm:h-60 lg:h-68 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedOrdersData}
                margin={{ 
                  top: isMobile ? 10 : 20, 
                  right: isMobile ? 10 : 20, 
                  left: isMobile ? 10 : 20, 
                  bottom: isMobile ? 15 : 20 
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={isMobile ? -60 : -45}
                  textAnchor="end"
                  height={isMobile ? 45 : 35}
                  tick={{ fontSize: isMobile ? 8 : 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={isMobile ? 25 : 30}
                  tick={{ fontSize: isMobile ? 8 : 9, fill: "hsl(var(--muted-foreground))" }}
                  domain={['dataMin', 'auto']}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  formatter={(value: any) => {
                    const orderValue = value === null || value === undefined || isNaN(Number(value)) ? 0 : Number(value);
                    return [`${orderValue.toLocaleString()}`, "Orders"];
                  }}
                  labelFormatter={(label, payload) => {
                    if (!payload?.[0]) return label;
                    const monthData = payload[0].payload;
                    return monthData.fullLabel || monthData.month;
                  }}
                  contentStyle={{
                    borderRadius: 10,
                    borderColor: "hsl(var(--border))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  radius={[8, 8, 0, 0]}
                  fill="#3b82f6"
                  animationDuration={700}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
        <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 xl:grid-cols-2">



          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-2 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Order Status Distribution</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Distribution of order fulfillment</p>
            </div>

            <div className="w-full overflow-hidden">
              <ReactECharts
                style={{ height: "250px", width: "100%", minHeight: "250px" }}
                className="h-[250px]! sm:h-[280px]! lg:h-[310px]!"
                option={{
                  tooltip: { trigger: "item" },
                  legend: {
                    bottom: 5,
                    left: "center",
                    textStyle: { color: "var(--muted-foreground)", fontSize: 9 },
                    itemWidth: 10,
                    itemHeight: 6,
                    itemGap: 8,
                  },
                series: [
                  {
                    type: "pie",
                    radius: ["40%", "70%"],
                    center: ["50%", "45%"],
                    avoidLabelOverlap: true,
                    itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
                    label: {
                      show: true,
                      formatter: "{b}: {d}%",
                      fontSize: 9,
                    },
                    labelLine: {
                      length: 8,
                      length2: 5,
                    },
                    data: orderStatusData.map((o, i) => ({
                      value: o.value,
                      name: o.name,
                      itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
                    })),
                  },
                ],
              }}
              />
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-2 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Trending Products</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Top products by sales activity</p>
            </div>
            {trendingProducts.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No trending products data available
              </div>
            ) : (
            <div className="w-full overflow-hidden">
              <ReactECharts
                style={{ height: "250px", width: "100%", minHeight: "250px" }}
                className="h-[250px]! sm:h-[260px]!"
                option={{
                  tooltip: {
                    trigger: "axis",
                    backgroundColor: "rgba(0,0,0,0.65)",
                    borderRadius: 8,
                    padding: 8,
                    textStyle: { color: "#fff", fontSize: 11 },
                    formatter: (params: any) => {
                      if (!params || !Array.isArray(params) || params.length === 0) return '';
                      const p = params[0];
                      const product = trendingProducts[p.dataIndex];
                      const fullName = product?.name || p.axisValue || 'Unknown';
                      const data = p.data;
                      return `
            <div style="font-size:11px;">
              <b>${fullName}</b><br/>
              Sales Count: <b>${data.salesCount}</b><br/>
              Total Sold: <b>${data.totalSold}</b><br/>
              Reviews: <b>${data.reviewCount}</b>
            </div>`;
                    },
                  },
                  grid: { 
                    left: isMobile ? 40 : 50, 
                    right: isMobile ? 10 : 20, 
                    top: isMobile ? 20 : 30, 
                    bottom: isMobile ? 40 : 35 
                  },
                  xAxis: {
                    type: "category",
                    data: trendingProducts.slice(0, isMobile ? 6 : 10).map((p) => {
                      const name = p.name || 'Unknown';
                      // Truncate more aggressively on mobile
                      const maxLength = isMobile ? 6 : 8;
                      return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
                    }),
                    axisLabel: {
                      color: "var(--muted-foreground)",
                      fontSize: isMobile ? 8 : 9,
                      interval: 0,
                      formatter: (value: string) => {
                        // More aggressive truncation on mobile
                        const maxLength = isMobile ? 7 : 10;
                        return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                      },
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                  },
                  yAxis: {
                    type: "value",
                    min: 0,
                    axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
                    splitLine: { lineStyle: { color: "rgba(120,120,120,0.40)" } },
                  },
                  series: [
                    {
                      type: "bar",
                      data: trendingProducts.slice(0, isMobile ? 6 : 10).map((p) => ({
                        value: p.salesCount || 0,
                        salesCount: p.salesCount || 0,
                        totalSold: p.totalSold || 0,
                        reviewCount: p.reviewCount || 0,
                      })),
                      itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                          { offset: 0, color: "#8b5cf6" },
                          { offset: 1, color: "#a78bfa" },
                        ]),
                      },
                      barWidth: "60%",
                    },
                  ],
                }}
              />
            </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 xl:grid-cols-2">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-2 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Product Performance</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sales vs Reviews correlation</p>
            </div>
            {topProducts.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No product performance data available
              </div>
            ) : (
            <div className="w-full overflow-hidden">
              <ReactECharts
                style={{ height: "280px", width: "100%", minHeight: "280px" }}
                className="h-[280px]!"
                option={{
                  tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "cross" },
                    backgroundColor: "rgba(0,0,0,0.65)",
                    borderRadius: 8,
                    padding: 8,
                    textStyle: { color: "#fff", fontSize: 11 },
                    formatter: (params: any) => {
                      if (!params || !Array.isArray(params) || params.length === 0) return '';
                      const param = params[0];
                      const product = topProducts[param.dataIndex];
                      const fullName = product?.name || param.axisValue || 'Unknown';
                      return `
                        <div style="font-size:11px; margin-bottom:4px;">
                          <b>${fullName}</b>
                        </div>
                        ${params.map((p: any) => `
                          <div style="font-size:11px;">
                            ${p.marker} ${p.seriesName}: <b>${p.value}</b>
                          </div>
                        `).join('')}
                      `;
                    },
                  },
                  legend: {
                    data: ["Total Sold", "Reviews"],
                    bottom: 0,
                    textStyle: { color: "var(--muted-foreground)", fontSize: 10 },
                  },
                  grid: { 
                    left: isMobile ? 40 : 50, 
                    right: isMobile ? 10 : 20, 
                    top: isMobile ? 20 : 30, 
                    bottom: isMobile ? 40 : 50 
                  },
                  xAxis: {
                    type: "category",
                    data: topProducts.length > 0 ? topProducts.slice(0, isMobile ? 6 : 10).map((p) => {
                      const name = p.name || 'Unknown';
                      // Truncate more aggressively on mobile
                      const maxLength = isMobile ? 6 : 8;
                      return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
                    }) : [],
                    axisLabel: {
                      color: "var(--muted-foreground)",
                      fontSize: isMobile ? 8 : 9,
                      interval: 0, // Show all labels
                      formatter: (value: string) => {
                        // More aggressive truncation on mobile
                        const maxLength = isMobile ? 7 : 10;
                        return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                      },
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                  },
                  yAxis: [
                    {
                      type: "value",
                      name: "Sold",
                      position: "left",
                      axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
                      splitLine: { lineStyle: { color: "rgba(120,120,120,0.20)" } },
                    },
                    {
                      type: "value",
                      name: "Reviews",
                      position: "right",
                      axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
                      splitLine: { show: false },
                    },
                  ],
                  series: [
                    {
                      name: "Total Sold",
                      type: "bar",
                      data: topProducts.length > 0 ? topProducts.map((p) => p.totalSold || 0) : [],
                      itemStyle: {
                        borderRadius: [4, 4, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                          { offset: 0, color: "#10b981" },
                          { offset: 1, color: "#34d399" },
                        ]),
                      },
                    },
                    {
                      name: "Reviews",
                      type: "line",
                      yAxisIndex: 1,
                      data: topProducts.length > 0 ? topProducts.map((p) => p.reviewCount || 0) : [],
                      lineStyle: { width: 3, color: "#f59e0b" },
                      itemStyle: { color: "#f59e0b" },
                      symbol: "circle",
                      symbolSize: 8,
                    },
                  ],
                }}
              />
            </div>
            )}
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-2 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">Sales Activity Heatmap</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Sold vs Sales Count</p>
            </div>
            {topProducts.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No sales activity data available
              </div>
            ) : (
            <div className="w-full overflow-hidden">
              <ReactECharts
                style={{ height: "280px", width: "100%", minHeight: "280px" }}
                className="h-[280px]!"
                option={{
                  tooltip: {
                    trigger: "item",
                    backgroundColor: "rgba(0,0,0,0.65)",
                    borderRadius: 8,
                    padding: 8,
                    textStyle: { color: "#fff", fontSize: 11 },
                    formatter: (params: any) => {
                      const data = params.data;
                      return `
            <div style="font-size:11px;">
              <b>${data.name}</b><br/>
              Total Sold: <b>${data.totalSold}</b><br/>
              Sales Count: <b>${data.salesCount}</b><br/>
              Rating: <b>${data.rating?.toFixed(1) || 0}⭐</b>
            </div>`;
                    },
                  },
                  grid: { 
                    left: isMobile ? 40 : 50, 
                    right: isMobile ? 10 : 20, 
                    top: isMobile ? 20 : 30, 
                    bottom: isMobile ? 40 : 50 
                  },
                  xAxis: {
                    type: "value",
                    name: "Sales Count",
                    nameLocation: "middle",
                    nameGap: 30,
                    axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
                    splitLine: { lineStyle: { color: "rgba(120,120,120,0.20)" } },
                  },
                  yAxis: {
                    type: "value",
                    name: "Total Sold",
                    nameLocation: "middle",
                    nameGap: 50,
                    axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
                    splitLine: { lineStyle: { color: "rgba(120,120,120,0.20)" } },
                  },
                  series: [
                    {
                      type: "scatter",
                      data: topProducts.length > 0 ? topProducts.map((p) => {
                        const salesCount = p.salesCount || 0;
                        const totalSold = p.totalSold || 0;
                        const rating = p.rating || 0;
                        return {
                          value: [salesCount, totalSold],
                          name: p.name || 'Unknown',
                          totalSold: totalSold,
                          salesCount: salesCount,
                          rating: rating,
                        };
                      }) : [],
                      symbolSize: (data: any) => {
                        const totalSold = (data?.value && Array.isArray(data.value) && data.value[1]) ? data.value[1] : 0;
                        return Math.max(20, Math.min(60, totalSold / 10));
                      },
                      itemStyle: {
                        color: (params: any) => {
                          const rating = params.data.rating || 0;
                          if (rating >= 4) return "#10b981";
                          if (rating >= 3) return "#f59e0b";
                          return "#ef4444";
                        },
                        opacity: 0.7,
                      },
                      emphasis: {
                        itemStyle: {
                          opacity: 1,
                          borderColor: "#fff",
                          borderWidth: 2,
                        },
                      },
                    },
                  ],
                }}
              />
            </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">Recent Orders</h2>

              <Link href="/orders">
                <Button className="rounded-full text-xs sm:text-sm h-7 sm:h-9 px-3 sm:px-4">See all</Button>
              </Link>
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="border-b text-left text-sm uppercase tracking-wide text-muted-foreground">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-xs text-muted-foreground">
                        No recent orders found.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2 pr-4 font-medium text-foreground text-xs">
                          {order.user?.name || "Unknown User"}
                        </td>

                        <td className="py-2 pr-4 text-[11px] text-muted-foreground">
                          {order.user?.email || "N/A"}
                        </td>

                        <td className="py-2 pr-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="py-2 pr-4 text-[11px] text-muted-foreground whitespace-nowrap">
                          {order.createdAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>


          <div className="rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-5 shadow-sm overflow-hidden">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">
                  Top Products
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Best performing products by sales.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <table className="w-full text-xs sm:text-sm min-w-[400px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 pr-2">Sold</th>
                    <th className="py-2 pr-2">Reviews</th>
                    <th className="py-2 pr-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-xs text-muted-foreground"
                      >
                        No products data yet.
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                      >
                        <td className="py-2 pr-2">{product.name}</td>
                        <td className="py-2 pr-2">
                          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-1 rounded-md font-semibold">
                            {product.totalSold}
                          </span>
                        </td>
                        <td className="py-2 pr-2">
                          <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-1 rounded-md font-semibold">
                            {product.reviewCount || 0}
                          </span>
                        </td>
                        <td className="py-2 pr-2">
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-1 rounded-md font-semibold">
                            {(product.rating || 0).toFixed(1)}⭐
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type Tone = 'blue' | 'emerald' | 'violet' | 'amber';

const toneMap: Record<
  Tone,
  { bg: string; iconBg: string; ring: string; text: string }
> = {
  blue: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
    ring: 'ring-sky-100 dark:ring-sky-900/60',
    text: 'text-sky-700 dark:text-sky-100',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    ring: 'ring-emerald-100 dark:ring-emerald-900/60',
    text: 'text-emerald-700 dark:text-emerald-100',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    ring: 'ring-violet-100 dark:ring-violet-900/60',
    text: 'text-violet-700 dark:text-violet-100',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    ring: 'ring-amber-100 dark:ring-amber-900/60',
    text: 'text-amber-700 dark:text-amber-100',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tone?: Tone;
}) {
  const colors = toneMap[tone];

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-border bg-card/80 p-3 sm:p-4 md:p-5 shadow ring-1 ring-inset ${colors.ring}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className={`flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-xl sm:rounded-2xl ${colors.iconBg}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
          {value}
        </p>
      </div>
      <div
        className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl ${colors.bg}`}
      />
    </div>
  );
}

function MiniMetricCard({ label, value, helper, icon: Icon, color }: any) {
  return (
    <div className={`rounded-xl sm:rounded-2xl border border-border px-3 sm:px-4 shadow-sm py-2 sm:py-3 ${color}`}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[10px] sm:text-[11px] font-medium uppercase">{label}</p>
          <p className="text-lg sm:text-xl font-bold">{value}</p>
          {helper && <p className="text-[10px] sm:text-[11px] opacity-70">{helper}</p>}
        </div>
        {Icon && (
          <div className="p-1.5 sm:p-2 rounded-full bg-white/50 dark:bg-white/10 shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const colorMap: Record<string, string> = {
    delivered: "bg-emerald-100 text-emerald-700",
    received: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    cancelled: "bg-rose-100 text-rose-700",
    refunded: "bg-purple-100 text-purple-700",
    shipped: "bg-sky-100 text-sky-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`text-xs rounded-full px-2.5 py-1 font-medium ${
        colorMap[normalized] || "bg-muted text-foreground"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}


