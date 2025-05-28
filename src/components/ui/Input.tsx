'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  error,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  className,
  ...props
}) => {
  const defaultInputClassName = `
    w-full px-4 py-3 border rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent 
    text-gray-900 placeholder-gray-500
    ${error ? 'border-red-500' : 'border-gray-300'}
  `;

  const defaultLabelClassName = `
    block text-sm font-medium text-gray-900 mb-2
    ${error ? 'text-red-600' : ''}
  `;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      <label
        htmlFor={name}
        className={`${defaultLabelClassName} ${labelClassName}`}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`${defaultInputClassName} ${inputClassName} ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;