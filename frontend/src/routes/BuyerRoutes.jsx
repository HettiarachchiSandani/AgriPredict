import React from "react";
import { Route } from "react-router-dom";
import BuyerLayout from "../components/layout/BuyerLayout.jsx";

import Dashboard from "../pages/buyer/Dashboard.jsx";
import MakeRequest from "../pages/buyer/MakeRequest.jsx";
import OrderHistory from "../pages/buyer/OrderHistory.jsx";

import ProtectedRoute from "../context/ProtectedRoute.jsx";

const user = { name: "Buyer ABC", role: "buyer" };

export const buyerRoutes = (
  <>
    {/* Dashboard */}
    <Route
      path="/buyer/dashboard"
      element={
        <ProtectedRoute role="B001">
          <BuyerLayout>
            <Dashboard />
          </BuyerLayout>
        </ProtectedRoute>
      }
    />

    {/* Make Request */}
    <Route
      path="/buyer/make-request"
      element={
        <ProtectedRoute role="B001">
          <BuyerLayout>
            <MakeRequest />
          </BuyerLayout>
        </ProtectedRoute>
      }
    />

    {/* Order History */}
    <Route
      path="/buyer/order-history"
      element={
        <ProtectedRoute role="B001">
          <BuyerLayout>
            <OrderHistory />
          </BuyerLayout>
        </ProtectedRoute>
      }
    />
  </>
);
