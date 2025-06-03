import { productApi } from "../../../lib/api/productApi";
import { ProductCategories } from "../../../lib/types/product.types";

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("ProductApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("mock-token");
  });

  describe("getAllProducts", () => {
    it("fetches products successfully", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            name: "Test Burger",
            description: "Test",
            price: 15,
            category: ProductCategories.burgers,
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
        ],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await productApi.getAllProducts({ limit: 50 });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/products?limit=50",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      } as Response);

      await expect(productApi.getAllProducts()).rejects.toThrow("Server error");
    });
  });

  describe("createProduct", () => {
    it("creates product successfully", async () => {
      const createData = {
        name: "New Burger",
        description: "New burger description",
        price: 20,
        category: ProductCategories.burgers,
      };

      const mockResponse = {
        id: "2",
        ...createData,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await productApi.createProduct(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/products",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateProduct", () => {
    it("updates product successfully", async () => {
      const updateData = {
        name: "Updated Burger",
        price: 25,
      };

      const mockResponse = {
        id: "1",
        name: "Updated Burger",
        price: 25,
        description: "Test",
        category: ProductCategories.burgers,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await productApi.updateProduct("test-burger", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/products/test-burger",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteProduct", () => {
    it("deletes product successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await productApi.deleteProduct("test-burger");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/products/test-burger",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("getProductByName", () => {
    it("fetches single product successfully", async () => {
      const mockProduct = {
        id: "1",
        name: "Test Burger",
        description: "Test",
        price: 15,
        category: ProductCategories.burgers,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      } as Response);

      const result = await productApi.getProductByName("test-burger");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/products/test-burger",
        expect.objectContaining({
          method: "GET",
        })
      );
      expect(result).toEqual(mockProduct);
    });
  });
});
