import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateTeam from "./pages/CreateTeam";
import JoinTeam from "./pages/JoinTeam";
import CreateTournament from "./pages/CreateTournament";
import Tournaments from "./pages/Tournaments";
import JoinWithPayment from "./pages/JoinWithPayment";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Layout from "./components/Layout";
import ResetPassword from "./pages/ResetPassword"; // Add this
import DownloadApp from "./pages/DownloadApp";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🌐 Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected Routes with Layout (Includes Admin too) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-team" element={<CreateTeam />} />
          <Route path="join-team" element={<JoinTeam />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/create-tournament"
            element={
              <ProtectedAdminRoute>
                <CreateTournament />
              </ProtectedAdminRoute>
            }
          />

          <Route path="tournaments" element={<Tournaments />} />
          <Route
            path="join/:tournamentId/:teamId"
            element={<JoinWithPayment />}
          />

          <Route path="download" element={<DownloadApp />} />

          {/* ✅ Admin Panel now inside Layout */}
          <Route
            path="admin-panel"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
