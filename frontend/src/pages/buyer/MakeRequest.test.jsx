import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import MakeRequest from "./MakeRequest";
import { MemoryRouter } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { getBreeds } from "@/api/batchAPI";
import { addOrder } from "@/api/orderAPI";

vi.mock("@/hooks/useAuth");
vi.mock("@/api/batchAPI");
vi.mock("@/api/orderAPI");

describe("MakeRequest Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: { userid: 1 },
    });

    getBreeds.mockResolvedValue([
      { breedid: "1", breedname: "Breed A", eggtype: "Type A" },
    ]);

    addOrder.mockResolvedValue({});
  });

  test("renders form correctly", async () => {
    render(
      <MemoryRouter>
        <MakeRequest />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading make request/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/new egg request/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/breed \/ strain/i)).toBeInTheDocument();
    expect(screen.getByText(/order date/i)).toBeInTheDocument();
    expect(screen.getByText(/quantity/i)).toBeInTheDocument();
  });

  test("updates form inputs correctly", async () => {
    render(
      <MemoryRouter>
        <MakeRequest />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/new egg request/i)).toBeInTheDocument()
    );

    const quantityInput = screen.getByRole("spinbutton");

    fireEvent.change(quantityInput, { target: { value: "10" } });

    expect(quantityInput.value).toBe("10");
  });

  test("shows validation errors", async () => {
    render(
      <MemoryRouter>
        <MakeRequest />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/new egg request/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/submit/i));

    expect(screen.getByText(/breed is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ordered date is required/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enter a valid quantity/i)
    ).toBeInTheDocument();
  });

  test("submits form successfully", async () => {
    render(
      <MemoryRouter>
        <MakeRequest />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/new egg request/i)).toBeInTheDocument()
    );

    const breedSelect = screen.getByRole("combobox");
    fireEvent.change(breedSelect, {
      target: { value: "1" },
    });

    const dateInput = screen.getAllByDisplayValue("").find(
      (el) => el.type === "date"
    );

    fireEvent.change(dateInput, {
      target: { value: "2099-01-01" },
    });

    const quantityInput = screen.getByRole("spinbutton");

    fireEvent.change(quantityInput, {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalled();
    });

    expect(addOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerid: 1,
        breedid: "1",
        quantity: 5,
        note: "",
        completed: false,
      })
    );
  });

  test("clears form on cancel", async () => {
    render(
      <MemoryRouter>
        <MakeRequest />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/new egg request/i)).toBeInTheDocument()
    );

    const quantityInput = screen.getByRole("spinbutton");

    fireEvent.change(quantityInput, { target: { value: "5" } });

    fireEvent.click(screen.getByText(/cancel/i));

    expect(quantityInput.value).toBe("");
  });
});