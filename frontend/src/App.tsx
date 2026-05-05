// frontend/src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Medicines } from "./pages/Medicines";
import { AddMedicine } from "./pages/AddMedicine";
import { EditMedicine } from "./pages/EditMedicine";
import { Reminders } from "./pages/Reminders";
import AdminDashboard from "./components/AdminDashboard";
import { Pharmacy } from "./pages/Pharmacy";
import Settings from "./pages/Settings";
import Assistant from "./pages/Assistant";

// Blocks unauthenticated users — redirects to /login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// Blocks non-admin users — redirects to /dashboard
function AdminRoute({ children }: { children: React.ReactNode }) { // 👈 added
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Blocks already-logged-in users from seeing login/register
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

// Extracted to avoid repeating the spinner JSX 3 times
function Spinner() { // 👈 added
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected user routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="medicines/add" element={<AddMedicine />} />
          <Route path="medicines/:id/edit" element={<EditMedicine />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Catch-all — send unknown URLs to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;