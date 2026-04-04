import React from "react";
import { Route } from "react-router-dom";
import ManagerLayout from "../components/layout/ManagerLayout.jsx"; 

import Dashboard from "../pages/manager/Dashboard.jsx";
import AddBatch from "../pages/manager/batches/AddBatch.jsx";
import BatchDetails from "../pages/manager/batches/BatchDetails.jsx";
import BatchList from "../pages/manager/batches/BatchList.jsx";
import DailyOperations from "../pages/manager/dailyOps/DailyOperations.jsx";
import Predictions from "../pages/manager/predictions/Predictions.jsx";
import Records from "../pages/manager/records/Records.jsx";
import Reports from "../pages/manager/reports/Reports.jsx";

import BuyerRequestMatch from "../pages/manager/buyers/BuyerRequestMatch.jsx";
import BuyersList from "../pages/manager/buyers/BuyersList.jsx";
import OrderHistory from "../pages/manager/buyers/OrderHistory.jsx";
import NewBuyer from "../pages/manager/buyers/NewBuyer.jsx";

import Feedstock from "../pages/manager/feedstock/Feedstock.jsx";

import ProtectedRoute from "../context/ProtectedRoute.jsx";


export const managerRoutes = (
  <>
    {/* Dashboard */}
    <Route
      path="/manager/dashboard"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <Dashboard />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Batches */}
    <Route
      path="/manager/batches"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <BatchList />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/batches/add"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <AddBatch />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/batches/edit/:id"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <AddBatch />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/batches/view/:id"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <BatchDetails />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Daily Operations */}
    <Route
      path="/manager/daily-ops"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <DailyOperations />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Predictions */}
    <Route
      path="/manager/predictions"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <Predictions />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Records */}
    <Route
      path="/manager/records"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <Records />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Reports */}
    <Route
      path="/manager/reports"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <Reports />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Buyers */}
    <Route
      path="/manager/buyers"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <BuyersList />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/buyers/add"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <NewBuyer />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/buyers/request"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <BuyerRequestMatch />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/manager/buyers/order-history"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <OrderHistory />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />

    {/* Feedstock */}
    <Route
      path="/manager/feedstock"
      element={
        <ProtectedRoute role="A003">
          <ManagerLayout>
            <Feedstock />
          </ManagerLayout>
        </ProtectedRoute>
      }
    />
  </>
);
