import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewManager from "./RegisterManager";
import * as managersAPI from "@/api/managersAPI";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/api/managersAPI", () => ({
  addManager: vi.fn(),
  getManagers: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

global.alert = vi.fn();

describe("NewManager Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText("Enter first name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter last name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("07X XXX XXXX"), {
      target: { value: "0712345678" },
    });
    fireEvent.change(screen.getByLabelText("Date of Birth"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(screen.getByPlaceholderText("NIC number"), {
      target: { value: "123456789V" },
    });
    fireEvent.change(screen.getByPlaceholderText("example@email.com"), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "123456" },
    });
  };

  const renderComponent = (setManagers = vi.fn()) => {
    render(
      <MemoryRouter>
        <NewManager managers={[]} setManagers={setManagers} />
      </MemoryRouter>
    );
  };

  it("renders form correctly", () => {
    renderComponent();
    expect(screen.getByText("Register Manager")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("shows validation errors when required fields are empty", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("submits form successfully", async () => {
    managersAPI.addManager.mockResolvedValue({});
    managersAPI.getManagers.mockResolvedValue([]);
    const mockSetManagers = vi.fn();
    renderComponent(mockSetManagers);
    fillRequiredFields();
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(managersAPI.addManager).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Manager added successfully!");
    });
  });

  it("handles API error", async () => {
    managersAPI.addManager.mockRejectedValue({
      response: {
        data: { email: ["Email already exists"] },
      },
    });
    renderComponent();
    fillRequiredFields();
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("navigates when cancel button clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockNavigate).toHaveBeenCalledWith("/owner/staff");
  });

  it("shows loading state while submitting", async () => {
    let resolveFn;
    managersAPI.addManager.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve;
      })
    );
    managersAPI.getManagers.mockResolvedValue([]); 

    renderComponent();
    fillRequiredFields();

    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Saving...")).toBeInTheDocument();

    resolveFn({});

    expect(await screen.findByText("Save")).toBeInTheDocument();
  });
});