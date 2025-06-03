import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import MenuPage from "../../../components/product/MenuPage";
import productSlice, {
  deleteProduct,
} from "../../../lib/redux/slices/productSlice";
import cartSlice from "../../../lib/redux/slices/cartSlice";
import authSlice from "../../../lib/redux/slices/authSlice";
import { ProductCategories } from "../../../lib/types/product.types";

jest.mock("../../../lib/hooks/useAdmin", () => ({
  useAdmin: jest.fn(),
}));

jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock("../../../components/product/ProductCard", () => {
  return function MockProductCard({
    product,
    onAddToCart,
    onEdit,
    onDelete,
    isAdmin,
    formatPrice,
  }: any) {
    return (
      <div data-testid={`product-card-${product.id}`}>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span>{formatPrice(product.price)}</span>
        {isAdmin ? (
          <>
            <button
              onClick={() => onEdit(product)}
              data-testid={`edit-${product.id}`}
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(product)}
              data-testid={`delete-${product.id}`}
            >
              Eliminar
            </button>
          </>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            data-testid={`add-to-cart-${product.id}`}
          >
            Agregar
          </button>
        )}
      </div>
    );
  };
});

jest.mock("../../../components/product/CreateProductForm", () => {
  return function MockCreateProductForm({ onSuccess, onCancel }: any) {
    return (
      <div data-testid="create-product-form">
        <button onClick={onSuccess} data-testid="form-success">
          Success
        </button>
        <button onClick={onCancel} data-testid="form-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock("../../../components/product/EditProductForm", () => {
  return function MockEditProductForm({ onSuccess, onCancel, product }: any) {
    return (
      <div data-testid="edit-product-form">
        <span>Editing: {product?.name}</span>
        <button onClick={onSuccess} data-testid="form-success">
          Success
        </button>
        <button onClick={onCancel} data-testid="form-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock("../../../components/ui/Modal", () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    );
  };
});

jest.mock("../../../components/ui/Alert", () => {
  return function MockAlert({ type, children, onDismiss }: any) {
    return (
      <div data-testid={`alert-${type}`}>
        {children}
        {onDismiss && (
          <button onClick={onDismiss} data-testid="alert-dismiss">
            Dismiss
          </button>
        )}
      </div>
    );
  };
});

const mockDispatch = jest.fn();
jest.mock("../../../lib/hooks/redux", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: () => mockDispatch,
}));

const { useAppSelector } = require("../../../lib/hooks/redux");
const { useAdmin } = require("../../../lib/hooks/useAdmin");

const mockProducts = [
  {
    id: "1",
    name: "Hamburguesa Clásica",
    description: "Deliciosa hamburguesa con carne",
    price: 15000,
    category: ProductCategories.burgers,
    isActive: true,
    imageUrl: "https://example.com/burger.jpg",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    id: "2",
    name: "Papas Fritas",
    description: "Papas crujientes",
    price: 8000,
    category: ProductCategories.Accompaniments,
    isActive: true,
    imageUrl: null,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    id: "3",
    name: "Coca Cola",
    description: "Bebida refrescante",
    price: 5000,
    category: ProductCategories.drinks,
    isActive: false,
    imageUrl: "https://example.com/coke.jpg",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
];

const defaultProductsState = {
  products: mockProducts,
  loading: { fetch: false, create: false, update: false, delete: false },
  error: null,
};

const defaultAuthState = {
  isAuthenticated: true,
  user: { id: "1", email: "test@test.com" },
};

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      products: productSlice,
      cart: cartSlice,
      auth: authSlice,
    },
    preloadedState: initialState,
  });
};

describe("MenuPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();

    useAppSelector.mockImplementation((selector: any) => {
      const state = {
        products: defaultProductsState,
        auth: defaultAuthState,
      };
      return selector(state);
    });

    useAdmin.mockReturnValue({ isAdmin: false });

    window.confirm = jest.fn();
    window.alert = jest.fn();
  });

  describe("Category Navigation", () => {
    it("should filter products by selected category", () => {
      render(<MenuPage />);

      expect(screen.getByTestId("product-card-1")).toBeInTheDocument();
      expect(screen.queryByTestId("product-card-2")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("ACOMPAÑAMIENTOS"));

      expect(screen.queryByTestId("product-card-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("product-card-2")).toBeInTheDocument();
    });

    it("should show empty state when no products in category", () => {
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          products: { ...defaultProductsState, products: [] },
          auth: defaultAuthState,
        };
        return selector(state);
      });

      render(<MenuPage />);

      expect(
        screen.getByText("No hay productos disponibles")
      ).toBeInTheDocument();
    });
  });

  describe("Admin Features", () => {
    beforeEach(() => {
      useAdmin.mockReturnValue({ isAdmin: true });
    });

    it('should show "NUEVO PRODUCTO" button for admin users', () => {
      render(<MenuPage />);

      expect(screen.getByText("NUEVO PRODUCTO")).toBeInTheDocument();
    });

    it('should not show "NUEVO PRODUCTO" button for regular users', () => {
      useAdmin.mockReturnValue({ isAdmin: false });

      render(<MenuPage />);

      expect(screen.queryByText("NUEVO PRODUCTO")).not.toBeInTheDocument();
    });

    it('should open create product modal when clicking "NUEVO PRODUCTO"', () => {
      render(<MenuPage />);

      fireEvent.click(screen.getByText("NUEVO PRODUCTO"));

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Crear Nuevo Producto")).toBeInTheDocument();
    });

    it("should not delete product if confirmation is cancelled", () => {
      window.confirm = jest.fn().mockReturnValue(false);

      render(<MenuPage />);

      const deleteButton = screen.getByTestId("delete-1");
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: deleteProduct.pending.type,
        })
      );
    });
  });

  describe("Cart Operations", () => {
    it("should add product to cart when authenticated", () => {
      render(<MenuPage />);

      const addToCartButton = screen.getByTestId("add-to-cart-1");
      fireEvent.click(addToCartButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart/addItem",
          payload: mockProducts[0],
        })
      );
    });

    it("should show alert when trying to add to cart while not authenticated", () => {
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          products: defaultProductsState,
          auth: { ...defaultAuthState, isAuthenticated: false },
        };
        return selector(state);
      });

      render(<MenuPage />);

      const addToCartButton = screen.getByTestId("add-to-cart-1");
      fireEvent.click(addToCartButton);

      expect(window.alert).toHaveBeenCalledWith(
        "Debes iniciar sesión para agregar productos al carrito"
      );
    });

    it("should show success message after adding to cart", async () => {
      render(<MenuPage />);

      const addToCartButton = screen.getByTestId("add-to-cart-1");
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(screen.getByTestId("alert-success")).toBeInTheDocument();
        expect(
          screen.getByText("Hamburguesa Clásica agregado al carrito")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Modal Operations", () => {
    beforeEach(() => {
      useAdmin.mockReturnValue({ isAdmin: true });
    });

    it("should open edit modal when editing a product", () => {
      render(<MenuPage />);

      const editButton = screen.getByTestId("edit-1");
      fireEvent.click(editButton);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("Editar Producto")).toBeInTheDocument();
      expect(
        screen.getByText("Editing: Hamburguesa Clásica")
      ).toBeInTheDocument();
    });

    it("should close modal and show success message on successful creation", async () => {
      render(<MenuPage />);

      fireEvent.click(screen.getByText("NUEVO PRODUCTO"));
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("form-success"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
        expect(screen.getByTestId("alert-success")).toBeInTheDocument();
        expect(
          screen.getByText("Producto creado exitosamente")
        ).toBeInTheDocument();
      });
    });

    it("should close modal and show success message on successful update", async () => {
      render(<MenuPage />);

      fireEvent.click(screen.getByTestId("edit-1"));
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("form-success"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
        expect(screen.getByTestId("alert-success")).toBeInTheDocument();
        expect(
          screen.getByText("Producto actualizado exitosamente")
        ).toBeInTheDocument();
      });
    });

    it("should cancel modal operations", () => {
      render(<MenuPage />);

      fireEvent.click(screen.getByText("NUEVO PRODUCTO"));
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("form-cancel"));
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when present", () => {
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          products: {
            ...defaultProductsState,
            error: "Error loading products",
          },
          auth: defaultAuthState,
        };
        return selector(state);
      });

      render(<MenuPage />);

      expect(screen.getByTestId("alert-error")).toBeInTheDocument();
      expect(screen.getByText("Error loading products")).toBeInTheDocument();
    });

    it("should clear error when dismissing alert", () => {
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          products: {
            ...defaultProductsState,
            error: "Error loading products",
          },
          auth: defaultAuthState,
        };
        return selector(state);
      });

      render(<MenuPage />);

      const dismissButton = screen.getByTestId("alert-dismiss");
      fireEvent.click(dismissButton);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "products/clearError",
        })
      );
    });
  });

  describe("Success Message Auto-dismiss", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should auto-dismiss success messages after 3 seconds", async () => {
      render(<MenuPage />);

      const addToCartButton = screen.getByTestId("add-to-cart-1");
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(screen.getByTestId("alert-success")).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByTestId("alert-success")).not.toBeInTheDocument();
      });
    });
  });

  describe("Product Filtering", () => {
    it("should only show active products", () => {
      render(<MenuPage />);

      fireEvent.click(screen.getByText("BEBIDAS"));

      expect(screen.queryByTestId("product-card-3")).not.toBeInTheDocument();
      expect(
        screen.getByText("No hay productos disponibles")
      ).toBeInTheDocument();
    });

    it("should show different empty state messages for admin vs regular users", () => {
      useAppSelector.mockImplementation((selector: any) => {
        const state = {
          products: { ...defaultProductsState, products: [] },
          auth: defaultAuthState,
        };
        return selector(state);
      });

      useAdmin.mockReturnValue({ isAdmin: false });
      const { rerender } = render(<MenuPage />);
      expect(
        screen.getByText("Pronto agregaremos productos a esta categoría.")
      ).toBeInTheDocument();

      useAdmin.mockReturnValue({ isAdmin: true });
      rerender(<MenuPage />);
      expect(
        screen.getByText("Agrega el primer producto para esta categoría.")
      ).toBeInTheDocument();
    });
  });
});
