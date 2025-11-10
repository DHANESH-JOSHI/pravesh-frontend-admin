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

  async getChilds(id: string | null) {
    const response = await instance.get<ApiResponse<Category[]>>(`/categories/children/${id}`);
    return response.data;
  }

  async getByBrand(brandId:string){
    const response = await instance.get<ApiResponse<Category[]>>(`/categories/brand/${brandId}`);
    return response.data;
  }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Category>>(`/categories/${id}`, { params: { populate: true } });
    return response.data;
  }

  async create(data: CreateCategory) {
    const response = await instance.post<ApiResponse<Category>>("/categories", data);
    return response.data;
  }

  async update(id: string, data: UpdateCategory) {
    const response = await instance.patch<ApiResponse<Category>>(`/categories/${id}`,data);
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  }

}

export const categoryService = new CategoryService();