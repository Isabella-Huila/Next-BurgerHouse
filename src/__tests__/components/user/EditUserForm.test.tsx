import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import EditUserForm from '@/components/user/EditUserForm';
import { User } from '@/lib/types/auth.types';

jest.mock('@/lib/redux/slices/usersSlice', () => {
  const mockUpdateUser = jest.fn();
  const mockClearError = jest.fn();
  
  return {
    __esModule: true,
    default: (state = {
      users: [],
      loading: { fetch: false, update: false, delete: false },
      error: null,
      pagination: { limit: 10, total: 0 },
      filters: {}
    }, action: any) => {
      switch (action.type) {
        case 'users/clearError':
          return { ...state, error: null };
        case 'users/updateUser/pending':
          return { ...state, loading: { ...state.loading, update: true } };
        case 'users/updateUser/fulfilled':
          return { ...state, loading: { ...state.loading, update: false } };
        case 'users/updateUser/rejected':
          return { ...state, loading: { ...state.loading, update: false }, error: action.payload };
        default:
          return state;
      }
    },
    updateUser: mockUpdateUser,
    clearError: mockClearError
  };
});

jest.mock('@/lib/redux/slices/authSlice', () => ({
  __esModule: true,
  default: (state = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
  }, action: any) => state
}));

const { updateUser, clearError } = require('@/lib/redux/slices/usersSlice');
const usersSlice = require('@/lib/redux/slices/usersSlice').default;
const authSlice = require('@/lib/redux/slices/authSlice').default;

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  isActive: true,
  roles: ['customer']
};

const mockCurrentUser: User = {
  id: '2',
  email: 'admin@example.com',
  fullName: 'Admin User',
  isActive: true,
  roles: ['admin']
};

const createMockStore = (currentUser: User | null = mockCurrentUser, loading = { update: false }, error: string | null = null) => {
  return configureStore({
    reducer: {
      users: usersSlice,
      auth: authSlice
    },
    preloadedState: {
      users: {
        users: [mockUser],
        loading: { fetch: false, update: loading.update, delete: false },
        error,
        pagination: { limit: 10, total: 1 },
        filters: {}
      },
      auth: {
        user: currentUser,
        token: 'mock-token',
        isLoading: false,
        error: null,
        isAuthenticated: !!currentUser
      }
    }
  });
};

const renderWithProvider = (
  component: React.ReactElement,
  store = createMockStore()
) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('EditUserForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (updateUser as jest.Mock).mockImplementation(() => ({
      type: 'users/updateUser/pending',
      payload: undefined,
      meta: {
        arg: { email: mockUser.email, updateData: {} },
        requestId: 'test-request-id',
        requestStatus: 'pending'
      },
      unwrap: jest.fn().mockResolvedValue(mockUser)
    }));
    
    (clearError as jest.Mock).mockReturnValue({ type: 'users/clearError' });
  });

  describe('Rendering', () => {
    it('should render all form fields correctly', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /GUARDAR/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CANCELAR/i })).toBeInTheDocument();
    });

    it('should show admin fields when current user is admin', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('ESTADO')).toBeInTheDocument();
      expect(screen.getByText('ROLES')).toBeInTheDocument();
      expect(screen.getByText('Usuario activo')).toBeInTheDocument();
      
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      const customerCheckbox = screen.getByRole('checkbox', { name: /customer/i });
      const deliveryCheckbox = screen.getByRole('checkbox', { name: /delivery/i });
      
      expect(adminCheckbox).toBeInTheDocument();
      expect(customerCheckbox).toBeInTheDocument();
      expect(deliveryCheckbox).toBeInTheDocument();
    });

    it('should show password field when editing self', () => {
      const selfEditingUser = { ...mockCurrentUser };
      renderWithProvider(
        <EditUserForm
          user={selfEditingUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText('Dejar vacío para mantener la actual')).toBeInTheDocument();
    });

    it('should not show admin fields for non-admin users', () => {
      const nonAdminUser = { ...mockCurrentUser, roles: ['customer'] };
      const store = createMockStore(nonAdminUser);
      
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
        store
      );

      expect(screen.queryByText('ESTADO')).not.toBeInTheDocument();
      expect(screen.queryByText('ROLES')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {

    it('should show validation error for empty email', async () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('test@example.com');
      fireEvent.change(emailInput, { target: { name: 'email', value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();
      });
    });

    it('should show validation error for short password', async () => {
      const selfEditingUser = { ...mockCurrentUser };
      renderWithProvider(
        <EditUserForm
          user={selfEditingUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Dejar vacío para mantener la actual');
      fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
      });
    });

    it('should show validation error for weak password', async () => {
      const selfEditingUser = { ...mockCurrentUser };
      renderWithProvider(
        <EditUserForm
          user={selfEditingUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Dejar vacío para mantener la actual');
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'weakpass' } });
      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe contener al menos una mayúscula, una minúscula y un número')).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('test@example.com');
      
      fireEvent.change(emailInput, { target: { name: 'email', value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { name: 'email', value: 'newemail@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText('El correo electrónico es requerido')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should handle form data changes correctly', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('test@example.com');
      const fullNameInput = screen.getByDisplayValue('Test User');

      fireEvent.change(emailInput, { target: { name: 'email', value: 'newemail@example.com' } });
      fireEvent.change(fullNameInput, { target: { name: 'fullName', value: 'New Full Name' } });

      expect(emailInput).toHaveValue('newemail@example.com');
      expect(fullNameInput).toHaveValue('New Full Name');
    });

    it('should handle role changes correctly', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      expect(adminCheckbox).not.toBeChecked();
      
      fireEvent.click(adminCheckbox);
      expect(adminCheckbox).toBeChecked();
    });

    it('should handle active status toggle correctly', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const activeCheckbox = screen.getByRole('checkbox', { name: /Usuario activo/i });
      expect(activeCheckbox).toBeChecked();
      
      fireEvent.click(activeCheckbox);
      expect(activeCheckbox).not.toBeChecked();
    });

    it('should call onCancel when cancel button is clicked', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /CANCELAR/i }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data for admin user', async () => {
      const mockUnwrap = jest.fn().mockResolvedValue(mockUser);
      (updateUser as jest.Mock).mockReturnValue({
        type: 'users/updateUser/pending',
        unwrap: mockUnwrap
      });

      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const fullNameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(fullNameInput, { target: { name: 'fullName', value: 'Updated Name' } });

      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i });
      fireEvent.click(adminCheckbox);

      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith({
          email: mockUser.email,
          updateData: {
            fullName: 'Updated Name',
            isActive: true,
            roles: ['customer', 'admin']
          }
        });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should submit form with password when editing self', async () => {
      const mockUnwrap = jest.fn().mockResolvedValue(mockCurrentUser);
      (updateUser as jest.Mock).mockReturnValue({
        type: 'users/updateUser/pending',
        unwrap: mockUnwrap
      });

      const selfEditingUser = { ...mockCurrentUser };
      renderWithProvider(
        <EditUserForm
          user={selfEditingUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const passwordInput = screen.getByPlaceholderText('Dejar vacío para mantener la actual');
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'NewPass123!' } });

      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith({
          email: selfEditingUser.email,
          updateData: {
            fullName: selfEditingUser.fullName,
            password: 'NewPass123!',
            isActive: true,
            roles: ['admin']
          }
        });
      });
    });

    it('should handle submission error correctly', async () => {
      const mockUnwrap = jest.fn().mockRejectedValue(new Error('Update failed'));
      (updateUser as jest.Mock).mockReturnValue({
        type: 'users/updateUser/pending',
        unwrap: mockUnwrap
      });

      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', () => {
      const store = createMockStore(mockCurrentUser, { update: true });
      
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
        store
      );

      const submitButton = screen.getByRole('button', { name: /GUARDANDO/i });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('GUARDANDO...');
    });

    it('should not submit form when there are validation errors', async () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('test@example.com');
      fireEvent.change(emailInput, { target: { name: 'email', value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /GUARDAR/i }));

      await waitFor(() => {
        expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();
      });

      expect(updateUser).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display server error when present', () => {
      const store = createMockStore(mockCurrentUser, { update: false }, 'Server error occurred');
      
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
        store
      );

      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form inputs', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProvider(
        <EditUserForm
          user={mockUser}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByDisplayValue('test@example.com');
      emailInput.focus();
      expect(emailInput).toHaveFocus();
    });
  });
});