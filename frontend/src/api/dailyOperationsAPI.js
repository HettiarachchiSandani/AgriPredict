import api from "./api"; 

// Fetch all batches
export const getBatches = async () => {
  try {
    const response = await api.get("/batches/batches/active/");
    return response.data;
  } catch (error) {
    console.error("Error fetching batches:", error.response?.data || error.message);
    return [];
  }
};

// Fetch all feed stocks
export const getFeedStocks = async () => {
  try {
    const response = await api.get("/feed/feedstocks/");
    return response.data;
  } catch (error) {
    console.error("Error fetching feed stocks:", error.response?.data || error.message);
    return [];
  }
};

export const addDailyOperation = async (payload) => {
  try {
    const response = await api.post("/batches/dailyoperations/", payload);
    return response.data;
  } catch (error) {
    return Promise.reject(
      error.response?.data || { detail: "Something went wrong" }
    );
  }
};

export const getDailyOperationByOperationId = async (operationid) => {
  try {
    const response = await api.get(`/batches/dailyoperations/${operationid}/`);
    return response.data; 
  } catch (error) {
    console.error(
      `Error fetching daily operation ${operationid}:`,
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

export const getDailySummary = async () => {
  try {
    const response = await api.get("/batches/daily_summary/summary/");
    return response.data;
  } catch (error) {
    console.error("Error fetching daily summary:", error.response?.data || error.message);
    return null;
  }
};