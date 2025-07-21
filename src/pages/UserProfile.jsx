import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import WinRatioSummary from "../components/WinRatioSummary";
import CareerSummary from "../components/CareerSummary";

const UserProfile = () => {
  const [userData, setUserData] = useState({});
  const [teams, setTeams] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      let displayName = "User";
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        displayName = userDoc.data().name || "User";
      }

      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&background=random&color=fff&size=128`;

      setAvatarUrl(avatar);
      setUserData({ email: user.email, name: displayName, uid: user.uid });

      const q = query(
        collection(db, "teams"),
        where("memberIds", "array-contains", user.uid)
      );
      const snap = await getDocs(q);
      const teamsList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsList);
    };

    fetchData();
  }, []);

  return (
    <div className="glass-card p-4" style={{ color: "#fff" }}>
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          borderBottom: "1px solid #444",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <h3 className="glow">👤 {userData.name}</h3>
          <p>
            <b>Email:</b> {userData.email}
          </p>
        </div>
      </div>

      <div>
        <h4 className="glow mb-3">🎮 My Teams</h4>
        {teams.length === 0 ? (
          <p>You haven't joined or created any team.</p>
        ) : (
          <ul style={{ paddingLeft: "1rem" }}>
            {teams.map((team) => (
              <li key={team.id}>
                <b>{team.teamName}</b> –{" "}
                <span style={{ color: "lightgreen" }}>{team.game}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary Panels */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <WinRatioSummary userId={userData.uid} />
        <CareerSummary userId={userData.uid} />
      </div>
    </div>
  );
};

export default UserProfile;
