// components/AdminBracketManager.jsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { generateInitialKnockoutFixtures } from "../utils/generateInitialKnockoutFixtures";
import { generateNextRoundFixtures } from "../utils/generateNextRoundFixtures";
import KnockoutBracketTree from "./KnockoutBracketTree";

const AdminBracketManager = ({ tournamentId }) => {
  const [fixturesByRound, setFixturesByRound] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchFixtures = async () => {
    setLoading(true);
    const snap = await getDocs(
      query(
        collection(db, "fixtures"),
        where("tournamentId", "==", tournamentId)
      )
    );
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const rounds = {};
    const teamSet = new Set();

    data.forEach((f) => {
      if (!rounds[f.round]) rounds[f.round] = [];
      rounds[f.round].push(f);
      if (f.team1Id) teamSet.add(f.team1Id);
      if (f.team2Id) teamSet.add(f.team2Id);
    });

    const names = {};
    await Promise.all(
      [...teamSet].map(async (id) => {
        if (id === "BYE") {
          names[id] = "BYE";
        } else {
          const teamSnap = await getDocs(
            query(collection(db, "teams"), where("__name__", "==", id))
          );
          if (!teamSnap.empty) {
            names[id] = teamSnap.docs[0].data().teamName || "Unknown";
          } else {
            names[id] = "Unknown";
          }
        }
      })
    );

    setFixturesByRound(rounds);
    setTeamNames(names);
    setLoading(false);
  };

  const setWinner = async (matchId, winnerId) => {
    await updateDoc(doc(db, "fixtures", matchId), { winnerId });
    await fetchFixtures();
  };

  const handleGenerateInitial = async () => {
    try {
      const docRef = doc(db, "tournaments", tournamentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const tournamentData = { id: docSnap.id, ...docSnap.data() };
        await generateInitialKnockoutFixtures(tournamentData);
        await fetchFixtures();
      } else {
        alert("Tournament not found");
      }
    } catch (err) {
      alert(err.message);
    }
  };
  const handleGenerateNext = async () => {
    try {
      await generateNextRoundFixtures(tournamentId);
      await fetchFixtures();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (tournamentId) fetchFixtures();
  }, [tournamentId]);

  return (
    <div className="glass-card p-3">
      <KnockoutBracketTree
        fixturesByRound={fixturesByRound}
        teamNames={teamNames}
      />
      <h4 className="glow text-center">🏆 Bracket Manager</h4>
      <div className="text-center my-3">
        <button
          className="btn btn-primary mx-2"
          onClick={handleGenerateInitial}
        >
          🔁 Generate Initial Fixtures
        </button>
        <button className="btn btn-warning mx-2" onClick={handleGenerateNext}>
          ➕ Generate Next Round
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.keys(fixturesByRound)
          .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
          .map((round) => (
            <div className="round-column" key={round}>
              <h6 className="text-warning text-center">{round}</h6>
              {fixturesByRound[round].map((fixture, index) => (
                <div key={fixture.id} className="fixture-card">
                  <b>Match {fixture.matchNumber}:</b>{" "}
                  {teamNames[fixture.team1Id]} vs {teamNames[fixture.team2Id]}
                  <div>
                    <label>
                      <b>Set Winner:</b>
                    </label>
                    <select
                      className="form-select my-1"
                      value={fixture.winnerId || ""}
                      onChange={(e) => setWinner(fixture.id, e.target.value)}
                    >
                      <option value="">-- Select Winner --</option>
                      {[fixture.team1Id, fixture.team2Id]
                        .filter((id) => id && id !== "BYE")
                        .map((id) => (
                          <option key={id} value={id}>
                            {teamNames[id]}
                          </option>
                        ))}
                    </select>
                    {fixture.winnerId && (
                      <div className="winner-chip">
                        ✅ Winner: {teamNames[fixture.winnerId]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
      )}
    </div>
  );
};

export default AdminBracketManager;
