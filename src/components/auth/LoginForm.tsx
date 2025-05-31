'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { loginUser, clearError } from '../../lib/redux/slices/authSlice';
import { LoginDto } from '../../lib/types/auth.types';
import Alert from '../ui/Alert';
import Input from '../ui/Input';

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setFieldErrors({});

    const errors: {[key: string]: string} = {};
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Ingresar</h1>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          <div className="space-y-4">
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
            {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>
        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">¿Aún no tienes cuenta?</p>
            <Link href="/register">
              <button className="bg-white border border-gray-300 text-gray-900 py-3 px-8 rounded-lg font-medium hover:bg-gray-50 hover:border-[#ff914d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff914d] transition-colors">
                REGISTRO
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}