import { authApi } from '@/lib/api/authApi'
import { storage } from '@/lib/utils/storage'
import { LoginDto, RegisterDto } from '@/lib/types/auth.types'

jest.mock('@/lib/utils/storage', () => ({
  storage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    setUser: jest.fn(),
    clearStorage: jest.fn(),
  }
}))

global.fetch = jest.fn()

describe('AuthApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('login', () => {
    const loginData: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    }

    test('makes correct API call for login', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
        token: 'mock-token'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await authApi.login(loginData)

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      })
      
      expect(result).toEqual(mockResponse)
    })

    test('includes authorization header when token exists', async () => {
      ;(storage.getToken as jest.Mock).mockReturnValue('existing-token')
      
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {}, token: 'token' })
      })

      await authApi.login(loginData)

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer existing-token'
          })
        })
      )
    })

    test('throws error when API call fails', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' })
      })

      await expect(authApi.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

})