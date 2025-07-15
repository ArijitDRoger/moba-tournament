import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TopNavBar from "./TopNavBar"; // Mobile top nav
import MobileAdminTabs from "./MobileAdminTabs"; // Admin bottom tabs
import { Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isAdmin = localStorage.getItem("role") === "admin";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="layout-wrapper">
      <Header />

      {isMobile ? (
        <>
          <TopNavBar />
          <div className="main-content-mobile position-relative">
            <Outlet />
          </div>
          {isAdmin && <MobileAdminTabs />}
        </>
      ) : (
        <div className="desktop-layout">
          <Sidebar />
          <div className="main-content-desktop position-relative">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
