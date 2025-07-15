import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div
      className="bg-dark text-white p-3"
      style={{ minHeight: "100vh", width: "200px" }}
    >
      <h5 className="mb-4">Admin Panel</h5>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/pending-payments">
            Pending Payments
          </Link>
        </li>
        {/* You can add more links here like /manage-users, /fixtures etc */}
      </ul>
    </div>
  );
};

export default Sidebar;
