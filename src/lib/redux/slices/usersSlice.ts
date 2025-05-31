import { UpdateUserDto, usersApi } from "@/lib/api/userApi";
import { User } from "@/lib/types/auth.types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface PaginationMeta {
  limit: number;
  total: number;
}

interface UsersState {
  users: User[];
  loading: {
    fetch: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
  pagination: PaginationMeta;
  filters: {
    isActive?: boolean;
    roles?: string[];
  };
}

const initialState: UsersState = {
  users: [],
  loading: {
    fetch: false,
    update: false,
    delete: false,
  },
  error: null,
  pagination: {
    limit: 10,
    total: 0,
  },
  filters: {},
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { limit = 10 } = params;

      const backendParams = {
        limit,
      };

      const response = await usersApi.getAllUsers(backendParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al cargar usuarios");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { email, updateData }: { email: string; updateData: UpdateUserDto },
    { rejectWithValue }
  ) => {
    try {
      return await usersApi.updateUser(email, updateData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al actualizar usuario");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (email: string, { rejectWithValue }) => {
    try {
      await usersApi.deleteUser(email);
      return email;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al eliminar usuario");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<UsersState["filters"]>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPageLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUsers: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.error = null;

        if (Array.isArray(action.payload)) {
          state.users = action.payload;
          state.pagination.total = action.payload.length;
        } else if (action.payload?.data) {
          state.users = action.payload.data;
          state.pagination.total =
            action.payload.meta?.total || action.payload.data.length;
        } else {
          state.users = [];
          state.pagination.total = 0;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Error al cargar usuarios";
      })

      .addCase(updateUser.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.users.findIndex(
          (u) => u.email === action.payload.email
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading.update = false;
        state.error =
          (action.payload as string) || "Error al actualizar usuario";
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.users = state.users.filter((u) => u.email !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = (action.payload as string) || "Error al eliminar usuario";
      });
  },
});

export const { setFilters, setPageLimit, clearError, resetUsers } =
  usersSlice.actions;
export default usersSlice.reducer;
