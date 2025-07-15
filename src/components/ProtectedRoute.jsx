import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (checking) return <p>Checking auth...</p>;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
