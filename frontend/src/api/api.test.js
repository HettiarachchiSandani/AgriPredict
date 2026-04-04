import { describe, it, expect, beforeEach } from "vitest";
import api from "./api";

describe("Axios API", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("adds token from localStorage", async () => {
    localStorage.setItem("access_token", "test-token");

    try {
      await api.get("https://httpbin.org/get");
    } catch (error) {
      const headers = error.config.headers;

      const authHeader =
        headers.Authorization || headers.authorization;

      expect(authHeader).toBe("Bearer test-token");
    }
  });

  it("adds token from sessionStorage if localStorage is empty", async () => {
    sessionStorage.setItem("access_token", "session-token");

    try {
      await api.get("https://httpbin.org/get");
    } catch (error) {
      const headers = error.config.headers;

      const authHeader =
        headers.Authorization || headers.authorization;

      expect(authHeader).toBe("Bearer session-token");
    }
  });

  it("does not add Authorization if no token", async () => {
    try {
      await api.get("https://httpbin.org/get");
    } catch (error) {
      const headers = error.config.headers;

      const authHeader =
        headers.Authorization || headers.authorization;

      expect(authHeader).toBeUndefined();
    }
  });
});