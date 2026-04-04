import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ManagersList from "./ManagersList";
import * as managersAPI from "@/api/managersAPI";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/managersAPI", () => ({
  getManagers: vi.fn(),
  updateManager: vi.fn(),
  deleteManager: vi.fn(),
}));

describe("ManagersList", () => {
  const sampleManagers = [
    {
      managerid: "M001",
      user_details: {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        phonenumber: "0712345678",
        nic: "123456",
        gender: "Male",
        dob: "2000-01-01",
        note: "Note 1",
        is_active: true,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders managers after loading", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading managers/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  test("filters by search", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.change(screen.getByPlaceholderText(/search managers/i), {
      target: { value: "John" },
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("filters by status", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.change(screen.getByDisplayValue("All Status"), {
      target: { value: "Inactive" },
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  test("opens edit modal", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getByLabelText("edit manager"));

    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
  });

  test("calls updateManager on save", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);
    managersAPI.updateManager.mockResolvedValue({});

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getByLabelText("edit manager"));

    fireEvent.change(screen.getByDisplayValue("John"), {
      target: { value: "Johnny", name: "firstname" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(managersAPI.updateManager).toHaveBeenCalled();
    });
  });

  test("calls deleteManager", async () => {
    managersAPI.getManagers.mockResolvedValue(sampleManagers);
    managersAPI.deleteManager.mockResolvedValue({});

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <ManagersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getByLabelText("delete manager"));

    await waitFor(() => {
      expect(managersAPI.deleteManager).toHaveBeenCalledWith("M001");
    });
  });

    test("navigates to add manager", async () => {
    managersAPI.getManagers.mockResolvedValue([]);

    render(
        <MemoryRouter>
        <ManagersList />
        </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText(/add manager/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/add manager/i));

    expect(mockNavigate).toHaveBeenCalledWith("/owner/staff/add");
    });
});