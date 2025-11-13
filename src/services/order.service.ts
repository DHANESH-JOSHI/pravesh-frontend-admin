import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { AdminUpdateOrder, Order, OrderQueryOptions, PaginatedOrders } from "@/types/order";



class OrderService {
  async getAllOrders(options?: OrderQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedOrders>>("/orders", {
      params: options
    });
    return response.data;
  }

  async getById(orderId: string) {
    const response = await instance.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrder(orderId: string, data: AdminUpdateOrder) {
    const response = await instance.patch<ApiResponse<Order>>(`/orders/${orderId}`, data);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await instance.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
    return response.data;
  }
}

export const orderService = new OrderService();