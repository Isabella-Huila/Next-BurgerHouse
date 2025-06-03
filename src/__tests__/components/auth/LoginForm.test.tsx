import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginForm from '@/components/auth/LoginForm'
import authReducer from '@/lib/redux/slices/authSlice'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: { auth: authReducer },
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

const renderWithProvider = (component, initialState = {}) => {
  const store = createMockStore(initialState)
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  }
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders login form correctly', () => {
    renderWithProvider(<LoginForm />)
    expect(screen.getByText('Ingresar')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    renderWithProvider(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))
    await waitFor(() => {
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument()
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })

  test('updates input values and clears field error when typing', async () => {
    renderWithProvider(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))
    await waitFor(() => {
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument()
    })
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect(screen.queryByText('El correo electrónico es requerido')).not.toBeInTheDocument()
    expect(emailInput).toHaveValue('test@example.com')
  })

  test('button disabled and shows loading text when isLoading is true', () => {
    renderWithProvider(<LoginForm />, { isLoading: true })
    const button = screen.getByRole('button', { name: /ingresando.../i })
    expect(button).toBeDisabled()
  })

  test('navigates to "/" when isAuthenticated is true', () => {
    renderWithProvider(<LoginForm />, { isAuthenticated: true })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  test('clears field error when correcting input', async () => {
    renderWithProvider(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'user@example.com' } })

    expect(screen.queryByText('El correo electrónico es requerido')).not.toBeInTheDocument()
  })

  test('updates values ​​when writing to inputs', () => {
    renderWithProvider(<LoginForm />)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    fireEvent.change(emailInput, { target: { value: 'usuario@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'miPassword123' } })

    expect(emailInput).toHaveValue('usuario@test.com')
    expect(passwordInput).toHaveValue('miPassword123')
  })

  test('render form with fields and button', () => {
    renderWithProvider(<LoginForm />)
    expect(screen.getByText('Ingresar')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })
    

})
