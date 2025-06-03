import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CreateProductForm from "../../../components/product/CreateProductForm";
import { ProductCategories } from "../../../lib/types/product.types";
import productSlice from "../../../lib/redux/slices/productSlice";

const mockStore = configureStore({
  reducer: {
    products: productSlice,
  },
  preloadedState: {
    products: {
      products: [],
      loading: { fetch: false, create: false, update: false, delete: false },
      error: null,
      pagination: { limit: 50, total: 0 },
    },
  },
});

const mockProps = {
  defaultCategory: ProductCategories.burgers,
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<Provider store={mockStore}>{component}</Provider>);
};

describe("CreateProductForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays validation errors for empty required fields", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const submitButton = screen.getByRole("button", {
      name: /Crear Producto/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
      expect(
        screen.getByText("La descripción es requerida")
      ).toBeInTheDocument();
      expect(screen.getByText("El precio es requerido")).toBeInTheDocument();
    });
  });

  test("validates minimum name length", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const nameInput = screen.getByLabelText(/NOMBRE DEL PRODUCTO/i);
    fireEvent.change(nameInput, { target: { value: "A" } });

    const submitButton = screen.getByRole("button", {
      name: /Crear Producto/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("El nombre debe tener al menos 2 caracteres")
      ).toBeInTheDocument();
    });
  });

  test("validates price is greater than 0", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const priceInput = screen.getByLabelText(/PRECIO/i);
    fireEvent.change(priceInput, { target: { value: "0" } });

    const submitButton = screen.getByRole("button", {
      name: /Crear Producto/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("El precio debe ser mayor a 0")
      ).toBeInTheDocument();
    });
  });

  test("shows image preview when valid URL is entered", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const imageInput = screen.getByPlaceholderText(
      /https:\/\/ejemplo.com\/imagen.jpg/i
    );
    fireEvent.change(imageInput, {
      target: { value: "https://example.com/image.jpg" },
    });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });
  });

  test("clears image preview when clear button is clicked", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const imageInput = screen.getByPlaceholderText(
      /https:\/\/ejemplo.com\/imagen.jpg/i
    );
    fireEvent.change(imageInput, {
      target: { value: "https://example.com/image.jpg" },
    });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", { name: "" }); // X button
    fireEvent.click(clearButton);

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  test("calls onCancel when cancel button is clicked", () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test("clears field errors when user starts typing", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const submitButton = screen.getByRole("button", {
      name: /Crear Producto/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/NOMBRE DEL PRODUCTO/i);
    fireEvent.change(nameInput, { target: { value: "Test Product" } });

    expect(
      screen.queryByText("El nombre es requerido")
    ).not.toBeInTheDocument();
  });

  test("handles image load error and sets error message", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const imageInput = screen.getByPlaceholderText(
      /https:\/\/ejemplo.com\/imagen.jpg/i
    );
    fireEvent.change(imageInput, {
      target: { value: "https://example.com/invalid.jpg" },
    });

    await waitFor(() => {
      const img = screen.getByAltText("Preview") as HTMLImageElement;
      fireEvent.error(img);
    });

    expect(
      screen.getByText("No se pudo cargar la imagen. Verifica la URL.")
    ).toBeInTheDocument();
  });

  jest.mock("../../../lib/redux/slices/productSlice", () => {
    const originalModule = jest.requireActual(
      "../../../lib/redux/slices/productSlice"
    );
    return {
      ...originalModule,
      createProduct: () => () => Promise.reject("Error de red"),
    };
  });

  test("disables submit button and shows loading text when creating product", () => {
    const loadingStore = configureStore({
      reducer: {
        products: productSlice,
      },
      preloadedState: {
        products: {
          products: [],
          loading: { fetch: false, create: true, update: false, delete: false },
          error: null,
          pagination: { limit: 50, total: 0 },
        },
      },
    });

    render(
      <Provider store={loadingStore}>
        <CreateProductForm {...mockProps} />
      </Provider>
    );

    const submitButton = screen.getByRole("button", { name: /Creando.../i });
    expect(submitButton).toBeDisabled();
  });

  test("displays error message when product creation fails", async () => {
    const errorStore = configureStore({
      reducer: {
        products: productSlice,
      },
      preloadedState: {
        products: {
          products: [],
          loading: {
            fetch: false,
            create: false,
            update: false,
            delete: false,
          },
          error: "Error creating product",
          pagination: { limit: 50, total: 0 },
        },
      },
    });

    render(
      <Provider store={errorStore}>
        <CreateProductForm {...mockProps} />
      </Provider>
    );

    expect(screen.getByText("Error creating product")).toBeInTheDocument();
  });

  test("does not show image preview for invalid URL", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const imageInput = screen.getByPlaceholderText(
      /https:\/\/ejemplo.com\/imagen.jpg/i
    );
    fireEvent.change(imageInput, { target: { value: "invalid-url" } });

    await waitFor(() => {
      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
    });
  });

  test("clears errors when user starts typing in a field with error", async () => {
    renderWithProvider(<CreateProductForm {...mockProps} />);

    const submitButton = screen.getByRole("button", {
      name: /Crear Producto/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/NOMBRE DEL PRODUCTO/i);
    fireEvent.change(nameInput, { target: { value: "T" } });

    expect(
      screen.queryByText("El nombre es requerido")
    ).not.toBeInTheDocument();
  });
});
