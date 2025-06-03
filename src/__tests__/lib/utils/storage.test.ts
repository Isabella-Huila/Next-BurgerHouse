import { storage } from "@/lib/utils/storage";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "location", {
  value: {
    protocol: "https:",
  },
  writable: true,
});

global.atob = jest.fn();

global.btoa = jest.fn((str) => Buffer.from(str).toString("base64"));

describe("Storage Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("token management", () => {
    test("setToken stores token in localStorage", () => {
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

    test("getToken returns null when no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.getToken();
      expect(result).toBeNull();
    });

    test("getToken returns null in server environment", () => {
      const originalWindow = global.window;
      delete global.window;

      const result = storage.getToken();
      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });

  describe("user management", () => {
    test("setUser stores user in localStorage", () => {
      const user = {
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

    test("setUser does nothing in server environment", () => {
      const originalWindow = global.window;
      delete global.window;

      const user = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        isActive: true,
        roles: ["user"],
      };

      storage.setUser(user);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    test("getUser retrieves and parses user from localStorage", () => {
      const user = {
        id: "1",
        email: "test@example.com",
        fullName: "Test User",
        isActive: true,
        roles: ["user"],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));

      const result = storage.getUser();
      expect(result).toEqual(user);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("user");
    });

    test("getUser returns null when no user exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.getUser();
      expect(result).toBeNull();
    });

    test("getUser handles invalid JSON gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      expect(() => storage.getUser()).toThrow();
    });

    test("getUser returns null in server environment", () => {
      const originalWindow = global.window;
      delete global.window;

      const result = storage.getUser();
      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });

  describe("clearStorage", () => {
    test("clearStorage removes token and user from localStorage", () => {
      storage.clearStorage();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });

    test("clearStorage does nothing in server environment", () => {
      const originalWindow = global.window;
      delete global.window;

      storage.clearStorage();

      expect(localStorageMock.removeItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe("isTokenValid", () => {
    test("returns false when no token exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storage.isTokenValid();
      expect(result).toBe(false);
    });

    test("returns true for valid token", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hora en el futuro
      const mockPayload = { exp: futureTimestamp };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        "base64"
      );
      const token = `header.${encodedPayload}.signature`;

      localStorageMock.getItem.mockReturnValue(token);
      global.atob.mockReturnValue(JSON.stringify(mockPayload));

      const result = storage.isTokenValid();
      expect(result).toBe(true);
      expect(global.atob).toHaveBeenCalledWith(encodedPayload);
    });

    test("returns false for expired token and clears storage", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hora en el pasado
      const mockPayload = { exp: pastTimestamp };
      const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString(
        "base64"
      );
      const token = `header.${encodedPayload}.signature`;

      localStorageMock.getItem.mockReturnValue(token);
      global.atob.mockReturnValue(JSON.stringify(mockPayload));

      const result = storage.isTokenValid();
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });

    test("returns false for malformed token and clears storage", () => {
      const invalidToken = "invalid.token";

      localStorageMock.getItem.mockReturnValue(invalidToken);
      global.atob.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = storage.isTokenValid();
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });

    test("returns false when JSON.parse fails and clears storage", () => {
      const token = "header.invalid-base64.signature";

      localStorageMock.getItem.mockReturnValue(token);
      global.atob.mockReturnValue("invalid-json");

      const result = storage.isTokenValid();
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });

    test("handles token without proper structure", () => {
      const invalidToken = "not-a-jwt-token";

      localStorageMock.getItem.mockReturnValue(invalidToken);

      const result = storage.isTokenValid();
      expect(result).toBe(false);
    });

    test("handles token with less than 3 parts", () => {
      const invalidToken = "header.payload"; // Solo 2 partes en lugar de 3

      localStorageMock.getItem.mockReturnValue(invalidToken);

      const result = storage.isTokenValid();
      expect(result).toBe(false);
    });
  });

  describe("edge cases and error handling", () => {
    test("setToken handles window undefined gracefully", () => {
      const originalWindow = global.window;
      delete global.window;

      expect(() => storage.setToken("test-token")).not.toThrow();

      global.window = originalWindow;
    });

    test("all methods handle server-side rendering", () => {
      const originalWindow = global.window;
      delete global.window;

      expect(storage.getToken()).toBeNull();
      expect(storage.getUser()).toBeNull();
      expect(() => storage.setToken("token")).not.toThrow();
      expect(() =>
        storage.setUser({
          id: "1",
          email: "test",
          fullName: "Test",
          isActive: true,
          roles: [],
        })
      ).not.toThrow();
      expect(() => storage.clearStorage()).not.toThrow();

      global.window = originalWindow;
    });

    test("handles localStorage.getItem exceptions", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      expect(() => storage.getToken()).toThrow();
      expect(() => storage.getUser()).toThrow();
    });

    test("handles localStorage.setItem exceptions", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("localStorage quota exceeded");
      });

      expect(() => storage.setToken("token")).toThrow();
      expect(() =>
        storage.setUser({
          id: "1",
          email: "test",
          fullName: "Test",
          isActive: true,
          roles: [],
        })
      ).toThrow();
    });

    test("handles localStorage.removeItem exceptions", () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      expect(() => storage.clearStorage()).toThrow();
    });

  });
});
