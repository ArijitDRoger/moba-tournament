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
import LandingPage from "./pages/LandingPage";
import BeautifulLoader from "./components/BeautifulLoader";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import PurchasePage from "./pages/PurchasePage";
import UPIPaymentPage from "./pages/UPIPaymentPage";

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

  if (checkingAuth) return <BeautifulLoader />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pay/:id" element={<UPIPaymentPage />} />
        <Route
          path="/join/:tournamentId/:teamId"
          element={<JoinWithPayment />}
        />

        {/* Protected with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Home />} />
          <Route path="create-team" element={<CreateTeam />} />
          <Route path="join-team" element={<JoinTeam />} />
          <Route path="purchase" element={<PurchasePage />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="download" element={<DownloadApp />} />

          <Route
            path="admin-panel"
            element={
              <ProtectedAdminRoute user={user}>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="create-tournament"
            element={
              <ProtectedAdminRoute user={user}>
                <CreateTournament />
              </ProtectedAdminRoute>
            }
          />
          <Route path="tournaments" element={<Tournaments user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
