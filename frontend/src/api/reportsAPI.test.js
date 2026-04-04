import { describe, it, expect, beforeEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getReports,
  generateReport,
  downloadReport,
} from "./reportsAPI";

describe("Report Service", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);

    global.URL.createObjectURL = vi.fn(() => "blob:url");
    global.URL.revokeObjectURL = vi.fn();

    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    document.createElement = vi.fn(() => ({
      href: "",
      download: "",
      click: vi.fn(),
    }));
  });

  it("returns reports when response is array", async () => {
    mock.onGet("/reports/reports/").reply(200, [{ id: 1 }]);

    const result = await getReports();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns reports when response has results", async () => {
    mock.onGet("/reports/reports/").reply(200, { results: [{ id: 2 }] });

    const result = await getReports();

    expect(result).toEqual([{ id: 2 }]);
  });

  it("returns empty array for invalid response", async () => {
    mock.onGet("/reports/reports/").reply(200, { message: "invalid" });

    const result = await getReports();

    expect(result).toEqual([]);
  });

  it("returns empty array on error", async () => {
    mock.onGet("/reports/reports/").networkError();

    const result = await getReports();

    expect(result).toEqual([]);
  });

  it("generates a report", async () => {
    const payload = { type: "monthly" };

    mock.onPost("/reports/reports/generate/").reply(200, {
      success: true,
    });

    const result = await generateReport(payload);

    expect(result.success).toBe(true);
  });

  it("rejects with error when generation fails", async () => {
    mock.onPost("/reports/reports/generate/").reply(400, {
      detail: "Error",
    });

    await expect(generateReport({})).rejects.toEqual({
      detail: "Error",
    });
  });

  it("downloads report file", async () => {
    const mockBlob = new Blob(["test"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    mock.onPost("/reports/reports/download/").reply(200, mockBlob);

    await downloadReport({});

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it("throws error when download fails", async () => {
    mock.onPost("/reports/reports/download/").networkError();

    await expect(downloadReport({})).rejects.toThrow();
  });
});