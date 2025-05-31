'use client';

import NavItem from './NavItem';
import { ShoppingCart, User, Users, Cookie } from 'lucide-react';
import { useAppSelector } from '../../lib/hooks/redux';
import { useAdmin } from '../../lib/hooks/useAdmin';

export default function Sidebar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isAdmin } = useAdmin();

  return (
    <header className="bg-white relative">
      <div className="flex justify-between items-center h-16 px-2 max-w-screen-2xl mx-auto">
        <div className="flex items-center pl-2">
          <a href="/">
            <span className="text-xl font-bold text-gray-900">
              Burger<span className="text-[#ff914d]"> House </span>
            </span>
          </a>
        </div>

        <nav className="hidden md:flex items-center space-x-8 pr-2">
          <NavItem href="/menu">MENU</NavItem>          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <a 
                    href="/users" 
                    className="flex items-center gap-1 text-gray-700 hover:text-[#ff914d] transition-colors"
                    title="Gestión de usuarios"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">USUARIOS</span>
                  </a>
                  <a 
                    href="/toppings" 
                    className="flex items-center gap-1 text-gray-700 hover:text-[#ff914d] transition-colors"
                    title="Gestión de toppings"
                  >
                    <Cookie className="w-5 h-5" />
                    <span className="text-sm font-medium">TOPPINGS</span>
                  </a>
                </>
              )}
              <a href="/profile" className="text-gray-700 hover:text-[#ff914d] transition-colors">
                <User className="w-5 h-5" />
              </a>
            </>
          ) : (
            <NavItem href="/login">LOGIN</NavItem>          
          )}
          
          <a href="/cart" className="text-gray-700 hover:text-[#ff914d] transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </a>
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ffe5d0]" />
    </header>
  );
}