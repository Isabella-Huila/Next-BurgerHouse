import { render, screen, fireEvent } from '@testing-library/react'
import Input from '@/components/ui/Input'

describe('Input Component', () => {
  test('renders input with label', () => {
    render(
      <Input
        label="Test Label"
        name="test"
        placeholder="Test placeholder"
      />
    )
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  test('displays error message when error prop is provided', () => {
    render(
      <Input
        label="Test Label"
        name="test"
        error="This field is required"
      />
    )
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  test('applies error styles when error is present', () => {
    render(
      <Input
        label="Test Label"
        name="test"
        error="Error message"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass('border-red-500')
  })

  test('calls onChange when user types', () => {
    const mockOnChange = jest.fn()
    
    render(
      <Input
        label="Test Label"
        name="test"
        onChange={mockOnChange}
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(mockOnChange).toHaveBeenCalled()
  })

  test('forwards other props to input element', () => {
    render(
      <Input
        label="Test Label"
        name="test"
        type="email"
        disabled
        data-testid="custom-input"
      />
    )
    
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeDisabled()
  })

  test('applies custom className', () => {
    render(
      <Input
        label="Test Label"
        name="test"
        className="custom-class"
      />
    )
    
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveClass('custom-class')
  })
})