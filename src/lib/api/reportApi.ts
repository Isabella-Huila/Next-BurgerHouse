import { API_BASE_URL } from "../consts/api";
import { Order, PaginatedResponse } from "../types/order.types";
import { storage } from "../utils/storage";


class ReportApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = storage.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getDailyReport(): Promise<{base64: string}> {
    const response = await this.request<{base64: string}>(
      `/reports/products/top-selling/daily`,
      {
        method: "GET",
      }
    );
    return response;
  }

  async getWeeklyReport(): Promise<{base64: string}> {
    const response = await this.request<{base64: string}>(
      `/reports/products/top-selling/weekly`,
      {
        method: "GET",
      }
    );
    return response;
  }

  async getMothlyReport(): Promise<{base64: string}> {
    const response = await this.request<{base64: string}>(
      `/reports/products/top-selling/monthly`,
      {
        method: "GET",
      }
    );
    return response;
  }

}



export const reportApi = new ReportApi();
