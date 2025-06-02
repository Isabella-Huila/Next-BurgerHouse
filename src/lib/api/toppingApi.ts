import { API_BASE_URL } from "../consts/api";
import {
  Topping,
  CreateToppingDto,
  UpdateToppingDto,
  ToppingsResponse,
} from "../types/topping.types";


export interface PaginationDto {
  page?: number;
  limit?: number;
}

class ToppingApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config: RequestInit = {
      method: options.method || "GET",
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

      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getAllToppings(
    params: { page?: number; limit?: number } = {}
  ): Promise<ToppingsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        queryParams.append(key, String(value));
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/toppings?${queryString}` : "/toppings";

    return this.request<ToppingsResponse>(endpoint);
  }

  async getToppingByName(name: string): Promise<Topping> {
    return this.request<Topping>(`/toppings/${name}`);
  }

  async createTopping(createData: CreateToppingDto): Promise<Topping> {
    return this.request<Topping>("/toppings", {
      method: "POST",
      body: JSON.stringify(createData),
    });
  }

  async updateTopping(
    name: string,
    updateData: UpdateToppingDto
  ): Promise<Topping> {
    return this.request<Topping>(`/toppings/${name}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  async deleteTopping(name: string): Promise<void> {
    return this.request<void>(`/toppings/${name}`, {
      method: "DELETE",
    });
  }
}

export const toppingApi = new ToppingApi();
