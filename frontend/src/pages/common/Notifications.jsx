import React, { useState, useEffect } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your order #O001 has been delivered." },
    { id: 2, message: "New batch added to your farm." },
    { id: 3, message: "Weekly report is ready." },
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((note) => (
            <li key={note.id}>{note.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
