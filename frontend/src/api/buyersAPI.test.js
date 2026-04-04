import { describe, it, expect, beforeEach, vi } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getBuyers,
  addBuyer,
  updateBuyer,
  deleteBuyer,
} from "./buyersAPI";

describe("Buyer API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches buyers successfully", async () => {
    mock.onGet("orders/buyers/").reply(200, [{ id: 1, name: "Buyer 1" }]);

    const result = await getBuyers();

    expect(result).toEqual([{ id: 1, name: "Buyer 1" }]);
  });

  it("returns empty array if response is not an array", async () => {
    mock.onGet("orders/buyers/").reply(200, { message: "ok" });

    const result = await getBuyers();

    expect(result).toEqual([]);
  });

  it("returns empty array on error", async () => {
    mock.onGet("orders/buyers/").networkError();

    const result = await getBuyers();

    expect(result).toEqual([]);
  });

  it("adds a buyer", async () => {
    const buyer = {
      email: "test@mail.com",
      password: "123",
      firstname: "John",
      lastname: "Doe",
    };

    mock.onPost("orders/buyers/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.email).toBe("test@mail.com");
      expect(data.firstname).toBe("John");

      return [201, { id: 1 }];
    });

    const result = await addBuyer(buyer);

    expect(result.id).toBe(1);
  });

  it("throws error when adding buyer fails", async () => {
    mock.onPost("orders/buyers/").networkError();

    await expect(addBuyer({})).rejects.toThrow();
  });

  it("updates a buyer", async () => {
    const buyer = {
      firstname: "Updated",
      lastname: "User",
      email: "update@mail.com",
    };

    mock.onPut("orders/buyers/1/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.firstname).toBe("Updated");

      return [200, { success: true }];
    });

    const result = await updateBuyer(1, buyer);

    expect(result.success).toBe(true);
  });

  it("throws error when updating buyer fails", async () => {
    mock.onPut("orders/buyers/1/").networkError();

    await expect(updateBuyer(1, {})).rejects.toThrow();
  });

  it("deletes a buyer", async () => {
    mock.onDelete("orders/buyers/1/").reply(204);

    await expect(deleteBuyer(1)).resolves.toBeUndefined();
  });

  it("throws error when deleting buyer fails", async () => {
    mock.onDelete("orders/buyers/1/").networkError();

    await expect(deleteBuyer(1)).rejects.toThrow();
  });
});