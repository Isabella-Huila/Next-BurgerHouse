import { usersApi } from "@/lib/api/userApi";
import { User } from "@/lib/types/auth.types";

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("UsersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("mock-token");
  });

  describe("getAllUsers", () => {
    it("fetches all users successfully", async () => {
      const mockResponse = {
        data: [
          {
            id: "1",
            email: "user1@test.com",
            fullName: "User One",
            isActive: true,
            roles: ["customer"],
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await usersApi.getAllUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles search parameters", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: {} }),
      } as Response);

      await usersApi.getAllUsers({ search: "test", limit: 5 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("search=test"),
        expect.any(Object)
      );
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Server error" }),
      } as Response);

      await expect(usersApi.getAllUsers()).rejects.toThrow("Server error");
    });
  });

  describe("getUserByEmail", () => {
    it("fetches user by email successfully", async () => {
      const mockUser: User = {
        id: "1",
        email: "user@test.com",
        fullName: "Test User",
        isActive: true,
        roles: ["customer"],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const result = await usersApi.getUserByEmail("user@test.com");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/user@test.com"),
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUser", () => {
    it("updates user successfully", async () => {
      const updateData = { fullName: "Updated Name" };
      const updatedUser: User = {
        id: "1",
        email: "user@test.com",
        fullName: "Updated Name",
        isActive: true,
        roles: ["customer"],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      } as Response);

      const result = await usersApi.updateUser("user@test.com", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/user@test.com"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe("deleteUser", () => {
    it("deletes user successfully", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(),
      } as Response);

      await usersApi.deleteUser("user@test.com");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/user@test.com"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("request method", () => {
    it("handles requests without token", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await usersApi.getAllUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it("handles fetch network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(usersApi.getAllUsers()).rejects.toThrow("Network error");
    });

    it("handles invalid JSON responses", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Response);

      await expect(usersApi.getAllUsers()).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });
  });
});
