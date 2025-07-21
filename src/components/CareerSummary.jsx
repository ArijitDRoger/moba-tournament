import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const CareerSummary = ({ userId }) => {
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId) return;

      const q = query(
        collection(db, "matchResults"),
        where("playerId", "==", userId),
        orderBy("playedAt", "desc")
      );

      const snap = await getDocs(q);
      const matches = snap.docs.map((doc) => doc.data());
      setRecentMatches(matches.slice(0, 5));
    };

    fetchMatches();
  }, [userId]);

  return (
    <div className="glass-card p-3" style={{ flex: 1 }}>
      <h5 className="glow">📈 Career Summary</h5>
      {recentMatches.length === 0 ? (
        <p>No recent matches found.</p>
      ) : (
        <ul style={{ paddingLeft: "1rem" }}>
          {recentMatches.map((match, i) => (
            <li key={i}>
              <span
                style={{
                  color: match.result === "win" ? "lightgreen" : "salmon",
                }}
              >
                {match.result.toUpperCase()}
              </span>{" "}
              – {match.game} on{" "}
              <span style={{ color: "#bbb" }}>
                {new Date(match.playedAt?.seconds * 1000).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CareerSummary;
