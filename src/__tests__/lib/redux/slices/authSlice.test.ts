import authReducer, {
  loginUser,
  registerUser,
  getProfile,
  logout,
  clearError,
  setUser,
  initializeAuth,
} from "@/lib/redux/slices/authSlice";
import { AuthState } from "@/lib/types/auth.types";
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/authApi";
import { storage } from "@/lib/utils/storage";

// Mocks
jest.mock("@/lib/api/authApi");
jest.mock("@/lib/utils/storage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

const mockUser = {
  id: "1",
  email: "test@example.com",
  fullName: "Test User",
  isActive: true,
  roles: ["user"],
};

const mockAuthResponse = {
  user: mockUser,
  token: "test-token",
};

describe("Auth Slice", () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe("Initial State", () => {
    test("should have correct initial state", () => {
      const state = authReducer(undefined, { type: "@@INIT" });
      expect(state).toEqual(initialState);
    });
  });

  describe("Synchronous Actions", () => {
    describe("logout", () => {
      test("should handle logout action", () => {
        const authenticatedState = {
          ...initialState,
          user: mockUser,
          token: "token",
          isAuthenticated: true,
          isLoading: false,
          error: "some error",
        };

        const action = logout();
        const newState = authReducer(authenticatedState, action);

        expect(newState).toEqual({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
        expect(mockedStorage.clearStorage).toHaveBeenCalled();
      });
    });

    describe("clearError", () => {
      test("should clear error state", () => {
        const stateWithError = {
          ...initialState,
          error: "Some error message",
        };

        const action = clearError();
        const newState = authReducer(stateWithError, action);

        expect(newState.error).toBeNull();
        expect(newState).toEqual({
          ...stateWithError,
          error: null,
        });
      });
    });

    describe("setUser", () => {
      test("should set user in state", () => {
        const action = setUser(mockUser);
        const newState = authReducer(initialState, action);

        expect(newState.user).toEqual(mockUser);
        expect(mockedStorage.setUser).toHaveBeenCalledWith(mockUser);
      });
    });
  });

  describe("Async Thunks", () => {
    describe("loginUser", () => {
      const loginData = { email: "test@example.com", password: "password" };

      test("should handle loginUser.pending", () => {
        const action = { type: loginUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle loginUser.fulfilled", () => {
        const action = {
          type: loginUser.fulfilled.type,
          payload: mockAuthResponse,
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(mockAuthResponse.user);
        expect(state.token).toBe(mockAuthResponse.token);
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

      test("should handle loginUser.rejected without payload", () => {
        const action = {
          type: loginUser.rejected.type,
          payload: undefined,
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Login failed");
        expect(state.isAuthenticated).toBe(false);
      });

      test("should dispatch loginUser successfully", async () => {
        const fullProfile = { ...mockUser, fullName: "Full Profile User" };

        mockedAuthApi.login.mockResolvedValue(mockAuthResponse);
        mockedAuthApi.getProfile.mockResolvedValue(fullProfile);

        const result = await store.dispatch(loginUser(loginData));

        expect(result.type).toBe(loginUser.fulfilled.type);
        expect(result.payload).toEqual({
          ...mockAuthResponse,
          user: fullProfile,
        });
        expect(mockedStorage.setToken).toHaveBeenCalledWith(
          mockAuthResponse.token
        );
        expect(mockedStorage.setUser).toHaveBeenCalledWith(fullProfile);
      });

      test("should handle loginUser when getProfile fails", async () => {
        mockedAuthApi.login.mockResolvedValue(mockAuthResponse);
        mockedAuthApi.getProfile.mockRejectedValue(
          new Error("Profile fetch failed")
        );

        const result = await store.dispatch(loginUser(loginData));

        expect(result.type).toBe(loginUser.fulfilled.type);
        expect(result.payload).toEqual(mockAuthResponse);
        expect(mockedStorage.setUser).toHaveBeenCalledWith(
          mockAuthResponse.user
        );
      });

      test("should handle loginUser failure", async () => {
        const errorMessage = "Invalid credentials";
        mockedAuthApi.login.mockRejectedValue(new Error(errorMessage));

        const result = await store.dispatch(loginUser(loginData));

        expect(result.type).toBe(loginUser.rejected.type);
        expect(result.payload).toBe(errorMessage);
      });

      test("should handle loginUser failure with non-Error object", async () => {
        mockedAuthApi.login.mockRejectedValue("String error");

        const result = await store.dispatch(loginUser(loginData));

        expect(result.type).toBe(loginUser.rejected.type);
        expect(result.payload).toBe("Login failed");
      });
    });

    describe("registerUser", () => {
      const registerData = {
        email: "test@example.com",
        password: "password",
        fullName: "Test User",
      };

      test("should handle registerUser.pending", () => {
        const action = { type: registerUser.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      test("should handle registerUser.fulfilled", () => {
        const action = {
          type: registerUser.fulfilled.type,
          payload: mockAuthResponse,
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(mockAuthResponse.user);
        expect(state.token).toBe(mockAuthResponse.token);
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

      test("should handle registerUser.rejected without payload", () => {
        const action = {
          type: registerUser.rejected.type,
          payload: undefined,
        };
        const state = authReducer(initialState, action);

        expect(state.error).toBe("Registration failed");
      });

      test("should dispatch registerUser successfully", async () => {
        mockedAuthApi.register.mockResolvedValue(mockAuthResponse);

        const result = await store.dispatch(registerUser(registerData));

        expect(result.type).toBe(registerUser.fulfilled.type);
        expect(result.payload).toEqual(mockAuthResponse);
        expect(mockedStorage.setToken).toHaveBeenCalledWith(
          mockAuthResponse.token
        );
        expect(mockedStorage.setUser).toHaveBeenCalledWith(
          mockAuthResponse.user
        );
      });

      test("should handle registerUser failure", async () => {
        const errorMessage = "Email already exists";
        mockedAuthApi.register.mockRejectedValue(new Error(errorMessage));

        const result = await store.dispatch(registerUser(registerData));

        expect(result.type).toBe(registerUser.rejected.type);
        expect(result.payload).toBe(errorMessage);
      });

      test("should handle registerUser failure with non-Error object", async () => {
        mockedAuthApi.register.mockRejectedValue("String error");

        const result = await store.dispatch(registerUser(registerData));

        expect(result.type).toBe(registerUser.rejected.type);
        expect(result.payload).toBe("Registration failed");
      });
    });

    describe("getProfile", () => {
      test("should handle getProfile.pending", () => {
        const action = { type: getProfile.pending.type };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(true);
      });

      test("should handle getProfile.fulfilled", () => {
        const action = {
          type: getProfile.fulfilled.type,
          payload: mockUser,
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
      });

      test("should handle getProfile.rejected", () => {
        const action = {
          type: getProfile.rejected.type,
          payload: "Failed to get profile",
        };
        const state = authReducer(initialState, action);

        expect(state.isLoading).toBe(false);
        expect(state.error).toBe("Failed to get profile");
      });

      test("should handle getProfile.rejected without payload", () => {
        const action = {
          type: getProfile.rejected.type,
          payload: undefined,
        };
        const state = authReducer(initialState, action);

        expect(state.error).toBe("Failed to get profile");
      });

      test("should dispatch getProfile successfully", async () => {
        mockedAuthApi.getProfile.mockResolvedValue(mockUser);

        const result = await store.dispatch(getProfile());

        expect(result.type).toBe(getProfile.fulfilled.type);
        expect(result.payload).toEqual(mockUser);
        expect(mockedStorage.setUser).toHaveBeenCalledWith(mockUser);
      });

      test("should handle getProfile failure", async () => {
        const errorMessage = "Unauthorized";
        mockedAuthApi.getProfile.mockRejectedValue(new Error(errorMessage));

        const result = await store.dispatch(getProfile());

        expect(result.type).toBe(getProfile.rejected.type);
        expect(result.payload).toBe(errorMessage);
      });

      test("should handle getProfile failure with non-Error object", async () => {
        mockedAuthApi.getProfile.mockRejectedValue("Network error");

        const result = await store.dispatch(getProfile());

        expect(result.type).toBe(getProfile.rejected.type);
        expect(result.payload).toBe("Failed to get profile");
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
          user: mockUser,
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

      test("should initialize auth with valid token and user", async () => {
        const mockToken = "valid-token";

        mockedStorage.isTokenValid.mockReturnValue(true);
        mockedStorage.getToken.mockReturnValue(mockToken);
        mockedStorage.getUser.mockReturnValue(mockUser);

        const result = await store.dispatch(initializeAuth());

        expect(result.type).toBe(initializeAuth.fulfilled.type);
        expect(result.payload).toEqual({
          user: mockUser,
          token: mockToken,
        });
      });

      test("should initialize auth with valid token but no user", async () => {
        const mockToken = "valid-token";

        mockedStorage.isTokenValid.mockReturnValue(true);
        mockedStorage.getToken.mockReturnValue(mockToken);
        mockedStorage.getUser.mockReturnValue(null);
        mockedAuthApi.getProfile.mockResolvedValue(mockUser);

        const result = await store.dispatch(initializeAuth());

        expect(result.type).toBe(initializeAuth.fulfilled.type);
        expect(result.payload).toEqual({
          user: mockUser,
          token: mockToken,
        });
        expect(mockedStorage.setUser).toHaveBeenCalledWith(mockUser);
      });

      test("should handle auth initialization when getProfile fails", async () => {
        const mockToken = "valid-token";

        mockedStorage.isTokenValid.mockReturnValue(true);
        mockedStorage.getToken.mockReturnValue(mockToken);
        mockedStorage.getUser.mockReturnValue(null);
        mockedAuthApi.getProfile.mockRejectedValue(new Error("Unauthorized"));

        const result = await store.dispatch(initializeAuth());

        expect(result.type).toBe(initializeAuth.fulfilled.type);
        expect(result.payload).toBeNull();
        expect(mockedStorage.clearStorage).toHaveBeenCalled();
      });

      test("should return null when token is invalid", async () => {
        mockedStorage.isTokenValid.mockReturnValue(false);

        const result = await store.dispatch(initializeAuth());

        expect(result.type).toBe(initializeAuth.fulfilled.type);
        expect(result.payload).toBeNull();
      });

      test("should return null when no token exists", async () => {
        mockedStorage.isTokenValid.mockReturnValue(true);
        mockedStorage.getToken.mockReturnValue(null);

        const result = await store.dispatch(initializeAuth());

        expect(result.type).toBe(initializeAuth.fulfilled.type);
        expect(result.payload).toBeNull();
      });
    });
  });

  describe("State Transitions", () => {
    test("should maintain state consistency during loading", () => {
      let state = authReducer(initialState, { type: loginUser.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      state = authReducer(state, {
        type: loginUser.fulfilled.type,
        payload: mockAuthResponse,
      });
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });

    test("should handle multiple error states", () => {
      let state = authReducer(initialState, {
        type: loginUser.rejected.type,
        payload: "Login error",
      });
      expect(state.error).toBe("Login error");

      state = authReducer(state, clearError());
      expect(state.error).toBeNull();

      state = authReducer(state, {
        type: registerUser.rejected.type,
        payload: "Register error",
      });
      expect(state.error).toBe("Register error");
    });

    test("should handle user updates after authentication", () => {
      let state = authReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload: mockAuthResponse,
      });

      const updatedUser = { ...mockUser, fullName: "Updated Name" };
      state = authReducer(state, setUser(updatedUser));

      expect(state.user).toEqual(updatedUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle unknown action types", () => {
      const state = authReducer(initialState, { type: "UNKNOWN_ACTION" });
      expect(state).toEqual(initialState);
    });

    test("should handle partial user data", () => {
      const partialUser = { ...mockUser, roles: [] };
      const action = setUser(partialUser);
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(partialUser);
    });

  });
});
