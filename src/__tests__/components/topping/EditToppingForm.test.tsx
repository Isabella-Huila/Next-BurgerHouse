import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EditToppingForm from '@/components/topping/EditToppingForm';
import toppingsReducer from '@/lib/redux/slices/toppingsSlice';
import authReducer from '@/lib/redux/slices/authSlice';
import { Topping } from '@/lib/types/topping.types';

jest.mock('@/lib/api/toppingApi', () => ({
  toppingApi: {
    updateTopping: jest.fn(),
  },
}));

const mockDispatch = jest.fn();
jest.mock('@/lib/hooks/redux', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: () => mockDispatch,
}));

const { useAppSelector } = require('@/lib/hooks/redux');

const mockTopping: Topping = {
  id: '1',
  name: 'Extra Queso',
  price: 5000,
  maximumAmount: 3,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      toppings: toppingsReducer,
      auth: authReducer,
    },
    preloadedState: {
      toppings: {
        toppings: [],
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { limit: 10, total: 0 },
        ...initialState.toppings,
      },
      auth: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('EditToppingForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAppSelector.mockImplementation((selector) => 
      selector({
        toppings: {
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
        }
      })
    );
  });

  describe('Initial render', () => {
    it('should render all form fields with topping data', () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Extra Queso')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByText('GUARDAR')).toBeInTheDocument();
      expect(screen.getByText('CANCELAR')).toBeInTheDocument();
    });

    it('should render inactive state checkbox correctly', () => {
      renderWithProvider(
        <EditToppingForm 
          topping={{...mockTopping, isActive: false}}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });
  });

  describe('Form validation', () => {
    it('should show error when name is empty', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByDisplayValue('Extra Queso');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      });
    });

    it('should show error when name is too short', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByDisplayValue('Extra Queso');
      fireEvent.change(nameInput, { target: { value: 'AB' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
      });
    });

    it('should show error when price is empty', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByDisplayValue('5000');
      fireEvent.change(priceInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
      });
    });

    it('should show error when price is less than or equal to 0', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByDisplayValue('5000');
      fireEvent.change(priceInput, { target: { value: '0' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
      });
    });

    it('should show error when maximum amount is empty', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const maxAmountInput = screen.getByDisplayValue('3');
      fireEvent.change(maxAmountInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('La cantidad máxima es requerida')).toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('should clear field errors when user types', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByDisplayValue('Extra Queso');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      });

      fireEvent.change(nameInput, { target: { value: 'Nuevo nombre' } });

      await waitFor(() => {
        expect(screen.queryByText('El nombre es requerido')).not.toBeInTheDocument();
      });
    });

    it('should toggle checkbox state correctly', () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should call onCancel when cancel is clicked', () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('CANCELAR'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form submission', () => {
    it('should handle update errors', async () => {
      mockDispatch.mockImplementation(() => ({
        unwrap: () => Promise.reject(new Error('Error de servidor'))
      }));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByDisplayValue('Extra Queso');
      fireEvent.change(nameInput, { target: { value: 'Nuevo nombre' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Update topping failed:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Loading and error states', () => {
    it('should show loading state in button', () => {
      useAppSelector.mockImplementation((selector) => 
        selector({
          toppings: {
            loading: { update: true },
            error: null,
          }
        })
      );

      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('GUARDANDO...')).toBeInTheDocument();
      expect(screen.getByText('GUARDANDO...')).toBeDisabled();
    });

    it('should show error message from state', () => {
      useAppSelector.mockImplementation((selector) => 
        selector({
          toppings: {
            loading: { update: false },
            error: 'Error al actualizar topping',
          }
        })
      );

      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Error al actualizar topping')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numeric values', async () => {
      renderWithProvider(
        <EditToppingForm 
          topping={mockTopping}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const priceInput = screen.getByDisplayValue('5000');
      fireEvent.change(priceInput, { target: { value: '-100' } });
      fireEvent.click(screen.getByText('GUARDAR'));

      await waitFor(() => {
        expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
      });
    });
  });
});
