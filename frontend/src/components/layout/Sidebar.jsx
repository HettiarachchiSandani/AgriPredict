import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../../assets/logo.png";

import { 
  MdDashboard,
  MdCalendarToday,
  MdAnalytics,
  MdListAlt,
  MdAssessment,
  MdPeople,
  MdHelpOutline,
  MdSettings,
  MdInventory,
  MdShoppingCart,
  MdLogout
} from "react-icons/md";

export default function Sidebar({ role, isSidebarOpen, toggleSidebar, isMobile }) {

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;

    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, isMobile, toggleSidebar]);

  const menu = {
    owner: [
      { label: "Dashboard", to: "/owner/dashboard", icon: <MdDashboard /> },
      { label: "Batches", to: "/owner/batches", icon: <MdListAlt /> },
      { label: "Daily Operations", to: "/owner/daily-ops", icon: <MdCalendarToday /> },
      { label: "Predictions", to: "/owner/predictions", icon: <MdAnalytics /> },
      { label: "Records", to: "/owner/records", icon: <MdListAlt /> },
      { label: "Reports", to: "/owner/reports", icon: <MdAssessment /> },
      { label: "Buyers", to: "/owner/buyers", icon: <MdShoppingCart /> },
      { label: "Staff", to: "/owner/staff", icon: <MdPeople /> },
      { label: "Feedstock", to: "/owner/feedstock", icon: <MdInventory /> },
    ],
    manager: [
      { label: "Dashboard", to: "/manager/dashboard", icon: <MdDashboard /> },
      { label: "Batches", to: "/manager/batches", icon: <MdListAlt /> },
      { label: "Daily Operations", to: "/manager/daily-ops", icon: <MdCalendarToday /> },
      { label: "Predictions", to: "/manager/predictions", icon: <MdAnalytics /> },
      { label: "Records", to: "/manager/records", icon: <MdListAlt /> },
      { label: "Reports", to: "/manager/reports", icon: <MdAssessment /> },
      { label: "Buyers", to: "/manager/buyers", icon: <MdShoppingCart /> },
      { label: "Feedstock", to: "/manager/feedstock", icon: <MdInventory /> },
    ],
    buyer: [
      { label: "Dashboard", to: "/buyer/dashboard", icon: <MdDashboard /> },
      { label: "Make Request", to: "/buyer/make-request", icon: <MdShoppingCart /> },
      { label: "Order History", to: "/buyer/order-history", icon: <MdListAlt /> },
    ],
  };

  const bottomMenu = [
    { label: "Help Centre", to: `/common/help-centre`, icon: <MdHelpOutline /> },
    { label: "Settings", to: `/common/settings`, icon: <MdSettings /> },
    { label: "Logout", to: `/common/logout`, icon: <MdLogout /> },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}
    >
      
      <div className="logo">
        <img src={logo} alt="Farm Logo" />
      </div>

      <nav className="menu">
        {menu[role]?.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
            onClick={isMobile ? toggleSidebar : undefined}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="bottom-menu">
        {bottomMenu.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
            onClick={isMobile ? toggleSidebar : undefined}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}