import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useAdmin } from "@/lib/hooks/useAdmin";
import authSlice from "@/lib/redux/slices/authSlice";
import React from "react";

const createMockStore = (user = {}) =>
  configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: {
          id: "1",
          email: "test@example.com",
          fullName: "Test User",
          isActive: true,
          roles: ["customer"],
          ...user,
        },
        token: "mock-token",
        isLoading: false,
        error: null,
        isAuthenticated: true,
      },
    },
  });

describe("useAdmin", () => {
  it("should return false for non-admin user", () => {
    const store = createMockStore({ roles: ["customer"] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const { result } = renderHook(() => useAdmin(), { wrapper });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should return true for admin user", () => {
    const store = createMockStore({ roles: ["admin", "customer"] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const { result } = renderHook(() => useAdmin(), { wrapper });

    expect(result.current.isAdmin).toBe(true);
  });

  it("should return false when roles array is empty", () => {
    const store = createMockStore({ roles: [] });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const { result } = renderHook(() => useAdmin(), { wrapper });

    expect(result.current.isAdmin).toBe(false);
  });

  it("should return false when user is null", () => {
    const store = configureStore({
      reducer: { auth: authSlice },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const { result } = renderHook(() => useAdmin(), { wrapper });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
