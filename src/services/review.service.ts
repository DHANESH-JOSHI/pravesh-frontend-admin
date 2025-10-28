import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Review, PaginatedReviews, ReviewQueryOptions } from "@/types/review";

class ReviewService {
  async getAllReviews(options: ReviewQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedReviews>>("/reviews", {
      params: options
    });
    return response.data;
  }

  // async getProductReviews(productId: string, page = 1, limit = 10) {
  //   const response = await instance.get<ApiResponse<PaginatedReviews>>(`/reviews/${productId}`, {
  //     params: { page, limit }
  //   });
  //   return response.data;
  // }

  async delete(id: string) {
    const response = await instance.delete<ApiResponse<void>>(`/reviews/${id}`);
    return response.data;
  }
}

export const reviewService = new ReviewService();