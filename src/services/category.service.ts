import instance from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types";
import { CreateCategory, UpdateCategory, Category } from "@/types/category";

export interface PaginatedCategory extends PaginatedData {
  categories: Category[];
}

class CategoryService {
  async getAll(query?: string, page = 1, limit = 10) {
    const response = await instance.get<ApiResponse<PaginatedCategory>>("/categories", {
      params: {
        query,
        page,
        limit
      }
    });
    return response.data;
  }

  async getChildCategories(parentId: string) {
    const response = await instance.get<ApiResponse<Category[]>>(`/children/${parentId}`);
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  async create(data: CreateCategory) {
    const formData = new FormData();
    formData.append('name', data.title);
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
    if (data.title) formData.append('name', data.title);
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