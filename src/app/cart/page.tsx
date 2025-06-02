'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { removeItem, updateQuantity, clearCart } from '@/lib/redux/slices/cartSlice';
import { Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils/price';
import Link from 'next/link';
import { Product } from '@/lib/types/product.types';
import axios from 'axios';
import { useAuthUserId } from '@/lib/hooks/useAuthUserId';
import { Dialog, DialogPanel, DialogTitle, DialogDescription, Transition, TransitionChild } from '@headlessui/react';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const userId = useAuthUserId();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');

  const { items, total } = useAppSelector((state) => state.cart);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleCheckoutClick = () => {
    setIsOpen(true);
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setAddressError('Por favor ingresa una dirección de entrega');
      return;
    }

    setIsLoading(true);
    try {
      const requestUrl = window.location.origin;
      const productIds = items.flatMap(item => Array(item.quantity).fill(item.id));
      console.log('Product IDs:', productIds);
      const formData = new URLSearchParams();

      items.forEach((item, index) => {
        formData.append(`line_items[${index}][quantity]`, item.quantity.toString());
        formData.append(`line_items[${index}][price_data][currency]`, 'cop');
        formData.append(`line_items[${index}][price_data][product_data][name]`, item.name);
        formData.append(`line_items[${index}][price_data][unit_amount]`, (item.price * 100).toString());
      });

      formData.append('payment_method_types[0]', 'card');
      formData.append('mode', 'payment');
      formData.append('success_url', `${requestUrl}/buy/success`);
      formData.append('cancel_url', `${requestUrl}/cart`);
      formData.append('metadata[productIds]', JSON.stringify(productIds));
      formData.append('metadata[total]', total.toString());
      formData.append('metadata[userId]', userId || '');
      formData.append('metadata[address]', address);

      const response = await axios.post('/api/checkout', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`
        }
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
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
              {items.map((item: Product & { quantity: number }) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.price)} c/u</p>
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
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Total:</h3>
                <span className="text-xl font-bold text-[#ff914d]">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Vaciar Carrito
                </button>
                <button
                  onClick={handleCheckoutClick}
                  disabled={isLoading}
                  className="flex-1 bg-[#ff914d] hover:bg-[#e67b36] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2" size={20} />
                      Proceder al Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de dirección usando HeadlessUI */}
      <Transition show={isOpen}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* Fondo oscuro */}
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

          {/* Contenedor del modal */}
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
                      setIsOpen(false);
                      setAddressError('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Cancelar
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