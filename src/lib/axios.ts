import { authService } from "@/services/auth.service";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Single-flight refresh state
let isRefreshing = false;
let waitQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

function flushQueue(err?: any) {
  if (err) {
    waitQueue.forEach(p => p.reject(err));
  } else {
    waitQueue.forEach(p => p.resolve(true));
  }
  waitQueue = [];
}

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;
    if (status !== 401 || !original) {
      return Promise.reject(error);
    }
    // Avoid re-refreshing same request
    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({
          resolve: () => resolve(instance(original)),
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      await authService.refreshTokens();
      flushQueue();
      return instance(original);
    } catch (e) {
      flushQueue(e);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
