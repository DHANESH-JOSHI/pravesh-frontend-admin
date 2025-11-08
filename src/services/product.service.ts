import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateProduct, QueryOptions, Product, PaginatedProducts, ProductFilters } from "@/types/product"


class ProductService {
  async search(query: string, page = 1, limit = 10) {
    const response = await instance.get<ApiResponse<PaginatedProducts>>(`/products/search`, {
      params: {
        q: query,
        page,
        limit
      }
    });
    return response.data;
  }

  async getAll(options: QueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedProducts>>("/products", {
      params: options
    });
    return response.data;
  }

  async getFilters() {
    const response = await instance.get<ApiResponse<ProductFilters>>("/products/filters");
    return response.data;
  }

  // async getDiscounted(page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>("/products/discount", {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getFeatured(page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>("/products/featured", {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getTrending(page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>("/products/trending", {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getBestSelling(page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>("/products/best-selling", {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getNewArrivals(page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>("/products/new-arrivals", {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getByCategory(categoryId: string, page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedProducts>>(`/products/category/${categoryId}`, {
  //     params: {
  //       page,
  //       limit
  //     }
  //   });
  //   return response.data;
  // }

  // async getBySlug(slug: string, populate: boolean = false) {
  //   const response = await instance.get<ApiResponse<Product>>(`/products/slug/${slug}`, {
  //     params: {
  //       populate
  //     }
  //   });
  //   return response.data;
  // }

  async getById(id: string) {
    const response = await instance.get<ApiResponse<Product>>(`/products/${id}`, { params: { populate: true } });
    return response.data;
  }

  async create(data: CreateProduct) {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
    formData.append('originalPrice', data.originalPrice.toString());
    if (data.discountValue) formData.append('discountedPrice', data.discountValue.toString());
    if (data.discountType) formData.append('discountType', data.discountType);
    if (data.brandId) formData.append('brandId', data.brandId);
    formData.append('categoryId', data.categoryId);
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }
    formData.append('unit', data.unit);
    if (data.minStock) formData.append('minStock', data.minStock.toString());
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.features) formData.append('features', JSON.stringify(data.features));
    if (data.specifications) formData.append('specifications', JSON.stringify(data.specifications));
    if (data.isFeatured) formData.append('isFeatured', data.isFeatured.toString());
    if (data.isNewArrival) formData.append('isNewArrival', data.isNewArrival.toString());
    formData.append('stock', data.stock.toString());
    const response = await instance.post<ApiResponse<Product>>("/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async update(id: string, data: Partial<CreateProduct>) {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
    if (data.originalPrice) formData.append('originalPrice', data.originalPrice.toString());
    if (data.discountValue) formData.append('discountedPrice', data.discountValue.toString());
    if (data.discountType) formData.append('discountType', data.discountType);
    if (data.brandId) formData.append('brandId', data.brandId);
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    if (data.unit) formData.append('unit', data.unit);
    if (data.minStock) formData.append('minStock', data.minStock.toString());
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.features) formData.append('features', JSON.stringify(data.features));
    if (data.specifications) formData.append('specifications', JSON.stringify(data.specifications));
    if (data.isFeatured) formData.append('isFeatured', data.isFeatured.toString());
    if (data.isNewArrival) formData.append('isNewArrival', data.isNewArrival.toString());
    if (data.stock) formData.append('stock', data.stock.toString());
    const response = await instance.patch<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  }
}

export const productService = new ProductService();