import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TopNavBar.css"; // 👇 Add styles (provided below)
import {
  FaTrophy,
  FaUsers,
  FaPlusCircle,
  FaHome,
  FaDownload,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { TbTournament } from "react-icons/tb";

const TopNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: <FaHome />, label: "Home" },
    { path: "/tournaments", icon: <FaTrophy />, label: "Tournaments" },
    { path: "/create-team", icon: <FaPlusCircle />, label: "Create Team" },
    { path: "/join-team", icon: <FaUsers />, label: "Join Team" },
    { path: "/download", icon: <FaDownload />, label: "Download App" },
    // ✅ Admin Panel link only visible to admins
    {
      path: "/admin-panel",
      icon: <RiAdminFill />,
      label: "Admin Panel",
      adminOnly: true,
    },
    {
      path: "/create-tournament",
      icon: <TbTournament />,
      label: "Create Tournament",
      adminOnly: true,
    },
  ];

  return (
    <div className="top-nav-bar">
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`nav-item ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-icon-label">
            {item.icon}
            <span>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopNavBar;
