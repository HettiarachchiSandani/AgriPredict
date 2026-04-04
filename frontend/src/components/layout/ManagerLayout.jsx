import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./OwnerLayout.css"; 
import { AuthContext } from "../../context/AuthContext";

export default function ManagerLayout({ children }) {
  const { user, loading } = useContext(AuthContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

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

  const getTopMargin = () => {
    if (window.innerWidth <= 768) return "70px";
    if (window.innerWidth <= 1024) return "80px";
    return "90px";
  };

  const getPadding = () => {
    if (window.innerWidth <= 768) return "15px 20px";
    if (window.innerWidth <= 1024) return "20px 25px";
    return "25px 35px";
  };

  return (
    <div className="layout-container">
      <Sidebar
        role="manager"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <div className={`main-area ${!isSidebarOpen || isMobile ? "sidebar-closed" : ""}`}>
        <Topbar
          role="manager"
          user={user} 
          loading={loading}
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />

        <div
          className="content-wrapper"
          style={{ marginTop: getTopMargin(), padding: getPadding() }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}