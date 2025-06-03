import { Product } from "../../../lib/types/product.types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CreateProductDto, UpdateProductDto } from "../../types/product.types";
import { productApi } from "../../../lib/api/productApi";

interface PaginationMeta {
  limit: number;
  total: number;
}

interface ProductsState {
  products: Product[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
  pagination: PaginationMeta;
}

const initialState: ProductsState = {
  products: [],
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  pagination: {
    limit: 50,
    total: 0,
  },
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { limit = 50 } = params;
      const backendParams = {
        limit,
      };

      const response = await productApi.getAllProducts(backendParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al cargar productos");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (createData: CreateProductDto, { rejectWithValue }) => {
    try {
      return await productApi.createProduct(createData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al crear producto");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (
    { name, updateData }: { name: string; updateData: UpdateProductDto },
    { rejectWithValue }
  ) => {
    try {
      return await productApi.updateProduct(name, updateData);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al actualizar producto");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (name: string, { rejectWithValue }) => {
    try {
      await productApi.deleteProduct(name);
      return name;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error al eliminar producto");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setPageLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.error = null;
        if (Array.isArray(action.payload)) {
          state.products = action.payload;
          state.pagination.total = action.payload.length;
        } else if (action.payload?.data) {
          state.products = action.payload.data;
          state.pagination.total =
            action.payload.meta?.total || action.payload.data.length;
        } else {
          state.products = [];
          state.pagination.total = 0;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Error al cargar productos";
      })
      .addCase(createProduct.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading.create = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading.create = false;
        state.error = (action.payload as string) || "Error al crear producto";
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.products.findIndex(
          (p) => p.name === action.payload.name
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading.update = false;
        state.error =
          (action.payload as string) || "Error al actualizar producto";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.products = state.products.filter(
          (p) => p.name !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading.delete = false;
        state.error =
          (action.payload as string) || "Error al eliminar producto";
      });
  },
});

export const { setPageLimit, clearError, resetProducts } =
  productsSlice.actions;
export default productsSlice.reducer;
