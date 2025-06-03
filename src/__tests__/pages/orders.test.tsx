import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrdersPage from '../../app/orders/page';
import { OrderState } from '../../lib/types/order.types';


jest.mock('@/lib/api/orderApi', () => ({
  order: {
    getOrders: jest.fn(),
    updateOrderToNextStatus: jest.fn(),
    cancelOrder: jest.fn(),
    eraseOrder: jest.fn(),
  },
}));


jest.mock('@/lib/hooks/useUserRoles', () => ({
  useUserRoles: jest.fn(),
}));


jest.mock('@/lib/utils/date', () => ({
  formatDate: jest.fn((date) => `Formatted: ${date}`),
}));

jest.mock('@/lib/utils/order', () => ({
  getOrderStateColor: jest.fn((state) => `color-${state}`),
}));

import { order } from '../../lib/api/orderApi';
import { useUserRoles } from '../../lib/hooks/useUserRoles';

const mockOrders = [
  {
    id: 'order-1',
    date: '2024-01-15',
    address: 'Calle 123',
    state: OrderState.Pending,
    total: 25.50,
    products: [
      {
        id: 'product-1',
        name: 'Hamburguesa Margherita',
        price: 20.00,
        category: 'burgers',
        imageUrl: 'https://example.com/burger.jpg'
      }
    ],
    items: [
      { productId: 'product-1', quantity: 1 }
    ],
    toppings: []
  },
  {
    id: 'order-2',
    date: '2024-01-14',
    address: 'Calle 456',
    state: OrderState.Delivered,
    total: 35.75,
    products: [
      {
        id: 'product-2',
        name: 'Hamburguesa Clásica',
        price: 15.00,
        category: 'Hamburguesa',
        imageUrl: 'https://example.com/burger.jpg'
      }
    ],
    items: [
      { productId: 'product-2', quantity: 2 }
    ],
    toppings: [
      { topping: 'Extra Queso', productId: 'product-2', quantity: 1, price: 2.50 }
    ]
  }
];

const mockOrdersResponse = {
  data: mockOrders,
  totalPages: 2
};

describe('OrdersPage', () => {
  beforeEach(() => {
    
    jest.clearAllMocks();
    
    
    (order.getOrders as jest.Mock).mockResolvedValue(mockOrdersResponse);
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => {
        if (roles.includes('customer')) return true;
        if (roles.includes('admin')) return false;
        if (roles.includes('delivery')) return false;
        return false;
      })
    });
  });


  it('should render orders after loading', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Mis órdenes')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Orden #order-1')).toBeInTheDocument();
    expect(screen.getByText('Orden #order-2')).toBeInTheDocument();
  });
;

  it('should show empty state when no orders exist', async () => {
    (order.getOrders as jest.Mock).mockResolvedValue({
      data: [],
      totalPages: 1
    });
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No tienes órdenes aún.')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);
    
    expect(order.getOrders).toHaveBeenCalledWith(5, 2);
  });

  it('should disable pagination buttons appropriately', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      const prevButton = screen.getByText('Anterior');
      expect(prevButton).toBeDisabled();
    });
  });

  it('should show cancel button for customer role and cancellable orders', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      const cancelButtons = screen.getAllByText('Cancelar');
      expect(cancelButtons).toHaveLength(1);
    });
  });

  it('should not show cancel button for delivered orders', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Orden #order-2')).toBeInTheDocument();
    });
    
   
    const allCancelButtons = screen.queryAllByText('Cancelar');
    expect(allCancelButtons).toHaveLength(1); 
  });

  it('should handle order cancellation', async () => {
  const cancelledOrder = { ...mockOrders[0], state: OrderState.Cancelled };
  (order.cancelOrder as jest.Mock).mockResolvedValue(cancelledOrder);

  render(<OrdersPage />);

  const cancelButton = await screen.findByText('Cancelar');
  fireEvent.click(cancelButton);

  await waitFor(() => {
    expect(order.cancelOrder).toHaveBeenCalledWith('order-1');
  });
});

  it('should show update status button for admin/delivery roles', async () => {
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => {
        if (roles.includes('admin')) return true;
        if (roles.includes('delivery')) return true;
        return false;
      })
    });
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Actualizar Estado')).toBeInTheDocument();
    });
  });

  it('should handle status update', async () => {
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => roles.includes('admin'))
    });
    
    (order.updateOrderToNextStatus as jest.Mock).mockResolvedValue({});
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      const updateButton = screen.getByText('Actualizar Estado');
      fireEvent.click(updateButton);
    });
    
    expect(order.updateOrderToNextStatus).toHaveBeenCalledWith('order-1');
  });

  it('should show delete button for admin role', async () => {
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => roles.includes('admin'))
    });
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTitle('Eliminar orden permanentemente');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should handle order deletion', async () => {
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => roles.includes('admin'))
    });
    
    (order.eraseOrder as jest.Mock).mockResolvedValue({});
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      const deleteButton = screen.getByTitle('Eliminar orden permanentemente');
      fireEvent.click(deleteButton);
    });
    
    expect(order.eraseOrder).toHaveBeenCalledWith('order-1');
  });

  it('should display product quantities correctly', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('x2')).toBeInTheDocument(); // For the second order
    });
  });

  it('should display toppings information', async () => {
    render(<OrdersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Toppings:')).toBeInTheDocument();
      expect(screen.getByText(/Topping Extra Queso/)).toBeInTheDocument();
    });
  });

  
  it('should show processing state during actions', async () => {
    (order.cancelOrder as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);
    });
    
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  it('should handle API errors during actions', async () => {
    (order.cancelOrder as jest.Mock).mockRejectedValue(new Error('Cancel failed'));
    
    render(<OrdersPage />);
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Cancel failed')).toBeInTheDocument();
    });
  });

  it('should adjust pagination when deleting last item on page', async () => {
    // Mock single item on page 2
    (order.getOrders as jest.Mock).mockResolvedValue({
      data: [mockOrders[0]],
      totalPages: 2
    });
    
    (useUserRoles as jest.Mock).mockReturnValue({
      hasAnyRole: jest.fn((roles) => roles.includes('admin'))
    });
    
    (order.eraseOrder as jest.Mock).mockResolvedValue({});
    
    render(<OrdersPage />);
 
    await waitFor(() => {
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);
    });
    
   
    await waitFor(() => {
      const deleteButton = screen.getByTitle('Eliminar orden permanentemente');
      fireEvent.click(deleteButton);
    });
  
    await waitFor(() => {
      expect(order.getOrders).toHaveBeenCalledWith(5, 1);
    });
  });

  it('should be a client component', () => {
    expect(() => render(<OrdersPage />)).not.toThrow();
  });
});