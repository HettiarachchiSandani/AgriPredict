import api from "./api";

// Get all reports
export const getReports = async () => {
  try {
    const response = await api.get("/reports/reports/");
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    } else if (Array.isArray(data.results)) {
      return data.results;
    } else {
      console.error("Invalid reports response:", data);
      return [];
    }
  } catch (error) {
    console.error(
      "Error fetching reports:",
      error.response?.data || error.message
    );
    return [];
  }
};

// Generate reports
export const generateReport = async (payload) => {
  try {
    const response = await api.post("/reports/reports/generate/", payload);
    return response.data;
  } catch (error) {
    return Promise.reject(
      error.response?.data || { detail: "Something went wrong" }
    );
  }
};

// Dowanload reprots
export const downloadReport = async (payload) => {
  try {
    const response = await api.post("/reports/reports/download/", payload, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading report:", error);
    throw error;
  }
};