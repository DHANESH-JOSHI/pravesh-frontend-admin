import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { CreateBlog, UpdateBlog, Blog, BlogQueryOptions, PaginatedBlogs } from "@/types/blog";



class BlogService {
  async getPostById(id: string) {
    const response = await instance.get<ApiResponse<Blog>>(`/blogs/${id}`);
    return response.data;
  }

  async getAllPosts(options: BlogQueryOptions) {
    const response = await instance.get<ApiResponse<PaginatedBlogs>>("/blogs", { params: options });
    return response.data;
  }

  async create(data: CreateBlog) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.featuredImage) {
      formData.append('featuredImage', data.featuredImage);
    }
    if (data.slug) {
      formData.append('slug', data.slug);
    }
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.isPublished !== undefined) {
      formData.append('isPublished', data.isPublished.toString());
    }
    const response = await instance.post<ApiResponse<Blog>>("/blogs", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async update(postId: string, data: UpdateBlog) {
    const formData = new FormData();
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.content) {
      formData.append('content', data.content);
    }
    if (data.slug) {
      formData.append('slug', data.slug);
    }
    if (data.featuredImage) {
      formData.append('featuredImage', data.featuredImage);
    }
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.isPublished !== undefined) {
      formData.append('isPublished', data.isPublished.toString());
    }
    const response = await instance.patch<ApiResponse<Blog>>(`/blogs/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async delete(postId: string) {
    const response = await instance.delete<ApiResponse<void>>(`/blogs/${postId}`);
    return response.data;
  }
}

export const blogService = new BlogService();