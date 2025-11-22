'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingCart, Package, TrendingUp, Star, Heart, ShoppingBag, FileText, Activity, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/common/page-header';
import { useQuery } from '@tanstack/react-query';
import instance from '@/lib/axios';
import { ApiResponse } from '@/types';
import Loader from '@/components/ui/loader';

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
    user: { name: string; email: string; };
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
  // lowStockProducts: Array<{
  //   _id: string;
  //   name: string;
  //   stock: number;
  // }>;
  // outOfStockList: Array<{
  //   _id: string;
  //   name: string;
  // }>;
  totalReviews: number;
  averageRating: number;
  totalWishlistItems: number;
  totalCartItems: number;
  totalBlogs: number;
  publishedBlogs: number;
  activeUsers: number;
}

const COLORS = ['oklch(0.5583 0.1276 42.9956)', 'oklch(0.6898 0.1581 290.4107)', 'oklch(0.8816 0.0276 93.1280)', 'oklch(0.8822 0.0403 298.1792)', 'oklch(0.5608 0.1348 42.0584)'];

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<IDashboardStats>>(`/dashboard/stats`);
      return response.data.data;
    },
  });
  if (isLoading) {
    return (
      <Loader/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!stats) return null;
  const orderStatusData = Object.entries(stats.orderStatusStats).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
  }));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className='mb-8'>
          <PageHeader
            title="Dashboard Stats"
          />
        </div>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card icon={<Users className="h-8 w-8" />} title="Total Users" value={stats.totalUsers.toLocaleString()} change={stats.newUsersThisMonth} />
          <Card icon={<ShoppingCart className="h-8 w-8" />} title="Total Orders" value={stats.totalOrders.toLocaleString()} />
          <Card icon={<IndianRupee className="h-8 w-8" />} title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
          <Card icon={<Package className="h-8 w-8" />} title="Total Products" value={stats.totalProducts.toLocaleString()} />
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="New Users Today" value={stats.newUsersToday.toString()} />
          <Card title="New Users This Week" value={stats.newUsersThisWeek.toString()} />
          <Card title="New Users This Month" value={stats.newUsersThisMonth.toString()} />
        </div>

        {/* Sales Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} />
          <Card title="This Week's Revenue" value={`₹${stats.thisWeekRevenue.toLocaleString()}`} />
          <Card title="This Month's Revenue" value={`₹${stats.thisMonthRevenue.toLocaleString()}`} />
          <Card title="Average Order Value" value={`₹${stats.averageOrderValue.toFixed(2)}`} />
        </div>

        {/* Order Status */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card title="Pending Orders" value={stats.pendingOrders.toString()} />
          <Card title="Processing Orders" value={stats.processingOrders.toString()} />
          <Card title="Shipped Orders" value={stats.shippedOrders.toString()} />
          <Card title="Delivered Orders" value={stats.deliveredOrders.toString()} />
          <Card title="Cancelled Orders" value={stats.cancelledOrders.toString()} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="oklch(0.5583 0.1276 42.9956)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="oklch(0.5583 0.1276 42.9956)"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="py-2">{order.user.name}</td>
                      <td className="py-2">₹{order.totalAmount}</td>
                      <td className="py-2 capitalize">{order.status.replace('_', ' ')}</td>
                      <td className="py-2">{order.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Sold</th>
                    <th className="text-left py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{product.totalSold}</td>
                      <td className="py-2">₹{product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Low Stock Products
            </h2>
            <ul className="space-y-2">
              {stats.lowStockProducts.map((product) => (
                <li key={product._id} className="flex justify-between">
                  <span>{product.name}</span>
                  <span className="text-red-500">{product.stock} left</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-accent/50 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Out of Stock Products
            </h2>
            <ul className="space-y-2">
              {stats.outOfStockList.map((product) => (
                <li key={product._id}>{product.name}</li>
              ))}
            </ul>
          </div>
        </div>*/}

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card icon={<Star className="h-8 w-8" />} title="Total Reviews" value={stats.totalReviews.toString()} />
          <Card icon={<TrendingUp className="h-8 w-8" />} title="Average Rating" value={stats.averageRating.toFixed(1)} />
          <Card icon={<Heart className="h-8 w-8" />} title="Wishlist Items" value={stats.totalWishlistItems.toString()} />
          <Card icon={<ShoppingBag className="h-8 w-8" />} title="Cart Items" value={stats.totalCartItems.toString()} />
          <Card icon={<FileText className="h-8 w-8" />} title="Total Blogs" value={stats.totalBlogs.toString()} />
          <Card icon={<FileText className="h-8 w-8" />} title="Published Blogs" value={stats.publishedBlogs.toString()} />
          <Card icon={<Activity className="h-8 w-8" />} title="Active Users" value={stats.activeUsers.toString()} />
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value, change }: { icon?: React.ReactNode; title: string; value: string; change?: number }) {
  return (
    <div className="bg-accent/50 p-6 rounded shadow flex items-center">
      {icon && <div className="mr-4 text-primary">{icon}</div>}
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold ">{value}</p>
        {change !== undefined && (
          <p className="text-sm text-green-600">+{change} this month</p>
        )}
      </div>
    </div>
  );
}