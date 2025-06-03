import { authApi } from "@/lib/api/authApi";
import { storage } from "@/lib/utils/storage";
import { LoginDto, RegisterDto } from "@/lib/types/auth.types";

jest.mock("@/lib/utils/storage", () => ({
  storage: {
    getToken: jest.fn(),
    setToken: jest.fn(),
    setUser: jest.fn(),
    clearStorage: jest.fn(),
  },
}));

global.fetch = jest.fn();

describe("AuthApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe("login", () => {
    const loginData: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    test("makes correct API call for login", async () => {
      const mockResponse = {
        user: { id: "1", email: "test@example.com", fullName: "Test User" },
        token: "mock-token",
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authApi.login(loginData);

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      expect(result).toEqual(mockResponse);
    });

    test("includes authorization header when token exists", async () => {
      (storage.getToken as jest.Mock).mockReturnValue("existing-token");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {}, token: "token" }),
      });

      await authApi.login(loginData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer existing-token",
          }),
        })
      );
    });

    test("throws error when API call fails", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials" }),
      });

      await expect(authApi.login(loginData)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    test("throws generic error when response json fails", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("JSON parse error");
        },
      });

      await expect(authApi.login(loginData)).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    test("handles network errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      await expect(authApi.login(loginData)).rejects.toThrow("Network error");
    });
  });

  describe("register", () => {
    const registerData: RegisterDto = {
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
    };

    test("includes authorization header when token exists during register", async () => {
      (storage.getToken as jest.Mock).mockReturnValue("existing-token");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {}, token: "token" }),
      });

      await authApi.register(registerData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer existing-token",
          }),
        })
      );
    });

    test("throws error when register API call fails", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Email already exists" }),
      });

      await expect(authApi.register(registerData)).rejects.toThrow(
        "Email already exists"
      );
    });
  });

  describe("getProfile", () => {

    test("includes authorization header in getProfile when token exists", async () => {
      (storage.getToken as jest.Mock).mockReturnValue("user-token");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email: "test@test.com" }),
      });

      await authApi.getProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer user-token",
          }),
        })
      );
    });

    test("throws error when getProfile fails", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(authApi.getProfile()).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateProfile", () => {
    const email = "test@example.com";
    const updateData = {
      fullName: "Updated Name",
      isActive: true,
    };


    test("includes authorization header in updateProfile when token exists", async () => {
      (storage.getToken as jest.Mock).mockReturnValue("auth-token");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", email }),
      });

      await authApi.updateProfile(email, updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer auth-token",
          }),
        })
      );
    });

    test("throws error when updateProfile fails", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Forbidden" }),
      });

      await expect(authApi.updateProfile(email, updateData)).rejects.toThrow(
        "Forbidden"
      );
    });

    test("handles updateProfile with empty update data", async () => {
      const mockUser = { id: "1", email };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const result = await authApi.updateProfile(email, {});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({}),
        })
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe("request method edge cases", () => {
    test("handles fetch network error", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));

      await expect(
        authApi.login({ email: "test@test.com", password: "pass" })
      ).rejects.toThrow("Network failure");
    });

    test("merges custom headers with default headers", async () => {
      (storage.getToken as jest.Mock).mockReturnValue("token");
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await authApi.getProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer token",
          }),
        })
      );
    });

    test("handles response without error message in catch block", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Parse error");
        },
      });

      await expect(authApi.getProfile()).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });
  });
});
