import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );

  if (!user) return <Navigate to="/" replace />;

  if (role && role !== "any" && user.roleid?.trim() !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;