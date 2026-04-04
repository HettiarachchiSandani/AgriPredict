import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getFeedStocks,
  addFeedStock,
  updateFeedStock,
  deleteFeedStock,
} from "./feedstockAPI";

describe("Feed API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches feed stocks", async () => {
    mock.onGet("/feed/feedstocks/").reply(200, [{ id: 1 }]);

    const result = await getFeedStocks();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns empty array on error", async () => {
    mock.onGet("/feed/feedstocks/").networkError();

    const result = await getFeedStocks();

    expect(result).toEqual([]);
  });

  it("adds a feed stock", async () => {
    const payload = { name: "Feed A" };

    mock.onPost("/feed/feedstocks/").reply((config) => {
      const data = JSON.parse(config.data);
      expect(data.name).toBe("Feed A");

      return [201, { id: 1 }];
    });

    const result = await addFeedStock(payload);

    expect(result.id).toBe(1);
  });

  it("throws error when adding feed stock fails", async () => {
    mock.onPost("/feed/feedstocks/").networkError();

    await expect(addFeedStock({})).rejects.toThrow();
  });

  it("updates feed stock", async () => {
    const payload = { name: "Updated Feed", stockid: 99 };

    mock.onPut("/feed/feedstocks/1/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.stockid).toBeUndefined();
      expect(data.name).toBe("Updated Feed");

      return [200, { success: true }];
    });

    const result = await updateFeedStock(1, payload);

    expect(result.success).toBe(true);
  });

  it("throws error when updating feed stock fails", async () => {
    mock.onPut("/feed/feedstocks/1/").networkError();

    await expect(updateFeedStock(1, {})).rejects.toThrow();
  });

  it("deletes a feed stock", async () => {
    mock.onDelete("/feed/feedstocks/1/").reply(204);

    await expect(deleteFeedStock(1)).resolves.toBeUndefined();
  });

  it("throws error when deleting feed stock fails", async () => {
    mock.onDelete("/feed/feedstocks/1/").networkError();

    await expect(deleteFeedStock(1)).rejects.toThrow();
  });
});