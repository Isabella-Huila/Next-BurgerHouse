import { LoginDto, RegisterDto, AuthResponse, User } from "../types/auth.types";
import { storage } from "../utils/storage";

const API_BASE_URL = "http://localhost:3000";

class AuthApi {
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

  async login(loginData: LoginDto): Promise<AuthResponse> {
    return this.request<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
  }

  async register(registerData: RegisterDto): Promise<AuthResponse> {
    return this.request<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/users/profile");
  }

  async updateProfile(email: string, updateData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${email}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }
}

export const authApi = new AuthApi();
