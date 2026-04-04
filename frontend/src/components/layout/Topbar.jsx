import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MdNotifications, MdMenu } from "react-icons/md";
import "./Topbar.css";
import {
  getUnreadCount,
  getNotifications,
  markAsRead,
} from "@/api/notificationAPI";
import notificationSound from "../../assets/notification.mp3";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Topbar({ role, loading, toggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const pageNames = {
    "/owner/dashboard": "Dashboard",
    "/owner/batches": "Batches",
    "/owner/batches/add": "Batches",
    "/owner/daily-ops": "Daily Operations",
    "/owner/predictions": "Predictions",
    "/owner/records": "Records",
    "/owner/reports": "Reports",
    "/owner/buyers": "Buyers",
    "/owner/staff": "Staff",
    "/owner/feedstock": "Feedstock",

    "/manager/dashboard": "Dashboard",
    "/manager/batches": "Batches",
    "/manager/batches/add": "Batches",
    "/manager/daily-ops": "Daily Operations",
    "/manager/predictions": "Predictions",
    "/manager/records": "Records",
    "/manager/reports": "Reports",
    "/manager/buyers": "Buyers",
    "/manager/staff": "Staff",
    "/manager/feedstock": "Feedstock",

    "/buyer/dashboard": "Dashboard",
    "/buyer/make-request": "Make Request",
    "/buyer/order-history": "Order History",

    "/common/settings": "Settings",
    "/common/help-centre": "Help Centre",
    "/common/logout": "Logout",
  };

  let pageName = pageNames[location.pathname] || "Dashboard";

  if (
    location.pathname.startsWith("/owner/batches/edit/") ||
    location.pathname.startsWith("/owner/batches/view/")
  )
    pageName = "Batches";

  if (
    location.pathname.startsWith("/owner/buyers/add") ||
    location.pathname.startsWith("/owner/buyers/request") ||
    location.pathname.startsWith("/owner/buyers/order-history")
  )
    pageName = "Buyers";

  if (location.pathname.startsWith("/owner/staff/add")) pageName = "Staff";

  if (
    location.pathname.startsWith("/manager/batches/edit/") ||
    location.pathname.startsWith("/manager/batches/view/")
  )
    pageName = "Batches";

  if (
    location.pathname.startsWith("/manager/buyers/add") ||
    location.pathname.startsWith("/manager/buyers/request") ||
    location.pathname.startsWith("/manager/buyers/order-history")
  )
    pageName = "Buyers";

  const firstName = user?.firstname || "";
  const lastName = user?.lastname || "";

  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : "";

  const avatarLetter = firstName
    ? firstName.charAt(0).toUpperCase()
    : "?";

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const prevCountRef = useRef(0);

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      const newCount = res.data.unread_count;

      if (newCount > prevCountRef.current) {
        console.log("🔔 New notification!");

        if (user?.soundEnabled && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.5;
          audioRef.current.play().catch((err) => {
            console.log("Audio error:", err);
          });
        }
      }

      prevCountRef.current = newCount;
      setUnreadCount(newCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDropdown = async () => {
    const newState = !showDropdown;
    setShowDropdown(newState);

    if (newState) {
      try {
        const res = await getNotifications();
        setNotificationList(res.data);

        const unread = res.data.filter((n) => !n.isread);

        await Promise.all(
          unread.map((n) => markAsRead(n.notificationid))
        );

        setNotificationList((prev) =>
          prev.map((n) => ({ ...n, isread: true }))
        );

        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markAsRead(notification.notificationid);

      setNotificationList((prev) =>
        prev.map((n) =>
          n.notificationid === notification.notificationid
            ? { ...n, isread: true }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);
    }
  };

  const hasNotifications = notificationList.length > 0;

  return (
    <header
      className="topbar"
      style={{
        left:
          isSidebarOpen && window.innerWidth > 1024
            ? "250px"
            : "0",
        width:
          isSidebarOpen && window.innerWidth > 1024
            ? "calc(100% - 250px)"
            : "100%",
      }}
    >
      <div className="topbar-content">
        <div className="topbar-left">
          <button
            className="hamburger-btn"
            onClick={toggleSidebar}
            style={{
              display:
                !isSidebarOpen || window.innerWidth <= 1024
                  ? "block"
                  : "none",
            }}
          >
            <MdMenu size={28} />
          </button>

          <h1 className="dashboard-title">{pageName}</h1>
        </div>

        <div className="topbar-right">
          <div
            ref={dropdownRef}
            className={`notification-icon ${
              hasNotifications ? "active" : ""
            }`}
            onClick={handleToggleDropdown}
          >
            <MdNotifications size={24} />

            {showDropdown && (
              <div className="notification-dropdown">
                {notificationList.length === 0 ? (
                  <div className="notification-item empty">
                    <p>No notifications available</p>
                  </div>
                ) : (
                  notificationList.map((n) => (
                    <div
                      key={n.notificationid}
                      className={`notification-item ${
                        n.isread ? "read" : "unread"
                      } ${n.type?.toLowerCase()}`}
                      onClick={() =>
                        handleNotificationClick(n)
                      }
                    >
                      <p>{n.message}</p>
                      <small>{n.type}</small>

                      {!n.isread && (
                        <span className="dot"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="user-info">
            <div className="user-avatar">{avatarLetter}</div>

            <div className="user-details">
              <span className="user-name">
                {loading ? "Loading..." : user ? fullName : "Guest"}
              </span>

              <span className="user-role">
                {role
                  ? role.charAt(0).toUpperCase() +
                    role.slice(1)
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}