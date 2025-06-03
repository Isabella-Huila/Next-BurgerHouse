import { order } from "../../../lib/api/orderApi";
import { Order, PaginatedResponse, OrderState } from "../../../lib/types/order.types";
import { User } from "../../../lib/types/auth.types";
import { Product, ProductCategories } from "../../../lib/types/product.types";



global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockStorage = {
  getToken: jest.fn(),
  setToken: jest.fn(),
  removeToken: jest.fn(),
  clear: jest.fn(),
};


const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("OrderApi", () => {
  const mockToken = "test-token";
  
  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    fullName: "Test User",
    isActive: true,
    roles: ["user"],
  };

  const mockProduct: Product = {
    id: "product-1",
    name: "Test Product",
    price: 15000,
    description: "A test product",
    category: "burgers" as ProductCategories.burgers,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockOrder: Order = {
    id: "order-1",
    total: 25000,
    state: OrderState.Pending,
    products: [mockProduct],
    address: "123 Test Street",
    user: mockUser,
    date: "2024-01-01T00:00:00Z",
    toppings: [
      {
        productId: "product-1",
        topping: "Extra Queso",
        quantity: 2,
        price: 5000,
      },
    ],
    items: [
      {
        productId: "product-1",
        quantity: 1,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getToken.mockReturnValue(mockToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("createOrder", () => {
    it("should create order with all parameters", async () => {
      const orderData = {
        total: 25000,
        productIds: ["product-1"],
        address: "123 Test Street",
        toppings: [
          {
            productId: "product-1",
            topping: "Extra Queso",
            quantity: 2,
            price: 5000,
          },
        ],
        items: [
          {
            productId: "product-1",
            quantity: 1,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, ...orderData }),
      } as Response);

      const result = await order.createOrder(
        orderData.total,
        orderData.productIds,
        orderData.address,
        orderData.toppings,
        orderData.items
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(orderData),
        })
      );
      expect(result).toEqual({ ...mockOrder, ...orderData });
    });
    it("should create order with minimal required parameters", async () => {
      const minimalOrderData = {
        total: 15000,
        productIds: ["product-1"],
        address: "456 Simple Street",
      };

      const minimalOrder = {
        ...mockOrder,
        ...minimalOrderData,
        toppings: undefined,
        items: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => minimalOrder,
      } as Response);

      const result = await order.createOrder(
        minimalOrderData.total,
        minimalOrderData.productIds,
        minimalOrderData.address
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            ...minimalOrderData,
            toppings: undefined,
            items: undefined,
          }),
        })
      );
      expect(result).toEqual(minimalOrder);
    });

    it("should create order with empty arrays for toppings and items", async () => {
      const orderData = {
        total: 10000,
        productIds: ["product-1"],
        address: "789 Empty Street",
        toppings: [],
        items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, ...orderData }),
      } as Response);

      const result = await order.createOrder(
        orderData.total,
        orderData.productIds,
        orderData.address,
        orderData.toppings,
        orderData.items
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders"),
        expect.objectContaining({
          body: JSON.stringify(orderData),
        })
      );
    });

    it("should handle zero total order", async () => {
      const orderData = {
        total: 0,
        productIds: ["free-product"],
        address: "Free Street",
      };

      const freeOrder = { ...mockOrder, total: 0 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => freeOrder,
      } as Response);

      const result = await order.createOrder(
        orderData.total,
        orderData.productIds,
        orderData.address
      );

      expect(result.total).toBe(0);
    });
  });

  describe("getOrders", () => {


    it("should fetch orders with custom pagination", async () => {
      const mockResponse: PaginatedResponse<Order> = {
        data: [mockOrder],
        total: 100,
        limit: 25,
        offset: 50,
        totalPages: 4,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await order.getOrders(25, 50);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders/user?limit=25&offset=50"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle zero limit and offset", async () => {
      const mockResponse: PaginatedResponse<Order> = {
        data: [],
        total: 0,
        limit: 0,
        offset: 0,
        totalPages: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await order.getOrders(0, 0);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders/user?limit=0&offset=0"),
        expect.any(Object)
      );
    });

    it("should handle large pagination numbers", async () => {
      const mockResponse: PaginatedResponse<Order> = {
        data: [],
        total: 0,
        limit: 999,
        offset: 9999,
        totalPages: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await order.getOrders(999, 9999);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/orders/user?limit=999&offset=9999"),
        expect.any(Object)
      );
    });
  });

  describe("updateOrderToNextStatus", () => {
    
    it("should handle updating order with special characters in ID", async () => {
      const specialOrderId = "order-123-abc_def";
      const updatedOrder = { ...mockOrder, id: specialOrderId };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedOrder,
      } as Response);

      const result = await order.updateOrderToNextStatus(specialOrderId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/${specialOrderId}`),
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("cancelOrder", () => {


    it("should handle cancelling non-existent order", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Order not found" }),
      } as Response);

      await expect(order.cancelOrder("non-existent")).rejects.toThrow(
        "Order not found"
      );
    });
  });

  describe("eraseOrder", () => {

    it("should handle admin erase without proper permissions", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Forbidden" }),
      } as Response);

      await expect(order.eraseOrder("order-1")).rejects.toThrow("Forbidden");
    });
  });

  describe("Error handling", () => {
    it("should handle HTTP errors", async () => {
      const errorMessage = "Bad Request";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: errorMessage }),
      } as Response);

      await expect(
        order.createOrder(1000, ["product-1"], "Test Address")
      ).rejects.toThrow(errorMessage);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(order.getOrders()).rejects.toThrow("Network error");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "API request failed:",
        expect.any(Error)
      );
    });

   

    it("should handle error without message in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({}),
      } as Response);

      await expect(
        order.createOrder(1000, [], "")
      ).rejects.toThrow("HTTP error! status: 422");
    });

    it("should handle 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      } as Response);

      await expect(order.getOrders()).rejects.toThrow("Unauthorized");
    });
  });

 

  describe("Request configuration", () => {


    it("should handle request without token", async () => {
      mockStorage.getToken.mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, limit: 10, offset: 0, totalPages: 0 }),
      } as Response);

      await order.getOrders();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it("should handle empty token", async () => {
      mockStorage.getToken.mockReturnValue("");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0, limit: 10, offset: 0, totalPages: 0 }),
      } as Response);

      await order.getOrders();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("should handle very long addresses", async () => {
      const longAddress = "A".repeat(500);
      const orderWithLongAddress = { ...mockOrder, address: longAddress };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => orderWithLongAddress,
      } as Response);

      const result = await order.createOrder(
        1000,
        ["product-1"],
        longAddress
      );

      expect(result.address).toBe(longAddress);
    });

    it("should handle orders with many products", async () => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        ...mockProduct,
        id: `product-${i}`,
        name: `Product ${i}`,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, products: manyProducts }),
      } as Response);

      const result = await order.createOrder(
        50000,
        manyProducts.map(p => p.id),
        "Test Address"
      );

      expect(result.products).toHaveLength(100);
    });

    it("should handle orders with many toppings", async () => {
      const manyToppings = Array.from({ length: 50 }, (_, i) => ({
        productId: `product-${i}`,
        topping: `topping-${i}`,
        quantity: 1,
        price: 1000,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockOrder, toppings: manyToppings }),
      } as Response);

      const result = await order.createOrder(
        25000,
        ["product-1"],
        "Test Address",
        manyToppings
      );

      expect(result.toppings).toHaveLength(50);
    });

    it("should handle very high order totals", async () => {
      const highTotal = 999999999;
      const expensiveOrder = { ...mockOrder, total: highTotal };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expensiveOrder,
      } as Response);

      const result = await order.createOrder(
        highTotal,
        ["expensive-product"],
        "Rich Street"
      );

      expect(result.total).toBe(highTotal);
    });

    it("should handle different order states", async () => {
      const states = [
        OrderState.Pending,
        OrderState.Preparing, 
        OrderState.Ready,
        OrderState.OnTheWay,
        OrderState.Delivered,
        OrderState.Cancelled
      ];

      for (const state of states) {
        const orderWithState = { ...mockOrder, state };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => orderWithState,
        } as Response);

        const result = await order.updateOrderToNextStatus("order-1");
        expect(Object.values(OrderState)).toContain(result.state);
      }
    });
  });
});