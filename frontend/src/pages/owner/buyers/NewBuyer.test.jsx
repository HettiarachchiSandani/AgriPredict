import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NewBuyer from "./NewBuyer";
import * as buyersAPI from "@/api/buyersAPI";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/buyersAPI", () => ({
  addBuyer: vi.fn(),
}));

describe("NewBuyer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders form fields correctly", () => {
    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Gender")).toBeInTheDocument();
    // Exact string avoids ambiguity with toggle button's aria-label
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
  });

  test("shows validation errors if required fields are empty", async () => {
    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/company is required/i)).toBeInTheDocument();
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test("toggles password visibility", () => {
    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("calls addBuyer API on valid submit", async () => {
    buyersAPI.addBuyer.mockResolvedValue({});
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "0712345678" } });
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "TestCo" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "Test Address" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(buyersAPI.addBuyer).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: "John",
          email: "john@example.com",
          phonenumber: "0712345678",
          company: "TestCo",
          address: "Test Address",
          password: "password123",
          roleid: "B001",
          is_active: true,
        })
      );
    });

    expect(window.alert).toHaveBeenCalledWith("Buyer registered successfully!");
  });

  test("cancel button navigates back", () => {
    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/cancel/i));
    expect(mockNavigate).toHaveBeenCalledWith("/owner/buyers");
  });
});