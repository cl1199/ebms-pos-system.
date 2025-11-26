// src/App.jsx
import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";
import Home from "./pages/Home";
import EventDashboard from "./pages/EventDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import POSPage from "./pages/POSPage";
import AdminProducts from "./pages/AdminProducts";
import AdminEvents from "./pages/AdminEvents";
import AdminBars from "./pages/AdminBars";
import AdminAssignments from "./pages/AdminAssignments";
import Login from "./pages/Login";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import CashierRoute from "@/components/auth/CashierRoute";
import SupervisorRoute from "@/components/auth/SupervisorRoute";

export default function App() {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={<Login />} />

      {/* Todo lo demás va dentro del layout protegido */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* HOME: portada bonita */}
        <Route index element={<Home />} />

        {/* GESTIÓN DEL EVENTO (ADMIN + SUPERVISOR) */}
        <Route
          path="event-dashboard"
          element={
            <SupervisorRoute>
              <EventDashboard />
            </SupervisorRoute>
          }
        />
        <Route
          path="inventario"
          element={
            <SupervisorRoute>
              <InventoryDashboard />
            </SupervisorRoute>
          }
        />
        <Route
          path="ventas"
          element={
            <SupervisorRoute>
              <SalesDashboard />
            </SupervisorRoute>
          }
        />

        {/* POS – solo cajeros */}
        <Route
          path="pos"
          element={
            <CashierRoute>
              <POSPage />
            </CashierRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="admin/bars"
          element={
            <AdminRoute>
              <AdminBars />
            </AdminRoute>
          }
        />
        <Route
          path="admin/assignments"
          element={
            <AdminRoute>
              <AdminAssignments />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  );
}