import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/api/api";

import {
  getBatches,
  getFeedStocks,
  addDailyOperation,
  getDailyOperationByOperationId,
  getDailySummary,
} from "@/api/dailyOperationsAPI";

vi.mock("@/api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("batchAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch batches successfully", async () => {
    const mockData = [{ batchid: "1" }];

    api.get.mockResolvedValue({ data: mockData });

    const result = await getBatches();

    expect(api.get).toHaveBeenCalledWith("/batches/batches/active/");
    expect(result).toEqual(mockData);
  });

  it("should return empty array if getBatches fails", async () => {
    api.get.mockRejectedValue({
      response: { data: "error" },
    });

    const result = await getBatches();

    expect(result).toEqual([]);
  });

  it("should fetch feed stocks successfully", async () => {
    const mockData = [{ id: 1 }];

    api.get.mockResolvedValue({ data: mockData });

    const result = await getFeedStocks();

    expect(api.get).toHaveBeenCalledWith("/feed/feedstocks/");
    expect(result).toEqual(mockData);
  });

  it("should return empty array if getFeedStocks fails", async () => {
    api.get.mockRejectedValue(new Error("Network error"));

    const result = await getFeedStocks();

    expect(result).toEqual([]);
  });

  it("should add daily operation successfully", async () => {
    const payload = { feed: 10 };
    const mockResponse = { success: true };

    api.post.mockResolvedValue({ data: mockResponse });

    const result = await addDailyOperation(payload);

    expect(api.post).toHaveBeenCalledWith(
      "/batches/dailyoperations/",
      payload
    );
    expect(result).toEqual(mockResponse);
  });

  it("should reject when addDailyOperation fails", async () => {
    const payload = { feed: 10 };

    api.post.mockRejectedValue({
      response: { data: { error: "Failed" } },
    });

    await expect(addDailyOperation(payload)).rejects.toEqual({
      error: "Failed",
    });
  });

  it("should fetch daily operation by id", async () => {
    const mockData = { id: 1 };

    api.get.mockResolvedValue({ data: mockData });

    const result = await getDailyOperationByOperationId(1);

    expect(api.get).toHaveBeenCalledWith(
      "/batches/dailyoperations/1/"
    );
    expect(result).toEqual(mockData);
  });

  it("should throw error if fetching operation fails", async () => {
    api.get.mockRejectedValue({
      response: { data: "error" },
    });

    await expect(
      getDailyOperationByOperationId(1)
    ).rejects.toEqual("error");
  });

  it("should fetch daily summary successfully", async () => {
    const mockData = { total: 100 };

    api.get.mockResolvedValue({ data: mockData });

    const result = await getDailySummary();

    expect(api.get).toHaveBeenCalledWith(
      "/batches/daily_summary/summary/"
    );
    expect(result).toEqual(mockData);
  });

  it("should return null if getDailySummary fails", async () => {
    api.get.mockRejectedValue(new Error("error"));

    const result = await getDailySummary();

    expect(result).toBeNull();
  });
});