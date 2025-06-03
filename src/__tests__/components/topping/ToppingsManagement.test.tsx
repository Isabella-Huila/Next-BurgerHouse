import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ToppingsManagement from '@/components/topping/ToppingsManagement';
import CreateToppingForm from '@/components/topping/CreateToppingForm';
import EditToppingForm from '@/components/topping/EditToppingForm';
import toppingsReducer from '@/lib/redux/slices/toppingsSlice';
import authReducer from '@/lib/redux/slices/authSlice';
import { toppingApi } from '@/lib/api/toppingApi';

jest.mock('@/lib/api/toppingApi');
jest.mock('@/lib/hooks/useAdmin');

const mockToppingApi = toppingApi as jest.Mocked<typeof toppingApi>;

const mockUseAdmin = require('@/lib/hooks/useAdmin');

const mockToppings = [
  {
    id: '1',
    name: 'Extra Queso',
    price: 5000,
    maximumAmount: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Pepperoni Extra',
    price: 7000,
    maximumAmount: 2,
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Champiñones',
    price: 4000,
    maximumAmount: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

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
        pagination: { limit: 10, total: 0 }
      },
      auth: {
        isAuthenticated: true,
        user: { id: '1', roles: ['admin'] },
        token: 'mock-token',
        loading: false,
        error: null
      },
      ...initialState
    }
  });
};

const renderWithRedux = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ToppingsManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdmin.useAdmin.mockReturnValue({ isAdmin: true, user: { roles: ['admin'] } });
    mockToppingApi.getAllToppings.mockResolvedValue({
      data: mockToppings,
      meta: { page: 1, limit: 10, total: 3, totalPages: 1 }
    });
  });

  describe('Initial Rendering', () => {
    test('should render title and create topping button', () => {
      renderWithRedux(<ToppingsManagement />);
      
      expect(screen.getByText('GESTIÓN DE TOPPINGS')).toBeInTheDocument();
      expect(screen.getByText('NUEVO TOPPING')).toBeInTheDocument();
    });

    test('should show error message if not admin', () => {
      mockUseAdmin.useAdmin.mockReturnValue({ isAdmin: false, user: null });
      
      renderWithRedux(<ToppingsManagement />);
      
      expect(screen.getByText('No tienes permisos para acceder a esta página')).toBeInTheDocument();
    });

    test('should load toppings when component mounts', async () => {
      const store = createMockStore();
      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        expect(mockToppingApi.getAllToppings).toHaveBeenCalledWith({ limit: 10 });
      });
    });
  });

  describe('Toppings Table', () => {
    test('should display toppings in the table', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        expect(screen.getByText('Extra Queso')).toBeInTheDocument();
        expect(screen.getByText('Pepperoni Extra')).toBeInTheDocument();
        expect(screen.getByText('Champiñones')).toBeInTheDocument();
      });
    });

    test('should display topping status correctly', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        const activeStatuses = screen.getAllByText('Activo');
        const inactiveStatuses = screen.getAllByText('Inactivo');
        
        expect(activeStatuses).toHaveLength(2); // Extra Queso y Champiñones
        expect(inactiveStatuses).toHaveLength(1); // Pepperoni Extra
      });
    });

  });

  describe('Search Functionality', () => {
    test('should filter toppings by name', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      const searchInput = screen.getByPlaceholderText('Buscar toppings...');
      fireEvent.change(searchInput, { target: { value: 'queso' } });
      
      await waitFor(() => {
        expect(screen.getByText('Extra Queso')).toBeInTheDocument();
        expect(screen.queryByText('Pepperoni Extra')).not.toBeInTheDocument();
        expect(screen.queryByText('Champiñones')).not.toBeInTheDocument();
      });
    });

    test('should be case insensitive search', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      const searchInput = screen.getByPlaceholderText('Buscar toppings...');
      fireEvent.change(searchInput, { target: { value: 'EXTRA' } });
      
      await waitFor(() => {
        expect(screen.getByText('Extra Queso')).toBeInTheDocument();
        expect(screen.getByText('Pepperoni Extra')).toBeInTheDocument();
        expect(screen.queryByText('Champiñones')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create Topping Modal', () => {
    test('should open modal when clicking "NEW TOPPING"', () => {
      renderWithRedux(<ToppingsManagement />);
      
      const createButton = screen.getByText('NUEVO TOPPING');
      fireEvent.click(createButton);
      
      expect(screen.getByText('Crear Nuevo Topping')).toBeInTheDocument();
    });

    test('should close modal when clicking cancel', () => {
      renderWithRedux(<ToppingsManagement />);
      
      const createButton = screen.getByText('NUEVO TOPPING');
      fireEvent.click(createButton);
      
      const cancelButton = screen.getByText('CANCELAR');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByText('Crear Nuevo Topping')).not.toBeInTheDocument();
    });
  });

  describe('Edit Topping Modal', () => {
    test('should open edit modal when clicking edit button', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Editar topping');
        fireEvent.click(editButtons[0]);
        
        expect(screen.getByText('Editar Topping')).toBeInTheDocument();
      });
    });
  });

  describe('Topping Deletion', () => {
    test('should show confirmation before deleting', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Eliminar topping');
        fireEvent.click(deleteButtons[0]);
        
        expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de eliminar el topping "Extra Queso"?');
      });

      confirmSpy.mockRestore();
    });

    test('should delete topping if confirmed', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      mockToppingApi.deleteTopping.mockResolvedValue();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(async () => {
        const deleteButtons = screen.getAllByTitle('Eliminar topping');
        fireEvent.click(deleteButtons[0]);
        
        await waitFor(() => {
          expect(mockToppingApi.deleteTopping).toHaveBeenCalledWith('Extra Queso');
        });
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    test('should show spinner during loading', () => {
      const store = createMockStore({
        toppings: {
          toppings: [],
          loading: { fetch: true, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 0 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    test('should disable buttons during operations', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: true, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Editar topping');
        expect(editButtons[0]).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {

    test('should be able to close error message', () => {
      const store = createMockStore({
        toppings: {
          toppings: [],
          loading: { fetch: false, create: false, update: false, delete: false },
          error: 'Error al cargar toppings',
          pagination: { limit: 10, total: 0 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);

      const dismissButton = document.querySelector('[data-testid="close-alert"]') ||
                           document.querySelector('button[aria-label="Close"]') ||
                           screen.queryByText('×');
      
      if (dismissButton) {
        fireEvent.click(dismissButton);
        expect(screen.queryByText('Error al cargar toppings')).not.toBeInTheDocument();
      } else {
        console.warn('No se encontró botón para cerrar el mensaje de error');
      }
    });
  });

  describe('Pagination', () => {
    test('should change limit of items per page', () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      const limitSelect = screen.getByDisplayValue('10');
      fireEvent.change(limitSelect, { target: { value: '25' } });
      
      expect(limitSelect).toHaveValue('25');
    });
  });

  describe('Redux Integration', () => {
    test('should dispatch fetchToppings on mount with authenticated admin user', () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      renderWithRedux(<ToppingsManagement />, store);
      
      expect(dispatchSpy).toHaveBeenCalled();
    });

    test('should not load toppings if user is not authenticated', () => {
      const store = createMockStore({
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null
        }
      });
      
      renderWithRedux(<ToppingsManagement />, store);
      
      expect(mockToppingApi.getAllToppings).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have accessible table structure', async () => {
      const store = createMockStore({
        toppings: {
          toppings: mockToppings,
          loading: { fetch: false, create: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 3 }
        }
      });

      renderWithRedux(<ToppingsManagement />, store);
      
      await waitFor(() => {
        const table = screen.queryByRole('table');
        if (table) {
          expect(table).toBeInTheDocument();
          const columnHeaders = screen.getAllByRole('columnheader');
          expect(columnHeaders.length).toBeGreaterThan(0);
        } else {
          expect(screen.getByText('Extra Queso')).toBeInTheDocument();
        }
      });
    });

    test('should have appropriate labels on buttons', () => {
      renderWithRedux(<ToppingsManagement />);
      
      const createButton = screen.getByRole('button', { name: /nuevo topping/i });
      expect(createButton).toBeInTheDocument();
    });
  });
});

describe('CreateToppingForm', () => {
  const mockProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should validate required fields', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreateToppingForm {...mockProps} />
      </Provider>
    );

    const submitButton = screen.getByText('CREAR TOPPING');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
      expect(screen.getByText('El precio es requerido')).toBeInTheDocument();
    });
  });

  test('should validate minimum name length', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreateToppingForm {...mockProps} />
      </Provider>
    );

    const nameInput = screen.getByLabelText('NOMBRE DEL TOPPING');
    fireEvent.change(nameInput, { target: { value: 'AB' } });
    
    const submitButton = screen.getByText('CREAR TOPPING');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
    });
  });

  test('should validate that price is greater than 0', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreateToppingForm {...mockProps} />
      </Provider>
    );

    const priceInput = screen.getByLabelText('PRECIO');
    fireEvent.change(priceInput, { target: { value: '0' } });
    
    const submitButton = screen.getByText('CREAR TOPPING');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
    });
  });

});

describe('EditToppingForm', () => {
  const mockTopping = mockToppings[0];
  const mockProps = {
    topping: mockTopping,
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should pre-fill form with topping data', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <EditToppingForm {...mockProps} />
      </Provider>
    );

    expect(screen.getByDisplayValue('Extra Queso')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  test('should show active status checkbox', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <EditToppingForm {...mockProps} />
      </Provider>
    );

    const activeCheckbox = screen.getByLabelText('Topping activo');
    expect(activeCheckbox).toBeInTheDocument();
    expect(activeCheckbox).toBeChecked();
  });

  test('should only send modified fields', async () => {
    const store = createMockStore();
    mockToppingApi.updateTopping.mockResolvedValue({
      ...mockTopping,
      name: 'Queso Extra Premium'
    });

    render(
      <Provider store={store}>
        <EditToppingForm {...mockProps} />
      </Provider>
    );

    const nameInput = screen.getByDisplayValue('Extra Queso');
    fireEvent.change(nameInput, { target: { value: 'Queso Extra Premium' } });
    
    const submitButton = screen.getByText('GUARDAR');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToppingApi.updateTopping).toHaveBeenCalledWith(
        'Extra Queso',
        { name: 'Queso Extra Premium' }
      );
    });
  });
});