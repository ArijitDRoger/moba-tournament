// src/components/FixtureModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";

const FixtureModal = ({ tournament, onClose }) => {
  const [fixtures, setFixtures] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef();

  const fetchFixtures = async () => {
    setLoading(true);
    const q = query(
      collection(db, "fixtures"),
      where("tournamentId", "==", tournament.id)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFixtures(data);

    const teamIds = new Set();
    data.forEach((f) => {
      teamIds.add(f.team1Id);
      teamIds.add(f.team2Id);
      if (f.winnerId) teamIds.add(f.winnerId);
    });

    const names = {};
    await Promise.all(
      Array.from(teamIds).map(async (id) => {
        if (id === "BYE") {
          names[id] = "BYE";
          return;
        }
        const docSnap = await getDoc(doc(db, "teams", id));
        names[id] = docSnap.exists() ? docSnap.data().teamName : "Unknown";
      })
    );

    setTeamNames(names);
    setLoading(false);
  };

  useEffect(() => {
    if (tournament?.id) fetchFixtures();
  }, [tournament?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" ref={modalRef}>
        <button className="btn-close float-end" onClick={onClose}></button>
        <h4 className="text-center mb-3 glow">
          📋 Fixtures - {tournament.title}
        </h4>

        {loading ? (
          <p>Loading...</p>
        ) : fixtures.length === 0 ? (
          <p className="text-warning">❌ Fixtures not generated yet.</p>
        ) : (
          fixtures.map((match) => (
            <div key={match.id} className="card glass-card p-2 mb-2">
              <b>Match {match.matchNumber}:</b> {teamNames[match.team1Id]} vs{" "}
              {teamNames[match.team2Id]}
              {match.matchTime && (
                <p>
                  <b>Time:</b> {match.matchTime}
                </p>
              )}
              {match.round && (
                <p>
                  <b>Round:</b> {match.round}
                </p>
              )}
              {match.winnerId && (
                <p className="text-success">
                  🏆 Winner: <b>{teamNames[match.winnerId]}</b>
                </p>
              )}
            </div>
          ))
        )}

        <button onClick={onClose} className="btn btn-secondary mt-3 w-100">
          Close
        </button>
      </div>
    </div>
  );
};

export default FixtureModal;
