import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CreateToppingForm from '@/components/topping/CreateToppingForm';
import toppingsReducer from '@/lib/redux/slices/toppingsSlice';
import '@testing-library/jest-dom';

// Mock hooks
const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();

jest.mock('@/lib/hooks/redux', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector)
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      toppings: toppingsReducer
    },
    preloadedState: {
      toppings: {
        toppings: [],
        loading: { fetch: false, create: false, update: false, delete: false },
        error: null,
        pagination: { limit: 10, total: 0 },
        ...initialState
      }
    }
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

describe('CreateToppingForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return value
    mockUseAppSelector.mockReturnValue({
      loading: { create: false },
      error: null
    });
  });

  it('renders form fields correctly', () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/nombre del topping/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cantidad máxima/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear topping/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /crear topping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/el precio es requerido/i)).toBeInTheDocument();
    });
  });

  it('validates minimum name length', async () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const nameInput = screen.getByLabelText(/nombre del topping/i);
    fireEvent.change(nameInput, { target: { value: 'AB' } });

    const submitButton = screen.getByRole('button', { name: /crear topping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('validates price is greater than 0', async () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const priceInput = screen.getByLabelText(/precio/i);
    fireEvent.change(priceInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /crear topping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el precio debe ser mayor a 0/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('clears field errors when input changes', async () => {
    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    // First trigger validation error
    const submitButton = screen.getByRole('button', { name: /crear topping/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });

    // Then type in the field to clear error
    const nameInput = screen.getByLabelText(/nombre del topping/i);
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });

    await waitFor(() => {
      expect(screen.queryByText(/el nombre es requerido/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state during submission', () => {
    // Mock para estado de loading
    mockUseAppSelector.mockReturnValue({
      loading: { create: true },
      error: null
    });

    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    const submitButton = screen.getByRole('button', { name: /creando/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error from Redux state', () => {
    const errorMessage = 'Error creating topping';
    
    // Mock para estado de error
    mockUseAppSelector.mockReturnValue({
      loading: { create: false },
      error: errorMessage
    });

    renderWithProvider(
      <CreateToppingForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});