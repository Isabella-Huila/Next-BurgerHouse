import { configureStore } from "@reduxjs/toolkit";
import toppingsReducer, {
  fetchToppings,
  createTopping,
  updateTopping,
  deleteTopping,
  setPageLimit,
  clearError,
  resetToppings,
} from "@/lib/redux/slices/toppingsSlice";
import { toppingApi } from "@/lib/api/toppingApi";

jest.mock("@/lib/api/toppingApi");
const mockToppingApi = toppingApi as jest.Mocked<typeof toppingApi>;

describe("toppingsSlice", () => {
  let store: ReturnType<typeof configureStore>;

  const mockTopping = {
    id: "1",
    name: "Extra Queso",
    price: 5000,
    maximumAmount: 3,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const initialState = {
    toppings: [],
    loading: {
      fetch: false,
      create: false,
      update: false,
      delete: false,
    },
    error: null,
    pagination: {
      limit: 10,
      total: 0,
    },
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        toppings: toppingsReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should return the initial state", () => {
      expect(toppingsReducer(undefined, { type: "unknown" })).toEqual(
        initialState
      );
    });
  });

  describe("Synchronous actions", () => {
    it("should handle setPageLimit", () => {
      const action = setPageLimit(25);
      const state = toppingsReducer(initialState, action);

      expect(state.pagination.limit).toBe(25);
    });

    it("should handle clearError", () => {
      const stateWithError = {
        ...initialState,
        error: "Some error",
      };

      const action = clearError();
      const state = toppingsReducer(stateWithError, action);

      expect(state.error).toBeNull();
    });

    it("should handle resetToppings", () => {
      const stateWithData = {
        ...initialState,
        toppings: [mockTopping],
        error: "Some error",
        pagination: { limit: 25, total: 1 },
      };

      const action = resetToppings();
      const state = toppingsReducer(stateWithData, action);

      expect(state).toEqual(initialState);
    });
  });

  describe("fetchToppings async thunk", () => {
    it("should handle fetchToppings.pending", () => {
      const action = { type: fetchToppings.pending.type };
      const state = toppingsReducer(initialState, action);

      expect(state.loading.fetch).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchToppings.fulfilled with array response", async () => {
      const mockResponse = [mockTopping];
      mockToppingApi.getAllToppings.mockResolvedValue(mockResponse as any);

      await store.dispatch(fetchToppings({ limit: 10 }));
      const state = store.getState().toppings;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBeNull();
      expect(state.toppings).toEqual(mockResponse);
      expect(state.pagination.total).toBe(1);
    });

    it("should handle fetchToppings.fulfilled with paginated response", async () => {
      const mockResponse = {
        data: [mockTopping],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockToppingApi.getAllToppings.mockResolvedValue(mockResponse);

      await store.dispatch(fetchToppings({ limit: 10 }));
      const state = store.getState().toppings;

      expect(state.loading.fetch).toBe(false);
      expect(state.toppings).toEqual(mockResponse.data);
      expect(state.pagination.total).toBe(1);
    });

    it("should handle fetchToppings.fulfilled with empty response", async () => {
      const mockResponse = {};
      mockToppingApi.getAllToppings.mockResolvedValue(mockResponse as any);

      await store.dispatch(fetchToppings({ limit: 10 }));
      const state = store.getState().toppings;

      expect(state.toppings).toEqual([]);
      expect(state.pagination.total).toBe(0);
    });

    it("should handle fetchToppings.rejected", async () => {
      const errorMessage = "Error al cargar toppings";
      mockToppingApi.getAllToppings.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchToppings({ limit: 10 }));
      const state = store.getState().toppings;

      expect(state.loading.fetch).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("createTopping async thunk", () => {
    const createData = {
      name: "Extra Queso",
      price: 5000,
      maximumAmount: 3,
    };

    it("should handle createTopping.pending", () => {
      const action = { type: createTopping.pending.type };
      const state = toppingsReducer(initialState, action);

      expect(state.loading.create).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle createTopping.fulfilled", async () => {
      mockToppingApi.createTopping.mockResolvedValue(mockTopping);

      await store.dispatch(createTopping(createData));
      const state = store.getState().toppings;

      expect(state.loading.create).toBe(false);
      expect(state.toppings).toContain(mockTopping);
      expect(state.pagination.total).toBe(1);
    });

    it("should handle createTopping.rejected", async () => {
      const errorMessage = "Error al crear topping";
      mockToppingApi.createTopping.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createTopping(createData));
      const state = store.getState().toppings;

      expect(state.loading.create).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("updateTopping async thunk", () => {
    const updateData = {
      name: "Extra Queso Updated",
      price: 6000,
    };

    beforeEach(() => {
      store = configureStore({
        reducer: {
          toppings: toppingsReducer,
        },
        preloadedState: {
          toppings: {
            ...initialState,
            toppings: [mockTopping],
            pagination: { limit: 10, total: 1 },
          },
        },
      });
    });

    it("should handle updateTopping.pending", () => {
      const action = { type: updateTopping.pending.type };
      const state = toppingsReducer(initialState, action);

      expect(state.loading.update).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle updateTopping.fulfilled for non-existing topping", async () => {
      const updatedTopping = { ...mockTopping, name: "Non-existing" };
      mockToppingApi.updateTopping.mockResolvedValue(updatedTopping);

      await store.dispatch(updateTopping({ name: "Non-existing", updateData }));
      const state = store.getState().toppings;

      expect(state.toppings[0]).toEqual(mockTopping);
    });

    it("should handle updateTopping.rejected", async () => {
      const errorMessage = "Error al actualizar topping";
      mockToppingApi.updateTopping.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(
        updateTopping({ name: mockTopping.name, updateData })
      );
      const state = store.getState().toppings;

      expect(state.loading.update).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("deleteTopping async thunk", () => {
    beforeEach(() => {
      store = configureStore({
        reducer: {
          toppings: toppingsReducer,
        },
        preloadedState: {
          toppings: {
            ...initialState,
            toppings: [mockTopping],
            pagination: { limit: 10, total: 1 },
          },
        },
      });
    });

    it("should handle deleteTopping.pending", () => {
      const action = { type: deleteTopping.pending.type };
      const state = toppingsReducer(initialState, action);

      expect(state.loading.delete).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle deleteTopping.fulfilled", async () => {
      mockToppingApi.deleteTopping.mockResolvedValue();

      await store.dispatch(deleteTopping(mockTopping.name));
      const state = store.getState().toppings;

      expect(state.loading.delete).toBe(false);
      expect(state.toppings).toHaveLength(0);
      expect(state.pagination.total).toBe(0);
    });

    it("should handle deleteTopping.rejected", async () => {
      const errorMessage = "Error al eliminar topping";
      mockToppingApi.deleteTopping.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(deleteTopping(mockTopping.name));
      const state = store.getState().toppings;

      expect(state.loading.delete).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("Error handling with default messages", () => {
    it("should use default error message when none provided", async () => {
      mockToppingApi.getAllToppings.mockRejectedValue(new Error());

      await store.dispatch(fetchToppings());
      const state = store.getState().toppings;

      expect(state.error).toBe("Error al cargar toppings");
    });

    it("should use default error message for create", async () => {
      mockToppingApi.createTopping.mockRejectedValue(new Error());

      await store.dispatch(
        createTopping({ name: "Test", price: 1000, maximumAmount: 1 })
      );
      const state = store.getState().toppings;

      expect(state.error).toBe("Error al crear topping");
    });

    it("should use default error message for update", async () => {
      mockToppingApi.updateTopping.mockRejectedValue(new Error());

      await store.dispatch(updateTopping({ name: "Test", updateData: {} }));
      const state = store.getState().toppings;

      expect(state.error).toBe("Error al actualizar topping");
    });

    it("should use default error message for delete", async () => {
      mockToppingApi.deleteTopping.mockRejectedValue(new Error());

      await store.dispatch(deleteTopping("Test"));
      const state = store.getState().toppings;

      expect(state.error).toBe("Error al eliminar topping");
    });
  });
});
