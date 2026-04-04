import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import EditBatch from "./AddBatch";
import * as batchAPI from "@/api/batchAPI";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({ id: null })),
  };
});

vi.mock("@/api/batchAPI");

describe("EditBatch Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const breedsMock = [
    { breedid: "1", breedname: "Breed A", eggtype: "Large" },
  ];

  const batchMock = [
    {
      batchid: "1",
      batchname: "Old Batch",
      breed: "1",
      startdate: "2025-01-01T00:00:00Z",
      initial_male: 5,
      initial_female: 5,
      current_male: 5,
      current_female: 5,
      status: "Active",
      note: "Some note",
    },
  ];

  test("calls addBatch on submit (add mode)", async () => {
    vi.mocked(useParams).mockReturnValue({ id: null });

    batchAPI.getBreeds.mockResolvedValue(breedsMock);
    batchAPI.addBatch.mockResolvedValue({ batchid: "2" });
    batchAPI.getBatches.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <EditBatch />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /breed/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/batch name/i), { target: { value: "New Batch" } });
    fireEvent.change(screen.getByRole("combobox", { name: /breed/i }), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: "2025-01-01" } });
    fireEvent.change(screen.getByLabelText(/initial female/i), { target: { value: 5 } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(batchAPI.addBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          batchname: "New Batch",
          breed: "1",
          startdate: "2025-01-01",
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/owner/batches");
    });
  });

  test("calls updateBatch when editing", async () => {
    vi.mocked(useParams).mockReturnValue({ id: "1" });

    batchAPI.getBreeds.mockResolvedValue(breedsMock);
    batchAPI.getBatches.mockResolvedValue(batchMock);
    batchAPI.updateBatch.mockResolvedValue(batchMock[0]);

    render(
      <MemoryRouter initialEntries={["/edit/1"]}>
        <Routes>
          <Route path="/edit/:id" element={<EditBatch />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/batch name/i)).toHaveValue("Old Batch");
    });

    fireEvent.change(screen.getByLabelText(/batch name/i), { target: { value: "Updated Batch" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(batchAPI.updateBatch).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ batchname: "Updated Batch" })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/owner/batches");
    });
  });
});