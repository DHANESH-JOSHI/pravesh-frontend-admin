import instance from "@/lib/axios";

export const unitService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; isDeleted?: string }) => {
    const response = await instance.get("/units", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await instance.get(`/units/${id}`);
    return response.data;
  },
  create: async (data: { name: string }) => {
    const response = await instance.post("/units", data);
    return response.data;
  },
  update: async (id: string, data: { name?: string }) => {
    const response = await instance.patch(`/units/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await instance.delete(`/units/${id}`);
    return response.data;
  },
};

