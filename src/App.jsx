import React, { useEffect, useState } from "react";
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
import ResetPassword from "./pages/ResetPassword";
import DownloadApp from "./pages/DownloadApp";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const App = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div style={{ color: "#fff", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Redirect root to login or dashboard */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />

        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-team" element={<CreateTeam />} />
          <Route path="join-team" element={<JoinTeam />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route
            path="create-tournament"
            element={
              <ProtectedAdminRoute user={user}>
                <CreateTournament />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="join/:tournamentId/:teamId"
            element={<JoinWithPayment />}
          />
          <Route path="download" element={<DownloadApp />} />
          <Route
            path="admin-panel"
            element={
              <ProtectedAdminRoute user={user}>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/tournaments" element={<Tournaments user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
