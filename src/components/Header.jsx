import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-title">
          <span className="logo-icon">🎮</span>
          <h1 className="header-title">e - Tournament</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
