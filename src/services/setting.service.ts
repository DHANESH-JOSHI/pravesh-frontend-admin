import instance from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Setting, UpdateSetting } from "@/types/setting";

class SettingService {
  async get() {
    const response = await instance.get<ApiResponse<Setting>>("/settings");
    return response.data;
  }

  async update(data: UpdateSetting) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "logo") {
          if (value instanceof File) {
            formData.append("logo", value);
          }
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else if (value) {
          formData.append(key, value);
        }
      }
    });

    const response = await instance.patch<ApiResponse<Setting>>("/settings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

export const settingService = new SettingService();

