'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { clearCart } from '@/lib/redux/slices/cartSlice';
import { useAppDispatch } from '@/lib/hooks/redux';

export default function PaymentSuccessPage() {
  const dispatch = useAppDispatch();
  dispatch(clearCart())
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago confirmado!</h1>

        <p className="text-gray-600 mb-6">
          Tu pedido ha sido procesado exitosamente. Cuando tu pago sea reportado, podrás ver los detalles de tu orden en "Mis órdenes".
        </p>

        <div className="mt-8">
          <Link
            href="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#ff914d] hover:bg-[#e67b36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors"
          >
            Ver mis órdenes
          </Link>
        </div>
      </div>
    </div>
  );
}