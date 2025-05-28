import NavItem from './NavItem';
import { ShoppingCart } from 'lucide-react';

export default function Sidebar() {
  return (
    <header className="bg-white relative">
      <div className="flex justify-between items-center h-16 px-2 max-w-screen-2xl mx-auto">
        {/* Logo a la izquierda */}
        <div className="flex items-center pl-2">
          <span className="text-xl font-bold text-gray-900">
            <span className="text-[#ff914d]">Burger</span> House
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 pr-2">
          <NavItem href="#">MENU</NavItem>
          <NavItem href="/login">LOGIN</NavItem>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-[#ff914d] hover:bg-[#e67b36]">
            PEDIR
          </button>
          <a href="/cart" className="text-gray-700 hover:text-[#ff914d] transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </a>
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ffe5d0]" />
    </header>
  );
}

