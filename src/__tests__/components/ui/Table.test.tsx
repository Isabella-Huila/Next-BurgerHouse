import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable, { Column, Action } from '@/components/ui/Table';
import { Edit, Trash2, TestTube } from 'lucide-react';
import '@testing-library/jest-dom';

interface TestData {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

const mockData: TestData[] = [
  { id: '1', name: 'Item 1', price: 100, active: true },
  { id: '2', name: 'Item 2', price: 200, active: false },
];

const mockColumns: Column<TestData>[] = [
  { key: 'name', title: 'Name' },
  { 
    key: 'price', 
    title: 'Price',
    render: (value) => `$${value}`
  },
  {
    key: 'active',
    title: 'Status',
    render: (value) => value ? 'Active' : 'Inactive'
  }
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        emptyMessage="No data found"
        emptyIcon={TestTube}
      />
    );

    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders search input when searchable', () => {
    const mockOnSearch = jest.fn();
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        searchable={true}
        searchPlaceholder="Search items..."
        onSearch={mockOnSearch}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search items...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });

  it('renders actions column', () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const actions: Action<TestData>[] = [
      {
        label: 'Edit',
        icon: Edit,
        onClick: mockEdit,
        color: 'primary'
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: mockDelete,
        color: 'danger'
      }
    ];

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        actions={actions}
      />
    );

    expect(screen.getByText('Acciones')).toBeInTheDocument();
    
    const editButtons = screen.getAllByTitle('Edit');
    const deleteButtons = screen.getAllByTitle('Delete');
    
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(editButtons[0]);
    expect(mockEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it('disables actions when specified', () => {
    const mockAction = jest.fn();

    const actions: Action<TestData>[] = [
      {
        label: 'Edit',
        icon: Edit,
        onClick: mockAction,
        disabled: (item) => !item.active
      }
    ];

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        actions={actions}
      />
    );

    const actionButtons = screen.getAllByTitle('Edit');
    
    expect(actionButtons[0]).not.toHaveClass('cursor-not-allowed');
    
    expect(actionButtons[1]).toHaveClass('cursor-not-allowed');
  });

  it('renders pagination controls', () => {
    const mockLimitChange = jest.fn();

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={{
          limit: 10,
          total: 100,
          onLimitChange: mockLimitChange,
          limitOptions: [5, 10, 25]
        }}
      />
    );

    expect(screen.getByText('Mostrar:')).toBeInTheDocument();
    expect(screen.getByText('elementos')).toBeInTheDocument();

    const select = screen.getByDisplayValue('10');
    fireEvent.change(select, { target: { value: '25' } });
    
    expect(mockLimitChange).toHaveBeenCalledWith(25);
  });

  it('handles nested object properties', () => {
    const nestedData = [
      { id: '1', user: { profile: { name: 'John Doe' } }, price: 100 }
    ];

    const nestedColumns: Column<any>[] = [
      { key: 'user.profile.name', title: 'User Name' },
      { key: 'price', title: 'Price' }
    ];

    render(
      <DataTable
        data={nestedData}
        columns={nestedColumns}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('applies custom row className', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        rowClassName={(item) => item.active ? 'active-row' : 'inactive-row'}
      />
    );

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveClass('active-row');
    expect(rows[2]).toHaveClass('inactive-row');
  });
});