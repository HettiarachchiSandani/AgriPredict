import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import DailyOperation from "./DailyOperations";

vi.mock("@/api/dailyOperationsAPI", () => {
  const addDailyOperation = vi.fn(() =>
    Promise.resolve({ id: 1 })
  );

  return {
    addDailyOperation,
    getBatches: vi.fn(() =>
      Promise.resolve([
        {
          batchid: "1",
          batchname: "Batch A",
          current_male: 100,
          current_female: 100,
          start_date: "2024-01-01"
        }
      ])
    ),
    getFeedStocks: vi.fn(() =>
      Promise.resolve([
        {
          stockid: 1,
          feedtype: "Type A",
          quantity: 500
        }
      ])
    ),
  };
});

import { addDailyOperation } from "@/api/dailyOperationsAPI";

describe("DailyOperation", () => {

  it("renders form fields", async () => {
    render(<DailyOperation />);

    expect(await screen.findByText("Daily Farm Operations")).toBeInTheDocument();

    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Batch")).toBeInTheDocument();
    expect(screen.getByLabelText("Feed Type")).toBeInTheDocument();
  });

  it("updates input values", async () => {
    const user = userEvent.setup();
    render(<DailyOperation />);

    await user.type(screen.getByLabelText("Date"), "2024-04-01");

    expect(screen.getByLabelText("Date")).toHaveValue("2024-04-01");
  });

  it("shows alert if required fields are missing", async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<DailyOperation />);

    const saveButton = screen.getByRole("button", { name: /save/i });

    await user.click(saveButton);

    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
        "Batch, Feed Type, and Date are required."
        );
    });
    });

  it("submits form successfully", async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<DailyOperation />);

    await user.type(screen.getByLabelText("Date"), "2024-04-01");

    await user.selectOptions(screen.getByLabelText("Batch"), "1");
    await user.selectOptions(screen.getByLabelText("Feed Type"), "Type A");

    await user.type(screen.getByLabelText("Feed Usage (kg)"), "10");
    await user.type(screen.getByLabelText("Male Mortality"), "1");
    await user.type(screen.getByLabelText("Female Mortality"), "1");

    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalled();
    });
  });

  it("calls API with correct payload", async () => {
    const user = userEvent.setup();

    render(<DailyOperation />);

    await user.type(screen.getByLabelText("Date"), "2024-04-01");

    await user.selectOptions(screen.getByLabelText("Batch"), "1");
    await user.selectOptions(screen.getByLabelText("Feed Type"), "Type A");

    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(addDailyOperation).toHaveBeenCalled();
    });
  });

});