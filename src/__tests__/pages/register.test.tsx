import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterPage from '@/app/register/page'
import authReducer from '@/lib/redux/slices/authSlice'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const createMockStore = () => {
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
      },
    },
  })
}

describe('RegisterPage', () => {
  test('renders RegisterForm component', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <RegisterPage />
      </Provider>
    )
    
    expect(screen.getByText('Registro')).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })
})