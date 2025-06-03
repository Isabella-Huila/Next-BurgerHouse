import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import productSlice from "@/lib/redux/slices/productSlice";
import authSlice from "@/lib/redux/slices/authSlice";
import cartSlice from "@/lib/redux/slices/cartSlice";
import AdminProductsPage from "@/app/menu/page";

jest.mock("../../components/product/MenuPage", () => {
  return function MockMenuPage() {
    return <div data-testid="menu-page">MenuPage Component</div>;
  };
});

const createMockStore = () => {
  return configureStore({
    reducer: {
      products: productSlice,
      auth: authSlice,
      cart: cartSlice,
    },
    preloadedState: {
      products: {
        products: [],
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { limit: 50, total: 0 },
      },
      auth: {
        isAuthenticated: true,
        user: { id: "1", email: "admin@test.com", role: "admin" },
        loading: false,
        error: null,
      },
      cart: {
        items: [],
        total: 0,
      },
    },
  });
};

describe("AdminProductsPage", () => {
  it("renders MenuPage component", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <AdminProductsPage />
      </Provider>
    );

    expect(screen.getByTestId("menu-page")).toBeInTheDocument();
  });
});
