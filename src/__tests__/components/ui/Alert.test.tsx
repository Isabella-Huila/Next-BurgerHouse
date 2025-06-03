import { render, screen, fireEvent } from '@testing-library/react'
import Alert from '@/components/ui/Alert'

describe('Alert Component', () => {
  test('renders alert with message', () => {
    render(<Alert type="info">Test message</Alert>)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  test('calls onDismiss when dismiss button is clicked', () => {
    const mockOnDismiss = jest.fn()
    render(
      <Alert type="error" dismissible onDismiss={mockOnDismiss}>
        Error message
      </Alert>
    )
    
    const dismissButton = screen.getByRole('button')
    fireEvent.click(dismissButton)
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })

  test('applies correct styles for different types', () => {
    const { container, rerender } = render(<Alert type="error">Error</Alert>)
    expect(container.firstChild).toHaveClass('bg-red-100')

    rerender(<Alert type="success">Success</Alert>)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })
})