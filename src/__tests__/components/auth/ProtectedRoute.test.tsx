import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import authReducer from '@/lib/redux/slices/authSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('ProtectedRoute Component', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  const renderProtectedRoute = (
    initialState: any,
    requireAuth: boolean = true,
    children: React.ReactNode = <div data-testid="protected-content">Protected Content</div>
  ) => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: initialState,
    });

    return render(
      <Provider store={store}>
        <ProtectedRoute requireAuth={requireAuth}>
          {children}
        </ProtectedRoute>
      </Provider>
    );
  };

  describe('Loading State', () => {

    it('should not redirect while loading', () => {
      const loadingState = {
        auth: {
          user: null,
          token: null,
          isLoading: true,
          error: null,
          isAuthenticated: false,
        },
      };

      renderProtectedRoute(loadingState);
      
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Required (requireAuth = true)', () => {
    it('should render children when user is authenticated and not loading', () => {
      const authenticatedState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      renderProtectedRoute(authenticatedState);
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated and not loading', async () => {
      const unauthenticatedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      renderProtectedRoute(unauthenticatedState);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should return null when not authenticated and not loading', () => {
      const unauthenticatedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      const { container } = renderProtectedRoute(unauthenticatedState);
      
      expect(container.firstChild).toBeNull();
    });

  });

  describe('Authentication Not Required (requireAuth = false)', () => {
    it('should render children when requireAuth is false and user is authenticated', () => {
      const authenticatedState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      renderProtectedRoute(authenticatedState, false);
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should render children when requireAuth is false and user is not authenticated', () => {
      const unauthenticatedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      renderProtectedRoute(unauthenticatedState, false);
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined authentication state gracefully', () => {
      const undefinedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: undefined,
        },
      };

      renderProtectedRoute(undefinedState as any);
      
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should handle multiple rapid state changes correctly', async () => {
      let currentState = {
        auth: {
          user: null,
          token: null,
          isLoading: true,
          error: null,
          isAuthenticated: false,
        },
      };

      const { rerender } = renderProtectedRoute(currentState);
      
      currentState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: currentState,
      });

      rerender(
        <Provider store={store}>
          <ProtectedRoute requireAuth={true}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </Provider>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Children Rendering', () => {
    it('should render complex children components', () => {
      const authenticatedState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      const complexChildren = (
        <div>
          <h1 data-testid="header">Dashboard</h1>
          <div data-testid="content">
            <p>Welcome to the dashboard</p>
            <button data-testid="action-button">Click me</button>
          </div>
        </div>
      );

      renderProtectedRoute(authenticatedState, true, complexChildren);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the dashboard')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      const authenticatedState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      const { container } = renderProtectedRoute(authenticatedState, true, null);
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle multiple children', () => {
      const authenticatedState = {
        auth: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User', isActive: true, roles: ['user'] },
          token: 'valid-token',
          isLoading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </>
      );

      renderProtectedRoute(authenticatedState, true, multipleChildren);
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should use default requireAuth value of true when not provided', async () => {
      const unauthenticatedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: unauthenticatedState,
      });

      render(
        <Provider store={store}>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </Provider>
      );
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle requireAuth prop changes', async () => {
      const unauthenticatedState = {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      const { rerender } = renderProtectedRoute(unauthenticatedState, false);
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();

      rerender(
        <Provider store={store}>
          <ProtectedRoute requireAuth={true}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </Provider>
      );
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});