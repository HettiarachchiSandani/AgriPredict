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

  test("calls addBuyer API on valid submit", async () => {
    buyersAPI.addBuyer.mockResolvedValue({});
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <NewBuyer />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Date of Birth"), { target: { value: "1990-01-01" } });
    fireEvent.change(screen.getByLabelText("NIC"), { target: { value: "123456789V" } });
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
          lastname: "Doe",
          dob: "1990-01-01",
          nic: "123456789V",
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