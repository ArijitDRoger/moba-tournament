import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null: loading, false: not admin, true: admin

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return <p className="text-center text-white">🔒 Verifying access...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-danger mt-5">
        <h3>🚫 You are not authorized to view this page.</h3>
        <p>Please contact the admin if you believe this is a mistake.</p>
        <a href="/dashboard" className="btn btn-outline-primary mt-3">
          🔙 Back to Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
