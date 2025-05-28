'use client';

import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { logout } from '../../lib/redux/slices/authSlice';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ProtectedRoute>
      
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-[#ff914d] hover:bg-[#e67b36] text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

    </ProtectedRoute>
  );
}
