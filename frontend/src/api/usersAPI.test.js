import { describe, it, expect, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import api from "./api";

import {
  getUsers,
  getUserDetails,
  addUser,
  updateUser,
  deleteUser,
} from "./usersAPI";

describe("User API", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it("fetches all users", async () => {
    mock.onGet("/users/").reply(200, [{ id: 1 }]);

    const result = await getUsers();

    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns empty array on error", async () => {
    mock.onGet("/users/").networkError();

    const result = await getUsers();

    expect(result).toEqual([]);
  });

  it("fetches user details", async () => {
    mock.onGet("/users/1/").reply(200, { id: 1 });

    const result = await getUserDetails(1);

    expect(result).toEqual({ id: 1 });
  });

  it("returns null when fetching user fails", async () => {
    mock.onGet("/users/1/").networkError();

    const result = await getUserDetails(1);

    expect(result).toBeNull();
  });

  it("adds a user with correct payload", async () => {
    const user = {
      firstname: "John",
      email: "john@test.com",
      password: "123456",
      roleid: 1,
    };

    mock.onPost("/users/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.firstname).toBe("John");
      expect(data.lastname).toBeNull();

      return [201, { id: 1 }];
    });

    const result = await addUser(user);

    expect(result.id).toBe(1);
  });

  it("throws error when adding user fails", async () => {
    mock.onPost("/users/").networkError();

    await expect(addUser({})).rejects.toThrow();
  });

  it("updates a user", async () => {
    const user = {
      firstname: "Updated",
      email: "test@test.com",
      is_staff: true,
      is_active: true,
    };

    mock.onPut("/users/1/").reply((config) => {
      const data = JSON.parse(config.data);

      expect(data.firstname).toBe("Updated");

      return [200, { success: true }];
    });

    const result = await updateUser(1, user);

    expect(result.success).toBe(true);
  });

  it("throws error when updating user fails", async () => {
    mock.onPut("/users/1/").networkError();

    await expect(updateUser(1, {})).rejects.toThrow();
  });

  it("deletes a user", async () => {
    mock.onDelete("/users/1/").reply(200);

    await expect(deleteUser(1)).resolves.toBeUndefined();
  });

  it("throws error when deleting user fails", async () => {
    mock.onDelete("/users/1/").networkError();

    await expect(deleteUser(1)).rejects.toThrow();
  });
});