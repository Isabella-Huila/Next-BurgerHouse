import React from 'react';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function NavItem({ href, children, className = '' }: NavItemProps) {
  return (
    <a
      href={href}
      className={`text-sm font-medium text-gray-700 hover:text-[#ff914d] transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
