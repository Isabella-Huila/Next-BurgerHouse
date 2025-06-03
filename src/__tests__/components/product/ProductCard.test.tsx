import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from '../../../components/product/ProductCard';
import type { Product, ProductCategories } from '../../../lib/types/product.types';
import '@testing-library/jest-dom';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        {...props}
        data-testid="product-image"
      />
    );
  };
});

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Hamburguesa Clásica',
    description: 'Deliciosa hamburguesa con carne, lechuga, tomate y cebolla',
    price: 15000,
    category: 'burgers' as ProductCategories,
    imageUrl: 'https://example.com/burger.jpg',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockOnAddToCart = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockFormatPrice = jest.fn((price: number) => `$${price.toLocaleString()}`);

  const defaultProps = {
    product: mockProduct,
    isAdmin: false,
    isAuthenticated: true,
    onAddToCart: mockOnAddToCart,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    formatPrice: mockFormatPrice
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders product name', () => {
      render(<ProductCard {...defaultProps} />);
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    it('renders product description', () => {
      render(<ProductCard {...defaultProps} />);
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });

    it('renders product price', () => {
      render(<ProductCard {...defaultProps} />);
      expect(screen.getByText(mockFormatPrice(mockProduct.price))).toBeInTheDocument();
    });

    it('renders product image', () => {
      render(<ProductCard {...defaultProps} />);
      const image = screen.getByTestId('product-image');
      expect(image).toHaveAttribute('src', mockProduct.imageUrl);
      expect(image).toHaveAttribute('alt', mockProduct.name);
    });
  });


  describe('Category Emojis', () => {
    it('renders correct emoji for burgers category', () => {
      const burgerProduct = { ...mockProduct, category: 'burgers' as ProductCategories, imageUrl: undefined };
      render(<ProductCard {...defaultProps} product={burgerProduct} />);

      expect(screen.getByText('🍔')).toBeInTheDocument();
    });

    it('renders correct emoji for accompaniments category', () => {
      const accompanimentProduct = { ...mockProduct, category: 'Accompaniments' as ProductCategories, imageUrl: undefined };
      render(<ProductCard {...defaultProps} product={accompanimentProduct} />);

      expect(screen.getByText('🍟')).toBeInTheDocument();
    });

    it('renders correct emoji for drinks category', () => {
      const drinkProduct = { ...mockProduct, category: 'drinks' as ProductCategories, imageUrl: undefined };
      render(<ProductCard {...defaultProps} product={drinkProduct} />);

      expect(screen.getByText('🥤')).toBeInTheDocument();
    });

    it('renders default emoji for unknown category', () => {
      const unknownProduct = { ...mockProduct, category: 'unknown' as ProductCategories, imageUrl: undefined };
      render(<ProductCard {...defaultProps} product={unknownProduct} />);

      expect(screen.getByText('🍽️')).toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    it('shows emoji fallback when image fails to load', async () => {
      render(<ProductCard {...defaultProps} />);

      const image = screen.getByTestId('product-image');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('🍔')).toBeInTheDocument();
      });
    });
  });

  describe('Customer View (Non-Admin)', () => {
    it('shows add to cart button when authenticated', () => {
      render(<ProductCard {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /agregar/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });

    it('calls onAddToCart when add to cart button is clicked', () => {
      render(<ProductCard {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /agregar/i });
      fireEvent.click(addButton);

      expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('shows disabled button with login message when not authenticated', () => {
      render(<ProductCard {...defaultProps} isAuthenticated={false} />);

      const addButton = screen.getByRole('button', { name: /inicia sesión para agregar/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeDisabled();
    });

    it('does not call onAddToCart when button is disabled', () => {
      render(<ProductCard {...defaultProps} isAuthenticated={false} />);

      const addButton = screen.getByRole('button', { name: /inicia sesión para agregar/i });
      fireEvent.click(addButton);

      expect(mockOnAddToCart).not.toHaveBeenCalled();
    });

    it('does not show admin controls', () => {
      render(<ProductCard {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/activo/i)).not.toBeInTheDocument();
    });
  });

  describe('Admin View', () => {
    const adminProps = { ...defaultProps, isAdmin: true };

    it('shows edit and delete buttons instead of add to cart', () => {
      render(<ProductCard {...adminProps} />);

      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      render(<ProductCard {...adminProps} />);

      const editButton = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
    });

    it('calls onDelete when delete button is clicked', () => {
      render(<ProductCard {...adminProps} />);

      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
    });

    it('shows active status for active product', () => {
      render(<ProductCard {...adminProps} />);

      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('shows inactive status for inactive product', () => {
      const inactiveProduct = { ...mockProduct, isActive: false };
      render(<ProductCard {...adminProps} product={inactiveProduct} />);

      expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and accessible names', () => {
      render(<ProductCard {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /agregar/i });
      expect(addButton).toBeInTheDocument();
    });

    it('has proper image alt text', () => {
      render(<ProductCard {...defaultProps} />);

      const image = screen.getByTestId('product-image');
      expect(image).toHaveAttribute('alt', 'Hamburguesa Clásica');
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct CSS classes based on authentication state', () => {
      const { rerender } = render(<ProductCard {...defaultProps} isAuthenticated={true} />);
      
      let addButton = screen.getByRole('button', { name: /agregar/i });
      expect(addButton).toHaveClass('bg-[#ff914d]');

      rerender(<ProductCard {...defaultProps} isAuthenticated={false} />);
      
      addButton = screen.getByRole('button', { name: /inicia sesión para agregar/i });
      expect(addButton).toHaveClass('bg-gray-300');
    });

    it('applies correct status badge classes', () => {
      const { rerender } = render(<ProductCard {...defaultProps} isAdmin={true} />);
      
      let statusBadge = screen.getByText('Activo');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');

      const inactiveProduct = { ...mockProduct, isActive: false };
      rerender(<ProductCard {...defaultProps} isAdmin={true} product={inactiveProduct} />);
      
      statusBadge = screen.getByText('Inactivo');
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty product name gracefully', () => {
      const productWithEmptyName = { ...mockProduct, name: '' };
      render(<ProductCard {...defaultProps} product={productWithEmptyName} />);

      // Should not crash and should render empty name
      expect(screen.queryByText('Hamburguesa Clásica')).not.toBeInTheDocument();
    });

    it('handles empty description gracefully', () => {
      const productWithEmptyDescription = { ...mockProduct, description: '' };
      render(<ProductCard {...defaultProps} product={productWithEmptyDescription} />);

      // Should not crash
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    it('handles zero price', () => {
      const productWithZeroPrice = { ...mockProduct, price: 0 };
      render(<ProductCard {...defaultProps} product={productWithZeroPrice} />);

      expect(mockFormatPrice).toHaveBeenCalledWith(0);
    });

    it('handles very long product names', () => {
      const longName = 'Hamburguesa con ingredientes muy largos y detallados que podrían causar problemas de diseño';
      const productWithLongName = { ...mockProduct, name: longName };
      render(<ProductCard {...defaultProps} product={productWithLongName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles very long descriptions', () => {
      const longDescription = 'Esta es una descripción muy larga que podría causar problemas de diseño y debería ser truncada apropiadamente para mantener la consistencia visual del componente';
      const productWithLongDescription = { ...mockProduct, description: longDescription };
      render(<ProductCard {...defaultProps} product={productWithLongDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});
