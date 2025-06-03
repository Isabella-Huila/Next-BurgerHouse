import { NextRequest } from "next/server";
import { middleware, isTokenValid } from "../middleware";

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: "next" })),
    redirect: jest.fn((url) => ({ type: "redirect", url })),
  },
}));

describe("middleware", () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    mockRequest = {
      nextUrl: {
        pathname: "/",
      } as any,
    };
    jest.clearAllMocks();
  });

  describe("isTokenValid", () => {
    it("should return true for valid token", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureExp };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(true);
    });

    it("should return false for expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // -1 hour
      const payload = { exp: pastExp };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(isTokenValid(token)).toBe(false);
    });

    it("should return false for invalid token format", () => {
      expect(isTokenValid("invalid-token")).toBe(false);
    });

    it("should return false for malformed JWT", () => {
      expect(isTokenValid("header.invalid-payload.signature")).toBe(false);
    });

    it("should return false for empty token", () => {
      expect(isTokenValid("")).toBe(false);
    });
  });

  describe("middleware function", () => {
    it("should allow access to public paths", () => {
      const publicPaths = ["/", "/login", "/register", "/forgot-password"];

      publicPaths.forEach((path) => {
        mockRequest.nextUrl!.pathname = path;
        const response = middleware(mockRequest as NextRequest);
        expect(response).toEqual({ type: "next" });
      });
    });

    it("should allow access to protected paths (middleware passes through)", () => {
      mockRequest.nextUrl!.pathname = "/dashboard";
      const response = middleware(mockRequest as NextRequest);
      expect(response).toEqual({ type: "next" });
    });

    it("should allow access to admin paths", () => {
      mockRequest.nextUrl!.pathname = "/users";
      const response = middleware(mockRequest as NextRequest);
      expect(response).toEqual({ type: "next" });
    });

    it("should allow access to profile path", () => {
      mockRequest.nextUrl!.pathname = "/profile";
      const response = middleware(mockRequest as NextRequest);
      expect(response).toEqual({ type: "next" });
    });
  });
});
