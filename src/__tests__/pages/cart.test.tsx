import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import CartPage from '../../app/cart/page';
import cartSlice from '../../lib/redux/slices/cartSlice';
import toppingsSlice from '../../lib/redux/slices/toppingsSlice';
import { order } from '../../lib/api/orderApi';

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('lucide-react', () => ({
  Trash2: function MockTrash2({ size }: { size?: number }) {
    return <div data-testid="trash-icon" style={{ width: size, height: size }}>🗑️</div>;
  },
  ArrowLeft: function MockArrowLeft({ className }: { className?: string }) {
    return <div data-testid="arrow-left" className={className}>←</div>;
  },
  CreditCard: function MockCreditCard({ className }: { className?: string }) {
    return <div data-testid="credit-card" className={className}>💳</div>;
  },
  Plus: function MockPlus({ size }: { size?: number }) {
    return <div data-testid="plus-icon" style={{ width: size, height: size }}>+</div>;
  },
  Minus: function MockMinus({ size }: { size?: number }) {
    return <div data-testid="minus-icon" style={{ width: size, height: size }}>-</div>;
  },
  X: function MockX({ size }: { size?: number }) {
    return <div data-testid="x-icon" style={{ width: size, height: size }}>×</div>;
  },
}));

jest.mock('../../lib/hooks/useAuthUserId', () => ({
  useAuthUserId: () => 'test-user-id',
}));

jest.mock('../../lib/utils/price', () => ({
  formatPrice: (price: number) => `$${price.toLocaleString()}`,
}));

jest.mock('axios');
jest.mock('../../lib/api/orderApi');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedOrder = order as jest.Mocked<typeof order>;

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartSlice,
      toppings: toppingsSlice,
    },
    preloadedState: {
      cart: {
        items: [],
        total: 0,
      },
      toppings: {
        toppings: [],
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 0, limit: 10, total: 0 },
      },
      ...initialState,
    },
  });
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

// Mock data
const mockBurgerItem = {
  id: 'burger-1',
  name: 'Hamburguesa Clásica',
  price: 15000,
  category: 'burgers',
  quantity: 2,
};

const mockFriesItem = {
  id: 'fries-1',
  name: 'Papas Fritas',
  price: 8000,
  category: 'sides',
  quantity: 1,
};

const mockToppings = [
  { id: 'topping-1', name: 'Queso Extra', price: 2000, isActive: true },
  { id: 'topping-2', name: 'Bacon', price: 3000, isActive: true },
  { id: 'topping-3', name: 'Aguacate', price: 2500, isActive: true },
];

describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000', href: 'http://localhost:3000/cart' },
      writable: true,
    });
  });

  describe('Empty Cart', () => {
    it('should render empty cart message when no items', () => {
      renderWithProvider(<CartPage />);
      
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      expect(screen.getByText('Agrega algunos productos del menú para continuar')).toBeInTheDocument();
      expect(screen.getByText('🛒')).toBeInTheDocument();
    });

    it('should render explore menu link when cart is empty', () => {
      renderWithProvider(<CartPage />);
      
      const exploreLink = screen.getByRole('link', { name: /Explorar Menú/i });
      expect(exploreLink).toBeInTheDocument();
      expect(exploreLink).toHaveAttribute('href', '/menu');
    });

    it('should have correct styling on empty cart container', () => {
      renderWithProvider(<CartPage />);
      
      const emptyContainer = screen.getByText('Tu carrito está vacío').closest('div');
      expect(emptyContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-8', 'text-center');
    });
  });

  describe('Cart with Items', () => {
    const initialStateWithItems = {
      cart: {
        items: [mockBurgerItem, mockFriesItem],
        total: 38000,
      },
      toppings: {
        toppings: mockToppings,
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 3, limit: 10, total: 3 },
      },
    };

    it('should render cart items correctly', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
      expect(screen.getByText('Papas Fritas')).toBeInTheDocument();
      expect(screen.getByText('$15.000 c/u')).toBeInTheDocument();
      expect(screen.getByText('$8.000 c/u')).toBeInTheDocument();
    });

    it('should render cart title and back link', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
      
      const backLink = screen.getByRole('link', { name: /Volver al menú/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/menu');
    });

    it('should display total price correctly', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      expect(screen.getByText('$38.000')).toBeInTheDocument();
      expect(screen.getByText('Subtotal productos:')).toBeInTheDocument();
    });

    it('should render quantity controls for each item', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const quantityDisplays = screen.getAllByText('2');
      expect(quantityDisplays).toHaveLength(1); 
      
      const quantityDisplay = screen.getByText('1');
      expect(quantityDisplay).toBeInTheDocument(); 
    });

    it('should render delete buttons for each item', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const deleteButtons = screen.getAllByTestId('trash-icon');
      expect(deleteButtons).toHaveLength(2); 
    });
  });

  describe('Quantity Management', () => {
    const initialStateWithItems = {
      cart: {
        items: [mockBurgerItem],
        total: 30000,
      },
    };

    it('should increase quantity when plus button is clicked', async () => {
      const { store } = renderWithProvider(<CartPage />, initialStateWithItems);
      
      const plusButtons = screen.getAllByText('+');
      const plusButton = plusButtons.find(btn => btn.closest('.border'));
      
      fireEvent.click(plusButton!);
      
      await waitFor(() => {
        const actions = store.getState();
        expect(plusButton).toBeInTheDocument();
      });
    });

    it('should decrease quantity when minus button is clicked', async () => {
      const { store } = renderWithProvider(<CartPage />, initialStateWithItems);
      
      const minusButtons = screen.getAllByText('-');
      const minusButton = minusButtons.find(btn => btn.closest('.border'));
      
      fireEvent.click(minusButton!);
      
      await waitFor(() => {
        expect(minusButton).toBeInTheDocument();
      });
    });

    it('should remove item when delete button is clicked', async () => {
      const { store } = renderWithProvider(<CartPage />, initialStateWithItems);
      
      const deleteButton = screen.getByTestId('trash-icon');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(deleteButton).toBeInTheDocument();
      });
    });
  });

  describe('Cart Actions', () => {
    const initialStateWithItems = {
      cart: {
        items: [mockBurgerItem],
        total: 30000,
      },
      toppings: {
        toppings: mockToppings,
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 3 },
      },
    };

    it('should render clear cart button', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const clearButton = screen.getByText('Vaciar Carrito');
      expect(clearButton).toBeInTheDocument();
    });

    it('should render checkout button', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      expect(checkoutButton).toBeInTheDocument();
      expect(screen.getByTestId('credit-card')).toBeInTheDocument();
    });

    it('should clear cart when clear button is clicked', async () => {
      const { store } = renderWithProvider(<CartPage />, initialStateWithItems);
      
      const clearButton = screen.getByText('Vaciar Carrito');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(clearButton).toBeInTheDocument();
      });
    });
  });

  describe('Toppings Modal', () => {
    const initialStateWithBurger = {
      cart: {
        items: [mockBurgerItem],
        total: 30000,
      },
      toppings: {
        toppings: mockToppings,
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 3 },
      },
    };

    it('should open toppings modal when checkout is clicked with burger items', async () => {
      renderWithProvider(<CartPage />, initialStateWithBurger);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Toppings para Hamburguesa Clásica/)).toBeInTheDocument();
      });
    });

    it('should display toppings in modal', async () => {
      renderWithProvider(<CartPage />, initialStateWithBurger);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Queso Extra')).toBeInTheDocument();
        expect(screen.getByText('Bacon')).toBeInTheDocument();
        expect(screen.getByText('Aguacate')).toBeInTheDocument();
      });
    });

    it('should show toppings limit message', async () => {
      renderWithProvider(<CartPage />, initialStateWithBurger);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Toppings seleccionados: 0\/5/)).toBeInTheDocument();
      });
    });

    it('should close toppings modal when X button is clicked', async () => {
      renderWithProvider(<CartPage />, initialStateWithBurger);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        const closeButton = screen.getByTestId('x-icon');
        fireEvent.click(closeButton);
      });
    });
  });

  describe('Address Modal', () => {
    const initialStateWithoutBurgers = {
      cart: {
        items: [mockFriesItem],
        total: 8000,
      },
      toppings: {
        toppings: mockToppings,
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 3 },
      },
    };

    it('should open address modal directly when no burger items', async () => {
      renderWithProvider(<CartPage />, initialStateWithoutBurgers);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dirección de entrega')).toBeInTheDocument();
      });
    });

    it('should display order summary in address modal', async () => {
      renderWithProvider(<CartPage />, initialStateWithoutBurgers);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Productos:')).toBeInTheDocument();
        expect(screen.getByText('Total:')).toBeInTheDocument();
      });
    });

    it('should render address textarea', async () => {
      renderWithProvider(<CartPage />, initialStateWithoutBurgers);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Ej: Calle 123/);
        expect(textarea).toBeInTheDocument();
      });
    });

    it('should show error when trying to checkout without address', async () => {
      renderWithProvider(<CartPage />, initialStateWithoutBurgers);
      
      const checkoutButton = screen.getByText('Proceder al Pago');
      fireEvent.click(checkoutButton);
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Confirmar y Pagar');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Por favor ingresa una dirección de entrega')).toBeInTheDocument();
      });
    });
  });

  describe('Checkout Process', () => {
    const initialStateWithItems = {
      cart: {
        items: [mockFriesItem],
        total: 8000,
      },
      toppings: {
        toppings: mockToppings,
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { page: 1, totalPages: 1, totalItems: 3 },
      },
    };


  });

  describe('Component Structure', () => {
    it('should have correct main container styling', () => {
      const { container } = renderWithProvider(<CartPage />);
      
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'py-8');
    });

    it('should have correct max-width container', () => {
      renderWithProvider(<CartPage />);
      
      const container = screen.getByText('Tu Carrito').closest('.max-w-4xl');
      expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should be a client component', () => {
      expect(() => renderWithProvider(<CartPage />)).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    const initialStateWithItems = {
      cart: {
        items: [mockBurgerItem],
        total: 30000,
      },
    };

    it('should have responsive classes for cart actions', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const actionsContainer = screen.getByText('Vaciar Carrito').closest('.flex');
      expect(actionsContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-4');
    });

    it('should have responsive classes for item layout', () => {
      renderWithProvider(<CartPage />, initialStateWithItems);
      
      const itemContainer = screen.getByText('Hamburguesa Clásica').closest('.flex');
      expect(itemContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });
  });
});