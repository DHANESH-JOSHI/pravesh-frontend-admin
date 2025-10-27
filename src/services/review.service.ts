import instance from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types";
import { CreateReview, UpdateReview, ReviewQuery, Review } from "@/types/review";

interface PaginatedReviews extends PaginatedData {
  reviews: Review[];
}

class ReviewService {
  async getAllReviews(page = 1, limit = 10) {
    const response = await instance.get<ApiResponse<PaginatedReviews>>("/reviews", {
      params: { page, limit }
    });
    return response.data;
  }

  async getMyReviews(query?: ReviewQuery) {
    const response = await instance.get<ApiResponse<PaginatedReviews>>("/reviews/me", {
      params: query
    });
    return response.data;
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const response = await instance.get<ApiResponse<PaginatedReviews>>(`/reviews/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  async create(data: CreateReview) {
    const response = await instance.post<ApiResponse<Review>>("/reviews", data);
    return response.data;
  }

  async update(id: string, data: UpdateReview) {
    const response = await instance.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/reviews/${id}`);
    return response.data;
  }
}

export const reviewService = new ReviewService();