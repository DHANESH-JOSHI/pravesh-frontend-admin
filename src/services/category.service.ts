import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateCategory, UpdateCategory, Category, PaginatedCategories, CategoryQueryOptions } from "@/types/category";

class CategoryService {
  async getAll(options: CategoryQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedCategories>>("/categories", {
      params: options
    });
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Category>>(`/categories/${id}`, { params: { populate: true } });
    return response.data;
  }

  async create(data: CreateCategory) {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.image && data.image instanceof File) formData.append('image', data.image);
    if (data.parentCategoryId) formData.append('parentId', data.parentCategoryId);

    const response = await instance.post<ApiResponse<Category>>("/categories", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id: string, data: UpdateCategory) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.image && data.image instanceof File) formData.append('image', data.image);
    if (data.parentCategoryId) formData.append('parentId', data.parentCategoryId);

    const response = await instance.patch<ApiResponse<Category>>(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  }

}

export const categoryService = new CategoryService();