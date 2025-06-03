import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "../../../components/product/ProductCard";
import { ProductCategories } from "../../../lib/types/product.types";

const mockProduct = {
  id: "1",
  name: "Test Burger",
  description: "Delicious test burger",
  price: 15000,
  category: ProductCategories.burgers,
  isActive: true,
  imageUrl: "https://example.com/image.jpg",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockFormatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);

describe("ProductCard", () => {
  const mockOnAddToCart = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("shows category emoji when no image", () => {
    const productWithoutImage = { ...mockProduct, imageUrl: undefined };
    render(
      <ProductCard
        product={productWithoutImage}
        isAdmin={false}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    expect(screen.getByText("🍔")).toBeInTheDocument();
  });

  it("handles add to cart for authenticated users", () => {
    render(
      <ProductCard
        product={mockProduct}
        isAdmin={false}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    const addButton = screen.getByText("AGREGAR");
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it("disables add to cart for unauthenticated users", () => {
    render(
      <ProductCard
        product={mockProduct}
        isAdmin={false}
        isAuthenticated={false}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    const addButton = screen.getByText("INICIA SESIÓN PARA AGREGAR");
    expect(addButton).toBeDisabled();
  });

  it("shows admin controls for admin users", () => {
    render(
      <ProductCard
        product={mockProduct}
        isAdmin={true}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("handles edit button click", () => {
    render(
      <ProductCard
        product={mockProduct}
        isAdmin={true}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    const editButton = screen.getByText("Editar");
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });

  it("handles delete button click", () => {
    render(
      <ProductCard
        product={mockProduct}
        isAdmin={true}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    const deleteButton = screen.getByText("Eliminar");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
  });

  it("shows inactive status for inactive products", () => {
    const inactiveProduct = { ...mockProduct, isActive: false };
    render(
      <ProductCard
        product={inactiveProduct}
        isAdmin={true}
        isAuthenticated={true}
        onAddToCart={mockOnAddToCart}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        formatPrice={mockFormatPrice}
      />
    );

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });
});
