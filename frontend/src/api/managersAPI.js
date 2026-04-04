import api from "./api"; 
const BASE_PATH = "/owners/managers/";

// GET all managers
export const getManagers = async () => {
  try {
    const res = await api.get(BASE_PATH);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching managers:", error.response?.data || error.message);
    return [];
  }
};

// ADD a manager
export const addManager = async (managerData) => {
  try {
    const res = await api.post(BASE_PATH, managerData);
    return res.data;
  } catch (error) {
    console.error(
      "addManager error:",
      error.response?.data ? JSON.stringify(error.response.data) : error.message
    );
    throw error;
  }
};

// UPDATE a manager
export const updateManager = async (managerId, userData) => {
  try {
    const res = await api.put(`${BASE_PATH}${managerId}/`, userData);
    return res.data;
  } catch (error) {
    console.error(
      `updateManager error for ${managerId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// DELETE a manager
export const deleteManager = async (managerId) => {
  try {
    await api.delete(`${BASE_PATH}${managerId}/`);
  } catch (error) {
    console.error("deleteManager error for", managerId, error.response?.data || error.message);
    throw error;
  }
};