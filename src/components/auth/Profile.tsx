'use client';

import { useAppDispatch, useAppSelector } from '../../lib/hooks/redux';
import { logout } from '../../lib/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { ChevronRight, User, LogOut } from 'lucide-react';

export default function Profile() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      icon: <User className="w-5 h-5" />,
      title: 'Pedidos',
      href: '/orders'
    },
  ];

  return (
    
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-[#ff914d] font-medium mb-2">Perfil</p>
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              {user?.email || 'Usuario'}
            </h1>
            <button className="mt-4 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:border-[#ff914d] hover:text-[#ff914d] transition-colors">
              EDITAR
            </button>
          </div>
        </div>

        <div className="py-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-600">{item.icon}</span>
                <span className="text-gray-900 font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>
          ))}
        </div>

        <div className="px-6 py-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 font-medium hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            CERRAR SESIÓN
          </button>
        </div>
      </div>

  );
}