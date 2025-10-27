import instance from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types";
import { CreateBrand, UpdateBrand, Brand } from "@/types/brand";

interface PaginatedBrand extends PaginatedData {
  brands: Brand[];
}
class BrandService {
  async getAll(query?:string,page = 1, limit = 10) {
    const response = await instance.get<ApiResponse<PaginatedBrand>>("/brands", {
      params: {
        query,
        page,
        limit
      }
    });
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Brand>>(`/brands/${id}`);
    return response.data;
  }

  async create(data: CreateBrand) {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }
    const response = await instance.post<ApiResponse<Brand>>("/brands", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id: string, data: UpdateBrand) {
    const formData = new FormData();
    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.image && data.image instanceof File) {
      formData.append('image', data.image);
    }

    const response = await instance.patch<ApiResponse<Brand>>(`/brands/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/brands/${id}`);
    return response.data;
  }
}

export const brandService = new BrandService();