import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateOrder, CreateCustomOrder, AdminUpdateOrder, Order, OrderQueryOptions, PaginatedOrders } from "@/types/order";



class OrderService {
  async create(data: CreateOrder) {
    const response = await instance.post<ApiResponse<Order>>("/orders", data);
    return response.data;
  }

  async createCustomOrder(data: CreateCustomOrder) {
    const formData = new FormData();
    formData.append('image', data.image);
    const response = await instance.post<ApiResponse<Order>>("/orders/custom", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

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

  async adminUpdate(orderId: string, data: AdminUpdateOrder) {
    const response = await instance.patch<ApiResponse<Order>>(`/orders/${orderId}`, data);
    return response.data;
  }
}

export const orderService = new OrderService();