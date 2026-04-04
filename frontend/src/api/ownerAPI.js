import axios from "axios";
const BASE_URL = "http://127.0.0.1:8000/api";

// Get all batches
export const getBatches = async () => {
  const res = await axios.get(`${BASE_URL}/owner-manager-batches/`);
  return res.data;
};

// Get all feedstocks
export const getFeedstocks = async () => {
  const res = await axios.get(`${BASE_URL}/owner-manager-feedstocks/`);
  return res.data;
};

// Get all daily operations
export const getDailyOperations = async () => {
  const res = await axios.get(`${BASE_URL}/daily-operations/`);
  return res.data;
};

// Get predictions 
export const getPredictions = async (batchid) => {
  const res = await axios.get(`${BASE_URL}/predictions/?batchid=${batchid}`);
  return res.data.length > 0 ? res.data[0] : { predictedeggcount: 0 };
};