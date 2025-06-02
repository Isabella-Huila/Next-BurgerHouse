import { API_BASE_URL } from "../consts/api";
import { LoginDto, RegisterDto, AuthResponse, User } from "../types/auth.types";
import { Order, PaginatedResponse } from "../types/order.types";
import { storage } from "../utils/storage";


interface PaginationDto {
    limit?: number;
    offset?: number;
}

class OrderApi {
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

    async getOrders(limit: number = 10, offset: number = 0): Promise<PaginatedResponse<Order>> {
        const response = await this.request<PaginatedResponse<Order>>(
            `/orders/user?limit=${limit}&offset=${offset}`,
            {
                method: "GET",
            }
        );
        return response;
    }

}

export const order = new OrderApi();
