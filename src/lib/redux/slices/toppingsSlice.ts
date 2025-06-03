import { Topping } from "../../../lib/types/topping.types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toppingApi } from '../../api/toppingApi';
import { CreateToppingDto, UpdateToppingDto } from '../../types/topping.types';

interface PaginationMeta {
  limit: number;
  total: number;
}

interface ToppingsState {
  toppings: Topping[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
  pagination: PaginationMeta;
}

const initialState: ToppingsState = {
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

export const fetchToppings = createAsyncThunk(
  "toppings/fetchToppings",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { limit = 10 } = params;
      const backendParams = {
        limit,
      };

      const response = await toppingApi.getAllToppings(backendParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al cargar toppings");
    }
  }
);

export const createTopping = createAsyncThunk(
  "toppings/createTopping",
  async (createData: CreateToppingDto, { rejectWithValue }) => {
    try {
      return await toppingApi.createTopping(createData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al crear topping");
    }
  }
);

export const updateTopping = createAsyncThunk(
  "toppings/updateTopping",
  async (
    { name, updateData }: { name: string; updateData: UpdateToppingDto },
    { rejectWithValue }
  ) => {
    try {
      return await toppingApi.updateTopping(name, updateData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al actualizar topping");
    }
  }
);

export const deleteTopping = createAsyncThunk(
  "toppings/deleteTopping",
  async (name: string, { rejectWithValue }) => {
    try {
      await toppingApi.deleteTopping(name);
      return name;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al eliminar topping");
    }
  }
);

const toppingsSlice = createSlice({
  name: "toppings",
  initialState,
  reducers: {
    setPageLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetToppings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchToppings.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchToppings.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.error = null;
        if (Array.isArray(action.payload)) {
          state.toppings = action.payload;
          state.pagination.total = action.payload.length;
        } else if (action.payload?.data) {
          state.toppings = action.payload.data;
          state.pagination.total =
            action.payload.meta?.total || action.payload.data.length;
        } else {
          state.toppings = [];
          state.pagination.total = 0;
        }
      })
      .addCase(fetchToppings.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Error al cargar toppings";
      })
      .addCase(createTopping.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createTopping.fulfilled, (state, action) => {
        state.loading.create = false;
        state.toppings.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTopping.rejected, (state, action) => {
        state.loading.create = false;
        state.error = (action.payload as string) || "Error al crear topping";
      })
      .addCase(updateTopping.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateTopping.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.toppings.findIndex(
          (t) => t.name === action.payload.name
        );
        if (index !== -1) {
          state.toppings[index] = action.payload;
        }
      })
      .addCase(updateTopping.rejected, (state, action) => {
        state.loading.update = false;
        state.error =
          (action.payload as string) || "Error al actualizar topping";
      })
      .addCase(deleteTopping.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteTopping.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.toppings = state.toppings.filter(
          (t) => t.name !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteTopping.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = (action.payload as string) || "Error al eliminar topping";
      });
  },
});

export const { setPageLimit, clearError, resetToppings } =
  toppingsSlice.actions;
export default toppingsSlice.reducer;
