export enum ProductCategories {
  burgers = "burgers",
  Accompaniments = "Accompaniments",
  drinks = "drinks",
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategories;
  isActive?: boolean;
  imageUrl?: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
