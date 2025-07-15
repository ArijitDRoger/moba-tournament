import React from "react";
import { useNavigate } from "react-router-dom";
import "./MobileAdminTabs.css";

const MobileAdminTabs = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-admin-tabs">
      <button onClick={() => navigate("/admin-panel")}>Approvals</button>
      <button onClick={() => navigate("/admin-panel?tab=all")}>All</button>
      <button onClick={() => navigate("/admin-panel?tab=ongoing")}>
        Ongoing
      </button>
      <button onClick={() => navigate("/admin-panel?tab=upcoming")}>
        Upcoming
      </button>
      <button onClick={() => navigate("/admin-panel?tab=teams")}>Teams</button>
    </div>
  );
};

export default MobileAdminTabs;
