export interface Topping {
  id: string;
  name: string;
  price: number;
  maximumAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateToppingDto {
  name: string;
  price: number;
  maximumAmount: number;
}

export interface UpdateToppingDto {
  name?: string;
  price?: number;
  maximumAmount?: number;
  isActive?: boolean;
}

export interface ToppingsResponse {
  data: Topping[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
