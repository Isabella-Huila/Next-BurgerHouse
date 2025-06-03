// src/__tests__/lib/redux/store.test.ts
import { store, persistor } from "@/lib/redux/store";
import type { RootState } from "@/lib/redux/store";

// Mock redux-persist
jest.mock("redux-persist/es/storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock("redux-persist", () => ({
  persistReducer: jest.fn((config, reducer) => reducer),
  persistStore: jest.fn(() => ({
    persist: jest.fn(),
    purge: jest.fn(),
    flush: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  })),
}));

// Mock individual slice reducers
jest.mock("@/lib/redux/slices/authSlice", () => ({
  __esModule: true,
  default: (
    state = { user: null, isAuthenticated: false, loading: false, error: null }
  ) => state,
}));

jest.mock("@/lib/redux/slices/usersSlice", () => ({
  __esModule: true,
  default: (state = { users: [], loading: false, error: null }) => state,
}));

jest.mock("@/lib/redux/slices/toppingsSlice", () => ({
  __esModule: true,
  default: (
    state = {
      toppings: [],
      loading: { fetch: false, create: false, update: false, delete: false },
      error: null,
      pagination: { limit: 10, total: 0 },
    }
  ) => state,
}));

jest.mock("@/lib/redux/slices/productSlice", () => ({
  __esModule: true,
  default: (state = { products: [], loading: false, error: null }) => state,
}));

jest.mock("@/lib/redux/slices/cartSlice", () => ({
  __esModule: true,
  default: (state = { items: [], total: 0 }) => state,
}));

describe("Redux Store Configuration", () => {
  describe("store initialization", () => {
    it("should create store with correct initial state structure", () => {
      const state = store.getState() as RootState;

      expect(state).toHaveProperty("auth");
      expect(state).toHaveProperty("users");
      expect(state).toHaveProperty("toppings");
      expect(state).toHaveProperty("products");
      expect(state).toHaveProperty("cart");
    });

    it("should have auth slice with correct initial state", () => {
      const state = store.getState() as RootState;

      expect(state.auth).toEqual({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    });

    it("should have users slice with correct initial state", () => {
      const state = store.getState() as RootState;

      expect(state.users).toEqual({
        users: [],
        loading: false,
        error: null,
      });
    });

    it("should have toppings slice with correct initial state", () => {
      const state = store.getState() as RootState;

      expect(state.toppings).toEqual({
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
      });
    });

    it("should have products slice with correct initial state", () => {
      const state = store.getState() as RootState;

      expect(state.products).toEqual({
        products: [],
        loading: false,
        error: null,
      });
    });

    it("should have cart slice with correct initial state", () => {
      const state = store.getState() as RootState;

      expect(state.cart).toEqual({
        items: [],
        total: 0,
      });
    });
  });

  describe("store functionality", () => {
    it("should be able to dispatch actions", () => {
      expect(() => {
        store.dispatch({ type: "TEST_ACTION" });
      }).not.toThrow();
    });

    it("should have dispatch method", () => {
      expect(typeof store.dispatch).toBe("function");
    });

    it("should have getState method", () => {
      expect(typeof store.getState).toBe("function");
    });

    it("should have subscribe method", () => {
      expect(typeof store.subscribe).toBe("function");
    });

    it("should be able to subscribe to state changes", () => {
      const unsubscribe = store.subscribe(() => {});
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
    });
  });

  describe("persistor", () => {
    it("should create persistor instance", () => {
      expect(persistor).toBeDefined();
    });

    it("should have persistor methods", () => {
      expect(typeof persistor.persist).toBe("function");
      expect(typeof persistor.purge).toBe("function");
      expect(typeof persistor.flush).toBe("function");
      expect(typeof persistor.pause).toBe("function");
      expect(typeof persistor.resume).toBe("function");
    });
  });

  describe("type safety", () => {
    it("should maintain correct TypeScript types for RootState", () => {
      const state: RootState = store.getState();

      // These should not cause TypeScript errors
      expect(state.auth.user).toBeDefined();
      expect(state.auth.isAuthenticated).toBeDefined();
      expect(state.auth.loading).toBeDefined();
      expect(state.auth.error).toBeDefined();

      expect(state.toppings.toppings).toBeDefined();
      expect(state.toppings.loading.fetch).toBeDefined();
      expect(state.toppings.loading.create).toBeDefined();
      expect(state.toppings.loading.update).toBeDefined();
      expect(state.toppings.loading.delete).toBeDefined();
      expect(state.toppings.pagination.limit).toBeDefined();
      expect(state.toppings.pagination.total).toBeDefined();
    });
  });

  describe("store behavior with actions", () => {
    it("should handle unknown actions gracefully", () => {
      const initialState = store.getState();

      store.dispatch({ type: "UNKNOWN_ACTION" });

      const newState = store.getState();
      expect(newState).toEqual(initialState);
    });

  });
});
