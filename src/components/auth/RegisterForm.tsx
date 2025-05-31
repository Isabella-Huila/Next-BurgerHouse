'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { registerUser, clearError } from '../../lib/redux/slices/authSlice';
import { RegisterDto } from '../../lib/types/auth.types';
import Alert from '../ui/Alert';
import Input from '../ui/Input';

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterDto>({
    email: '',
    password: '',
    fullName: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido';
    }
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }else if (formData.password && !/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
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

    try {
      await dispatch(registerUser(formData)).unwrap();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Registro</h1>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          <div className="space-y-4">
            <Input
              label="NOMBRE COMPLETO"
              name="fullName"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              error={fieldErrors.fullName}
            />
            <Input
              label="CORREO ELECTRÓNICO"
              name="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />
            <Input
              label="CONTRASEÑA"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-black hover:bg-[#1f1f1f]"
          >
            {isLoading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
          </button>
        </form>
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">¿Ya tienes una cuenta?</p>
            <Link href="/login">
              <button className="bg-white border border-gray-300 text-gray-900 py-3 px-8 rounded-lg font-medium hover:bg-gray-50 hover:border-[#ff914d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors">
                INGRESAR
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}