import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BuyersList from "./BuyersList";
import * as buyersAPI from "@/api/buyersAPI";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    NavLink: ({ children }) => <span>{children}</span>,
  };
});

vi.mock("@/api/buyersAPI", () => ({
  getBuyers: vi.fn(),
  addBuyer: vi.fn(),
  updateBuyer: vi.fn(),
  deleteBuyer: vi.fn(),
}));

describe("BuyersList Component", () => {
  const sampleBuyers = [
    {
      buyerid: "B001",
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      phonenumber: "0712345678",
      company: "TestCo",
      address: "Address 1",
      note: "Note 1",
      is_active: true,
    },
    {
      buyerid: "B002",
      firstname: "Jane",
      lastname: "Smith",
      email: "jane@example.com",
      phonenumber: "0723456789",
      company: "TestCo2",
      address: "Address 2",
      note: "Note 2",
      is_active: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders buyers table after fetching", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading buyers/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test("opens modal with buyer info when edit clicked", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[0]); 

    await waitFor(() => {
      expect(screen.getByPlaceholderText("First Name")).toHaveValue("John");
      expect(screen.getByPlaceholderText("Email")).toHaveValue("john@example.com");
    });
  });

  test("filters buyers by search term", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.change(screen.getByPlaceholderText(/search buyers/i), {
      target: { value: "Jane" },
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("filters buyers by status", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.change(screen.getByDisplayValue("All Status"), {
      target: { value: "Inactive" },
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("delete buyer calls deleteBuyer API and removes from table", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);
    buyersAPI.deleteBuyer.mockResolvedValue({});

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[1]); 

    await waitFor(() => {
      expect(buyersAPI.deleteBuyer).toHaveBeenCalledWith("B001");
    });
  });

  test("cancel button closes modal", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[0]); 

    await waitFor(() => screen.getByPlaceholderText("First Name"));

    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByPlaceholderText("First Name")).not.toBeInTheDocument();
  });

  test("save button calls updateBuyer API when editing", async () => {
    buyersAPI.getBuyers.mockResolvedValue(sampleBuyers);
    buyersAPI.updateBuyer.mockResolvedValue({});

    render(
      <MemoryRouter>
        <BuyersList />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("John Doe"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[0]); 

    await waitFor(() => screen.getByPlaceholderText("First Name"));

    fireEvent.change(screen.getByPlaceholderText("First Name"), {
      target: { value: "Johnny" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(buyersAPI.updateBuyer).toHaveBeenCalledWith("B001", expect.objectContaining({
        firstname: "Johnny",
        is_active: true,
      }));
    });
  });
});