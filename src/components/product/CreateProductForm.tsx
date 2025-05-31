'use client';

import React, { useState, FormEvent } from 'react';
import Image from 'next/image';
import { CreateProductDto, ProductCategories } from '../../lib/types/product.types';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import Alert from '../ui/Alert';
import Input from '../ui/Input';
import { clearError, createProduct } from '../../lib/redux/slices/productSlice';
import { X } from 'lucide-react';

interface CreateProductFormProps {
  defaultCategory: ProductCategories;
  onSuccess: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: ProductCategories.burgers, label: 'Hamburguesas' },
  { value: ProductCategories.Accompaniments, label: 'Acompañamientos' },
  { value: ProductCategories.drinks, label: 'Bebidas' }
];

export default function CreateProductForm({ 
  defaultCategory, 
  onSuccess, 
  onCancel 
}: CreateProductFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: defaultCategory,
    imageUrl: ''
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }

    if (!formData.price) {
      errors.price = 'El precio es requerido';
    } else if (Number(formData.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.category) {
      errors.category = 'La categoría es requerida';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Por favor ingresa una URL válida';
    }

    return errors;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const createData: CreateProductDto = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      imageUrl: formData.imageUrl.trim() || undefined
    };

    try {
      await dispatch(createProduct(createData)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Create product failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'imageUrl' && value && isValidUrl(value)) {
      setImagePreview(value);
    } else if (name === 'imageUrl' && !value) {
      setImagePreview(null);
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          IMAGEN DEL PRODUCTO (opcional)
        </label>
        <div className="space-y-3">
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-gray-900 placeholder-gray-500 ${
              fieldErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fieldErrors.imageUrl && (
            <p className="text-sm text-red-600">{fieldErrors.imageUrl}</p>
          )}
          
          {imagePreview && (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={() => {
                  setImagePreview(null);
                  setFieldErrors(prev => ({
                    ...prev,
                    imageUrl: 'No se pudo cargar la imagen. Verifica la URL.'
                  }));
                }}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ingresa la URL de una imagen
        </p>
      </div>

      <Input
        label="NOMBRE DEL PRODUCTO"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej: Hamburguesa Clásica"
        error={fieldErrors.name}
      />

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          DESCRIPCIÓN
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el producto..."
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none ${
            fieldErrors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {fieldErrors.description && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.description}</p>
        )}
      </div>

      <Input
        label="PRECIO (en miles de pesos)"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="Ej: 15"
        min="0"
        step="0.5"
        error={fieldErrors.price}
      />

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          CATEGORÍA
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-gray-900 ${
            fieldErrors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.category}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading.create}
          className="flex-1 px-6 py-3 bg-[#ff914d] text-white rounded-lg hover:bg-[#e67b36] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.create ? 'Creando...' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}