import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  LoginDto,
  RegisterDto,
  User,
  AuthResponse,
} from "../../types/auth.types";
import { authApi } from "../../api/authApi";
import { storage } from "../../utils/storage";

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginDto,
  { rejectValue: string }
>("auth/loginUser", async (loginData, { rejectWithValue }) => {
  try {
    const response = await authApi.login(loginData);
    storage.setToken(response.token);
    try {
      const fullProfile = await authApi.getProfile();
      storage.setUser(fullProfile);
      return { ...response, user: fullProfile };
    } catch {
      storage.setUser(response.user);
      return response;
    }
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed"
    );
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterDto,
  { rejectValue: string }
>("auth/registerUser", async (registerData, { rejectWithValue }) => {
  try {
    const response = await authApi.register(registerData);
    storage.setToken(response.token);
    storage.setUser(response.user);
    return response;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Registration failed"
    );
  }
});

export const getProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getProfile();
      storage.setUser(user);
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to get profile"
      );
    }
  }
);

export const initializeAuth = createAsyncThunk<
  { user: User; token: string } | null,
  void
>("auth/initializeAuth", async () => {
  if (storage.isTokenValid()) {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      return { user, token };
    } else if (token) {
      try {
        const user = await authApi.getProfile();
        storage.setUser(user);
        return { user, token };
      } catch {
        storage.clearStorage();
        return null;
      }
    }
  }
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      storage.clearStorage();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
        state.isAuthenticated = false;
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to get profile";
      })
      // Casos para initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
