'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { User } from '../../lib/types/auth.types';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import { fetchUsers, deleteUser, setPageLimit, clearError } from '../../lib/redux/slices/usersSlice';
import { useAdmin } from '../../lib/hooks/useAdmin';
import Modal from '../ui/Modal';
import EditUserForm from './EditUserForm';
import Alert from '../ui/Alert';
import DataTable, { Action, Column } from '../ui/Table';

export default function UsersManagement() {
  const dispatch = useAppDispatch();
  const usersState = useAppSelector((state) => state.users);
  const authState = useAppSelector((state) => state.auth);

  const {
    users = [],
    loading = { fetch: false, update: false, delete: false },
    error = null,
    pagination = { limit: 10, total: 0 }
  } = usersState;

  const { isAdmin } = useAdmin();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && authState.isAuthenticated) {
      dispatch(fetchUsers({ 
        limit: pagination.limit
      }));
    }
  }, [dispatch, isAdmin, pagination.limit, authState.isAuthenticated]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setPageLimit(newLimit));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.email}?`)) {
      try {
        await dispatch(deleteUser(user.email)).unwrap();
        setSuccessMessage('Usuario eliminado exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
        dispatch(fetchUsers({ limit: pagination.limit }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSuccessMessage('Usuario actualizado exitosamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    dispatch(fetchUsers({ limit: pagination.limit }));
  };

  const columns: Column<User>[] = [
    {
      key: 'email',
      title: 'Usuario',
      render: (_, user) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {user.fullName || 'Sin nombre'}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'roles',
      title: 'Roles',
      render: (roles) => (
        <div className="flex gap-1 flex-wrap">
          {roles?.length ? (
            roles.map((role: string) => (
              <span
                key={role}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : role === 'delivery'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {role}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              Sin roles
            </span>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Estado',
      render: (isActive) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  const actions: Action<User>[] = [
    {
      label: 'Editar usuario',
      icon: Edit,
      onClick: handleEditUser,
      color: 'primary',
      disabled: () => loading.update
    },
    {
      label: 'Eliminar usuario',
      icon: Trash2,
      onClick: handleDeleteUser,
      color: 'danger',
      disabled: () => loading.delete
    }
  ];

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error">
          No tienes permisos para acceder a esta página
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-[#ff914d]" />
          <h1 className="text-3xl font-black text-gray-900">GESTIÓN DE USUARIOS</h1>
        </div>
        <p className="text-gray-600">
          Administra los usuarios del sistema ({pagination.total} usuarios)
        </p>
      </div>

      {error && (
        <Alert type="error" dismissible onDismiss={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" dismissible onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={actions}
        loading={loading.fetch}
        searchable
        searchPlaceholder="Buscar por email o nombre..."
        onSearch={handleSearch}
        searchTerm={searchTerm}
        emptyMessage={searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
        emptyIcon={Users}
        pagination={{
          limit: pagination.limit,
          total: pagination.total,
          onLimitChange: handleLimitChange,
          limitOptions: [10, 25, 50, 100]
        }}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Editar Usuario"
      >
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}