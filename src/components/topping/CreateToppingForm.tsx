'use client';

import { useState, FormEvent } from 'react';
import { CreateToppingDto } from '@/lib/types/topping.types';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { createTopping, clearError } from '@/lib/redux/slices/toppingsSlice';

interface CreateToppingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateToppingForm({ onSuccess, onCancel }: CreateToppingFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.toppings);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maximumAmount: '1'
  });

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.price) {
      errors.price = 'El precio es requerido';
    } else if (Number(formData.price) <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.maximumAmount) {
      errors.maximumAmount = 'La cantidad máxima es requerida';
    } else if (Number(formData.maximumAmount) < 1 || Number(formData.maximumAmount) > 10) {
      errors.maximumAmount = 'La cantidad máxima debe estar entre 1 y 10';
    }

    return errors;
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

    const createData: CreateToppingDto = {
      name: formData.name.trim(),
      price: Number(formData.price),
      maximumAmount: Number(formData.maximumAmount)
    };

    try {
      await dispatch(createTopping(createData)).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Create topping failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Input
        label="NOMBRE DEL TOPPING"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Ej: Extra Queso"
        error={fieldErrors.name}
      />

      <Input
        label="PRECIO"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="5000"
        error={fieldErrors.price}
      />

      <Input
        label="CANTIDAD MÁXIMA"
        name="maximumAmount"
        type="number"
        min="1"
        max="10"
        value={formData.maximumAmount}
        onChange={handleChange}
        placeholder="5"
        error={fieldErrors.maximumAmount}
      />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading.create}
          className="flex-1 bg-[#ff914d] hover:bg-[#e67b36] text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading.create ? 'CREANDO...' : 'CREAR TOPPING'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:border-[#ff914d] hover:text-[#ff914d] transition-colors"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
}