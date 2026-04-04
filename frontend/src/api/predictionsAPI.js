import api from "./api";

// POST to predict next day
export const generatePrediction = async (payload) => {
  const res = await api.post("/predictions/predict_next_day/", payload); 
  return res.data;
};

// GET all predictions
export const getPredictions = async () => {
  const res = await api.get("/predictions/"); 
  return res.data;
};

// Get next day prediction
export const getPredictedTotalToday = async () => {
  const res = await api.get("/predictions/predict_total_today/");
  return res.data; 
};

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