import instance from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface OrderLog {
  _id: string;
  order: string | { _id: string; status: string; orderNumber?: string; user: string };
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

export interface OrderLogQueryOptions {
  page?: number;
  limit?: number;
  orderId?: string;
  staffId?: string;
  action?: string;
  field?: string;
  search?: string;
}

export interface OrderLogsResponse {
  logs: OrderLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const orderLogService = {
  async getAll(filters: OrderLogQueryOptions) {
    const response = await instance.get<ApiResponse<OrderLogsResponse>>(
      "/order-logs",
      { params: filters }
    );
    return response.data;
  },

  async getById(logId: string) {
    const response = await instance.get<ApiResponse<OrderLog>>(
      `/order-logs/${logId}`
    );
    return response.data;
  },

  async getOrderLogs(orderId: string, limit = 50) {
    const response = await instance.get<ApiResponse<OrderLogsResponse>>(
      `/order-logs`,
      { params: { orderId, limit, page: 1 } }
    );
    return response.data;
  },
};

