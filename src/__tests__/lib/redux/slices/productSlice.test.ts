import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { productApi } from "@/lib/api/productApi";
import productSlice, {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setPageLimit,
  clearError,
  resetProducts,
} from "@/lib/redux/slices/productSlice";
import {
  ProductCategories,
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "@/lib/types/product.types";

jest.mock("@/lib/api/productApi");
const mockedProductApi = productApi as jest.Mocked<typeof productApi>;

const mockProduct: Product = {
  id: "1",
  name: "Hamburguesa Clásica",
  description: "Deliciosa hamburguesa con carne y vegetales",
  price: 15000,
  category: ProductCategories.burgers,
  isActive: true,
  imageUrl: "https://example.com/image.jpg",
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
};

const mockProducts: Product[] = [
  mockProduct,
  {
    id: "2",
    name: "Papas Fritas",
    description: "Crujientes papas fritas",
    price: 8000,
    category: ProductCategories.Accompaniments,
    isActive: true,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
];

const mockCreateProductDto: CreateProductDto = {
  name: "Nueva Hamburguesa",
  description: "Nueva descripción",
  price: 20000,
  category: ProductCategories.burgers,
  imageUrl: "https://example.com/new-image.jpg",
};

const mockUpdateProductDto: UpdateProductDto = {
  name: "Hamburguesa Actualizada",
  description: "Descripción actualizada",
  price: 18000,
  category: ProductCategories.burgers,
  isActive: false,
};

describe("productSlice", () => {
  let store: EnhancedStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        products: productSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().products;
      expect(state).toEqual({
        products: [],
        loading: {
          fetch: false,
          create: false,
          update: false,
          delete: false,
        },
        error: null,
        pagination: {
          limit: 50,
          total: 0,
        },
      });
    });
  });

  describe("synchronous actions", () => {
    it("should handle setPageLimit", () => {
      store.dispatch(setPageLimit(25));
      const state = store.getState().products;
      expect(state.pagination.limit).toBe(25);
    });

    it("should handle clearError", () => {
      store.dispatch(fetchProducts.rejected(new Error("Test error"), "", {}));
      expect(store.getState().products.error).toBeTruthy();

      store.dispatch(clearError());
      const state = store.getState().products;
      expect(state.error).toBeNull();
    });

    it("should handle resetProducts", () => {
      store.dispatch(setPageLimit(25));
      store.dispatch(fetchProducts.fulfilled(mockProducts, "", {}));

      store.dispatch(resetProducts());
      const state = store.getState().products;
      expect(state).toEqual({
        products: [],
        loading: {
          fetch: false,
          create: false,
          update: false,
          delete: false,
        },
        error: null,
        pagination: {
          limit: 50,
          total: 0,
        },
      });
    });
  });

  describe("fetchProducts async thunk", () => {
    it("should handle fetchProducts.pending", () => {
      store.dispatch(fetchProducts.pending("", {}));
      const state = store.getState().products;
      expect(state.loading.fetch).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchProducts.fulfilled with array response", async () => {
      mockedProductApi.getAllProducts.mockResolvedValue(mockProducts as any);

      await store.dispatch(fetchProducts({ limit: 10 }));
      const state = store.getState().products;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBeNull();
      expect(state.products).toEqual(mockProducts);
      expect(state.pagination.total).toBe(mockProducts.length);
    });

    it("should handle fetchProducts.fulfilled with object response", async () => {
      const mockResponse = {
        data: mockProducts,
        meta: {
          page: 1,
          limit: 50,
          total: 100,
          totalPages: 2,
        },
      };
      mockedProductApi.getAllProducts.mockResolvedValue(mockResponse);

      await store.dispatch(fetchProducts({}));
      const state = store.getState().products;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBeNull();
      expect(state.products).toEqual(mockProducts);
      expect(state.pagination.total).toBe(100);
    });

    it("should handle fetchProducts.fulfilled with empty response", async () => {
      mockedProductApi.getAllProducts.mockResolvedValue({} as any);

      await store.dispatch(fetchProducts({}));
      const state = store.getState().products;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBeNull();
      expect(state.products).toEqual([]);
      expect(state.pagination.total).toBe(0);
    });

    it("should handle fetchProducts.rejected", async () => {
      const errorMessage = "Network error";
      mockedProductApi.getAllProducts.mockRejectedValue(
        new Error(errorMessage)
      );

      await store.dispatch(fetchProducts({}));
      const state = store.getState().products;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle fetchProducts.rejected with default error message", async () => {
      mockedProductApi.getAllProducts.mockRejectedValue(new Error());

      await store.dispatch(fetchProducts({}));
      const state = store.getState().products;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBe("Error al cargar productos");
    });

    it("should call productApi.getAllProducts with correct parameters", async () => {
      const params = { limit: 25 };
      mockedProductApi.getAllProducts.mockResolvedValue(mockProducts as any);

      await store.dispatch(fetchProducts(params));

      expect(mockedProductApi.getAllProducts).toHaveBeenCalledWith(params);
    });

    it("should use default parameters when none provided", async () => {
      mockedProductApi.getAllProducts.mockResolvedValue(mockProducts as any);

      await store.dispatch(fetchProducts());

      expect(mockedProductApi.getAllProducts).toHaveBeenCalledWith({
        limit: 50,
      });
    });
  });

  describe("createProduct async thunk", () => {
    it("should handle createProduct.pending", () => {
      store.dispatch(createProduct.pending("", mockCreateProductDto));
      const state = store.getState().products;
      expect(state.loading.create).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle createProduct.fulfilled", async () => {
      mockedProductApi.createProduct.mockResolvedValue(mockProduct);

      await store.dispatch(createProduct(mockCreateProductDto));
      const state = store.getState().products;

      expect(state.loading.create).toBe(false);
      expect(state.products).toContain(mockProduct);
      expect(state.products[0]).toEqual(mockProduct); // Should be added at the beginning
      expect(state.pagination.total).toBe(1);
    });

    it("should handle createProduct.rejected", async () => {
      const errorMessage = "Create failed";
      mockedProductApi.createProduct.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createProduct(mockCreateProductDto));
      const state = store.getState().products;

      expect(state.loading.create).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle createProduct.rejected with default error message", async () => {
      mockedProductApi.createProduct.mockRejectedValue(new Error());

      await store.dispatch(createProduct(mockCreateProductDto));
      const state = store.getState().products;

      expect(state.loading.create).toBe(false);
      expect(state.error).toBe("Error al crear producto");
    });
  });

  describe("updateProduct async thunk", () => {
    beforeEach(() => {
      store.dispatch(fetchProducts.fulfilled(mockProducts, "", {}));
    });

    it("should handle updateProduct.pending", () => {
      const updatePayload = {
        name: mockProduct.name,
        updateData: mockUpdateProductDto,
      };
      store.dispatch(updateProduct.pending("", updatePayload));
      const state = store.getState().products;
      expect(state.loading.update).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle updateProduct.fulfilled when product not found", async () => {
      const updatedProduct = { ...mockProduct, name: "Non-existent Product" };
      mockedProductApi.updateProduct.mockResolvedValue(updatedProduct);

      const updatePayload = {
        name: "Non-existent Product",
        updateData: mockUpdateProductDto,
      };
      await store.dispatch(updateProduct(updatePayload));
      const state = store.getState().products;

      expect(state.loading.update).toBe(false);
      expect(state.products).toEqual(mockProducts);
    });

    it("should handle updateProduct.rejected", async () => {
      const errorMessage = "Update failed";
      mockedProductApi.updateProduct.mockRejectedValue(new Error(errorMessage));

      const updatePayload = {
        name: mockProduct.name,
        updateData: mockUpdateProductDto,
      };
      await store.dispatch(updateProduct(updatePayload));
      const state = store.getState().products;

      expect(state.loading.update).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should handle updateProduct.rejected with default error message", async () => {
      mockedProductApi.updateProduct.mockRejectedValue(new Error());

      const updatePayload = {
        name: mockProduct.name,
        updateData: mockUpdateProductDto,
      };
      await store.dispatch(updateProduct(updatePayload));
      const state = store.getState().products;

      expect(state.loading.update).toBe(false);
      expect(state.error).toBe("Error al actualizar producto");
    });
  });

  describe("deleteProduct async thunk", () => {
    beforeEach(() => {
      store.dispatch(fetchProducts.fulfilled(mockProducts, "", {}));
    });

    it("should handle deleteProduct.pending", () => {
      store.dispatch(deleteProduct.pending("", mockProduct.name));
      const state = store.getState().products;
      expect(state.loading.delete).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle deleteProduct.fulfilled", async () => {
      mockedProductApi.deleteProduct.mockResolvedValue();

      await store.dispatch(deleteProduct(mockProduct.name));
      const state = store.getState().products;

      expect(state.loading.delete).toBe(false);
      expect(state.products).not.toContain(mockProduct);
      expect(state.products.length).toBe(1);
      expect(state.pagination.total).toBe(1);
    });

    it("should handle deleteProduct.rejected", async () => {
      const errorMessage = "Delete failed";
      mockedProductApi.deleteProduct.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(deleteProduct(mockProduct.name));
      const state = store.getState().products;

      expect(state.loading.delete).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.products).toEqual(mockProducts);
    });

    it("should handle deleteProduct.rejected with default error message", async () => {
      mockedProductApi.deleteProduct.mockRejectedValue(new Error());

      await store.dispatch(deleteProduct(mockProduct.name));
      const state = store.getState().products;

      expect(state.loading.delete).toBe(false);
      expect(state.error).toBe("Error al eliminar producto");
    });
  });

  describe("error handling edge cases", () => {
    it("should handle fetchProducts with string error payload", async () => {
      const action = {
        type: fetchProducts.rejected.type,
        payload: "Custom error message",
      };

      store.dispatch(action);
      const state = store.getState().products;

      expect(state.error).toBe("Custom error message");
    });

    it("should handle createProduct with undefined error payload", async () => {
      const action = {
        type: createProduct.rejected.type,
        payload: undefined,
      };

      store.dispatch(action);
      const state = store.getState().products;

      expect(state.error).toBe("Error al crear producto");
    });

    it("should handle updateProduct with null error payload", async () => {
      const action = {
        type: updateProduct.rejected.type,
        payload: null,
      };

      store.dispatch(action);
      const state = store.getState().products;

      expect(state.error).toBe("Error al actualizar producto");
    });

    it("should handle deleteProduct with empty error payload", async () => {
      const action = {
        type: deleteProduct.rejected.type,
        payload: "",
      };

      store.dispatch(action);
      const state = store.getState().products;

      expect(state.error).toBe("Error al eliminar producto");
    });
  });

  describe("complex state transitions", () => {

    it("should clear error when successful operation follows failed one", async () => {
      mockedProductApi.getAllProducts.mockRejectedValue(
        new Error("Fetch failed")
      );
      await store.dispatch(fetchProducts({}));

      let state = store.getState().products;
      expect(state.error).toBe("Fetch failed");

      mockedProductApi.createProduct.mockResolvedValue(mockProduct);
      await store.dispatch(createProduct(mockCreateProductDto));

      state = store.getState().products;
      expect(state.error).toBeNull();
    });
  });
});
