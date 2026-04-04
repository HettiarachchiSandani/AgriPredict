import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getOrdersWithAvailableEggs,
} from "./orderAPI";

describe("Order API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches orders", async () => {
    mock.onGet("orders/orders/").reply(200, [{ id: 1 }]);

    const result = await getOrders();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns empty array if response is not array", async () => {
    mock.onGet("orders/orders/").reply(200, { message: "ok" });

    const result = await getOrders();

    expect(result).toEqual([]);
  });

  it("returns empty array on error", async () => {
    mock.onGet("orders/orders/").networkError();

    const result = await getOrders();

    expect(result).toEqual([]);
  });

  it("adds an order", async () => {
    const order = { item: "Eggs", quantity: 10 };

    mock.onPost("orders/orders/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.item).toBe("Eggs");

      return [201, { id: 1 }];
    });

    const result = await addOrder(order);

    expect(result.id).toBe(1);
  });

  it("throws error when adding order fails", async () => {
    mock.onPost("orders/orders/").networkError();

    await expect(addOrder({})).rejects.toThrow();
  });

  it("updates an order", async () => {
    const order = { item: "Updated Eggs" };

    mock.onPut("orders/orders/1/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.item).toBe("Updated Eggs");

      return [200, { success: true }];
    });

    const result = await updateOrder(1, order);

    expect(result.success).toBe(true);
  });

  it("throws error when updating order fails", async () => {
    mock.onPut("orders/orders/1/").networkError();

    await expect(updateOrder(1, {})).rejects.toThrow();
  });

  it("deletes an order", async () => {
    mock.onDelete("orders/orders/1/").reply(200, { success: true });

    const result = await deleteOrder(1);

    expect(result.success).toBe(true);
  });

  it("throws error when deleting order fails", async () => {
    mock.onDelete("orders/orders/1/").networkError();

    await expect(deleteOrder(1)).rejects.toThrow();
  });

  it("fetches orders with available eggs", async () => {
    mock.onGet("orders/orders/with-available-eggs/").reply(200, [{ id: 1 }]);

    const result = await getOrdersWithAvailableEggs();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns empty array on error for available eggs", async () => {
    mock.onGet("orders/orders/with-available-eggs/").networkError();

    const result = await getOrdersWithAvailableEggs();

    expect(result).toEqual([]);
  });
});