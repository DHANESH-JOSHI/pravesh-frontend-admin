import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateBrand, UpdateBrand, Brand, BrandQueryOptions, PaginatedBrands } from "@/types/brand";

class BrandService {
  async getAll(options: BrandQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedBrands>>("/brands", {
      params: options
    });
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Brand>>(`/brands/${id}`, { params: { populate: true } });
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