import { toppingApi } from "@/lib/api/toppingApi";
import { CreateToppingDto, UpdateToppingDto } from "@/lib/types/topping.types";

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

const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("ToppingApi", () => {
  const mockToken = "test-token";
  const mockTopping = {
    id: "1",
    name: "Extra Queso",
    price: 5000,
    maximumAmount: 3,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(mockToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("getAllToppings", () => {
    it("should fetch all toppings successfully", async () => {
      const mockResponse = {
        data: [mockTopping],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await toppingApi.getAllToppings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          }),
          credentials: "include",
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle query parameters correctly", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({ page: 1, limit: 25 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings?page=1&limit=25"),
        expect.any(Object)
      );
    });

    it("should handle fetch without token", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it("should handle params with undefined values", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({ page: undefined, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings?limit=10"),
        expect.any(Object)
      );
    });

    it("should handle params with null values", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({ page: null as any, limit: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings?limit=20"),
        expect.any(Object)
      );
    });

    it("should handle empty params object", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings"),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining("?"),
        expect.any(Object)
      );
    });

    it("should handle both page and limit as 0", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 0, limit: 0, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({ page: 0, limit: 0 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings?page=0&limit=0"),
        expect.any(Object)
      );
    });
  });

  describe("getToppingByName", () => {
    it("should fetch topping by name successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopping,
      } as Response);

      const result = await toppingApi.getToppingByName("Extra Queso");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toEqual(mockTopping);
    });

    it("should handle special characters in topping name", async () => {
      const specialName = "Queso & Jamón";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTopping, name: specialName }),
      } as Response);

      const result = await toppingApi.getToppingByName(specialName);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/toppings/${specialName}`),
        expect.objectContaining({ method: "GET" })
      );
      expect(result.name).toBe(specialName);
    });
  });

  describe("createTopping", () => {
    it("should create topping successfully", async () => {
      const createData: CreateToppingDto = {
        name: "Extra Queso",
        price: 5000,
        maximumAmount: 3,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopping,
      } as Response);

      const result = await toppingApi.createTopping(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(mockTopping);
    });

    it("should create topping with minimal required data", async () => {
      const minimalData: CreateToppingDto = {
        name: "Simple Topping",
        price: 1000,
      };

      const expectedTopping = { ...mockTopping, ...minimalData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedTopping,
      } as Response);

      const result = await toppingApi.createTopping(minimalData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(minimalData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(expectedTopping);
    });
  });

  describe("updateTopping", () => {
    it("should update topping successfully", async () => {
      const updateData: UpdateToppingDto = {
        price: 6000,
        isActive: false,
      };

      const updatedTopping = { ...mockTopping, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTopping,
      } as Response);

      const result = await toppingApi.updateTopping("Extra Queso", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(updatedTopping);
    });

    it("should update topping with single field", async () => {
      const updateData: UpdateToppingDto = {
        price: 7500,
      };

      const updatedTopping = { ...mockTopping, price: 7500 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTopping,
      } as Response);

      const result = await toppingApi.updateTopping("Extra Queso", updateData);

      expect(result.price).toBe(7500);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        })
      );
    });

    it("should update topping with empty object", async () => {
      const updateData: UpdateToppingDto = {};

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopping,
      } as Response);

      const result = await toppingApi.updateTopping("Extra Queso", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({}),
        })
      );
      expect(result).toEqual(mockTopping);
    });
  });

  describe("deleteTopping", () => {
    it("should delete topping successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await toppingApi.deleteTopping("Extra Queso");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should delete topping without response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      } as Response);

      const result = await toppingApi.deleteTopping("Extra Queso");

      expect(result).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings/Extra Queso"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Error handling", () => {
    it("should handle HTTP errors", async () => {
      const errorMessage = "Not found";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: errorMessage }),
      } as Response);

      await expect(toppingApi.getAllToppings()).rejects.toThrow(errorMessage);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(toppingApi.getAllToppings()).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      await expect(toppingApi.getAllToppings()).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("should handle error without message in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      } as Response);

      await expect(toppingApi.getAllToppings()).rejects.toThrow(
        "HTTP error! status: 400"
      );
    });

    it("should handle 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(
        toppingApi.createTopping({ name: "Test", price: 1000 })
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle 500 server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal Server Error" }),
      } as Response);

      await expect(
        toppingApi.updateTopping("test", { price: 1000 })
      ).rejects.toThrow("Internal Server Error");
    });

    it("should log error and re-throw", async () => {
      const networkError = new Error("Connection failed");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(toppingApi.getAllToppings()).rejects.toThrow(
        "Connection failed"
      );

      expect(mockConsoleError).toHaveBeenCalledWith(
        "API request failed:",
        networkError
      );
    });

    it("should handle response.json() throwing error for successful requests", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("JSON parse error");
        },
      } as Response);

      await expect(toppingApi.getAllToppings()).rejects.toThrow(
        "JSON parse error"
      );
    });
  });

  describe("Request configuration", () => {
    it("should include correct headers and credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      } as Response);

      await toppingApi.getAllToppings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: "include",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      );
    });

    it("should use GET method by default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      } as Response);

      await toppingApi.getAllToppings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should override method when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopping,
      } as Response);

      await toppingApi.createTopping({ name: "Test", price: 1000 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should merge custom headers with default headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTopping,
      } as Response);

      // Esta prueba verifica que el método interno merge headers correctamente
      await toppingApi.createTopping({ name: "Test", price: 1000 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it("should handle window undefined (server-side rendering)", async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      } as Response);

      await toppingApi.getAllToppings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );

      global.window = originalWindow;
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle very long topping names", async () => {
      const longName = "A".repeat(255);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTopping, name: longName }),
      } as Response);

      const result = await toppingApi.getToppingByName(longName);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/toppings/${longName}`),
        expect.any(Object)
      );
      expect(result.name).toBe(longName);
    });

    it("should handle zero price toppings", async () => {
      const createData: CreateToppingDto = {
        name: "Free Topping",
        price: 0,
        maximumAmount: 1,
      };

      const freeTopping = { ...mockTopping, ...createData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => freeTopping,
      } as Response);

      const result = await toppingApi.createTopping(createData);

      expect(result.price).toBe(0);
    });

    it("should handle high pagination numbers", async () => {
      const mockResponse = {
        data: [],
        meta: { page: 999, limit: 100, total: 0, totalPages: 0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await toppingApi.getAllToppings({ page: 999, limit: 100 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/toppings?page=999&limit=100"),
        expect.any(Object)
      );
    });
  });
});
