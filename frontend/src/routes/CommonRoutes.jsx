import React from "react";
import { Route } from "react-router-dom";

import Settings from "../pages/common/Settings.jsx";
import HelpCentre from "../pages/common/HelpCentre.jsx";
import Notifications from "../pages/common/Notifications.jsx";
import Logout from "../pages/common/Logout.jsx";

import ProtectedRoute from "../context/ProtectedRoute.jsx";
import CommonLayout from "../components/layout/CommonLayout.jsx";
import useAuth from "../hooks/useAuth";

function CommonPage({ Component }) {
  const { user } = useAuth(); 
  return (
    <CommonLayout user={user}>
      <Component />
    </CommonLayout>
  );
}

export const commonRoutes = (
  <>
  {/* Settings */}
    <Route
      path="/common/settings"
      element={
        <ProtectedRoute role="any">
          <CommonPage Component={Settings} />
        </ProtectedRoute>
      }
    />

    {/* Help Centre */}
    <Route
      path="/common/help-centre"
      element={
        <ProtectedRoute role="any">
          <CommonPage Component={HelpCentre} />
        </ProtectedRoute>
      }
    />

    {/* Notifications */}
    <Route
      path="/common/notifications"
      element={
        <ProtectedRoute role="any">
          <CommonPage Component={Notifications} />
        </ProtectedRoute>
      }
    />

    {/* Logout */}
    <Route
      path="/common/logout"
      element={
        <ProtectedRoute role="any">
          <CommonPage Component={Logout} />
        </ProtectedRoute>
      }
    />
  </>
);