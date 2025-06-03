import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import EditProductForm from "../../../components/product/EditProductForm";
import { ProductCategories } from "../../../lib/types/product.types";
import productSlice, {
  clearError,
} from "../../../lib/redux/slices/productSlice";

jest.mock("next/image", () => {
  return function MockImage({ src, alt, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        {...props}
        data-testid="mock-image"
      />
    );
  };
});

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="x-icon">X</span>,
}));

const mockProduct = {
  id: "1",
  name: "Test Burger",
  description: "Test Description",
  price: 15,
  category: ProductCategories.burgers,
  isActive: true,
  imageUrl: "https://example.com/image.jpg",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockProductWithoutImage = {
  ...mockProduct,
  imageUrl: "",
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      products: productSlice,
    },
    preloadedState: {
      products: {
        products: [],
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { limit: 50, total: 0 },
        ...initialState,
      },
    },
  });
};

const renderWithStore = (
  component: React.ReactNode,
  store = createMockStore()
) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("EditProductForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders form with product data", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue("Test Burger")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByDisplayValue("Test Burger");
    fireEvent.change(nameInput, { target: { value: "" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("handles checkbox change for isActive", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("validates minimum name length", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByDisplayValue("Test Burger");
    fireEvent.change(nameInput, { target: { value: "a" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("El nombre debe tener al menos 2 caracteres")
      ).toBeInTheDocument();
    });
  });

  it("validates positive price", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const priceInput = screen.getByDisplayValue("15");
    fireEvent.change(priceInput, { target: { value: "0" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("El precio debe ser mayor a 0")
      ).toBeInTheDocument();
    });
  });

  it("displays global error message", () => {
    const errorStore = createMockStore({
      error: "Error de actualización",
    });

    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      errorStore
    );

    expect(screen.getByText("Error de actualización")).toBeInTheDocument();
  });

  it("validates required description field", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByDisplayValue("Test Description");
    fireEvent.change(descriptionInput, { target: { value: "" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("La descripción es requerida")
      ).toBeInTheDocument();
    });
  });

  it("validates empty price field", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const priceInput = screen.getByDisplayValue("15");
    fireEvent.change(priceInput, { target: { value: "" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El precio es requerido")).toBeInTheDocument();
    });
  });

  it("handles category selection change", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const categorySelect = screen.getByDisplayValue("Hamburguesas");
    fireEvent.change(categorySelect, {
      target: { value: ProductCategories.drinks },
    });

    expect(categorySelect).toHaveValue(ProductCategories.drinks);
  });

  it("sets image preview when valid URL is entered", () => {
    renderWithStore(
      <EditProductForm
        product={mockProductWithoutImage}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const imageUrlInput = screen.getByPlaceholderText(
      "https://ejemplo.com/imagen.jpg"
    );
    fireEvent.change(imageUrlInput, {
      target: { value: "https://example.com/new-image.jpg" },
    });

    expect(screen.getByTestId("mock-image")).toBeInTheDocument();
  });

  it("removes image preview when URL is cleared", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const imageUrlInput = screen.getByDisplayValue(
      "https://example.com/image.jpg"
    );
    fireEvent.change(imageUrlInput, { target: { value: "" } });

    expect(screen.queryByTestId("mock-image")).not.toBeInTheDocument();
  });

  it("clears image when X button is clicked", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const clearButton = screen.getByTestId("x-icon").closest("button");
    fireEvent.click(clearButton!);

    expect(screen.queryByTestId("mock-image")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("")).toBeInTheDocument();
  });

  it("handles image load error", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByTestId("mock-image");
    fireEvent.error(image);

    expect(
      screen.getByText("No se pudo cargar la imagen. Verifica la URL.")
    ).toBeInTheDocument();
  });

  it("clears field errors when input changes", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByDisplayValue("Test Burger");
    fireEvent.change(nameInput, { target: { value: "" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "New Name" } });

    expect(
      screen.queryByText("El nombre es requerido")
    ).not.toBeInTheDocument();
  });

  it("shows loading state during update", () => {
    const loadingStore = createMockStore({
      loading: { fetch: false, create: false, update: true, delete: false },
    });

    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      loadingStore
    );

    const submitButton = screen.getByText("Actualizando...");
    expect(submitButton).toBeDisabled();
  });

  it("initializes form with product data including empty imageUrl", () => {
    renderWithStore(
      <EditProductForm
        product={mockProductWithoutImage}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const imageUrlInput = screen.getByPlaceholderText(
      "https://ejemplo.com/imagen.jpg"
    );
    expect(imageUrlInput).toHaveValue("");
    expect(screen.queryByTestId("mock-image")).not.toBeInTheDocument();
  });

  it("renders all category options", () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText("Hamburguesas")).toBeInTheDocument();
    expect(screen.getByText("Acompañamientos")).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
  });

  it("clears error on form submission attempt", async () => {
    const store = createMockStore();
    const mockDispatch = jest
      .fn()
      .mockResolvedValue({ unwrap: () => Promise.resolve() });
    store.dispatch = mockDispatch;

    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
      store
    );

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(clearError());
    });
  });

  it("validates all fields together when multiple are invalid", async () => {
    renderWithStore(
      <EditProductForm
        product={mockProduct}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByDisplayValue("Test Burger");
    const descriptionInput = screen.getByDisplayValue("Test Description");
    const priceInput = screen.getByDisplayValue("15");

    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.change(descriptionInput, { target: { value: "" } });
    fireEvent.change(priceInput, { target: { value: "" } });

    const submitButton = screen.getByText("Actualizar Producto");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
      expect(
        screen.getByText("La descripción es requerida")
      ).toBeInTheDocument();
      expect(screen.getByText("El precio es requerido")).toBeInTheDocument();
    });
  });
});
