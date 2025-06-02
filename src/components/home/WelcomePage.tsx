'use client';

import Link from 'next/link';
import { ShoppingCart, UserPlus } from 'lucide-react';
import { useAppSelector } from '../../lib/hooks/redux';


export default function WelcomePage() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  return (
    <div className="text-black flex flex-col justify-center items-center px-4 pt-12">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-4">
          BURGER<span className="text-[#ff914d] block">HOUSE</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-xl mx-auto mb-12">
          Las mejores burgers de la ciudad, hechas con ingredientes frescos y mucho amor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={isAuthenticated ? "/menu" : "/login"}>
            <button 
              className="flex items-center justify-center gap-2 bg-[#ff914d] hover:bg-[#e8823d] text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <ShoppingCart className="w-5 h-5" />
              HACER PEDIDO
            </button>
          </Link>

          {!isAuthenticated && (
            <Link href="/login">
              <button className="flex items-center justify-center gap-2 border-2 border-gray-600 hover:border-[#ff914d] text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors">
                <UserPlus className="w-5 h-5" />
                YA TENGO CUENTA
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}