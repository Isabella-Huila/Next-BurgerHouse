'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import { useAdmin } from '../../lib/hooks/useAdmin';
import { Product, ProductCategories } from '../../lib/types/product.types';
import { Plus } from 'lucide-react';

import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { clearError, deleteProduct, fetchProducts } from '../../lib/redux/slices/productSlice';
import ProductCard from './ProductCard';
import CreateProductForm from './CreateProductForm';
import EditProductForm from './EditProductForm';

const categoryConfig = {
  [ProductCategories.burgers]: {
    title: 'BURGERS',
    icon: '🍔',
    description: 'Hamburguesas artesanales'
  },
  [ProductCategories.Accompaniments]: {
    title: 'ACOMPAÑAMIENTOS',
    icon: '🍟',
    description: 'Perfectos para acompañar'
  },
  [ProductCategories.drinks]: {
    title: 'BEBIDAS',
    icon: '🥤',
    description: 'Refrescantes bebidas'
  },
};

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products);
  const authState = useAppSelector((state) => state.auth);
  const { isAdmin } = useAdmin();

  const {
    products = [],
    loading = { fetch: false, create: false, update: false, delete: false },
    error = null
  } = productsState;

  const [selectedCategory, setSelectedCategory] = useState<ProductCategories>(ProductCategories.burgers);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 50 }));
  }, [dispatch]);

  const filteredProducts = products.filter(
    product => product.category === selectedCategory && product.isActive
  );

  const handleAddToCart = (product: Product) => {
    if (!authState.isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }
    // Lógica del carrito
    console.log('Agregando al carrito:', product);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      try {
        await dispatch(deleteProduct(product.name)).unwrap();
        setSuccessMessage('Producto eliminado exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
        dispatch(fetchProducts({ limit: 50 }));
      } catch (error) {
        console.error('Delete product failed:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setSuccessMessage('Producto creado exitosamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    dispatch(fetchProducts({ limit: 50 }));
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSuccessMessage('Producto actualizado exitosamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    dispatch(fetchProducts({ limit: 50 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b-2 border-[#ff914d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center relative">
            <div className="text-center">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Menú</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="absolute right-0 flex items-center gap-2 bg-[#ff914d] hover:bg-[#e67b36] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                NUEVO PRODUCTO
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b-2 border-[#ff914d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-8 overflow-x-auto py-4">
            {Object.entries(categoryConfig).map(([category, config]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as ProductCategories)}
                className={`flex flex-col items-center min-w-[120px] px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#ff914d] text-white'
                    : 'text-gray-600 hover:text-[#ff914d] hover:bg-orange-50'
                }`}
              >
                <span className="text-2xl mb-1">{config.icon}</span>
                <span className="text-xs font-medium uppercase">{config.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {categoryConfig[selectedCategory].title}
          </h2>
          <p className="text-gray-600">{categoryConfig[selectedCategory].description}</p>
        </div>

        {loading.fetch ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryConfig[selectedCategory].icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-600">
              {isAdmin ? 'Agrega el primer producto para esta categoría.' : 'Pronto agregaremos productos a esta categoría.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                isAuthenticated={authState.isAuthenticated}
                onAddToCart={handleAddToCart}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Producto"
      >
        <CreateProductForm
          defaultCategory={selectedCategory}
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Editar Producto"
      >
        {selectedProduct && (
          <EditProductForm
            product={selectedProduct}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}