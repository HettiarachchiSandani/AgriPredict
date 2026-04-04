import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@/api/api";
import {
  generatePrediction,
  getPredictions,
  getPredictedTotalToday,
  getBatches,
} from "@/api/predictionsAPI";

// Mock API
vi.mock("@/api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("predictionsAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call generatePrediction and return data", async () => {
    const mockData = { result: "ok" };

    api.post.mockResolvedValue({ data: mockData });

    const result = await generatePrediction({ batchId: 1 });

    expect(api.post).toHaveBeenCalledWith(
      "/predictions/predict_next_day/",
      { batchId: 1 }
    );
    expect(result).toEqual(mockData);
  });

  it("should fetch all predictions", async () => {
    const mockData = [{ id: 1 }];

    api.get.mockResolvedValue({ data: mockData });

    const result = await getPredictions();

    expect(api.get).toHaveBeenCalledWith("/predictions/");
    expect(result).toEqual(mockData);
  });

  it("should get today's predicted total", async () => {
    const mockData = { total: 100 };

    api.get.mockResolvedValue({ data: mockData });

    const result = await getPredictedTotalToday();

    expect(api.get).toHaveBeenCalledWith(
      "/predictions/predict_total_today/"
    );
    expect(result).toEqual(mockData);
  });

  it("should fetch active batches successfully", async () => {
    const mockData = [{ batchid: "1" }];

    api.get.mockResolvedValue({ data: mockData });

    const result = await getBatches();

    expect(api.get).toHaveBeenCalledWith("/batches/batches/active/");
    expect(result).toEqual(mockData);
  });

  it("should return empty array on failure", async () => {
    api.get.mockRejectedValue({
      response: { data: "error" },
    });

    const result = await getBatches();

    expect(result).toEqual([]);
  });

  it("should return empty array when no response message", async () => {
    api.get.mockRejectedValue(new Error("Network error"));

    const result = await getBatches();

    expect(result).toEqual([]);
  });
});