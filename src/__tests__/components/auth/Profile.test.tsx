import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import Profile from '@/components/auth/Profile';
import authSlice, { logout } from '@/lib/redux/slices/authSlice';
import usersSlice from '@/lib/redux/slices/usersSlice';
import { User } from '@/lib/types/auth.types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/components/user/EditUserForm', () => {
  return function MockEditUserForm({ user, onSuccess, onCancel }: {
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
  }) {
    return (
      <div data-testid="edit-user-form">
        <p>Editing user: {user.email}</p>
        <button onClick={onSuccess}>Submit</button>
        <button onClick={onCancel}>Cancel Form</button>
      </div>
    );
  };
});

const mockPush = jest.fn();
const mockRouter = { push: mockPush };
(useRouter as jest.Mock).mockReturnValue(mockRouter);

const createMockStore = (userOverrides = {}) => {
  const defaultUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    isActive: true,
    roles: ['customer']
  };

  return configureStore({
    reducer: {
      auth: authSlice,
      users: usersSlice
    },
    preloadedState: {
      auth: {
        user: { ...defaultUser, ...userOverrides },
        token: 'mock-token',
        isLoading: false,
        error: null,
        isAuthenticated: true
      },
      users: {
        users: [],
        loading: { fetch: false, update: false, delete: false },
        error: null,
        pagination: { limit: 10, total: 0 },
        filters: {}
      }
    }
  });
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders profile page with user email and basic elements', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('Perfil')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('EDITAR')).toBeInTheDocument();
      expect(screen.getByText('Pedidos')).toBeInTheDocument();
      expect(screen.getByText('CERRAR SESIÓN')).toBeInTheDocument();
    });

    it('displays fallback text when user email is null', () => {
      const store = createMockStore({ email: null });
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });

    it('displays fallback text when user email is empty string', () => {
      const store = createMockStore({ email: '' });
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });

    it('renders all menu items with proper structure', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const pedidosLink = screen.getByRole('link', { name: /pedidos/i });
      expect(pedidosLink).toBeInTheDocument();
      expect(pedidosLink).toHaveAttribute('href', '/order');
    });

    it('renders with proper CSS classes and structure', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const profileContainer = container.querySelector('.max-w-md.mx-auto.bg-white.min-h-screen');
      expect(profileContainer).toBeInTheDocument();
    });
  });

  describe('Edit Modal Functionality', () => {
    it('opens edit modal when edit button is clicked', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);

      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
      expect(screen.getByText('Editing user: test@example.com')).toBeInTheDocument();
    });

    it('closes edit modal when cancel is clicked in form', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel Form');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-user-form')).not.toBeInTheDocument();
    });

    it('closes edit modal when success callback is triggered', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-user-form')).not.toBeInTheDocument();
    });

    it('passes correct user data to EditUserForm', () => {
      const customUser = {
        id: '2',
        email: 'custom@example.com',
        fullName: 'Custom User',
        isActive: true,
        roles: ['admin']
      };
      const store = createMockStore(customUser);
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);

      expect(screen.getByText('Editing user: custom@example.com')).toBeInTheDocument();
    });

    it('does not render EditUserForm when modal is closed', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.queryByTestId('edit-user-form')).not.toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('dispatches logout action and redirects to home when logout button is clicked', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const logoutButton = screen.getByText('CERRAR SESIÓN');
      fireEvent.click(logoutButton);

      expect(dispatchSpy).toHaveBeenCalledWith(logout());
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('renders logout button with correct styling and icon', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const logoutButton = screen.getByText('CERRAR SESIÓN');
      expect(logoutButton).toHaveClass('flex', 'items-center', 'gap-3', 'text-red-600');
    });
  });

  describe('User States', () => {
    it('handles user with different roles correctly', () => {
      const adminUser = {
        email: 'admin@example.com',
        fullName: 'Admin User',
        roles: ['admin', 'customer']
      };
      const store = createMockStore(adminUser);
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('handles user without fullName', () => {
      const userWithoutName = {
        email: 'test@example.com',
        fullName: null
      };
      const store = createMockStore(userWithoutName);
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('handles inactive user', () => {
      const inactiveUser = {
        email: 'inactive@example.com',
        isActive: false
      };
      const store = createMockStore(inactiveUser);
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('inactive@example.com')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders orders link with correct href', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const ordersLink = screen.getByRole('link', { name: /pedidos/i });
      expect(ordersLink).toHaveAttribute('href', '/order');
    });

    it('applies hover styles to menu items', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const ordersLink = screen.getByRole('link', { name: /pedidos/i });
      expect(ordersLink).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByRole('button', { name: 'EDITAR' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CERRAR SESIÓN' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /pedidos/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByRole('button', { name: 'EDITAR' });
      editButton.focus();
      expect(document.activeElement).toBe(editButton);
    });
  });

  describe('Modal Behavior', () => {
    it('modal is initially closed', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
    });

    it('only shows one modal at a time', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);
      fireEvent.click(editButton);

      expect(screen.getAllByText('Editar Perfil')).toHaveLength(1);
    });

    it('resets selectedUser when modal is closed', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      const editButton = screen.getByText('EDITAR');
      fireEvent.click(editButton);
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel Form');
      fireEvent.click(cancelButton);

      fireEvent.click(editButton);
      expect(screen.getByTestId('edit-user-form')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      const store = configureStore({
        reducer: {
          auth: authSlice,
          users: usersSlice
        },
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false
          },
          users: {
            users: [],
            loading: { fetch: false, update: false, delete: false },
            error: null,
            pagination: { limit: 10, total: 0 },
            filters: {}
          }
        }
      });

      render(
        <Provider store={store}>
          <Profile />
        </Provider>
      );

      expect(screen.getByText('Usuario')).toBeInTheDocument();
    });
  });
});