import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import FeedStockList from "./Feedstock";
import * as feedstockAPI from "@/api/feedstockAPI";

vi.mock("@/api/feedstockAPI", () => ({
  getFeedStocks: vi.fn(),
  addFeedStock: vi.fn(),
  deleteFeedStock: vi.fn(),
  updateFeedStock: vi.fn(),
}));

describe("FeedStockList", () => {
  const mockData = [
    {
      stockid: "F001",
      feedtype: "Starter",
      quantity: 20,
      lastupdated: "2026-04-01T10:00:00Z",
      status: "Available",
    },
    {
      stockid: "F002",
      feedtype: "Grower",
      quantity: 5,
      lastupdated: "2026-04-02T10:00:00Z",
      status: "Low Stock",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders loading and then feed stock data", async () => {
    feedstockAPI.getFeedStocks.mockResolvedValue(mockData);
    render(<FeedStockList />);
    expect(screen.getByText(/loading feedstock/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("F001")).toBeInTheDocument();
      expect(screen.getByText("F002")).toBeInTheDocument();
    });
  });

  test("filters by feed type search", async () => {
    feedstockAPI.getFeedStocks.mockResolvedValue(mockData);
    render(<FeedStockList />);
    await waitFor(() => screen.getByText("F001"));
    fireEvent.change(screen.getByPlaceholderText(/search by feed type/i), {
      target: { value: "Starter" },
    });
    expect(screen.getByText("F001")).toBeInTheDocument();
    expect(screen.queryByText("F002")).not.toBeInTheDocument();
  });

  test("opens add form and calls addFeedStock", async () => {
    feedstockAPI.getFeedStocks.mockResolvedValue(mockData);
    feedstockAPI.addFeedStock.mockResolvedValue({});
    render(<FeedStockList />);
    await waitFor(() => screen.getByText("F001"));
    fireEvent.click(screen.getByText(/add feed stock/i));
    fireEvent.change(screen.getByLabelText(/feed type/i), {
      target: { value: "Finisher" },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: 10 },
    });
    fireEvent.click(screen.getByText(/add stock/i));
    await waitFor(() => {
      expect(feedstockAPI.addFeedStock).toHaveBeenCalledWith({
        feedtype: "Finisher",
        quantity: 10,
        status: "Low Stock",
      });
    });
  });

  test("opens edit form and calls updateFeedStock", async () => {
    feedstockAPI.getFeedStocks.mockResolvedValue(mockData);
    feedstockAPI.updateFeedStock.mockResolvedValue({});
    render(<FeedStockList />);
    await waitFor(() => screen.getByText("F001"));

    // Find the row containing "F001" and click its edit button
    const firstRow = screen.getByText("F001").closest("tr");
    const editButton = within(firstRow).getByRole("button", { name: /edit/i }); // falls back to aria-label if present
    // Since the button has no text, we can also use className or testid – but using role and a custom query is fragile.
    // Better: use the fact that only edit buttons have the class "edit-btn"
    // We'll use a data-testid in the component? For now, select by class:
    // const editButton = firstRow.querySelector(".edit-btn");
    // But to keep using testing-library, we can use:
    fireEvent.click(editButton);

    // Wait for form to appear and change feed type
    await waitFor(() => {
      expect(screen.getByLabelText(/feed type/i)).toHaveValue("Starter");
    });
    fireEvent.change(screen.getByLabelText(/feed type/i), {
      target: { value: "Updated Feed" },
    });
    fireEvent.click(screen.getByText(/update stock/i));

    await waitFor(() => {
      expect(feedstockAPI.updateFeedStock).toHaveBeenCalledWith(
        "F001",
        expect.objectContaining({
          feedtype: "Updated Feed",
          quantity: 20,
          status: "Available",
        })
      );
    });
  });

  test("deletes a feed stock", async () => {
    feedstockAPI.getFeedStocks.mockResolvedValue(mockData);
    feedstockAPI.deleteFeedStock.mockResolvedValue({});
    render(<FeedStockList />);
    await waitFor(() => screen.getByText("F001"));

    // Find the row containing "F001" and click its delete button
    const firstRow = screen.getByText("F001").closest("tr");
    const deleteButton = within(firstRow).getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(feedstockAPI.deleteFeedStock).toHaveBeenCalledWith("F001");
    });
  });
});