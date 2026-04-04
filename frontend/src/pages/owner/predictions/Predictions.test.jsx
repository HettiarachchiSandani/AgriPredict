import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Predictions from "./Predictions";

import * as predictionAPI from "@/api/predictionsAPI";
import * as batchAPI from "@/api/batchAPI";
import api from "@/api/api";

vi.mock("chart.js", async () => {
  const actual = await vi.importActual("chart.js");

  return {
    ...actual,
    Chart: {
      ...actual.Chart,
      register: vi.fn(),
    },
  };
});

vi.mock("@/api/predictionsAPI");
vi.mock("@/api/batchAPI");
vi.mock("@/api/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Predictions Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    predictionAPI.getBatches.mockResolvedValue([]);

    render(<Predictions />);

    expect(screen.getByText(/Loading batches/i)).toBeInTheDocument();
  });

  it("loads batches and displays dropdown", async () => {
    predictionAPI.getBatches.mockResolvedValue([
      { batchid: "1", batchname: "Batch 1" },
    ]);

    render(<Predictions />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Batch 1")).toBeInTheDocument();
    });
  });

  it("generates prediction when button is clicked", async () => {
    predictionAPI.getBatches.mockResolvedValue([
      { batchid: "1", batchname: "Batch 1" },
    ]);

    batchAPI.getBatchDetails.mockResolvedValue({
      batchid: "1",
      currentcount: 100,
    });

    predictionAPI.generatePrediction.mockResolvedValue({
      predictedeggcount: 50,
      mortality_probability: 0.1,
      shap_eggs: { feature1: 0.5 },
      shap_mortality: { feature2: -0.2 },
    });

    api.get.mockResolvedValue({
      data: [],
    });

    render(<Predictions />);

    const button = await screen.findByRole("button", {
      name: /Generate/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(predictionAPI.generatePrediction).toHaveBeenCalled();
    });
  });

  it("shows error when batch not selected", async () => {
    predictionAPI.getBatches.mockResolvedValue([]);

    global.alert = vi.fn();

    render(<Predictions />);

    const button = await screen.findByRole("button", {
        name: /Generate/i,
    });

    fireEvent.click(button);

    expect(global.alert).toHaveBeenCalledWith("Select a batch");
    });

  it("handles prediction API failure", async () => {
    predictionAPI.getBatches.mockResolvedValue([
      { batchid: "1", batchname: "Batch 1" },
    ]);

    batchAPI.getBatchDetails.mockResolvedValue({
      batchid: "1",
    });

    predictionAPI.generatePrediction.mockRejectedValue({
      response: { data: { error: "Prediction failed" } },
    });

    global.alert = vi.fn();

    render(<Predictions />);

    const button = await screen.findByRole("button", {
      name: /Generate/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Prediction failed");
    });
  });
});