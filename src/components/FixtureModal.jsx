import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

const FixtureModal = ({ tournament, onClose }) => {
  const [fixtures, setFixtures] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef();

  // Fetch existing fixtures & team names
  const fetchExistingFixtures = async () => {
    setLoading(true);
    setFixtures([]);
    setTeamNames({});

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
    });

    const names = {};
    await Promise.all(
      Array.from(teamIds).map(async (id) => {
        if (id !== "BYE") {
          const teamDoc = await getDoc(doc(db, "teams", id));
          names[id] = teamDoc.exists() ? teamDoc.data().teamName : "Unknown";
        } else {
          names[id] = "BYE";
        }
      })
    );

    setTeamNames(names);
    setLoading(false);
  };

  useEffect(() => {
    if (tournament?.id) {
      fetchExistingFixtures();
    }
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

  const generateFixtures = async () => {
    const fixtureRef = collection(db, "fixtures");
    const q = query(fixtureRef, where("tournamentId", "==", tournament.id));
    const existingSnap = await getDocs(q);

    await Promise.all(
      existingSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "fixtures", docSnap.id))
      )
    );

    const shuffled = [...tournament.registeredTeams].sort(
      () => 0.5 - Math.random()
    );
    const newFixtures = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const team1 = shuffled[i];
      const team2 = i + 1 < shuffled.length ? shuffled[i + 1] : "BYE";

      const fixture = {
        tournamentId: tournament.id,
        matchNumber: i / 2 + 1,
        team1Id: team1,
        team2Id: team2,
        matchTime: "",
        round: "",
        createdAt: new Date(),
      };

      await setDoc(
        doc(db, "fixtures", `${tournament.id}_match${fixture.matchNumber}`),
        fixture
      );
      newFixtures.push({
        id: `${tournament.id}_match${fixture.matchNumber}`,
        ...fixture,
      });
    }

    setFixtures(newFixtures);
    fetchExistingFixtures(); // re-fetch team names & sync state
  };

  const handleTimeChange = async (matchNumber, newTime) => {
    const id = `${tournament.id}_match${matchNumber}`;
    await setDoc(
      doc(db, "fixtures", id),
      { matchTime: newTime },
      { merge: true }
    );

    setFixtures((prev) =>
      prev.map((f) =>
        f.matchNumber === matchNumber ? { ...f, matchTime: newTime } : f
      )
    );
  };

  const handleRoundChange = async (matchNumber, newRound) => {
    const id = `${tournament.id}_match${matchNumber}`;
    await setDoc(doc(db, "fixtures", id), { round: newRound }, { merge: true });

    setFixtures((prev) =>
      prev.map((f) =>
        f.matchNumber === matchNumber ? { ...f, round: newRound } : f
      )
    );
  };

  const saveAllFixtures = async () => {
    for (let match of fixtures) {
      const id = `${tournament.id}_match${match.matchNumber}`;
      await setDoc(
        doc(db, "fixtures", id),
        {
          matchTime: match.matchTime || "",
          round: match.round || "",
        },
        { merge: true }
      );
    }
    alert("✅ All changes saved to Firestore!");
  };

  const downloadFixtures = () => {
    const text =
      `Fixtures for ${tournament.title}\n\n` +
      fixtures
        .map(
          (f) =>
            `Match ${f.matchNumber}: ${teamNames[f.team1Id] || "Unknown"} vs ${
              teamNames[f.team2Id] || "Unknown"
            }${f.matchTime ? `\nTime: ${f.matchTime}` : ""}${
              f.round ? `\nRound: ${f.round}` : ""
            }`
        )
        .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tournament.title}-fixtures.txt`;
    link.click();
  };

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
          <button onClick={generateFixtures} className="btn btn-success w-100">
            🔁 Generate Fixtures
          </button>
        ) : (
          <>
            {fixtures.map((match) => (
              <div key={match.matchNumber} className="card p-2 mb-2 glass-card">
                <b>Match {match.matchNumber}:</b> {teamNames[match.team1Id]} vs{" "}
                {teamNames[match.team2Id]}
                <div>
                  <label>
                    <b>Time:</b>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control my-1"
                    value={match.matchTime || ""}
                    onChange={(e) =>
                      handleTimeChange(match.matchNumber, e.target.value)
                    }
                  />
                </div>
                <div>
                  <label>
                    <b>Round:</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={match.round || ""}
                    onChange={(e) =>
                      handleRoundChange(match.matchNumber, e.target.value)
                    }
                    placeholder="e.g. Quarter Final"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={saveAllFixtures}
              className="btn btn-success mt-2 w-100"
            >
              💾 Save All Fixture Changes
            </button>

            <button
              onClick={generateFixtures}
              className="btn btn-warning mt-2 w-100"
            >
              ♻️ Regenerate Fixtures
            </button>

            <button
              onClick={downloadFixtures}
              className="btn btn-outline-info mt-2 w-100"
            >
              ⬇ Download Fixtures
            </button>
          </>
        )}

        <button onClick={onClose} className="btn btn-secondary mt-3 w-100">
          Close
        </button>
      </div>
    </div>
  );
};

export default FixtureModal;
