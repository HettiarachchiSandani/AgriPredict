import api from "./api"; 

// Get all batches
export const getBatches = async () => {
  try {
    const response = await api.get("/batches/batches/");
    return response.data;
  } catch (error) {
    console.error("Error fetching batches:", error.response?.data || error.message);
    return [];
  }
};

// Get all breeds
export const getBreeds = async () => {
  try {
    const response = await api.get("/batches/breeds/");
    return response.data;
  } catch (error) {
    console.error("Error fetching breeds:", error.response?.data || error.message);
    return [];
  }
};

// Get details of a particular batch
export const getBatchDetails = async (batchId) => {
  try {
    const response = await api.get(`/batches/batches/${batchId}/details/`);
    if (!response.data) return null;

    const data = response.data;

    return {
      batchid: data.batchid,
      batchname: data.batchname,
      breedname: data.breedname,
      eggtype: data.eggtype,
      startdate: data.startdate,
      status: data.status,
      note: data.note || "",

      initial_male: data.initial_male || 0,
      initial_female: data.initial_female || 0,
      initial_total: data.initial_total || (data.initial_male || 0) + (data.initial_female || 0),

      current_male: data.current_male || 0,
      current_female: data.current_female || 0,
      current_total: data.current_total || (data.current_male || 0) + (data.current_female || 0),

      mortality_male: data.mortality_male || 0,
      mortality_female: data.mortality_female || 0,
      total_mortality: data.total_mortality || 0,

      total_eggs: data.total_eggs || 0,
      total_feed: data.total_feed || 0,
      avg_eggs_per_bird: data.avg_eggs_per_bird || 0,
      feed_per_bird: data.feed_per_bird || 0,
      mortality_rate: data.mortality_rate || 0,
    };
  } catch (error) {
    console.error(`Error fetching batch details for ${batchId}:`, error.response?.data || error.message);
    return null;
  }
};

// Add a new batch
export const addBatch = async (batchData) => {
  try {
    const payload = {
      batchname: batchData.batchname,
      breed: batchData.breed,
      startdate: batchData.startdate,
      initial_male: batchData.initial_male || 0,
      initial_female: batchData.initial_female || 0,
      current_male: batchData.current_male ?? batchData.initial_male ?? 0,
      current_female: batchData.current_female ?? batchData.initial_female ?? 0,
      status: batchData.status || "Active",
      note: batchData.note || "",
    };
    const response = await api.post("/batches/batches/", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding batch:", error.response?.data || error.message);
    throw error;
  }
};

// Update a batch
export const updateBatch = async (batchId, batchData) => {
  try {
    const payload = {
      batchname: batchData.batchname,
      breed: batchData.breed,
      startdate: batchData.startdate,
      initial_male: batchData.initial_male || 0,
      initial_female: batchData.initial_female || 0,
      current_male: batchData.current_male || 0,
      current_female: batchData.current_female || 0,
      status: batchData.status || "Active",
      note: batchData.note || "",
    };

    const response = await api.put(`/batches/batches/${batchId}/`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating batch ${batchId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a batch
export const deleteBatch = async (batchId) => {
  try {
    await api.delete(`/batches/batches/${batchId}/`);
  } catch (error) {
    console.error(`Error deleting batch ${batchId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Get batch performance scores
export const getBatchPerformance = async () => {
  try {
    const response = await api.get("/batches/batches/performance/");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching batch performance:",
      error.response?.data || error.message
    );
    return [];
  }
};