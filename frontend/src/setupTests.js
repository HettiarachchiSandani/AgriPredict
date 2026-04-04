import "@testing-library/jest-dom";

import { vi } from "vitest";

vi.stubGlobal("alert", vi.fn());

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  },
});

Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  },
});