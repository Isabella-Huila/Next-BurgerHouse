'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { removeItem, updateQuantity, clearCart } from '@/lib/redux/slices/cartSlice';
import { Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils/price';
import Link from 'next/link';
import { Product } from '@/lib/types/product.types';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
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
                  onClick={() => alert('Proceder al pago')}
                  className="flex-1 bg-[#ff914d] hover:bg-[#e67b36] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <CreditCard className="mr-2" size={20} />
                  Proceder al Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}