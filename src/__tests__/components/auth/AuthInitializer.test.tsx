import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AuthInitializer from '@/components/auth/AuthInitializer'
import authReducer, { initializeAuth } from '@/lib/redux/slices/authSlice'

const mockDispatch = jest.fn()
jest.mock('@/lib/hooks/redux', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({
    auth: { isLoading: false }
  })
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

describe('AuthInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders children correctly', () => {
    const store = createMockStore()
    
    render(
      <Provider store={store}>
        <AuthInitializer>
          <div data-testid="test-child">Test Child</div>
        </AuthInitializer>
      </Provider>
    )
    
    expect(document.querySelector('[data-testid="test-child"]')).toBeInTheDocument()
  })

  test('dispatches initializeAuth on mount', () => {
    const store = createMockStore()
  
    render(
      <Provider store={store}>
        <AuthInitializer>
          <div>Test</div>
        </AuthInitializer>
      </Provider>
    )
  
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  
    const dispatchedFn = mockDispatch.mock.calls[0][0]
    expect(typeof dispatchedFn).toBe('function')
  })
  
  

  test('does not dispatch initializeAuth multiple times', () => {
    const store = createMockStore()
    
    const { rerender } = render(
      <Provider store={store}>
        <AuthInitializer>
          <div>Test</div>
        </AuthInitializer>
      </Provider>
    )
    
    rerender(
      <Provider store={store}>
        <AuthInitializer>
          <div>Test Updated</div>
        </AuthInitializer>
      </Provider>
    )
    
    expect(mockDispatch).toHaveBeenCalledTimes(1)
  })
})