import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateBanner, UpdateBanner, Banner, BannerQueryOptions, PaginatedBanners } from "@/types/banner";

class BannerService {

  async getAllBanners(options: BannerQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedBanners>>("/banners", { params: options });
    return response.data;
  }

  async getById(id:string){
    const response = await instance.get<ApiResponse<Banner>>(`/banners/${id}`)
    return response.data;
  }

  async create(data: CreateBanner) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('image', data.image);
    if (data.targetUrl) {
      formData.append('targetUrl', data.targetUrl);
    }
    if (data.targetId) {
      formData.append('targetId', data.targetId);
    }
    if (data.targetSlug) {
      formData.append('targetSlug', data.targetSlug);
    }
    if (data.type) {
      formData.append('type', data.type);
    }
    if (data.order) {
      formData.append('order', data.order.toString());
    }
    const response = await instance.post<ApiResponse<Banner>>("/banners", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(bannerId: string, data: UpdateBanner) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.image) formData.append('image', data.image);
    if (data.targetUrl) {
      formData.append('targetUrl', data.targetUrl);
    }
    if (data.targetSlug) {
      formData.append('targetSlug', data.targetSlug);
    }
    if (data.targetId) {
      formData.append('targetId', data.targetId);
    }
    if (data.type) {
      formData.append('type', data.type);
    }
    if (data.order) {
      formData.append('order', data.order.toString());
    }
    const response = await instance.patch<ApiResponse<Banner>>(`/banners/${bannerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async delete(bannerId: string) {
    const response = await instance.delete<ApiResponse<void>>(`/banners/${bannerId}`);
    return response.data;
  }
}

export const bannerService = new BannerService();