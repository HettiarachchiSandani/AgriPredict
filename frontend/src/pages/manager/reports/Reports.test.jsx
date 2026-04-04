import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import Reports from "./Reports";
import * as reportsAPI from "@/api/reportsAPI";
import * as batchAPI from "@/api/batchAPI";

vi.stubGlobal("alert", vi.fn());

vi.mock("@/api/reportsAPI", () => ({
  getReports: vi.fn(),
  generateReport: vi.fn(),
  downloadReport: vi.fn(),
}));

vi.mock("@/api/batchAPI", () => ({
  getBatches: vi.fn(),
}));

describe("Reports Component", () => {
  const mockBatches = [{ batchid: "B1", batchname: "Batch 1" }];
  const mockReports = [
    { reportid: "R1", generateddate: "2026-01-01", type: "batch", batchid: "B1" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders and loads data", async () => {
    batchAPI.getBatches.mockResolvedValue(mockBatches);
    reportsAPI.getReports.mockResolvedValue(mockReports);

    await act(async () => {
      render(<Reports />);
    });

    expect(await screen.findByText("Report Overview")).toBeInTheDocument();
    expect(await screen.findByText("R1")).toBeInTheDocument();
  });

  test("selects report type and enables generation", async () => {
    batchAPI.getBatches.mockResolvedValue([]);
    reportsAPI.getReports.mockResolvedValue([]);

    await act(async () => {
      render(<Reports />);
    });

    const select = screen.getByDisplayValue("Report Type");
    fireEvent.change(select, { target: { value: "Batch Report" } });

    const button = screen.getByRole("button", { name: /generate report/i });
    expect(button).not.toBeDisabled();
  });

  test("shows batch dropdown when required", async () => {
    batchAPI.getBatches.mockResolvedValue(mockBatches);
    reportsAPI.getReports.mockResolvedValue([]);

    await act(async () => {
      render(<Reports />);
    });

    fireEvent.change(screen.getByDisplayValue("Report Type"), {
      target: { value: "Batch Report" },
    });

    await waitFor(() => {
      expect(screen.getByText("All Batch")).toBeInTheDocument();
    });
  });

  test("generates report successfully", async () => {
    batchAPI.getBatches.mockResolvedValue(mockBatches);
    reportsAPI.getReports.mockResolvedValue([]);
    reportsAPI.generateReport.mockResolvedValue({ data: [{ name: "Test" }] });

    await act(async () => {
      render(<Reports />);
    });

    fireEvent.change(screen.getByDisplayValue("Report Type"), {
      target: { value: "Batch Report" },
    });
    fireEvent.change(screen.getByLabelText(/date from/i), {
      target: { value: "2026-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/date to/i), {
      target: { value: "2026-01-02" },
    });
    fireEvent.click(screen.getByRole("button", { name: /generate report/i }));

    await waitFor(() => {
      expect(reportsAPI.generateReport).toHaveBeenCalled();
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  test("disables generate button when no report type selected", async () => {
    batchAPI.getBatches.mockResolvedValue([]);
    reportsAPI.getReports.mockResolvedValue([]);

    await act(async () => {
      render(<Reports />);
    });

    const button = screen.getByRole("button", { name: /generate report/i });
    expect(button).toBeDisabled();
  });

  test("downloads report", async () => {
    batchAPI.getBatches.mockResolvedValue(mockBatches);
    reportsAPI.getReports.mockResolvedValue([]);
    reportsAPI.generateReport.mockResolvedValue({
      data: [{ name: "Test" }],
    });

    reportsAPI.downloadReport.mockResolvedValue({});

    await act(async () => {
      render(<Reports />);
    });

    fireEvent.change(screen.getByDisplayValue("Report Type"), {
      target: { value: "Batch Report" },
    });

    fireEvent.change(screen.getByLabelText(/date from/i), {
      target: { value: "2026-01-01" },
    });

    fireEvent.change(screen.getByLabelText(/date to/i), {
      target: { value: "2026-01-02" },
    });

    fireEvent.click(screen.getByRole("button", { name: /generate report/i }));

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/download excel/i));

    await waitFor(() => {
      expect(reportsAPI.downloadReport).toHaveBeenCalled();
    });
  });

  test("renders generated reports table", async () => {
    batchAPI.getBatches.mockResolvedValue([]);
    reportsAPI.getReports.mockResolvedValue(mockReports);

    await act(async () => {
      render(<Reports />);
    });

    expect(await screen.findByText("R1")).toBeInTheDocument();
    expect(screen.getByText("batch")).toBeInTheDocument();
  });
});