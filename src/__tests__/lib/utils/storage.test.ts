import { storage } from "@/lib/utils/storage";
import { User } from "@/lib/types/auth.types";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Storage Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("token management", () => {
    test("setToken stores token in localStorage and cookie", () => {
      const token = "test-token";
      storage.setToken(token);

      expect(localStorageMock.setItem).toHaveBeenCalledWith("token", token);
    });

    test("getToken retrieves token from localStorage", () => {
      const token = "test-token";
      localStorageMock.getItem.mockReturnValue(token);

      const result = storage.getToken();
      expect(result).toBe(token);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("token");
    });
  });

  describe("user management", () => {
    test("setUser stores user in localStorage", () => {
      const user: User = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        isActive: true,
        roles: ["user"],
      };

      storage.setUser(user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(user)
      );
    });

    test("getUser retrieves and parses user from localStorage", () => {
      const user: User = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        isActive: true,
        roles: ["user"],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));

      const result = storage.getUser();
      expect(result).toEqual(user);
    });
  });
});
