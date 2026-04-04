import React from "react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Logout.css";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleYes = () => {
    logout();
  };

  const handleNo = () => {
    navigate(-1);
  };

  return (
    <div className="logout-wrapper">
      <div className="logout-card">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to logout?</p>

        <div className="logout-actions">
          <button className="btn-logout" onClick={handleYes}>
            Yes, Logout
          </button>
          <button className="btn-cancel" onClick={handleNo}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}