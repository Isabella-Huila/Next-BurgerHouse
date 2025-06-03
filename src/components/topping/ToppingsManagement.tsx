'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Cookie } from 'lucide-react';
import { Topping } from '../../lib/types/topping.types';
import { useAppSelector, useAppDispatch } from '../../lib/hooks/redux';
import { fetchToppings, deleteTopping, setPageLimit, clearError } from '../../lib/redux/slices/toppingsSlice';
import { useAdmin } from '../../lib/hooks/useAdmin';
import Modal from '../ui/Modal';
import CreateToppingForm from './CreateToppingForm';
import EditToppingForm from './EditToppingForm';
import Alert from '../ui/Alert';
import DataTable, { Action, Column } from '../ui/Table';

export default function ToppingsManagement() {
  const dispatch = useAppDispatch();
  const toppingsState = useAppSelector((state) => state.toppings);
  const authState = useAppSelector((state) => state.auth);

  const {
    toppings = [],
    loading = { fetch: false, create: false, update: false, delete: false },
    error = null,
    pagination = { limit: 10, total: 0 }
  } = toppingsState;

  const { isAdmin } = useAdmin();

  const [filteredToppings, setFilteredToppings] = useState<Topping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && authState.isAuthenticated) {
      dispatch(fetchToppings({
        limit: pagination.limit
      }));
    }
  }, [dispatch, isAdmin, pagination.limit, authState.isAuthenticated]);

  useEffect(() => {
    const filtered = toppings.filter(topping =>
      topping.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredToppings(filtered);
  }, [toppings, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setPageLimit(newLimit));
  };

  const handleCreateTopping = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTopping = (topping: Topping) => {
    setSelectedTopping(topping);
    setIsEditModalOpen(true);
  };

  const handleDeleteTopping = async (topping: Topping) => {
    if (window.confirm(`¿Estás seguro de eliminar el topping "${topping.name}"?`)) {
      try {
        await dispatch(deleteTopping(topping.name)).unwrap();
        setSuccessMessage('Topping eliminado exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
        dispatch(fetchToppings({ limit: pagination.limit }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setSuccessMessage('Topping creado exitosamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    dispatch(fetchToppings({ limit: pagination.limit }));
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedTopping(null);
    setSuccessMessage('Topping actualizado exitosamente');
    setTimeout(() => setSuccessMessage(null), 3000);
    dispatch(fetchToppings({ limit: pagination.limit }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const columns: Column<Topping>[] = [
    {
      key: 'name',
      title: 'Nombre',
      render: (_, topping) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {topping.name}
          </div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Precio',
      render: (price) => (
        <span className="text-sm font-medium text-gray-900">
          {formatPrice(price)}
        </span>
      )
    },
    {
      key: 'maximumAmount',
      title: 'Cantidad Máxima',
      render: (maximumAmount) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {maximumAmount}
        </span>
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

  const actions: Action<Topping>[] = [
    {
      label: 'Editar topping',
      icon: Edit,
      onClick: handleEditTopping,
      color: 'primary',
      disabled: () => loading.update
    },
    {
      label: 'Eliminar topping',
      icon: Trash2,
      onClick: handleDeleteTopping,
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Cookie className="w-8 h-8 text-[#ff914d]" />
            <h1 className="text-3xl font-black text-gray-900">GESTIÓN DE TOPPINGS</h1>
          </div>
          <button
            onClick={handleCreateTopping}
            className="flex items-center gap-2 bg-[#ff914d] hover:bg-[#e67b36] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            NUEVO TOPPING
          </button>
        </div>
        
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
      </div>

      <DataTable
        data={filteredToppings}
        columns={columns}
        actions={actions}
        loading={loading.fetch}
        searchable
        searchPlaceholder="Buscar toppings..."
        searchTerm={searchTerm}
        onSearch={handleSearch}
        pagination={{
          total: pagination.total,
          limit: pagination.limit,
          onLimitChange: handleLimitChange
        }}
        emptyMessage="No se encontraron toppings. Crea el primer topping para comenzar."
        emptyIcon={Cookie}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Topping"
      >
        <CreateToppingForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTopping(null);
        }}
        title="Editar Topping"
      >
        {selectedTopping && (
          <EditToppingForm
            topping={selectedTopping}
            onSuccess={handleUpdateSuccess}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTopping(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}