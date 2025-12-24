import instance from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface OrderLog {
  _id: string;
  order: string | { _id: string; status: string; user: string };
  admin: {
    _id: string;
    name: string;
    email?: string;
    role: string;
  };
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserLogAnalytics {
  summary: {
    totalActions: number;
    views: number;
    statusUpdates: number;
    itemUpdates: number;
    feedbackUpdates: number;
    listViews: number;
  };
  actionBreakdown: Array<{
    action: string;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
    views: number;
    updates: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  mostViewedOrders: Array<{
    orderId: string;
    viewCount: number;
    lastViewed: string;
  }>;
  period: number;
}

export const orderLogService = {
  async getOrderLogs(orderId: string, limit = 50) {
    const response = await instance.get<ApiResponse<OrderLog[]>>(
      `/orders/${orderId}/logs`,
      { params: { limit } }
    );
    return response.data;
  },

  async getRecentLogs(limit = 50, page = 1) {
    const response = await instance.get<ApiResponse<{
      logs: OrderLog[];
      hasMore: boolean;
      total: number;
    }>>(
      "/order-logs/recent",
      { params: { limit, page } }
    );
    return response.data;
  },

  async getLogsByStaff(staffId: string, limit = 50, page = 1) {
    const response = await instance.get<ApiResponse<{
      logs: OrderLog[];
      hasMore: boolean;
      total: number;
    }>>(
      `/order-logs/staff/${staffId}`,
      { params: { limit, page } }
    );
    return response.data;
  },

  async getUserLogAnalytics(staffId: string, days = 30) {
    const response = await instance.get<ApiResponse<UserLogAnalytics>>(
      `/order-logs/staff/${staffId}/analytics`,
      { params: { days } }
    );
    return response.data;
  },
};

