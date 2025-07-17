import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-title">
          <h1 className="header-title">
            <span className="logo-icon">🎮</span> e - Tournament
          </h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
