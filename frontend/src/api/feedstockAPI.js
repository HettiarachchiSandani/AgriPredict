import api from "./api"; 

// Get all feed stocks
export const getFeedStocks = async () => {
  try {
    const response = await api.get("/feed/feedstocks/");
    return response.data;
  } catch (error) {
    console.error("Error fetching feed stocks:", error);
    return [];
  }
};

// Add a new feed stock
export const addFeedStock = async (feedStockData) => {
  try {
    const response = await api.post("/feed/feedstocks/", feedStockData); 
    return response.data;
  } catch (error) {
    console.error("Error adding feed stock:", error.response?.data || error.message);
    throw error;
  }
};

// Update a feed stock
export const updateFeedStock = async (stockid, feedStockData) => {
  try {
    if ("stockid" in feedStockData) delete feedStockData.stockid; 
    const response = await api.put(`/feed/feedstocks/${stockid}/`, feedStockData);
    return response.data;
  } catch (error) {
    console.error(`Error updating feed stock ${stockid}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a feed stock
export const deleteFeedStock = async (stockid) => {
  try {
    await api.delete(`/feed/feedstocks/${stockid}/`);
  } catch (error) {
    console.error(`Error deleting feed stock ${stockid}:`, error);
    throw error;
  }
};