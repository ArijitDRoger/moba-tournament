import React from "react";
import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";

const Header = () => {
  const navigate = useNavigate();
  const user = auth.currentUser; // 🔍 get current user

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-title" onClick={() => navigate("/")}>
          <h1 className="header-title">
            <span className="logo-icon">🎮</span> e - Tournament
          </h1>
        </div>

        <div>
          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="header-btn">
                Login
              </Link>
              <Link to="/signup" className="header-btn signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
