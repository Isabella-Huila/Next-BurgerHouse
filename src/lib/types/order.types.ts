import { User } from "./auth.types";
import { Product } from "./product.types";


export enum OrderState {
  Pending = 'pending',
  Preparing = 'preparing',
  Ready = 'ready',
  OnTheWay = 'onTheWay',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  currentPage?: number; // Opcional, para conveniencia
  totalPages: number;
}

export interface Order {
  id: string;
  total: number;
  date: string;
  user: User;
  state: OrderState;
  products: Product[];
  address: string;
}