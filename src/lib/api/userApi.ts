import { User } from "../types/auth.types";

const API_BASE_URL = "http://localhost:3000";

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  password?: string;
  isActive?: boolean;
  roles?: string[];
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UsersApi {
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

  async getAllUsers(
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        queryParams.append(key, String(value));
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    return this.request<UsersResponse>(endpoint);
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.request<User>(`/users/${email}`);
  }

  async updateUser(email: string, updateData: UpdateUserDto): Promise<User> {
    return this.request<User>(`/users/${email}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(email: string): Promise<void> {
    return this.request<void>(`/users/${email}`, {
      method: "DELETE",
    });
  }
}

export const usersApi = new UsersApi();
