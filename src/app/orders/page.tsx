"use client";
import { order } from '../../lib/api/orderApi';
import { useUserRoles } from '../..//lib/hooks/useUserRoles';
import { Order, OrderState } from '../..//lib/types/order.types';
import { Product } from '../..//lib/types/product.types';
import { formatDate } from '../..//lib/utils/date';
import { getOrderStateColor } from '../..//lib/utils/order';
import React, { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  const { hasAnyRole } = useUserRoles();
  const canCancelOrders = hasAnyRole(['customer']);
  const canUpdateOrders = hasAnyRole(['admin', 'delivery']);
  const canDeleteOrders = hasAnyRole(['admin']);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const ordersData = await order.getOrders(limit, currentPage);
          console.log('Orders Data:', ordersData);
        if (!ordersData?.data || !Array.isArray(ordersData.data)) {
          throw new Error('Invalid orders data received from server');
        }

        const processedOrders = ordersData.data;
        console.log('Processed Orders:', processedOrders);
        setOrders(processedOrders);
        setTotalPages(ordersData.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, limit]);

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numericPrice.toFixed(2);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleUpdateStatus = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);
      const updatedOrder = await order.updateOrderToNextStatus(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? {
            ...updatedOrder,
            id: updatedOrder.id || orderId,
            date: updatedOrder.date || order.date,
            address: updatedOrder.address || order.address,
            state: updatedOrder.state || order.state,
            total: updatedOrder.total || order.total,
            products: updatedOrder.products || order.products
          } : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);
      const cancelledOrder = await order.cancelOrder(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? {
            ...cancelledOrder,
            id: cancelledOrder.id || orderId,
            date: cancelledOrder.date || order.date,
            address: cancelledOrder.address || order.address,
            state: cancelledOrder.state || OrderState.Cancelled,
            total: cancelledOrder.total || order.total,
            products: cancelledOrder.products || order.products
          } : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);
      await order.eraseOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

    
      if (orders.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setProcessingOrder(null);
    }
  };

  const canCancel = (orderState: OrderState) => {
    return orderState !== OrderState.OnTheWay &&
      orderState !== OrderState.Delivered &&
      orderState !== OrderState.Cancelled;
  };

  
  const getProductQuantity = (productId: string, items?: { productId: string; quantity: number }[]) => {
    if (!items) return 1; 
    const item = items.find(item => item.productId === productId);
    return item ? item.quantity : 1;
  };

  
  const getProductToppings = (productId: string, toppings?: { topping: string; productId: string; quantity: number, price: number }[], allProducts?: Product[]) => {
    if (!toppings || !allProducts) return [];
    
    return toppings
      .filter(topping => topping.productId === productId)
      .map(topping => {
        const toppingProduct = allProducts.find(p => p.id === topping.productId);
        return {
          ...toppingProduct,
          quantity: topping.quantity,
          name: `Topping ${topping.topping}`,
          price: topping.price || 0
        };
      })
      .filter(topping => topping.name);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis órdenes</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No tienes órdenes aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Orden #{order.id?.slice(0, 8) || 'N/A'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStateColor(order.state)}`}>
                      {order.state}
                    </span>
                    {canDeleteOrders &&  canCancel(order.state) &&(
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={processingOrder === order.id}
                        className="p-1 text-red-500 hover:text-red-700 disabled:text-red-300"
                        title="Eliminar orden permanentemente"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dirección:</span> {order.address}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-800 mb-2">Productos</h3>
                  <div className="divide-y divide-gray-200">
                    {order.products.map((product: Product) => {
                      const quantity = getProductQuantity(product.id, order.items);
                      const toppings = getProductToppings(product.id, order.toppings, order.products);
                      const productTotal = product.price * quantity;
                      const toppingsTotal = toppings.reduce((sum, topping) => sum + (topping.price * topping.quantity), 0);
                      const itemTotal = productTotal + toppingsTotal;

                      return (
                        <div key={product.id} className="py-3">
                          <div className="flex justify-between">
                            <div className="flex items-start">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-md mr-4"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                                  {quantity > 1 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      x{quantity}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{product.category}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  ${formatPrice(product.price)} {quantity > 1 && `x ${quantity}`}
                                </p>
                                
                                {/* Display toppings */}
                                {toppings.length > 0 && (
                                  <div className="mt-2 ml-4">
                                    <p className="text-xs text-gray-500 font-medium">Toppings:</p>
                                    {toppings.map((topping, index) => (
                                      <div key={`${topping.id}-${index}`} className="text-xs text-gray-600 ml-2">
                                        • {topping.name} 
                                        {topping.quantity > 1 && ` x${topping.quantity}`}
                                        {topping.price > 0 && ` (+$${formatPrice(topping.price * topping.quantity)})`}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">
                                ${formatPrice(itemTotal)}
                              </p>
                              {(toppingsTotal > 0 || quantity > 1) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {quantity > 1 && <div>Base: ${formatPrice(productTotal)}</div>}
                                  {toppingsTotal > 0 && <div>Toppings: +${formatPrice(toppingsTotal)}</div>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-800">
                    Total: ${formatPrice(order.total)}
                  </p>

                  <div className="flex space-x-2">
                    {canCancelOrders && canCancel(order.state) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={processingOrder === order.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                      >
                        {processingOrder === order.id ? 'Procesando...' : 'Cancelar'}
                      </button>
                    )}

                    {canUpdateOrders && order.state !== OrderState.Delivered && order.state !== OrderState.Cancelled && (
                      <button
                        onClick={() => handleUpdateStatus(order.id)}
                        disabled={processingOrder === order.id}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-300"
                      >
                        {processingOrder === order.id ? 'Procesando...' : 'Actualizar Estado'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Anterior
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}