'use client';

import { useState, FormEvent } from 'react';
import { User } from '../../lib/types/auth.types';
import { UpdateUserDto } from '@/lib/api/userApi';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { updateUser, clearError } from '@/lib/redux/slices/usersSlice';

interface EditUserFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditUserForm({ user, onSuccess, onCancel }: EditUserFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: user.email || '',
    fullName: user.fullName || '',
    password: '',
    isActive: user.isActive,
    roles: user.roles || []
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const isCurrentUserAdmin = currentUser?.roles?.includes('admin') || false;
  const isEditingSelf = currentUser?.email === user.email;

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (formData.password && !/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(formData.password)) {
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
    
    const updateData: UpdateUserDto = {
      fullName: formData.fullName,
    };

    if (formData.email !== user.email) {
      updateData.email = formData.email;
    }

    if (formData.password.trim()) {
      updateData.password = formData.password;
    }

    if (isCurrentUserAdmin) {
      updateData.isActive = formData.isActive;
      updateData.roles = formData.roles;
    }

    try {
      await dispatch(updateUser({ 
        email: user.email, 
        updateData 
      })).unwrap();
      onSuccess();
    } catch (error) {
      console.error('Update user failed:', error);
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

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role] 
        : prev.roles.filter(r => r !== role)
    }));
  };

  const availableRoles = ['admin', 'customer', 'delivery'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <Input
        label="EMAIL"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email del usuario"
        error={fieldErrors.email}
      />

      <Input
        label="NOMBRE COMPLETO"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Nombre completo del usuario"
      />

      {isEditingSelf && (
        <Input
          label="NUEVA CONTRASEÑA (opcional)"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Dejar vacío para mantener la actual"
          error={fieldErrors.password}
        />
      )}

      {isCurrentUserAdmin && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">ESTADO</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#ff914d] border-gray-300 rounded focus:ring-[#ff914d]"
              />
              <span className="text-sm text-gray-700">Usuario activo</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">ROLES</label>
            <div className="space-y-2">
              {availableRoles.map(role => (
                <label key={role} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={(e) => handleRoleChange(role, e.target.checked)}
                    className="w-4 h-4 text-[#ff914d] border-gray-300 rounded focus:ring-[#ff914d]"
                  />
                  <span className="text-sm text-gray-700 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading.update}
          className="flex-1 bg-[#ff914d] hover:bg-[#e67b36] text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading.update ? 'GUARDANDO...' : 'GUARDAR'}
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