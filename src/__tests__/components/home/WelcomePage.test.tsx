import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WelcomePage from '../../../components/home/WelcomePage';
import authReducer from '../../../lib/redux/slices/authSlice';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
}));

const createMockStore = (authState: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
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
    },
  });
};

describe('WelcomePage', () => {
  it('should render main heading and description', () => {
    const store = createMockStore({});
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    expect(screen.getByText('BURGER')).toBeInTheDocument();
    expect(screen.getByText('HOUSE')).toBeInTheDocument();
    expect(screen.getByText('Las mejores burgers de la ciudad, hechas con ingredientes frescos y mucho amor.')).toBeInTheDocument();
  });

  it('should show "HACER PEDIDO" button for authenticated users pointing to menu', () => {
    const store = createMockStore({ isAuthenticated: true });
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    const orderButton = screen.getByRole('button', { name: /hacer pedido/i });
    expect(orderButton).toBeInTheDocument();
    expect(orderButton.closest('a')).toHaveAttribute('href', '/menu');
    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument();
  });

  it('should show "HACER PEDIDO" button for unauthenticated users pointing to login', () => {
    const store = createMockStore({ isAuthenticated: false });
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    const orderButton = screen.getByRole('button', { name: /hacer pedido/i });
    expect(orderButton).toBeInTheDocument();
    expect(orderButton.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should show "YA TENGO CUENTA" button for unauthenticated users', () => {
    const store = createMockStore({ isAuthenticated: false });
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    const loginButton = screen.getByRole('button', { name: /ya tengo cuenta/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton.closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
  });

  it('should not show "YA TENGO CUENTA" button for authenticated users', () => {
    const store = createMockStore({ isAuthenticated: true });
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    expect(screen.queryByRole('button', { name: /ya tengo cuenta/i })).not.toBeInTheDocument();
  });

  it('should disable "HACER PEDIDO" button when loading', () => {
    const store = createMockStore({ isLoading: true });
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    const orderButton = screen.getByRole('button', { name: /hacer pedido/i });
    expect(orderButton).toBeDisabled();
  });

  it('should render with responsive classes', () => {
    const store = createMockStore({});
    
    render(
      <Provider store={store}>
        <WelcomePage />
      </Provider>
    );

    const heading = screen.getByText('BURGER');
    expect(heading).toHaveClass('text-6xl', 'md:text-8xl', 'font-black');
    
    const buttonsContainer = screen.getByText('HACER PEDIDO').closest('div');
    expect(buttonsContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
  });
});
