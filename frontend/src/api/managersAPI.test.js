import { vi, describe, it, expect, beforeEach } from "vitest";
import api from "./api";
import {
  getManagers,
  addManager,
  updateManager,
  deleteManager,
} from "./managersAPI";

// Mock the api module
vi.mock("./api");

describe("Manager API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch managers successfully", async () => {
    const mockData = [{ id: 1, name: "Manager 1" }];

    api.get.mockResolvedValue({ data: mockData });

    const result = await getManagers();

    expect(api.get).toHaveBeenCalledWith("/owners/managers/");
    expect(result).toEqual(mockData);
  });

  it("should return empty array if getManagers fails", async () => {
    api.get.mockRejectedValue(new Error("API Error"));

    const result = await getManagers();

    expect(result).toEqual([]);
  });

  it("should add a manager successfully", async () => {
    const newManager = { name: "New Manager" };

    api.post.mockResolvedValue({ data: { id: 1, ...newManager } });

    const result = await addManager(newManager);

    expect(api.post).toHaveBeenCalledWith("/owners/managers/", newManager);
    expect(result).toEqual({ id: 1, ...newManager });
  });

  it("should throw error when addManager fails", async () => {
    api.post.mockRejectedValue(new Error("Add Error"));

    await expect(addManager({ name: "Test" })).rejects.toThrow("Add Error");
  });

  it("should update a manager successfully", async () => {
    const updatedData = { name: "Updated Manager" };

    api.put.mockResolvedValue({ data: updatedData });

    const result = await updateManager(1, updatedData);

    expect(api.put).toHaveBeenCalledWith("/owners/managers/1/", updatedData);
    expect(result).toEqual(updatedData);
  });

  it("should throw error when updateManager fails", async () => {
    api.put.mockRejectedValue(new Error("Update Error"));

    await expect(updateManager(1, {})).rejects.toThrow("Update Error");
  });

  it("should delete a manager successfully", async () => {
    api.delete.mockResolvedValue({});

    await deleteManager(1);

    expect(api.delete).toHaveBeenCalledWith("/owners/managers/1/");
  });

  it("should throw error when deleteManager fails", async () => {
    api.delete.mockRejectedValue(new Error("Delete Error"));

    await expect(deleteManager(1)).rejects.toThrow("Delete Error");
  });
});