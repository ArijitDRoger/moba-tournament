// src/pages/Home.jsx
import React from "react";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import RechargeStatus from "../components/RechargeStatus";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Adjust the path as needed
import "./Home.css"; // Optional: styling

const Home = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="loading-text">Loading...</div>;

  return (
    <div className="home-container">
      <div className="profile-section">
        <UserProfile />
      </div>

      <div className="dashboard-section">
        <Dashboard />
      </div>

      <div className="recharge-status-section">
        {user ? (
          <RechargeStatus user={user} />
        ) : (
          <div className="login-prompt">
            Please login to view recharge status.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
