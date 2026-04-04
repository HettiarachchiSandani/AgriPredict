import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./OwnerLayout.css";

export default function CommonLayout({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const roleMap = {
    A002: "owner",
    A003: "manager",
    B001: "buyer",
  };
  const roleStr = roleMap[user?.roleid] || null;

  return (
    <div className="layout-container">
      <Sidebar
        role={roleStr}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <div className={`main-area ${!isSidebarOpen || isMobile ? "sidebar-closed" : ""}`}>
        <Topbar
          role={roleStr}
          user={user}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />

        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}