import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginPage from '@/app/login/page'
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

describe('LoginPage', () => {
  test('renders LoginForm component', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    )
    
    expect(screen.getByText('Ingresar')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
  })
})