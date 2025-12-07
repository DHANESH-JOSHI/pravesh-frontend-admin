import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Message, PaginatedMessages, MessagesQueryOptions } from "@/types/message";

export const messageService = {
  async getAll(options: MessagesQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedMessages>>("/messages", {
      params: options
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Message>>(`/messages/${id}`, { params: { populate: true } });
    return response.data;
  },

  async resolve(id: string) {
    const response = await instance.patch<ApiResponse<Message>>(`/messages/${id}/resolve`);
    return response.data;
  },

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/messages/${id}`);
    return response.data;
  }
}
