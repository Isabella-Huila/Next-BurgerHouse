'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { removeItem, updateQuantity, clearCart } from '@/lib/redux/slices/cartSlice';
import { fetchToppings } from '@/lib/redux/slices/toppingsSlice';
import { Trash2, ArrowLeft, CreditCard, Plus, Minus, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils/price';
import Link from 'next/link';
import { Product } from '@/lib/types/product.types';
import { Topping } from '@/lib/types/topping.types';
import axios from 'axios';
import { useAuthUserId } from '@/lib/hooks/useAuthUserId';
import { Dialog, DialogPanel, DialogTitle, DialogDescription, Transition, TransitionChild } from '@headlessui/react';
import { order } from '@/lib/api/orderApi';

interface SelectedTopping {
  id: string;
  productId: string;
  quantity: number;
  price: number; 
}

export default function CartPage() {
  const dispatch = useAppDispatch();
  const userId = useAuthUserId();
  const [isLoading, setIsLoading] = useState(false);
  const [isToppingsModalOpen, setIsToppingsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const { items, total } = useAppSelector((state) => state.cart);
  const { toppings, loading } = useAppSelector((state) => state.toppings);

  // Filtrar solo productos de categoría "burgers"
  const burgerItems = items.filter(item => item.category === 'burgers');

  // Cargar toppings al montar el componente
  useEffect(() => {
    dispatch(fetchToppings({ limit: 50 }));
  }, [dispatch]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleCheckoutClick = () => {
    if (burgerItems.length > 0) {
      setCurrentProductIndex(0);
      setIsToppingsModalOpen(true);
    } else {
      setIsAddressModalOpen(true);
    }
  };

  const handleToppingQuantityChange = (toppingId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const currentProduct = burgerItems[currentProductIndex];
    if (!currentProduct) return;

    const currentProductToppings = selectedToppings.filter(t => t.productId === currentProduct.id);
    const currentToppingQuantity = currentProductToppings.find(t => t.id === toppingId)?.quantity || 0;
    const totalToppingsWithoutCurrent = currentProductToppings.filter(t => t.id !== toppingId).reduce((sum, t) => sum + t.quantity, 0);

    // Verificar si el nuevo total excede el límite de 5
    if (totalToppingsWithoutCurrent + newQuantity > 5) {
      return; // No permitir la acción si excede el límite
    }

    setSelectedToppings(prev => {
      const filtered = prev.filter(t => !(t.id === toppingId && t.productId === currentProduct.id));

      if (newQuantity > 0) {
        return [...filtered, {
          id: toppingId,
          productId: currentProduct.id,
          quantity: newQuantity,
          price: toppings.find(t => t.id === toppingId)?.price || 0
        }];
      }

      return filtered;
    });
  };

  const getCurrentProductToppings = () => {
    const currentProduct = burgerItems[currentProductIndex];
    if (!currentProduct) return [];

    return selectedToppings.filter(t => t.productId === currentProduct.id);
  };

  const getTotalToppingsForCurrentProduct = () => {
    return getCurrentProductToppings().reduce((sum, topping) => sum + topping.quantity, 0);
  };

  // FUNCIÓN CORREGIDA: Calcular total de toppings multiplicado por cantidad de productos
  const getToppingsTotal = () => {
    return selectedToppings.reduce((sum, selectedTopping) => {
      const topping = toppings.find(t => t.id === selectedTopping.id);
      const product = items.find(p => p.id === selectedTopping.productId);

      if (topping && product) {
        // Multiplicar el precio del topping por su cantidad Y por la cantidad del producto
        return sum + (topping.price * selectedTopping.quantity * product.quantity);
      }

      return sum;
    }, 0);
  };

  const getFinalTotal = () => {
    return total + getToppingsTotal();
  };

  const getSelectedToppingQuantity = (toppingId: string) => {
    const currentProduct = burgerItems[currentProductIndex];
    if (!currentProduct) return 0;

    return selectedToppings.find(t => t.id === toppingId && t.productId === currentProduct.id)?.quantity || 0;
  };

  const handleNextProduct = () => {
    if (currentProductIndex < burgerItems.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else {
      setIsToppingsModalOpen(false);
      setIsAddressModalOpen(true);
    }
  };

  const handlePreviousProduct = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  };

  const handleSkipToppings = () => {
    // Remover toppings del producto actual
    const currentProduct = burgerItems[currentProductIndex];
    if (currentProduct) {
      setSelectedToppings(prev => prev.filter(t => t.productId !== currentProduct.id));
    }
    handleNextProduct();
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setAddressError('Por favor ingresa una dirección de entrega');
      return;
    }

    setIsLoading(true);
    try {
      // Preparar datos para la API de orders
      const productIds = items.flatMap(item => Array(item.quantity).fill(item.id));

      // Preparar items con cantidad
      const itemsData = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Preparar toppings con nombres de topping (no solo IDs)
      const toppingsData = selectedToppings.map(selectedTopping => {
        const topping = toppings.find(t => t.id === selectedTopping.id);
        return {
          productId: selectedTopping.productId,
          topping: topping?.name || selectedTopping.id, // Usar nombre del topping
          quantity: selectedTopping.quantity,
          price: selectedTopping.price
        };
      });

      // Crear la orden usando tu API
      const orderResponse = await order.createOrder(
        getFinalTotal(),
        productIds as string[],
        address,
        toppingsData,
        itemsData
      );

      // Ahora crear sesión de Stripe con el detalle completo de productos y toppings
      const requestUrl = window.location.origin;
      const formData = new URLSearchParams();

      // Agregar cada producto como un ítem separado
      items.forEach((item, index) => {
        // Producto base
        formData.append(`line_items[${index}][quantity]`, item.quantity.toString());
        formData.append(`line_items[${index}][price_data][currency]`, 'cop');
        formData.append(`line_items[${index}][price_data][product_data][name]`, item.name);
        formData.append(`line_items[${index}][price_data][unit_amount]`, (item.price * 100).toString());

        // Buscar toppings para este producto
        const productToppings = selectedToppings.filter(t => t.productId === item.id);
        if (productToppings.length > 0) {
          // Crear descripción detallada con toppings
          let toppingsDescription = "Toppings: ";
          toppingsDescription += productToppings.map(selectedTopping => {
            const topping = toppings.find(t => t.id === selectedTopping.id);
            return `${topping?.name || 'Topping'} x${selectedTopping.quantity}`;
          }).join(", ");

          formData.append(`line_items[${index}][price_data][product_data][description]`, toppingsDescription);
        }
      });

      // Agregar un ítem adicional para los toppings si es necesario (solo para visualización)
      const toppingsTotal = getToppingsTotal();
      if (toppingsTotal > 0) {
        const toppingsIndex = items.length;
        formData.append(`line_items[${toppingsIndex}][quantity]`, '1');
        formData.append(`line_items[${toppingsIndex}][price_data][currency]`, 'cop');
        formData.append(`line_items[${toppingsIndex}][price_data][product_data][name]`, 'Toppings adicionales');
        formData.append(`line_items[${toppingsIndex}][price_data][product_data][description]`, 'Total de toppings para todas las hamburguesas');
        formData.append(`line_items[${toppingsIndex}][price_data][unit_amount]`, (toppingsTotal * 100).toString());
      }

      formData.append('payment_method_types[0]', 'card');
      formData.append('mode', 'payment');
      formData.append('success_url', `${requestUrl}/buy/success`);
      formData.append('cancel_url', `${requestUrl}/cart`);

      formData.append('metadata[orderId]', orderResponse.id.toString());
      formData.append('metadata[userId]', userId || '');

      const stripeResponse = await axios.post('/api/checkout', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`
        }
      });

      window.location.href = stripeResponse.data.url;
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentProductToppingsDisplay = () => {
    const currentToppings = getCurrentProductToppings();
    return currentToppings.map(selectedTopping => {
      const topping = toppings.find(t => t.id === selectedTopping.id);
      return topping ? { ...topping, selectedQuantity: selectedTopping.quantity } : null;
    }).filter(Boolean);
  };

  const getCurrentProductToppingsTotal = () => {
    return getCurrentProductToppingsDisplay().reduce((sum, topping) =>
      sum + (topping ? topping.price * topping.selectedQuantity : 0), 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link
            href="/menu"
            className="flex items-center text-[#ff914d] hover:text-[#e67b36] transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Volver al menú
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tu Carrito</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega algunos productos del menú para continuar</p>
            <Link
              href="/menu"
              className="inline-flex items-center px-6 py-3 bg-[#ff914d] hover:bg-[#e67b36] text-white font-medium rounded-lg transition-colors"
            >
              Explorar Menú
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {items.map((item: Product & { quantity: number }) => {
                const productToppings = selectedToppings.filter(t => t.productId === item.id);
                // CORREGIDO: Calcular total de toppings multiplicado por cantidad del producto
                const productToppingsTotal = productToppings.reduce((sum, selectedTopping) => {
                  const topping = toppings.find(t => t.id === selectedTopping.id);
                  return sum + (topping ? topping.price * selectedTopping.quantity * item.quantity : 0);
                }, 0);

                return (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">{formatPrice(item.price)} c/u</p>
                        {item.category === 'burgers' && productToppings.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">Toppings (por hamburguesa):</p>
                            {productToppings.map(selectedTopping => {
                              const topping = toppings.find(t => t.id === selectedTopping.id);
                              return topping ? (
                                <div key={selectedTopping.id} className="text-xs text-gray-600">
                                  • {topping.name} x{selectedTopping.quantity} ({formatPrice(topping.price * selectedTopping.quantity)})
                                </div>
                              ) : null;
                            })}
                            <p className="text-sm font-medium text-[#ff914d] mt-1">
                              Subtotal con toppings: {formatPrice((item.price * item.quantity) + productToppingsTotal)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center w-full sm:w-auto">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-center min-w-[40px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch(removeItem(item.id))}
                          className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal productos:</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                {getToppingsTotal() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toppings:</span>
                    <span className="font-medium">{formatPrice(getToppingsTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                  <h3 className="text-lg font-semibold text-gray-900">Total:</h3>
                  <span className="text-xl font-bold text-[#ff914d]">
                    {formatPrice(getFinalTotal())}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    dispatch(clearCart());
                    setSelectedToppings([]);
                  }}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Vaciar Carrito
                </button>
                <button
                  onClick={handleCheckoutClick}
                  disabled={isLoading}
                  className="flex-1 bg-[#ff914d] hover:bg-[#e67b36] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <CreditCard className="mr-2" size={20} />
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Toppings por Producto */}
      <Transition show={isToppingsModalOpen}>
        <Dialog onClose={() => setIsToppingsModalOpen(false)} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl rounded-xl bg-white p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Toppings para {burgerItems[currentProductIndex]?.name}
                  </DialogTitle>
                  <button
                    onClick={() => setIsToppingsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Producto {currentProductIndex + 1} de {burgerItems.length}
                  </p>
                  <p className={`text-sm font-medium ${getTotalToppingsForCurrentProduct() >= 5 ? 'text-red-600' : 'text-gray-600'}`}>
                    Toppings seleccionados: {getTotalToppingsForCurrentProduct()}/5
                  </p>
                </div>

                <DialogDescription className="text-gray-600 mb-4">
                  Selecciona hasta 5 toppings para esta hamburguesa (se aplicarán a todas las unidades)
                </DialogDescription>

                {getTotalToppingsForCurrentProduct() >= 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm font-medium">
                      ⚠️ Has alcanzado el límite máximo de 5 toppings para esta hamburguesa
                    </p>
                  </div>
                )}

                {loading.fetch ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff914d]"></div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {toppings.filter(topping => topping.isActive).map((topping) => {
                      const selectedQuantity = getSelectedToppingQuantity(topping.id);
                      const totalWithoutCurrent = getTotalToppingsForCurrentProduct() - selectedQuantity;
                      const canDecrease = selectedQuantity > 0;
                      const canIncrease = totalWithoutCurrent < 5;

                      return (
                        <div key={topping.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{topping.name}</h4>
                            <p className="text-sm text-gray-600">{formatPrice(topping.price)}</p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleToppingQuantityChange(topping.id, selectedQuantity - 1)}
                              disabled={!canDecrease}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="w-8 text-center font-medium">{selectedQuantity}</span>

                            <button
                              onClick={() => handleToppingQuantityChange(topping.id, selectedQuantity + 1)}
                              disabled={!canIncrease}
                              className="w-8 h-8 rounded-full bg-[#ff914d] hover:bg-[#e67b36] disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center"
                              title={!canIncrease ? "Límite de 5 toppings alcanzado" : ""}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {getCurrentProductToppings().length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Toppings seleccionados:</h4>
                    {getCurrentProductToppingsDisplay().map((topping) => (
                      <div key={topping!.id} className="flex justify-between text-sm">
                        <span>{topping!.name} x{topping!.selectedQuantity}</span>
                        <span>{formatPrice(topping!.price * topping!.selectedQuantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
                      <span>Total Toppings (por hamburguesa):</span>
                      <span className="text-[#ff914d]">{formatPrice(getCurrentProductToppingsTotal())}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <div className="flex gap-2">
                    {currentProductIndex > 0 && (
                      <button
                        onClick={handlePreviousProduct}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                      >
                        Anterior
                      </button>
                    )}
                    <button
                      onClick={handleSkipToppings}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                    >
                      Omitir
                    </button>
                  </div>

                  <button
                    onClick={handleNextProduct}
                    className="px-4 py-2 bg-[#ff914d] hover:bg-[#e67b36] text-white rounded-md transition-colors"
                  >
                    {currentProductIndex < burgerItems.length - 1 ? 'Siguiente' : 'Continuar'}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de dirección */}
      <Transition show={isAddressModalOpen}>
        <Dialog onClose={() => setIsAddressModalOpen(false)} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6">
                <DialogTitle className="text-xl font-bold text-gray-900 mb-4">Dirección de entrega</DialogTitle>
                <DialogDescription className="text-gray-600 mb-4">
                  Por favor ingresa la dirección donde deseas recibir tu pedido:
                </DialogDescription>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Productos:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {getToppingsTotal() > 0 && (
                      <div className="flex justify-between">
                        <span>Toppings:</span>
                        <span>{formatPrice(getToppingsTotal())}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-1 flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-[#ff914d]">{formatPrice(getFinalTotal())}</span>
                    </div>
                  </div>
                </div>

                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (addressError) setAddressError('');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                  rows={4}
                  placeholder="Ej: Calle 123 #45-67, Barrio, Ciudad"
                />
                {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsAddressModalOpen(false);
                      if (burgerItems.length > 0) {
                        setCurrentProductIndex(burgerItems.length - 1);
                        setIsToppingsModalOpen(true);
                      }
                      setAddressError('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#ff914d] hover:bg-[#e67b36] text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar y Pagar'
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}