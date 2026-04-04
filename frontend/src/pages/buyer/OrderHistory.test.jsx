import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import BuyerOrders from "./OrderHistory";
import { getOrders, updateOrder } from "@/api/orderAPI";

vi.mock("@/api/orderAPI");

describe("BuyerOrders Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);

    getOrders.mockResolvedValue([
      {
        orderid: "1",
        ordereddate: "2025-01-01",
        breed_details: "Breed A",
        quantity: 10,
        requesteddate: "2025-01-05",
        completed: false,
        accepted: null,
      },
    ]);

    updateOrder.mockResolvedValue({});
  });

  test("renders loading initially", () => {
    render(<BuyerOrders />);
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  test("renders orders table", async () => {
    render(<BuyerOrders />);

    await waitFor(() => {
      expect(screen.getByText(/order history/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("cell", { name: "1" })).toBeInTheDocument();
    expect(screen.getByText("Breed A")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("filters orders by status", async () => {
    render(<BuyerOrders />);

    await waitFor(() =>
      expect(screen.getByText(/order history/i)).toBeInTheDocument()
    );

    const statusFilter = screen.getAllByRole("combobox")[1];

    fireEvent.change(statusFilter, {
      target: { value: "Pending" },
    });

    expect(screen.getByRole("cell", { name: "1" })).toBeInTheDocument();
  });

  test("calls updateOrder when cancel button clicked", async () => {
    render(<BuyerOrders />);

    await waitFor(() =>
      expect(screen.getByText(/order history/i)).toBeInTheDocument()
    );

    const cancelButton = screen.getByRole("button", {
      name: /cancel order/i,
    });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(updateOrder).toHaveBeenCalled();
    });
  });

  test("does not cancel if confirm is false", async () => {
    render(<BuyerOrders />);

    await waitFor(() =>
      expect(screen.getByText(/order history/i)).toBeInTheDocument()
    );

    window.confirm = vi.fn(() => false);

    const cancelButton = screen.getByRole("button", {
      name: /cancel order/i,
    });

    fireEvent.click(cancelButton);

    expect(updateOrder).not.toHaveBeenCalled();
  });
});