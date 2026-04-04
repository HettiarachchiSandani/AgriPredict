import api from "./api";
const BASE_PATH = "orders/buyers/";

// Get all buyers
export const getBuyers = async () => {
  try {
    const res = await api.get(BASE_PATH);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching buyers:", error.response?.data || error.message);
    return [];
  }
};

// Add a new buyer
export const addBuyer = async (buyerData) => {
  try {
    const payload = {
      email: buyerData.email,
      password: buyerData.password,
      firstname: buyerData.firstname,
      lastname: buyerData.lastname,
      phonenumber: buyerData.phonenumber,
      nic: buyerData.nic,
      gender: buyerData.gender,
      dob: buyerData.dob,
      note: buyerData.note,
      company: buyerData.company,
      address: buyerData.address,
      is_active: buyerData.is_active ?? true,
    };

    const res = await api.post(BASE_PATH, payload);
    return res.data;
  } catch (error) {
    console.error("addBuyer error:", error.response?.data || error.message);
    throw error;
  }
};

// Update a buyer
export const updateBuyer = async (buyerId, buyerData) => {
  try {
    const payload = {
      firstname: buyerData.firstname,
      lastname: buyerData.lastname,
      email: buyerData.email,
      phonenumber: buyerData.phonenumber,
      nic: buyerData.nic,
      gender: buyerData.gender,
      dob: buyerData.dob,
      note: buyerData.note,
      company: buyerData.company,
      address: buyerData.address,
      is_active: buyerData.is_active ?? true,
    };

    const res = await api.put(`${BASE_PATH}${buyerId}/`, payload);
    return res.data;
  } catch (error) {
    console.error(`updateBuyer error for ${buyerId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete a buyer
export const deleteBuyer = async (buyerId) => {
  try {
    await api.delete(`${BASE_PATH}${buyerId}/`);
  } catch (error) {
    console.error("deleteBuyer error for", buyerId, error.response?.data || error.message);
    throw error;
  }
};