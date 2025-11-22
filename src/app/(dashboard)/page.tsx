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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ReactECharts from "echarts-for-react";
import {
  Users,
  ShoppingCart,
  Package,
  IndianRupee,
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

interface IDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;

  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  todayRevenue: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  averageOrderValue: number;

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
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  topCategories: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
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

  const orderStatusData = Object.entries(stats.orderStatusStats).map(
    ([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
    }),
  );

  const recentOrders = stats.recentOrders.slice(0, 6);
  const topProducts = stats.topProducts.slice(0, 5);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parsedData = stats.monthlyRevenue.map((item) => {
    const [yearStr, monthStr] = item.month.split("-");

    const year = Number(yearStr);
    const monthIndex = Number(monthStr);

    return {
      label: `${monthNames[monthIndex - 1]} ${year}`,
      month: monthIndex,
      year: year,
      orders: item.orders || 0,
      revenue: item.revenue || 0,
    };
  });


  const latestYear = parsedData[0]?.year || new Date().getFullYear();

  const formattedRevenueData = Array.from({ length: 12 }, (_, i) => {
    const existing = parsedData.find(
      (d) => d.month === i + 1 && d.year === latestYear
    );

    return {
      month: monthNames[i].slice(0, 3),
      revenue: existing?.revenue || 0,
      orders: existing?.orders || 0,
      fullLabel: `${monthNames[i]} ${latestYear}`,
    };
  });



  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Page header */}
        <header className="flex flex-col gap-2">
          <PageHeader title="Dashboard" />
          <p className="max-w-xl text-sm text-muted-foreground">
            A calm overview of your store performance. See revenue, orders and
            customers at a glance.
          </p>
        </header>

        {/* Primary KPI row */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            tone="blue"
          />
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

        {/* Secondary KPIs (spacious row of 3) */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <MiniMetricCard
            label="This Month’s Revenue"
            value={`₹${stats.thisMonthRevenue.toLocaleString()}`}
            helper="vs last 30 days"
            icon={TrendingUp}
            color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
          />
          <MiniMetricCard
            label="New Users This Month"
            value={stats.newUsersThisMonth.toString()}
            helper="Customers added"
            color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          />
          <MiniMetricCard
            label="Average Order Value"
            value={`₹${stats.averageOrderValue.toFixed(0)}`}
            helper="Per completed order"
            color="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          />
        </section>


        <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm  flex flex-col justify-between">
          <h2 className="text-sm font-semibold text-foreground">Monthly Sales</h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height={310}>
              <BarChart
                data={formattedRevenueData}
                margin={{ top: 30, right: 20, left: 40, bottom: 40 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                  labelFormatter={(label, payload) => {
                    if (!payload?.[0]) return label;
                    return payload[0].payload.month;
                  }}
                  contentStyle={{
                    borderRadius: 10,
                    borderColor: "hsl(var(--border))",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[8, 8, 0, 0]}
                  fill="#3b82f6"
                  animationDuration={700}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">



          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm ">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">Order Status Distribution</h2>
              <p className="text-xs text-muted-foreground">Distribution of order fulfillment</p>
            </div>

            <ReactECharts
              style={{ height: "310px", width: "100%" }}

              option={{
                tooltip: { trigger: "item" },
                legend: { bottom: 0, textStyle: { color: "var(--muted-foreground)" } },
                series: [
                  {
                    type: "pie",
                    radius: ["45%", "75%"],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
                    label: { show: true, formatter: "{b}: {d}%" },
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

          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm  flex flex-col justify-between">
            <h2 className="text-sm font-semibold text-foreground">Monthly Orders</h2>
            <ReactECharts
              style={{ height: "260px", width: "100%" }}
              option={{
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(0,0,0,0.65)",
                  borderRadius: 8,
                  padding: 10,
                  textStyle: { color: "#fff" },
                  formatter: (params: any) => {
                    const p = params[0];
                    return `
            <div style="font-size:12px;">
              <b>${p.axisValue}</b><br/>
              Orders : <b>${p.data}</b>
            </div>`;
                  },
                },
                grid: { left: 40, right: 20, top: 30, bottom: 40 },
                xAxis: {
                  type: "category",
                  data: formattedRevenueData.map((d) => d.month),
                  axisLabel: { color: "var(--muted-foreground)", fontSize: 12 },
                  axisLine: { show: false },
                  axisTick: { show: false },
                },

                yAxis: {
                  type: "value",
                  axisLabel: { color: "var(--muted-foreground)", fontSize: 12 },
                  splitLine: { lineStyle: { color: "rgba(120,120,120,0.40)" } }
                },
                series: [
                  {
                    type: "line",
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 6,
                    data: formattedRevenueData.map((d) => d.orders || 0),
                    lineStyle: { width: 3, color: "#465fff" },
                    itemStyle: { color: "#465fff" },
                    areaStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "#5caffd" },
                        { offset: 1, color: "#e6f0ff" },
                      ]),
                    },
                  },
                ],
              }}
            />
          </div>
        </section>



        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm ">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>

              <Link href="/orders">
                <Button className="rounded-full">See all</Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2">Customer</th>
                    <th className="py-2">Amount</th>
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
                        <td className="py-3 pr-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{order.user.name}</span>
                            <span className="text-[11px] text-muted-foreground">{order.user.email}</span>
                          </div>
                        </td>

                        <td className="py-3 pr-4 font-medium whitespace-nowrap">
                          ₹{order.totalAmount.toLocaleString()}
                        </td>

                        <td className="py-3 pr-4">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="py-3 pr-4 text-[11px] text-muted-foreground whitespace-nowrap">
                          {order.createdAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>


          <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm ">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Top Products
                </h2>
                <p className="text-xs text-muted-foreground">
                  Best performing products by revenue.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 pr-2">Sold</th>
                    <th className="py-2 pr-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
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

                        <td className="py-2 pr-2 whitespace-nowrap">
                          ₹{product.revenue.toLocaleString()}
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
      className={`relative flex flex-col justify-between rounded-2xl border border-border bg-card/80 p-5 shadow ring-1 ring-inset ${colors.ring}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold text-foreground sm:text-3xl">
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
    <div className={`rounded-2xl border border-border px-4 shadow- py-3 ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {helper && <p className="text-[11px] opacity-70">{helper}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-full bg-white/50 dark:bg-white/10 ">
            <Icon className="h-5 w-5" />
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


