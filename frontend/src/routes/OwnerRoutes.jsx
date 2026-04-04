import React from "react";
import { Route } from "react-router-dom";
import OwnerLayout from "../components/layout/OwnerLayout";

import OwnerDashboard from "../pages/owner/Dashboard";
import AddBatch from "../pages/owner/batches/AddBatch";
import BatchDetails from "../pages/owner/batches/BatchDetails";
import BatchList from "../pages/owner/batches/BatchList";
import DailyOps from "../pages/owner/dailyOps/DailyOperations";
import Predictions from "../pages/owner/predictions/Predictions";
import Records from "../pages/owner/records/Records";
import Reports from "../pages/owner/reports/Reports";
import BuyerRequestMatch from "../pages/owner/buyers/BuyerRequestMatch";
import BuyersList from "../pages/owner/buyers/BuyersList";
import OrderHistory from "../pages/owner/buyers/OrderHistory";
import NewBuyer from "../pages/owner/buyers/NewBuyer";
import ManagersList from "../pages/owner/staff/ManagersList";
import RegisterManager from "../pages/owner/staff/RegisterManager";
import Feedstock from "../pages/owner/feedstock/Feedstock";

import ProtectedRoute from "../context/ProtectedRoute";

export const ownerRoutes = (
  <>
    {/* Dashboard */}
    <Route
      path="/owner/dashboard"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <OwnerDashboard />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Batches */}
    <Route
      path="/owner/batches"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <BatchList />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/batches/add"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <AddBatch />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/batches/edit/:id"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <AddBatch />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/batches/view/:id"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <BatchDetails/>
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Daily Operations */}
    <Route
      path="/owner/daily-ops"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <DailyOps />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Predictions */}
    <Route
      path="/owner/predictions"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <Predictions />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Records */}
    <Route
      path="/owner/records"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <Records />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Reports */}
    <Route
      path="/owner/reports"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <Reports />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Buyers */}
    <Route
      path="/owner/buyers"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <BuyersList />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/buyers/add"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <NewBuyer />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/buyers/request"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <BuyerRequestMatch />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/buyers/order-history"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <OrderHistory />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Staff */}
    <Route
      path="/owner/staff"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <ManagersList />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/owner/staff/add"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <RegisterManager />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />

    {/* Feedstock */}
    <Route
      path="/owner/feedstock"
      element={
        <ProtectedRoute role="A002">
          <OwnerLayout>
            <Feedstock />
          </OwnerLayout>
        </ProtectedRoute>
      }
    />
  </>
);
