'use client';

import NavItem from './NavItem';
import { ShoppingCart, User, Users, Cookie, Package, PieChart, Home, Menu } from 'lucide-react';
import { useAppSelector } from '../../lib/hooks/redux';
import { useUserRoles } from '../../lib/hooks/useUserRoles';
import Link from 'next/link';
import { CartItem } from '@/lib/redux/slices/cartSlice';

export default function Sidebar() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const { hasAnyRole } = useUserRoles();
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Mapeo de elementos de navegación por rol
  const navItems = [
    {
      
      href: '/menu',
      icon: <Menu className="w-5 h-5" />,
      label: 'MENU',
      roles: ['customer', 'admin', 'delivery'],
      component: 'Link'
    },
    {
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      label: 'DASHBOARD',
      roles: ['customer', 'admin', 'delivery'],
      component: 'Link'
    },
    {
      href: '/users',
      icon: <Users className="w-5 h-5" />,
      label: 'USUARIOS',
      roles: ['admin'],
      component: 'Link'
    },
    {
      href: '/toppings',
      icon: <Cookie className="w-5 h-5" />,
      label: 'TOPPINGS',
      roles: ['admin'],
      component: 'Link'
    },
    {
      href: '/orders',
      icon: <Package className="w-5 h-5" />,
      label: 'PEDIDOS',
      roles: ['admin', 'delivery', "customer"],
      component: 'Link'
    },
    {
      href: '/reports',
      icon: <PieChart className="w-5 h-5" />,
      label: 'REPORTES',
      roles: ['admin'],
      component: 'Link'
    },
    {
      href: '/profile',
      icon: <User className="w-5 h-5" />,
      label: 'PERFIL',
      roles: ['customer', 'admin', 'delivery'],
      component: 'Link',
      showAsIcon: true
    }
  ];

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
          {navItems.map((item) => {
            if (!hasAnyRole(item.roles)) return null;
            
            if (item.component === 'NavItem') {
              return (
                <NavItem key={item.href} href={item.href}>
                  {item.label}
                </NavItem>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 text-gray-700 hover:text-[#ff914d] transition-colors ${
                  item.showAsIcon ? '' : 'min-w-[80px]'
                }`}
                title={item.label}
              >
                {item.icon}
                {!item.showAsIcon && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}

          {!isAuthenticated && <NavItem href="/login">LOGIN</NavItem>}

          {hasAnyRole(['customer', 'admin']) && (
            <Link href="/cart" className="relative text-gray-700 hover:text-[#ff914d] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ffe5d0]" />
    </header>
  );
}