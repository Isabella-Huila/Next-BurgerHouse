import { API_BASE_URL } from "../consts/api";
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductsResponse,
} from "../types/product.types";


export interface PaginationDto {
  page?: number;
  limit?: number;
}

class ProductApi {
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

  async getAllProducts(
    params: { page?: number; limit?: number } = {}
  ): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        queryParams.append(key, String(value));
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return this.request<ProductsResponse>(endpoint);
  }

  async getProductByName(name: string): Promise<Product> {
    return this.request<Product>(`/products/${name}`);
  }

  async createProduct(createData: CreateProductDto): Promise<Product> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(createData),
    });
  }

  async updateProduct(
    name: string,
    updateData: UpdateProductDto
  ): Promise<Product> {
    return this.request<Product>(`/products/${name}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  async deleteProduct(name: string): Promise<void> {
    return this.request<void>(`/products/${name}`, {
      method: "DELETE",
    });
  }
}

export const productApi = new ProductApi();
