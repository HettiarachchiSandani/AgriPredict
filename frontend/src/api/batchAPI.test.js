import { describe, it, expect, beforeEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getBatches,
  getBreeds,
  getBatchDetails,
  addBatch,
  updateBatch,
  deleteBatch,
  getBatchPerformance,
} from "./batchAPI";

describe("Batch API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches batches successfully", async () => {
    mock.onGet("/batches/batches/").reply(200, [{ id: 1 }]);

    const result = await getBatches();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("fetches breeds successfully", async () => {
    mock.onGet("/batches/breeds/").reply(200, ["Breed1"]);

    const result = await getBreeds();

    expect(result).toEqual(["Breed1"]);
  });

  it("fetches and transforms batch details", async () => {
    mock.onGet("/batches/batches/1/details/").reply(200, {
      batchid: 1,
      batchname: "Test Batch",
      breedname: "Breed A",
      initial_male: 10,
      initial_female: 20,
      current_male: 8,
      current_female: 18,
    });

    const result = await getBatchDetails(1);

    expect(result.batchid).toBe(1);
    expect(result.batchname).toBe("Test Batch");
    expect(result.initial_total).toBe(30);
    expect(result.current_total).toBe(26);
  });

  it("adds a batch", async () => {
    const newBatch = { batchname: "Batch 1", breed: 1 };

    mock.onPost("/batches/batches/").reply((config) => {
      const data = JSON.parse(config.data);
      expect(data.batchname).toBe("Batch 1");
      return [201, { id: 1 }];
    });

    const result = await addBatch(newBatch);

    expect(result.id).toBe(1);
  });

  it("updates a batch", async () => {
    const updatedBatch = { batchname: "Updated", breed: 1 };

    mock.onPut("/batches/batches/1/").reply((config) => {
      const data = JSON.parse(config.data);
      expect(data.batchname).toBe("Updated");
      return [200, { success: true }];
    });

    const result = await updateBatch(1, updatedBatch);

    expect(result.success).toBe(true);
  });

  it("deletes a batch", async () => {
    mock.onDelete("/batches/batches/1/").reply(204);

    await expect(deleteBatch(1)).resolves.toBeUndefined();
  });

  it("fetches batch performance", async () => {
    mock.onGet("/batches/batches/performance/").reply(200, [1, 2, 3]);

    const result = await getBatchPerformance();

    expect(result).toEqual([1, 2, 3]);
  });

  it("returns empty array on getBatches error", async () => {
    mock.onGet("/batches/batches/").networkError();

    const result = await getBatches();

    expect(result).toEqual([]);
  });
});