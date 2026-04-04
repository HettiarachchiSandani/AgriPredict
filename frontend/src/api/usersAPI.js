import api from "./api"; 

//GET
export const getUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return [];
  }
};

//GET Single User
export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
    return null;
  }
};

//ADD
export const addUser = async (userData) => {
  try {
    const payload = {
      firstname: userData.firstname,
      lastname: userData.lastname || null,
      email: userData.email,
      phonenumber: userData.phonenumber || null,
      password: userData.password, 
      is_staff: userData.is_staff || false,
      is_active: userData.is_active ?? true,
      roleid: userData.roleid,
      note: userData.note || null,
      nic: userData.nic || null,
      gender: userData.gender || null,
      dob: userData.dob || null,
    };

    const response = await api.post("/users/", payload);
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error.response?.data || error.message);
    throw error;
  }
};

//UPDATE
export const updateUser = async (userId, userData) => {
  try {
    const payload = {
      firstname: userData.firstname,
      lastname: userData.lastname || null,
      email: userData.email,
      phonenumber: userData.phonenumber || null,
      is_staff: userData.is_staff,
      is_active: userData.is_active,
      note: userData.note || null,
      nic: userData.nic || null,
      gender: userData.gender || null,
      dob: userData.dob || null,
    };

    if (userData.password) payload.password = userData.password;

    const response = await api.put(`/users/${userId}/`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};

//DELETE
export const deleteUser = async (userId) => {
  try {
    await api.delete(`/users/${userId}/`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    throw error;
  }
};