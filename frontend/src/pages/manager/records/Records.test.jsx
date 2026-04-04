import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import RecordPage from "./Records";
import * as recordsAPI from "@/api/recordsAPI";
import * as batchAPI from "@/api/batchAPI";
import * as dailyOpsAPI from "@/api/dailyOperationsAPI";
import { formatToSriLankaTime } from "@/utils/time";

vi.mock("@/api/recordsAPI", () => ({
  getRecords: vi.fn(),
}));

vi.mock("@/api/batchAPI", () => ({
  getBatches: vi.fn(),
}));

vi.mock("@/api/dailyOperationsAPI", () => ({
  getDailyOperationByOperationId: vi.fn(),
}));

vi.mock("@/utils/time", () => ({
  formatToSriLankaTime: vi.fn((timestamp) => timestamp),
}));

describe("RecordPage", () => {
  const mockBatches = [
    { batchid: "B1", batchname: "Batch Alpha" },
    { batchid: "B2", batchname: "Batch Beta" },
  ];

  const mockRecords = [
    {
      recordsid: "R001",
      batchid: "B1",
      timestamp: "2026-04-01 10:00:00",
      operationid: "OP1",
    },
    {
      recordsid: "R002",
      batchid: "B2",
      timestamp: "2026-04-02 14:30:00",
      operationid: "OP2",
    },
    {
      recordsid: "R003",
      batchid: "B1",
      timestamp: "2026-04-03 09:15:00",
      operationid: "OP3",
    },
  ];

  const mockOperation = {
    operationid: "OP1",
    date: "2026-04-01",
    feedusage: 120.5,
    eggcount: 240,
    avgeggweight: 58.2,
    male_mortality: 2,
    female_mortality: 1,
    mortalitycount: 3,
    water_used: 45,
    notes: "All good",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    recordsAPI.getRecords.mockResolvedValue(mockRecords);
    batchAPI.getBatches.mockResolvedValue(mockBatches);
    dailyOpsAPI.getDailyOperationByOperationId.mockResolvedValue(mockOperation);
    formatToSriLankaTime.mockImplementation((ts) => ts);
  });

  test("renders loading state initially, then records and batches", async () => {
    render(<RecordPage />);

    expect(screen.getByText(/Loading records/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading records/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText("R001")).toBeInTheDocument();
    expect(screen.getByText("R002")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Batch/i));
    expect(screen.getByText("Batch Alpha")).toBeInTheDocument();
    expect(screen.getByText("Batch Beta")).toBeInTheDocument();
  });

  test("filters records by batch", async () => {
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const batchSelect = screen.getByLabelText(/Batch/i);
    fireEvent.change(batchSelect, { target: { value: "B1" } });

    expect(screen.getByText("R001")).toBeInTheDocument();
    expect(screen.getByText("R003")).toBeInTheDocument();
    expect(screen.queryByText("R002")).not.toBeInTheDocument();
  });

  test("filters records by date range", async () => {
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const startDate = screen.getByLabelText(/Start Date/i);
    const endDate = screen.getByLabelText(/End Date/i);

    fireEvent.change(startDate, { target: { value: "2026-04-02" } });
    fireEvent.change(endDate, { target: { value: "2026-04-03" } });

    expect(screen.queryByText("R001")).not.toBeInTheDocument();
    expect(screen.getByText("R002")).toBeInTheDocument();
    expect(screen.getByText("R003")).toBeInTheDocument();
  });

  test("shows alert when end date is before start date", async () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const startDate = screen.getByLabelText(/Start Date/i);
    const endDate = screen.getByLabelText(/End Date/i);

    fireEvent.change(startDate, { target: { value: "2026-04-05" } });
    fireEvent.change(endDate, { target: { value: "2026-04-03" } });

    expect(alertMock).toHaveBeenCalledWith("End date cannot be earlier than Start date");
    alertMock.mockRestore();
  });

  test("resets filters correctly", async () => {
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const batchSelect = screen.getByLabelText(/Batch/i);
    fireEvent.change(batchSelect, { target: { value: "B1" } });
    expect(screen.queryByText("R002")).not.toBeInTheDocument();

    const resetBtn = screen.getByText(/Reset Filters/i);
    fireEvent.click(resetBtn);

    expect(screen.getByText("R001")).toBeInTheDocument();
    expect(screen.getByText("R002")).toBeInTheDocument();
    expect(batchSelect.value).toBe("");
    expect(screen.getByLabelText(/Start Date/i).value).toBe("");
    expect(screen.getByLabelText(/End Date/i).value).toBe("");
  });

  test("selecting a record fetches and displays operation details", async () => {
    render(<RecordPage />);

    await screen.findByText("R001");

    const firstRecordRow = screen.getByText("R001").closest("tr");
    fireEvent.click(firstRecordRow);

    expect(await screen.findByText("Record Details")).toBeInTheDocument();

    expect(await screen.findByText(/Feed Usage:/i)).toBeInTheDocument();
    expect(await screen.findByText(/120\.5/)).toBeInTheDocument();

    expect(await screen.findByText(/Egg Production:/i)).toBeInTheDocument();
    expect(await screen.findByText(/240/)).toBeInTheDocument();

    const opRow = await screen.findByText(/Operation ID:/i);
    expect(opRow.closest("p")).toHaveTextContent("OP1");

    expect(await screen.findByText(/Avg Egg Weight:/i)).toBeInTheDocument();
    expect(await screen.findByText(/58\.2/)).toBeInTheDocument();

    expect(dailyOpsAPI.getDailyOperationByOperationId).toHaveBeenCalledWith("OP1");
    });

    test("shows loading operation while fetching", async () => {
    dailyOpsAPI.getDailyOperationByOperationId.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockOperation), 100))
    );

    render(<RecordPage />);
    await screen.findByText("R001");

    const firstRecordRow = screen.getByText("R001").closest("tr");
    fireEvent.click(firstRecordRow);

    expect(screen.getByText(/Loading operation/i)).toBeInTheDocument();

    const avgWeightLabel = await screen.findByText(/Avg Egg Weight:/i);
    const avgWeightRow = avgWeightLabel.closest("p");

    expect(avgWeightRow).toHaveTextContent("58.2");
    });

  test("displays error message when operation fetch fails", async () => {
    dailyOpsAPI.getDailyOperationByOperationId.mockRejectedValue(new Error("Network error"));
    console.error = vi.fn(); // suppress expected error log

    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const firstRecordRow = screen.getByText("R001").closest("tr");
    fireEvent.click(firstRecordRow);

    await waitFor(() => {
      expect(screen.getByText(/No operation found for this record/i)).toBeInTheDocument();
    });
  });

  test("closes record panel when close button clicked", async () => {
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const firstRecordRow = screen.getByText("R001").closest("tr");
    fireEvent.click(firstRecordRow);

    expect(await screen.findByText("Record Details")).toBeInTheDocument();

    const closeBtn = screen.getByText("×");
    fireEvent.click(closeBtn);

    expect(screen.queryByText("Record Details")).not.toBeInTheDocument();
  });

  test("shows 'No Records Found' when filtered list empty", async () => {
    render(<RecordPage />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());

    const startDate = screen.getByLabelText(/Start Date/i);
    const endDate = screen.getByLabelText(/End Date/i);

    fireEvent.change(startDate, { target: { value: "2026-05-01" } });
    fireEvent.change(endDate, { target: { value: "2026-05-02" } });

    await waitFor(() => {
        expect(screen.getByText(/No Records Found/i)).toBeInTheDocument();
    });
    });

  test("handles API errors gracefully", async () => {
    recordsAPI.getRecords.mockRejectedValue(new Error("Failed to fetch"));
    console.error = vi.fn();

    render(<RecordPage />);
    await waitFor(() => {
      expect(screen.queryByText(/Loading records/i)).not.toBeInTheDocument();
    });

    expect(screen.queryByText("R001")).not.toBeInTheDocument();
    expect(screen.queryByText("R002")).not.toBeInTheDocument();
    expect(screen.queryByText("R003")).not.toBeInTheDocument();
  });
});