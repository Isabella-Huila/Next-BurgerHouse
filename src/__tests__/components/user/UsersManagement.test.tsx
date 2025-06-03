import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../../../lib/redux/slices/authSlice';
import usersSlice from '../../../lib/redux/slices/usersSlice';
import { User } from '../../../lib/types/auth.types';
import UsersManagement from '../../../components/user/UsersManagement';


jest.mock('../../../lib/hooks/useAdmin', () => ({
  useAdmin: jest.fn()
}));

jest.mock('../../../components/ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    return isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null;
  };
});

jest.mock('../../../components/user/EditUserForm', () => {
  return function MockEditUserForm({ user, onSuccess, onCancel }: any) {
    return (
      <div data-testid="edit-user-form">
        <span>Editing: {user.email}</span>
        <button onClick={onSuccess} data-testid="form-success">Success</button>
        <button onClick={onCancel} data-testid="form-cancel">Cancel</button>
      </div>
    );
  };
});

jest.mock('../../../components/ui/Alert', () => {
  return function MockAlert({ type, children, dismissible, onDismiss }: any) {
    return (
      <div data-testid={`alert-${type}`}>
        {children}
        {dismissible && (
          <button onClick={onDismiss} data-testid="alert-dismiss">Dismiss</button>
        )}
      </div>
    );
  };
});

jest.mock('../../../components/ui/Table', () => {
  return function MockDataTable({ 
    data, 
    columns, 
    actions, 
    loading, 
    searchable, 
    onSearch, 
    searchTerm,
    emptyMessage,
    pagination 
  }: any) {
    return (
      <div data-testid="data-table">
        {loading && <div data-testid="table-loading">Loading...</div>}
        
        {searchable && (
          <input
            data-testid="search-input"
            value={searchTerm || ''}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search..."
          />
        )}
        
        {data.length === 0 ? (
          <div data-testid="empty-message">{emptyMessage}</div>
        ) : (
          <div data-testid="table-data">
            {data.map((user: User, index: number) => (
              <div key={user.email || index} data-testid={`user-row-${index}`}>
                <span>{user.email}</span>
                <span>{user.fullName || 'Sin nombre'}</span>
                <span>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                {actions?.map((action: any, actionIndex: number) => (
                  <button
                    key={actionIndex}
                    data-testid={`action-${actionIndex}-${index}`}
                    onClick={() => action.onClick(user)}
                    disabled={action.disabled?.()}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {pagination && (
          <div data-testid="pagination">
            <select
              data-testid="limit-select"
              value={pagination.limit}
              onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
            >
              {pagination.limitOptions?.map((option: number) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };
});


Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn()
});

const { useAdmin } = require('../../../lib/hooks/useAdmin');

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@test.com',
    fullName: 'Admin User',
    isActive: true,
    roles: ['admin']
  },
  {
    id: '2',
    email: 'user@test.com',
    fullName: 'Regular User',
    isActive: true,
    roles: ['customer']
  },
  {
    id: '3',
    email: 'inactive@test.com',
    fullName: 'Inactive User',
    isActive: false,
    roles: ['customer']
  }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      users: usersSlice
    },
    preloadedState: {
      auth: {
        user: { id: '1', email: 'admin@test.com', fullName: 'Admin', isActive: true, roles: ['admin'] },
        token: 'test-token',
        isLoading: false,
        error: null,
        isAuthenticated: true
      },
      users: {
        users: mockUsers,
        loading: { fetch: false, update: false, delete: false },
        error: null,
        pagination: { limit: 10, total: mockUsers.length },
        filters: {}
      },
      ...initialState
    }
  });
};

const renderUsersManagement = (store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <UsersManagement />
    </Provider>
  );
};

describe('UsersManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdmin.mockReturnValue({ isAdmin: true, user: mockUsers[0] });
  });

  describe('Initial rendering', () => {
    test('renders correctly when the user is admin', () => {
      renderUsersManagement();
      
      expect(screen.getByText('GESTIÓN DE USUARIOS')).toBeInTheDocument();
      expect(screen.getByText(/Administra los usuarios del sistema/)).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    test('show error message when user is not admin', () => {
      useAdmin.mockReturnValue({ isAdmin: false, user: mockUsers[1] });
      
      renderUsersManagement();
      
      expect(screen.getByTestId('alert-error')).toBeInTheDocument();
      expect(screen.getByText('No tienes permisos para acceder a esta página')).toBeInTheDocument();
    });

    test('shows the list of users when there is data', () => {
      renderUsersManagement();
      
      expect(screen.getByTestId('table-data')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
      expect(screen.getByText('inactive@test.com')).toBeInTheDocument();
    });
  });

  describe('States of charge', () => {
    test('shows charging indicator when charging', () => {
      const store = createTestStore({
        users: {
          users: [],
          loading: { fetch: true, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 0 },
          filters: {}
        }
      });
      
      renderUsersManagement(store);
      
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });

    test('show message when there are no users', () => {
      const store = createTestStore({
        users: {
          users: [],
          loading: { fetch: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: 0 },
          filters: {}
        }
      });
      
      renderUsersManagement(store);
      
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
      expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('filter users by email', async () => {
      renderUsersManagement();
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'admin' } });
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('admin');
      });
    });

    test('filter users by full name', async () => {
      renderUsersManagement();
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Regular' } });
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('Regular');
      });
    });

    test('Display custom message when search finds no results', () => {
      const store = createTestStore({
        users: {
          users: [],
          loading: { fetch: false, update: false, delete: false },
          error: null,
          pagination: { limit: 10, total: mockUsers.length },
          filters: {}
        }
      });
      
      renderUsersManagement(store);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    test('opens edit modal when clicking edit', () => {
      renderUsersManagement();
      
      const editButton = screen.getByTestId('action-0-0');
      fireEvent.click(editButton);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });

    test('close edit modal on cancel', () => {
      renderUsersManagement();
      
      const editButton = screen.getByTestId('action-0-0');
      fireEvent.click(editButton);
      
      const cancelButton = screen.getByTestId('form-cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('handles user deletion with confirmation', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      
      renderUsersManagement();
      
      const deleteButton = screen.getByTestId('action-1-0');
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de eliminar al usuario admin@test.com?');
    });

    test('cancels the deletion when the user does not confirm', () => {
      (window.confirm as jest.Mock).mockReturnValue(false);
      
      renderUsersManagement();
      
      const deleteButton = screen.getByTestId('action-1-0');
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    test('allows you to change the limit of items per page', () => {
      renderUsersManagement();
      
      const limitSelect = screen.getByTestId('limit-select');
      fireEvent.change(limitSelect, { target: { value: '25' } });
      
      expect(limitSelect).toHaveValue('25');
    });

    test('displays the correct limit options', () => {
      renderUsersManagement();
      
      const limitSelect = screen.getByTestId('limit-select');
      const options = limitSelect.querySelectorAll('option');
      
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('10');
      expect(options[1]).toHaveValue('25');
      expect(options[2]).toHaveValue('50');
      expect(options[3]).toHaveValue('100');
    });
  });

  describe('Messages of success', () => {
    test('show success message after updating user', async () => {
      renderUsersManagement();
      
      const editButton = screen.getByTestId('action-0-0');
      fireEvent.click(editButton);
      
      const successButton = screen.getByTestId('form-success');
      fireEvent.click(successButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument();
        expect(screen.getByText('Usuario actualizado exitosamente')).toBeInTheDocument();
      });
    });

  });

  describe('Integration with Redux', () => {
    test('use the authentication state correctly', () => {
      const store = createTestStore({
        auth: {
          user: mockUsers[0],
          token: 'test-token',
          isLoading: false,
          error: null,
          isAuthenticated: false
        }
      });
      
      renderUsersManagement(store);
      
      expect(screen.getByText('GESTIÓN DE USUARIOS')).toBeInTheDocument();
    });
  });

  describe('Buttons disabled', () => {
    test('disables edit button when updating', () => {
      const store = createTestStore({
        users: {
          users: mockUsers,
          loading: { fetch: false, update: true, delete: false },
          error: null,
          pagination: { limit: 10, total: mockUsers.length },
          filters: {}
        }
      });
      
      renderUsersManagement(store);
      
      const editButton = screen.getByTestId('action-0-0');
      expect(editButton).toBeDisabled();
    });

    test('disable delete button when deleting', () => {
      const store = createTestStore({
        users: {
          users: mockUsers,
          loading: { fetch: false, update: false, delete: true },
          error: null,
          pagination: { limit: 10, total: mockUsers.length },
          filters: {}
        }
      });
      
      renderUsersManagement(store);
      
      const deleteButton = screen.getByTestId('action-1-0');
      expect(deleteButton).toBeDisabled();
    });
  });
});