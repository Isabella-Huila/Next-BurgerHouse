import authReducer, {
  loginUser,
  registerUser,
  logout,
  clearError,
  setUser,
  initializeAuth,
} from "@/lib/redux/slices/authSlice";
import { AuthState } from "@/lib/types/auth.types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/api/authApi");
jest.mock("@/lib/utils/storage");

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

describe("Auth Slice", () => {
  describe("reducers", () => {
    test("should handle logout", () => {
      const state = {
        ...initialState,
        user: {
          id: "1",
          email: "test@example.com",
          fullName: "Test",
          isActive: true,
          roles: ["user"],
        },
        token: "token",
        isAuthenticated: true,
        isLoading: false,
      };

      const action = logout();
      const newState = authReducer(state, action);

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBeNull();
      expect(newState.isLoading).toBe(false);
    });

    test("should handle clearError", () => {
      const state = {
        ...initialState,
        error: "Some error",
      };

      const action = clearError();
      const newState = authReducer(state, action);

      expect(newState.error).toBeNull();
    });

    test("should handle setUser", () => {
      const user = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        isActive: true,
        roles: ["user"],
      };

      const action = setUser(user);
      const newState = authReducer(initialState, action);

      expect(newState.user).toEqual(user);
    });
  });

  describe("async thunks", () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          auth: authReducer,
        },
      });
    });

    describe("loginUser", () => {
      test("should handle loginUser.pending", () => {
        const action = { type: loginUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle loginUser.fulfilled", () => {
        const payload = {
          user: {
            id: "1",
            email: "test@example.com",
            fullName: "Test",
            isActive: true,
            roles: ["user"],
          },
          token: "test-token",
        };

        const action = { type: loginUser.fulfilled.type, payload };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(payload.user);
        expect(state.token).toBe(payload.token);
        expect(state.isAuthenticated).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle loginUser.rejected", () => {
        const action = {
          type: loginUser.rejected.type,
          payload: "Login failed",
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Login failed");
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe("registerUser", () => {
      test("should handle registerUser.pending", () => {
        const action = { type: registerUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle registerUser.fulfilled", () => {
        const payload = {
          user: {
            id: "1",
            email: "test@example.com",
            fullName: "Test",
            isActive: true,
            roles: ["user"],
          },
          token: "test-token",
        };

        const action = { type: registerUser.fulfilled.type, payload };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(payload.user);
        expect(state.token).toBe(payload.token);
        expect(state.isAuthenticated).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle registerUser.rejected", () => {
        const action = {
          type: registerUser.rejected.type,
          payload: "Registration failed",
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Registration failed");
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe("initializeAuth", () => {
      test("should handle initializeAuth.pending", () => {
        const action = { type: initializeAuth.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
      });

      test("should handle initializeAuth.fulfilled with user data", () => {
        const payload = {
          user: {
            id: "1",
            email: "test@example.com",
            fullName: "Test",
            isActive: true,
            roles: ["user"],
          },
          token: "test-token",
        };

        const action = { type: initializeAuth.fulfilled.type, payload };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(payload.user);
        expect(state.token).toBe(payload.token);
        expect(state.isAuthenticated).toBe(true);
      });

      test("should handle initializeAuth.fulfilled with null payload", () => {
        const action = { type: initializeAuth.fulfilled.type, payload: null };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });

      test("should handle initializeAuth.rejected", () => {
        const action = { type: initializeAuth.rejected.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });
});
