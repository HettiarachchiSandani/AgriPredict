import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import Login from "./Login";
import useAuth from "../../hooks/useAuth";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../hooks/useAuth");
vi.mock("../../assets/logo.png", () => ({
  default: "logo.png",
}));

describe("Login Component", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("button", { name: /log in/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
  });

  test("updates input fields on change", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(emailInput, {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "123456" },
    });

    expect(emailInput.value).toBe("test@gmail.com");
    expect(passwordInput.value).toBe("123456");
  });

  test("toggles remember me checkbox", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const checkbox = screen.getByLabelText(/remember me/i);

    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);

    expect(checkbox.checked).toBe(true);
  });

  test("calls login function on submit", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "123456" },
    });

    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    expect(mockLogin).toHaveBeenCalledWith(
      "test@gmail.com",
      "123456",
      false
    );
  });

  test("calls login with rememberMe checked", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@gmail.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByLabelText(/remember me/i));

    const loginButton = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginButton);

    expect(mockLogin).toHaveBeenCalledWith(
      "test@gmail.com",
      "123456",
      true
    );
  });
});