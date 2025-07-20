// src/pages/Tournaments.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import FixtureModal from "../components/FixtureModal"; // ✅ Correct import
import "./Tournaments.css";
import ViewFixtureModal from "../components/ViewFixtureModal";

const Tournaments = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();
  const [viewFixtureTournamentId, setViewFixtureTournamentId] = useState(null);
  const user = auth.currentUser;
  const [teams, setTeams] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);

        const teamQuery = query(
          collection(db, "teams"),
          where("memberIds", "array-contains", user.uid)
        );
        const teamSnap = await getDocs(teamQuery);
        if (!teamSnap.empty) {
          const teamDoc = teamSnap.docs[0];
          setUserTeamId(teamDoc.id);
          setTeams([{ id: teamDoc.id, ...teamDoc.data() }]);
        }

        const snapT = await getDocs(collection(db, "tournaments"));
        const data = snapT.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTournaments(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleJoinClick = (tournamentId) => {
    if (!userTeamId) {
      alert("Please create or join a team first!");
      return;
    }

    if (!user) {
      setShowPrompt(true);
      return;
    }

    // Prevent join if team is not full
    const selectedTeam = teams.find((t) => t.id === userTeamId);
    if (!selectedTeam || selectedTeam.memberIds.length < 5) {
      alert("Your team must have 5 members to join the tournament.");
      return;
    }

    navigate(`/join/${tournamentId}/${userTeamId}`);
  };

  const openFixtureModal = (tournament) => {
    setSelectedTournament(null);
    setTimeout(() => {
      setSelectedTournament({ ...tournament }); // force re-render
    }, 100);
  };

  const isTeamEligible =
    teams.find((t) => t.id === userTeamId)?.memberIds?.length >= 5;

  return (
    <div className="tournaments-container">
      <div className="tournaments-content">
        <h2 className="glow">🎯 All Tournaments</h2>
        {tournaments.map((tour) => (
          <div key={tour.id} className="glass-card p-4 my-3">
            {/* ✅ Clickable tournament title */}
            <h4>{tour.title}</h4>

            {isAdmin && (tour.registeredTeams?.length || 0) > 1 && (
              <button
                className="btn btn-outline-light btn-sm mb-2"
                onClick={() => openFixtureModal(tour)}
              >
                ⚙️ Manage Fixtures
              </button>
            )}

            <button
              className="btn btn-info btn-sm mt-2 ms-2"
              onClick={() => setViewFixtureTournamentId(tour.id)}
            >
              📋 View Fixtures
            </button>

            <p>
              <b style={{ color: "lightgreen" }}>Game:</b> {tour.game}
            </p>
            <p>
              <b style={{ color: "lightgreen" }}>Start Date:</b>{" "}
              {tour.startDate}
            </p>
            <p>
              <b style={{ color: "lightgreen" }}>Entry Fee:</b> ₹{tour.entryFee}
            </p>
            <p>
              <b style={{ color: "lightgreen" }}>Teams Joined:</b>{" "}
              {tour.registeredTeams?.length || 0} / {tour.maxTeams}
            </p>
            <button
              className={`btn btn-primary btn-sm mt-2 ${
                !isTeamEligible ? "disabled" : ""
              }`}
              disabled={!isTeamEligible}
              onClick={() => handleJoinClick(tour.id)}
              title={
                !isTeamEligible ? "Gather remaining teammates (Need 5)" : ""
              }
            >
              Join & Pay
            </button>
          </div>
        ))}
        {/* Signup Prompt Modal */}
        {showPrompt && (
          <div className="modal">
            <p>You need to sign up or log in to join a tournament.</p>
            <button onClick={() => navigate("/signup")}>Go to Signup</button>
            <button onClick={() => setShowPrompt(false)}>Cancel</button>
          </div>
        )}
      </div>
      {viewFixtureTournamentId && (
        <ViewFixtureModal
          tournamentId={viewFixtureTournamentId}
          onClose={() => setViewFixtureTournamentId(null)}
        />
      )}

      {/* ✅ Fixture Modal */}
      {selectedTournament && (
        <FixtureModal
          key={selectedTournament.id} // 🔥 Force remount when tournament changes
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
};

export default Tournaments;
