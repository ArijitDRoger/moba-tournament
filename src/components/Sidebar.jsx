import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ImAndroid } from "react-icons/im";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // 👈 already used

import "./Sidebar.css";

const Sidebar = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false); // ✅ new
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Get user name from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        }

        // Get admin claim from token
        const token = await currentUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      }
    };
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        }

        const token = await user.getIdTokenResult();
        if (token.claims.admin) {
          setIsAdmin(true);

          // 🔴 Real-time listener for pending payments
          const q = query(
            collection(db, "pendingPayments"),
            where("status", "==", "pending")
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingCount(snapshot.size);
          });

          // 🧹 Cleanup when user logs out
          return () => unsubscribe();
        }
      }
    });

    fetchUserData();
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <ul className="nav flex-column text-white">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link text-white">
              🏠 Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tournaments" className="nav-link text-white">
              🧾 Tournaments
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/create-team" className="nav-link text-white">
              ➕ Create Team
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/join-team" className="nav-link text-white">
              🤝 Join Team
            </Link>
          </li>
          <li className="nav-item" onClick={() => navigate("/download")}>
            {" "}
            <ImAndroid />
            <span>Download App</span>
          </li>

          {/* ✅ Show Create Tournament only to admins */}
          {isAdmin && (
            <li className="nav-item">
              <Link to="/create-tournament" className="nav-link text-white">
                🎯 Create Tournament
              </Link>
            </li>
          )}

          {isAdmin && (
            <li className="nav-item">
              <Link
                to="/admin-panel"
                className="nav-link text-white d-flex align-items-center justify-content-between"
              >
                🛠️ Admin Panel
                {pendingCount > 0 && (
                  <span className="badge bg-danger ms-2">{pendingCount}</span>
                )}
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="sidebar-footer text-center text-white">
        <div
          className="rounded-circle mx-auto mb-2"
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          }}
        ></div>
        <p className="fw-bold mb-1">{userName}</p>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
