import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterForm from '@/components/auth/RegisterForm'
import authReducer from '@/lib/redux/slices/authSlice'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        ...initialState,
      },
    },
  })
}

const renderWithProvider = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState)
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  }
}

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders register form correctly', () => {
    renderWithProvider(<RegisterForm />)
    
    expect(screen.getByText('Registro')).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    renderWithProvider(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('El nombre completo es requerido')).toBeInTheDocument()
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })
  

  test('shows password validation error for short password', async () => {
    renderWithProvider(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/contraseña/i)
    fireEvent.change(passwordInput, { target: { value: '123' } })
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
    })
  })

  test('shows validation error for password missing requirements', async () => {
    renderWithProvider(<RegisterForm />)
  
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'abcdef' }, // sin mayúsculas ni números
    })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
  
    await waitFor(() => {
      expect(screen.getByText('La contraseña debe contener al menos una mayúscula, una minúscula y un número')).toBeInTheDocument()
    })
  })

  test('redirects to home if already authenticated', () => {
    renderWithProvider(<RegisterForm />, { isAuthenticated: true })
    expect(mockPush).toHaveBeenCalledWith('/')
  })


  test('updates input values when typing', () => {
    renderWithProvider(<RegisterForm />)
    
    const nameInput = screen.getByLabelText(/nombre completo/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    
    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } })
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    
    expect(nameInput).toHaveValue('Juan Pérez')
    expect(emailInput).toHaveValue('juan@example.com')
    expect(passwordInput).toHaveValue('Password123')
  })

  test('clears field error when user starts typing', async () => {
    renderWithProvider(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('El nombre completo es requerido')).toBeInTheDocument()
    })
    
    const nameInput = screen.getByLabelText(/nombre completo/i)
    fireEvent.change(nameInput, { target: { value: 'Juan' } })
    
    expect(screen.queryByText('El nombre completo es requerido')).not.toBeInTheDocument()
  })

  test('submit button is disabled when loading', () => {
    renderWithProvider(<RegisterForm />, { isLoading: true })
  
    const button = screen.getByRole('button', { name: /registrando/i })
    expect(button).toBeDisabled()
  })

  
})