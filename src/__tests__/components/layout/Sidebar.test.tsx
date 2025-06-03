import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../../../components/layout/Sidebar';
import authReducer from '../../../lib/redux/slices/authSlice';
import cartReducer from '../../../lib/redux/slices/cartSlice';

jest.mock('next/link', () => {
  return function MockLink({ children, href, className, title }: any) {
    return (
      <a href={href} className={className} title={title}>
        {children}
      </a>
    );
  };
});

jest.mock('../../../components/layout/NavItem', () => {
  return function MockNavItem({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href} data-testid="nav-item">{children}</a>;
  };
});

const mockHasAnyRole = jest.fn();
jest.mock('../../../lib/hooks/useUserRoles', () => ({
  useUserRoles: jest.fn(() => ({
    hasAnyRole: mockHasAnyRole,
  })),
}));

jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  User: () => <div data-testid="user-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Cookie: () => <div data-testid="cookie-icon" />,
  Package: () => <div data-testid="package-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
}));

const createMockStore = (authState: any = {}, cartState: any = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        ...authState,
      },
      cart: {
        items: [],
        total: 0,
        ...cartState,
      },
    },
  });
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasAnyRole.mockReturnValue(false);
  });

  it('should show login link for unauthenticated users', () => {
    mockHasAnyRole.mockReturnValue(false);

    const store = createMockStore({ isAuthenticated: false });
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('nav-item')).toBeInTheDocument();
  });

  it('should display menu navigation for authenticated users', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.some(role => ['customer', 'admin', 'delivery'].includes(role))
    );

    const store = createMockStore({ isAuthenticated: true });
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    const menuLink = screen.getByTitle('MENU');
    expect(menuLink).toHaveAttribute('href', '/menu');
  });

  it('should show admin-only navigation items for admin users', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.includes('admin')
    );

    const store = createMockStore({ 
      isAuthenticated: true,
      user: { roles: ['admin'] }
    });
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('cookie-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-icon')).toBeInTheDocument();
  });

  it('should display cart with item count', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.some(role => ['customer', 'admin'].includes(role))
    );

    const cartItems = [
      { id: '1', quantity: 2 },
      { id: '2', quantity: 3 },
    ];
    
    const store = createMockStore(
      { isAuthenticated: true },
      { items: cartItems }
    );
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Total quantity
  });

  it('should not show cart count when cart is empty', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.some(role => ['customer', 'admin'].includes(role))
    );

    const store = createMockStore(
      { isAuthenticated: true },
      { items: [] }
    );
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('should render profile icon without label', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.some(role => ['customer', 'admin', 'delivery'].includes(role))
    );

    const store = createMockStore({ isAuthenticated: true });
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const profileLink = screen.getByTitle('PERFIL');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(profileLink).not.toHaveTextContent('PERFIL');
  });

  it('should apply correct styling classes', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'relative');
    
    const brandLink = screen.getByText('Burger').closest('a');
    expect(brandLink).toHaveAttribute('href', '/');
  });

  it('should show orders link for all authenticated user types', () => {
    mockHasAnyRole.mockImplementation((roles: string[]) => 
      roles.some(role => ['admin', 'delivery', 'customer'].includes(role))
    );

    const store = createMockStore({ isAuthenticated: true });
    
    render(
      <Provider store={store}>
        <Sidebar />
      </Provider>
    );

    expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    const ordersLink = screen.getByTitle('PEDIDOS');
    expect(ordersLink).toHaveAttribute('href', '/orders');
  });
});