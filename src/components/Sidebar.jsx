import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { ImAndroid } from "react-icons/im";
import "./Sidebar.css";

const Sidebar = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        }

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

          const q = query(
            collection(db, "pendingPayments"),
            where("status", "==", "pending")
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingCount(snapshot.size);
          });

          return () => unsubscribe();
        }
      }
    });

    fetchUserData();
  }, []);

  return (
    <div className="sidebar custom-sidebar">
      <div className="sidebar-content">
        <ul className="nav flex-column text-white">
          <li className="nav-item ">
            <Link
              to="/dashboard"
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              🏠 Home
            </Link>
          </li>
          <li className="nav-item ">
            <Link
              to="/tournaments"
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === "/tournaments" ? "active" : ""
              }`}
            >
              🧾 Tournaments
            </Link>
          </li>
          <li className="nav-item ">
            <Link
              to="/create-team"
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === "/create-team" ? "active" : ""
              }`}
            >
              ➕ Create Team
            </Link>
          </li>
          <li className="nav-item ">
            <Link
              to="/join-team"
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === "/join-team" ? "active" : ""
              }`}
            >
              🤝 Join Team
            </Link>
          </li>

          {/* 🔧 Beautified Download App */}
          <li className="nav-item">
            <div
              className={`nav-link d-flex align-items-center gap-2 ${
                location.pathname === "/download" ? "active" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/download")}
            >
              <ImAndroid size={18} style={{ marginBottom: "2px" }} />
              <span>Download App</span>
            </div>
          </li>

          {isAdmin && (
            <>
              <li className="nav-item">
                <Link to="/create-tournament" className="nav-link text-white">
                  🎯 Create Tournament
                </Link>
              </li>
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
            </>
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
      </div>
    </div>
  );
};

export default Sidebar;
