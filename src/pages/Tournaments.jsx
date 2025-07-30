// src/pages/Tournaments.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import FixtureModal from "../components/FixtureModal";
import ViewFixtureModal from "../components/ViewFixtureModal";
import "./Tournaments.css";
import TeamSelectModal from "../components/TeamSelectModal";

const Tournaments = () => {
  const [user, setUser] = useState(null); // ✅ Proper user state
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTournamentForJoin, setSelectedTournamentForJoin] =
    useState(null);
  const [teamSelectorVisible, setTeamSelectorVisible] = useState(false);
  const [viewFixtureTournamentId, setViewFixtureTournamentId] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // ✅ Fix

        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);

        const teamQuery = query(
          collection(db, "teams"),
          where("memberIds", "array-contains", firebaseUser.uid)
        );
        const teamSnap = await getDocs(teamQuery);
        const userTeams = teamSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(userTeams);
      }

      // Load all tournaments regardless of login
      const snapT = await getDocs(collection(db, "tournaments"));
      const data = snapT.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(data);
    });

    return () => unsubscribe();
  }, []);

  const getRequiredMembers = (game) => (game === "BGMI" ? 4 : 5);

  const isTeamEligibleForTournament = (tour) => {
    const minPlayers = getRequiredMembers(tour.game);
    return teams.some(
      (team) => team.game === tour.game && team.memberIds?.length >= minPlayers
    );
  };

  const handleJoinClick = (tournament) => {
    console.log("Join clicked for tournament:", tournament);
    if (!user) {
      setShowPrompt(true);
      return;
    }

    const game = tournament.game;
    const minPlayers = getRequiredMembers(game);

    const eligibleTeams = teams.filter(
      (team) => team.game === game && team.memberIds.length >= minPlayers
    );

    if (eligibleTeams.length === 0) {
      alert(
        `You don't have any ${game} team with at least ${minPlayers} players.`
      );
      return;
    }

    setSelectedTournamentForJoin(tournament);
    setTeamSelectorVisible(true);
  };

  const openFixtureModal = (tournament) => {
    setSelectedTournament(null);
    setTimeout(() => {
      setSelectedTournament({ ...tournament });
    }, 100);
  };

  // ✅ Debug modal visibility
  console.log({ user, teams, teamSelectorVisible, selectedTournamentForJoin });

  return (
    <div className="tournaments-container">
      <div className="tournaments-content">
        <h2 className="glow">🎯 All Tournaments</h2>
        {tournaments.map((tour) => (
          <div key={tour.id} className="glass-card p-4 my-3">
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
                !isTeamEligibleForTournament(tour) ? "disabled" : ""
              }`}
              disabled={!isTeamEligibleForTournament(tour)}
              onClick={() => handleJoinClick(tour)}
              title={
                !isTeamEligibleForTournament(tour)
                  ? `Need ${getRequiredMembers(
                      tour.game
                    )} players in team to join`
                  : ""
              }
            >
              Join & Pay
            </button>
          </div>
        ))}

        {teamSelectorVisible && selectedTournamentForJoin && (
          <TeamSelectModal
            tournament={selectedTournamentForJoin}
            teams={teams}
            getRequiredMembers={getRequiredMembers}
            onCancel={() => {
              setTeamSelectorVisible(false);
              setSelectedTournamentForJoin(null);
            }}
          />
        )}

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

      {selectedTournament && (
        <FixtureModal
          key={selectedTournament.id}
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
};

export default Tournaments;
