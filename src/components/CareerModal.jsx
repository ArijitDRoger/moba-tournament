// src/components/CareerModal.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./CareerModal.css";

const CareerModal = ({ userId, onClose }) => {
  const [allMatches, setAllMatches] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      const q = query(
        collection(db, "results"),
        where("players", "array-contains", userId),
        orderBy("playedAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: d.data().winnerId === userId ? "Win" : "Loss",
      }));
      setAllMatches(rows);
    };
    fetchAll();
  }, [userId]);

  return (
    <div className="career-modal-backdrop" onClick={onClose}>
      <div className="career-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Your Career – Full History</h3>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tournament</th>
              <th>Game</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {allMatches.map((m) => (
              <tr key={m.id}>
                <td>
                  {new Date(m.playedAt.seconds * 1000).toLocaleDateString()}
                </td>
                <td>{m.tournamentName}</td>
                <td>{m.game}</td>
                <td className={m.status === "Win" ? "win" : "loss"}>
                  {m.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CareerModal;
