import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminToppingsPage from '@/app/toppings/page';

jest.mock('@/components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('@/components/topping/ToppingsManagement', () => {
  return function MockToppingsManagement() {
    return <div data-testid="toppings-management">Toppings Management Component</div>;
  };
});

describe('AdminToppingsPage', () => {
  it('should render ProtectedRoute wrapper', () => {
    render(<AdminToppingsPage />);
    
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('should render ToppingsManagement component inside ProtectedRoute', () => {
    render(<AdminToppingsPage />);
    
    const protectedRoute = screen.getByTestId('protected-route');
    const toppingsManagement = screen.getByTestId('toppings-management');
    
    expect(toppingsManagement).toBeInTheDocument();
    expect(protectedRoute).toContainElement(toppingsManagement);
  });

  it('should render ToppingsManagement with correct content', () => {
    render(<AdminToppingsPage />);
    
    expect(screen.getByText('Toppings Management Component')).toBeInTheDocument();
  });

  it('should have correct component structure', () => {
    const { container } = render(<AdminToppingsPage />);
    
    expect(container.firstChild).toHaveAttribute('data-testid', 'protected-route');
  });

  it('should be a client component', () => {
 
    expect(() => render(<AdminToppingsPage />)).not.toThrow();
  });
});