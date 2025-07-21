// src/pages/Home.jsx
import React from "react";
import Dashboard from "./Dashboard";
import UserProfile from "./UserProfile";
import "./Home.css"; // Optional CSS file

const Home = () => {
  return (
    <div className="home-container">
      <div className="profile-section">
        <UserProfile />
      </div>
      <div className="dashboard-section">
        <Dashboard />
      </div>
    </div>
  );
};

export default Home;
