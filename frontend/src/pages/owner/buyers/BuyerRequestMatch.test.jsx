import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BuyerRequestMatch from "./BuyerRequestMatch";
import * as orderAPI from "@/api/orderAPI";
import * as buyersAPI from "@/api/buyersAPI";

vi.mock("@/api/orderAPI", () => ({
  getOrdersWithAvailableEggs: vi.fn(),
  updateOrder: vi.fn(),
  getOrders: vi.fn(),
}));

vi.mock("@/api/buyersAPI", () => ({
  getBuyers: vi.fn(),
}));

describe("BuyerRequestMatch Component", () => {
  const mockOrders = [
    {
      orderid: "O001",
      buyerid: "B001",
      breedid: "BR001",
      breedname: "Layer",
      quantity: 100,
      requesteddate: "2026-04-01",
      ordereddate: "2026-04-02",
      accepted: null,
      completed: false,
      available_eggs: 90,
      prediction_available: true,
      next_7_days_predicted_eggs: 120,
    },
    {
      orderid: "O002",
      buyerid: "B002",
      breedid: "BR002",
      breedname: "Broiler",
      quantity: 50,
      requesteddate: "2026-04-03",
      ordereddate: "2026-04-04",
      accepted: true,
      completed: false,
      available_eggs: 45,
      prediction_available: false,
    },
  ];

  const mockBuyers = [
    { buyerid: "B001", firstname: "John", lastname: "Doe" },
    { buyerid: "B002", firstname: "Jane", lastname: "Smith" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state and then requests", async () => {
    orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
    buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

    render(
      <MemoryRouter>
        <BuyerRequestMatch />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading buyer requests/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("O001")).toBeInTheDocument();
      expect(screen.getByText("O002")).toBeInTheDocument();
    });
  });

  test("filters requests by buyer", async () => {
    orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
    buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

    render(<MemoryRouter><BuyerRequestMatch /></MemoryRouter>);

    await waitFor(() => screen.getByText("O001"));

    fireEvent.change(screen.getByLabelText("Buyer"), { target: { value: "B001" } });

    expect(screen.getByText("O001")).toBeInTheDocument();
    expect(screen.queryByText("O002")).not.toBeInTheDocument();
  });

  test("opens modal and shows order details", async () => {
  orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
  buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

  render(<MemoryRouter><BuyerRequestMatch /></MemoryRouter>);

  await waitFor(() => screen.getByText("O001"));

  const row = screen.getByText("O001").closest("tr");
  fireEvent.click(within(row).getByTitle("View & Update Status"));

  const modalHeading = await screen.findByRole("heading", { name: /order details/i });
  const modal = modalHeading.closest(".request-modal"); 
  expect(modal).toBeInTheDocument();

  expect(within(modal).getByText("O001")).toBeInTheDocument(); 
  expect(within(modal).getByText("B001")).toBeInTheDocument(); 
  expect(within(modal).getByText(/Layer/)).toBeInTheDocument();
  expect(within(modal).getByText(/BR001/)).toBeInTheDocument(); 
  expect(within(modal).getByText("100")).toBeInTheDocument(); 
  expect(within(modal).getByText("90")).toBeInTheDocument(); 
  expect(within(modal).getByText("120")).toBeInTheDocument(); 
});

  test("approve action calls updateOrder", async () => {
    orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
    orderAPI.updateOrder.mockResolvedValue({});
    buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

    render(<MemoryRouter><BuyerRequestMatch /></MemoryRouter>);

    await waitFor(() => screen.getByText("O001"));
    const row = screen.getByText("O001").closest("tr");
    fireEvent.click(within(row).getByTitle("View & Update Status"));

    await waitFor(() => screen.getByText("Confirm"));

    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(orderAPI.updateOrder).toHaveBeenCalledWith("O001", { accepted: true });
    });
  });

  test("reject action calls updateOrder", async () => {
    orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
    orderAPI.updateOrder.mockResolvedValue({});
    buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

    render(<MemoryRouter><BuyerRequestMatch /></MemoryRouter>);

    await waitFor(() => screen.getByText("O001"));
    const row = screen.getByText("O001").closest("tr");
    fireEvent.click(within(row).getByTitle("View & Update Status"));

    await waitFor(() => screen.getByText("Cancel"));

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(orderAPI.updateOrder).toHaveBeenCalledWith("O001", { accepted: false });
    });
  });

  test("complete action calls updateOrder", async () => {
    orderAPI.getOrdersWithAvailableEggs.mockResolvedValue(mockOrders);
    orderAPI.updateOrder.mockResolvedValue({});
    buyersAPI.getBuyers.mockResolvedValue(mockBuyers);

    render(<MemoryRouter><BuyerRequestMatch /></MemoryRouter>);

    await waitFor(() => screen.getByText("O002")); 
    const row = screen.getByText("O002").closest("tr");
    fireEvent.click(within(row).getByTitle("View & Update Status"));

    const completedButton = await waitFor(() => 
      screen.getByRole("button", { name: "Completed" })
    );
    fireEvent.click(completedButton);

    await waitFor(() => {
      expect(orderAPI.updateOrder).toHaveBeenCalledWith("O002", { completed: true });
    });
  });
});