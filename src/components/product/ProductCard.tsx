'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '../../lib/types/product.types';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatPrice: (price: number) => string;
}

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'burgers':
      return '🍔';
    case 'Accompaniments':
      return '🍟';
    case 'drinks':
      return '🥤';
    default:
      return '🍽️';
  }
};

export default function ProductCard({
  product,
  isAdmin,
  isAuthenticated,
  onAddToCart,
  onEdit,
  onDelete,
  formatPrice
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-80 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-6xl">{getCategoryEmoji(product.category)}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {product.name}
          </h3>
          <span className="text-xl font-bold text-[#ff914d] whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#ff914d] hover:bg-[#e67b36] text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-[#ff914d] border-2 border-[#ff914d] py-2 px-3 rounded-lg font-medium transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={!isAuthenticated}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-[#ff914d] hover:bg-[#e67b36] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAuthenticated ? 'AGREGAR' : 'INICIA SESIÓN PARA AGREGAR'}
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}