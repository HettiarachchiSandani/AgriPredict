import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BatchManagement from "./BatchList";
import * as batchAPI from "@/api/batchAPI";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/batchAPI");

describe("BatchManagement Component", () => {
  const batchesMock = [
    {
      batchid: "1",
      batchname: "Batch One",
      breedname: "Layer",
      startdate: "2025-01-01T00:00:00Z",
      initialcount: 100,
      currentcount: 95,
      status: "Active",
    },
    {
      batchid: "2",
      batchname: "Batch Two",
      breedname: "Layer",
      startdate: "2025-02-01T00:00:00Z",
      initialcount: 80,
      currentcount: 70,
      status: "Completed",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    batchAPI.getBatches.mockResolvedValue(batchesMock);
    batchAPI.deleteBatch.mockResolvedValue({});
  });

  test("renders batch table with fetched data", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading batches/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Batch One")).toBeInTheDocument();
      expect(screen.getByText("Batch Two")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBe(3); 
    });
  });

  test("search filters batches", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.change(screen.getByPlaceholderText(/search batches/i), {
      target: { value: "Two" },
    });

    expect(screen.queryByText("Batch One")).not.toBeInTheDocument();
    expect(screen.getByText("Batch Two")).toBeInTheDocument();
  });

  test("status filter works", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.change(screen.getByDisplayValue("All Status"), {
      target: { value: "Completed" },
    });

    expect(screen.queryByText("Batch One")).not.toBeInTheDocument();
    expect(screen.getByText("Batch Two")).toBeInTheDocument();
  });

  test("clicking Add Batch navigates to add page", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Add Batch"));

    fireEvent.click(screen.getByText(/add batch/i));
    expect(mockNavigate).toHaveBeenCalledWith("/manager/batches/add");
  });

  test("clicking Edit navigates to edit page", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[0]); 
    expect(mockNavigate).toHaveBeenCalledWith("/manager/batches/edit/1");
  });

  test("clicking View navigates to view page", async () => {
    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[1]); 
    expect(mockNavigate).toHaveBeenCalledWith("/manager/batches/view/1");
  });

  test("clicking Delete removes batch after confirm", async () => {
    window.confirm = vi.fn(() => true); 

    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[2]); 

    await waitFor(() => {
      expect(batchAPI.deleteBatch).toHaveBeenCalledWith("1");
      expect(screen.queryByText("Batch One")).not.toBeInTheDocument();
    });
  });

  test("clicking Delete cancels if confirm is false", async () => {
    window.confirm = vi.fn(() => false); 

    render(
      <MemoryRouter>
        <BatchManagement />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Batch One"));

    fireEvent.click(screen.getAllByRole("button", { name: "" })[2]);

    expect(batchAPI.deleteBatch).not.toHaveBeenCalled();
    expect(screen.getByText("Batch One")).toBeInTheDocument();
  });
});