import axios, { AxiosError, AxiosInstance } from "axios";
import { authService } from "@/services/auth.service";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const processQueue = (error?: any) => {
  refreshQueue.forEach((cb) => cb());
  refreshQueue = [];
};

instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh-tokens")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(instance(originalRequest)));
      });
    }

    isRefreshing = true;

    try {
      await authService.refreshTokens();
      processQueue();
      return instance(originalRequest);
    } catch (err) {
      processQueue(err);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
