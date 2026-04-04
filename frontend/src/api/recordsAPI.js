import api from "./api";

// Get all records
export const getRecords = async () => {
  try {
    const response = await api.get("reports/records/");
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};

// Get record by id
export const getRecordById = async (recordId) => {
  try {
    const response = await api.get(`reports/records/${recordId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching record ${recordId}:`, error);
    throw error;
  }
};

// Blockchain vrification
export const verifyBlockchain = async () => {
  try {
    const response = await api.get("reports/records/verify/");
    return response.data; 
  } catch (error) {
    console.error("Blockchain verification failed:", error);
    throw error;
  }
};
