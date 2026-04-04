import api from "./api";

// Get all notifications
export const getNotifications = () =>
  api.get("core/notifications/unread/");

// export const getNotifications = () => api.get("core/notifications/");

// Get unread notifications and count
export const getUnreadCount = async () => {
  try {
    const res = await api.get("core/notifications/unread_count/");
    return res; 
  } catch (err) {
    console.error("Error fetching unread count:", err);
    return { data: { unread_count: 0 } }; 
  }
};

// Mark a notification as read
export const markAsRead = (id) =>
  api.post(`core/notifications/${id}/mark_as_read/`);