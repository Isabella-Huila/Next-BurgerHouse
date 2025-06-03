import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PaymentSuccessPage from '../../app/buy/success/page';
import cartSlice from '../../lib/redux/slices/cartSlice';


jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});


jest.mock('lucide-react', () => ({
  CheckCircle: function MockCheckCircle({ className }: { className?: string }) {
    return <div data-testid="check-circle" className={className}>✓</div>;
  },
}));


const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartSlice,
    },
    preloadedState: {
      cart: {
        items: [],
        total: 0,
        ...initialState,
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

describe('PaymentSuccessPage', () => {
  it('should render the success message', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    expect(screen.getByText('¡Pago confirmado!')).toBeInTheDocument();
  });

  it('should render the description text', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    expect(screen.getByText(/Tu pedido ha sido procesado exitosamente/)).toBeInTheDocument();
    expect(screen.getByText(/Cuando tu pago sea reportado, podrás ver los detalles/)).toBeInTheDocument();
  });

  it('should render CheckCircle icon', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
  });

  it('should render link to orders page', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    const ordersLink = screen.getByRole('link', { name: /Ver mis órdenes/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute('href', '/orders');
  });

  it('should have correct styling classes on main container', () => {
    const { container } = renderWithProvider(<PaymentSuccessPage />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center', 'p-4');
  });

  it('should have correct styling on card container', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    const cardContainer = screen.getByText('¡Pago confirmado!').closest('div');
    expect(cardContainer).toHaveClass('max-w-md', 'w-full', 'bg-white', 'rounded-lg', 'shadow-md', 'p-8', 'text-center');
  });

  it('should have correct styling on success button', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    const button = screen.getByRole('link', { name: /Ver mis órdenes/i });
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'px-4',
      'py-2',
      'border',
      'border-transparent',
      'text-sm',
      'font-medium',
      'rounded-md',
      'shadow-sm',
      'text-white',
      'bg-[#ff914d]'
    );
  });

  it('should have correct icon styling', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    const icon = screen.getByTestId('check-circle');
    expect(icon).toHaveClass('h-6', 'w-6', 'text-green-600');
  });

  it('should be a client component', () => {
    expect(() => renderWithProvider(<PaymentSuccessPage />)).not.toThrow();
  });

  it('should clear cart when component mounts', () => {
    const mockStore = createMockStore({
      items: [{ id: 1, name: 'Test Item' }],
      total: 100,
    });
    
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    
    render(
      <Provider store={mockStore}>
        <PaymentSuccessPage />
      </Provider>
    );
    
    expect(dispatchSpy).toHaveBeenCalledWith({ type: 'cart/clearCart' });
  });

  it('should render all text content in Spanish', () => {
    renderWithProvider(<PaymentSuccessPage />);
    
    expect(screen.getByText('¡Pago confirmado!')).toBeInTheDocument();
    expect(screen.getByText('Ver mis órdenes')).toBeInTheDocument();
    expect(screen.getByText(/Tu pedido ha sido procesado exitosamente/)).toBeInTheDocument();
  });
});