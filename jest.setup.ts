import "@testing-library/jest-dom";
import React from "react";

// Mock para Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock para Next.js Link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children);
});

// Mock para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'URL', {
    writable: true,
    value: {
      createObjectURL: jest.fn(() => 'mocked-blob-url'),
      revokeObjectURL: jest.fn(),
    },
  });
}


if (typeof global.atob === 'undefined') {
  global.atob = jest.fn((str) => str);
}

// Mock para document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

// Mock para fetch
global.fetch = jest.fn();

// Mock para window.location
Object.defineProperty(window, "location", {
  value: {
    protocol: "https:",
    href: "https://localhost:3000",
  },
  writable: true,
});
