import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordConfirm from "./pages/auth/ResetPasswordConfirm";

import { ownerRoutes } from "./routes/OwnerRoutes";
import { managerRoutes } from "./routes/ManagerRoutes";
import { buyerRoutes } from "./routes/BuyerRoutes";
import { commonRoutes } from "./routes/CommonRoutes";

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading || user === undefined) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.roleid === "A002" ? (
              <Navigate to="/owner/dashboard" replace />
            ) : user.roleid === "A003" ? (
              <Navigate to="/manager/dashboard" replace />
            ) : user.roleid === "B001" ? (
              <Navigate to="/buyer/dashboard" replace />
            ) : (
              <Login />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/reset-password-confirm/:uid/:token"
        element={<ResetPasswordConfirm />}
      />

      {ownerRoutes}
      {managerRoutes}
      {buyerRoutes}
      {commonRoutes}

      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default App;