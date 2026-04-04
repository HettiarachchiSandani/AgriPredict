import api from "./api";

// Get all orders
export const getOrders = async () => {
  try {
    const res = await api.get("orders/orders/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching orders:", error.response?.data || error.message);
    return [];
  }
};

// Add order
export const addOrder = async (orderData) => {
  try {
    const res = await api.post("orders/orders/", orderData);
    return res.data;
  } catch (error) {
    console.error("Error adding order:", error.response?.data || error.message);
    throw error;
  }
};

// Update order
export const updateOrder = async (orderid, orderData) => {
  try {
    const res = await api.put(`orders/orders/${orderid}/`, orderData);
    return res.data;
  } catch (error) {
    console.error(`Error updating order ${orderid}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderid) => {
  try {
    const res = await api.delete(`orders/orders/${orderid}/`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting order ${orderid}:`, error.response?.data || error.message);
    throw error;
  }
};

// Get orders with available eggs
export const getOrdersWithAvailableEggs = async () => {
  try {
    const res = await api.get("orders/orders/with-available-eggs/");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching orders with available eggs:", error.response?.data || error.message);
    return [];
  }
};