import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const WinRatioSummary = ({ userId }) => {
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      const matchQuery = query(
        collection(db, "matchResults"),
        where("playerId", "==", userId)
      );
      const snap = await getDocs(matchQuery);
      let wins = 0;
      let losses = 0;
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.result === "win") wins++;
        else if (data.result === "loss") losses++;
      });

      setWinCount(wins);
      setLossCount(losses);
    };

    fetchStats();
  }, [userId]);

  const total = winCount + lossCount;
  const ratio = total > 0 ? ((winCount / total) * 100).toFixed(1) : "0";

  return (
    <div className="glass-card p-3" style={{ flex: 1 }}>
      <h5 className="glow">🏅 Win Ratio</h5>
      <p>
        Wins: <b style={{ color: "#00ff99" }}>{winCount}</b>
      </p>
      <p>
        Losses: <b style={{ color: "#ff5555" }}>{lossCount}</b>
      </p>
      <p>
        Win %: <b>{ratio}%</b>
      </p>
    </div>
  );
};

export default WinRatioSummary;
