import React from 'react';
import { Search } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface Action<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  color?: 'primary' | 'danger' | 'success' | 'warning';
  disabled?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  pagination?: {
    limit: number;
    total: number;
    onLimitChange?: (limit: number) => void;
    limitOptions?: number[];
  };
  className?: string;
  rowClassName?: (item: T) => string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  searchable = false,
  searchPlaceholder = "Buscar...",
  onSearch,
  searchTerm = "",
  emptyMessage = "No hay datos disponibles",
  emptyIcon: EmptyIcon,
  pagination,
  className = "",
  rowClassName
}: DataTableProps<T>) {
  
  const getNestedValue = (obj: T, key: string): any => {
    return key.split('.').reduce((value, k) => value?.[k], obj);
  };

  const getActionColor = (color: string = 'primary') => {
    const colors = {
      primary: 'text-[#ff914d] hover:text-[#e67b36]',
      danger: 'text-red-600 hover:text-red-800',
      success: 'text-green-600 hover:text-green-800',
      warning: 'text-yellow-600 hover:text-yellow-800'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
            />
          </div>
        )}
        
        {pagination && pagination.onLimitChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-sm text-gray-600 whitespace-nowrap">
              Mostrar:
            </label>
            <select
              id="limit-select"
              value={pagination.limit}
              onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-sm"
            >
              {(pagination.limitOptions || [10, 25, 50, 100]).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 whitespace-nowrap">elementos</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#ff914d]">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-6 py-3 text-xs font-medium text-white uppercase tracking-wider ${
                        column.align === 'center' ? 'text-center' :
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={{ width: column.width }}
                    >
                      {column.title}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-gray-50 ${rowClassName ? rowClassName(item) : ''}`}
                  >
                    {columns.map((column, colIndex) => {
                      const value = typeof column.key === 'string' ? 
                        getNestedValue(item, column.key) : 
                        item[column.key as keyof T];
                      
                      return (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap ${
                            column.align === 'center' ? 'text-center' :
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.render ? column.render(value, item) : value}
                        </td>
                      );
                    })}
                    
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {actions.map((action, actionIndex) => {
                            const ActionIcon = action.icon;
                            const isDisabled = action.disabled?.(item) || false;
                            
                            return (
                              <button
                                key={actionIndex}
                                onClick={() => !isDisabled && action.onClick(item)}
                                className={`transition-colors ${
                                  isDisabled 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : getActionColor(action.color)
                                }`}
                                title={action.label}
                                disabled={isDisabled}
                              >
                                <ActionIcon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && !loading && (
            <div className="text-center py-12">
              {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;