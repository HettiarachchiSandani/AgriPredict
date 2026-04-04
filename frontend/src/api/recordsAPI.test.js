import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getRecords,
  getRecordById,
  verifyBlockchain,
} from "./recordsAPI";

describe("Report API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches all records", async () => {
    mock.onGet("reports/records/").reply(200, [{ id: 1 }]);

    const result = await getRecords();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("throws error when fetching records fails", async () => {
    mock.onGet("reports/records/").networkError();

    await expect(getRecords()).rejects.toThrow();
  });

  it("fetches record by id", async () => {
    mock.onGet("reports/records/1/").reply(200, { id: 1 });

    const result = await getRecordById(1);

    expect(result).toEqual({ id: 1 });
  });

  it("throws error when fetching record by id fails", async () => {
    mock.onGet("reports/records/1/").networkError();

    await expect(getRecordById(1)).rejects.toThrow();
  });

  it("verifies blockchain", async () => {
    mock.onGet("reports/records/verify/").reply(200, { verified: true });

    const result = await verifyBlockchain();

    expect(result.verified).toBe(true);
  });

  it("throws error when blockchain verification fails", async () => {
    mock.onGet("reports/records/verify/").networkError();

    await expect(verifyBlockchain()).rejects.toThrow();
  });
});