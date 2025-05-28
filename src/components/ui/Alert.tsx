'use client';

import { useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const baseStyles = 'w-full p-4 rounded-lg border text-sm flex items-start gap-3 relative';

const styles = {
  error: 'bg-red-100 border-red-400 text-red-700',
  success: 'bg-green-100 border-green-400 text-green-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
};

export default function Alert({
  type = 'info',
  children,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={clsx(baseStyles, styles[type])}>
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-inherit hover:opacity-70"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
