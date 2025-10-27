import instance from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types";
import { CreateOrder, CreateCustomOrder, AdminUpdateOrder, OrderQuery, Order } from "@/types/order";

interface PaginatedOrders extends PaginatedData {
  orders: Order[];
}

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

  async confirmCustomOrder(orderId: string) {
    const response = await instance.post<ApiResponse<Order>>(`/orders/confirm/${orderId}`);
    return response.data;
  }

  async getMyOrders(query?: OrderQuery) {
    const response = await instance.get<ApiResponse<PaginatedOrders>>("/orders/me", {
      params: query
    });
    return response.data;
  }

  async getAllOrders(query?: OrderQuery) {
    const response = await instance.get<ApiResponse<PaginatedOrders>>("/orders", {
      params: query
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