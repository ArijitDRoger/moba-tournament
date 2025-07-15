import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ViewFixtureModal = ({ tournamentId, onClose }) => {
  const [fixtures, setFixtures] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [tournamentName, setTournamentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const fetchFixtures = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      }

      const q = query(
        collection(db, "fixtures"),
        where("tournamentId", "==", tournamentId)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFixtures(data);

      const ids = new Set();
      data.forEach((f) => {
        ids.add(f.team1Id);
        ids.add(f.team2Id);
      });

      const names = {};
      await Promise.all(
        Array.from(ids).map(async (id) => {
          if (id !== "BYE") {
            const teamDoc = await getDoc(doc(db, "teams", id));
            names[id] = teamDoc.exists() ? teamDoc.data().teamName : "Unknown";
          } else {
            names[id] = "BYE";
          }
        })
      );
      setTeamNames(names);

      const tourSnap = await getDoc(doc(db, "tournaments", tournamentId));
      if (tourSnap.exists()) {
        setTournamentName(tourSnap.data().title);
      }

      setLoading(false);
    };

    fetchFixtures();
  }, [tournamentId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const exportPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text(`Fixtures - ${tournamentName}`, 14, 20);
    const rows = fixtures.map((f) => [
      f.matchNumber,
      teamNames[f.team1Id],
      teamNames[f.team2Id],
      f.matchTime || "TBD",
      f.round || "-",
    ]);
    docPDF.autoTable({
      head: [["Match No", "Team 1", "Team 2", "Time", "Round"]],
      body: rows,
    });
    docPDF.save(`${tournamentName}-fixtures.pdf`);
  };

  const exportExcel = () => {
    const wsData = [
      ["Match No", "Team 1", "Team 2", "Time", "Round"],
      ...fixtures.map((f) => [
        f.matchNumber,
        teamNames[f.team1Id],
        teamNames[f.team2Id],
        f.matchTime || "TBD",
        f.round || "-",
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Fixtures");
    XLSX.writeFile(wb, `${tournamentName}-fixtures.xlsx`);
  };

  const regenerateFixtures = async () => {
    const confirm = window.confirm(
      "Are you sure you want to regenerate fixtures? This will overwrite existing ones."
    );
    if (!confirm) return;

    setLoading(true);

    const oldFixtures = await getDocs(
      query(
        collection(db, "fixtures"),
        where("tournamentId", "==", tournamentId)
      )
    );
    await Promise.all(
      oldFixtures.docs.map((docSnap) =>
        deleteDoc(doc(db, "fixtures", docSnap.id))
      )
    );

    const tourSnap = await getDoc(doc(db, "tournaments", tournamentId));
    if (!tourSnap.exists()) {
      setLoading(false);
      return alert("Tournament not found");
    }

    const registered = tourSnap.data().registeredTeams || [];
    const shuffled = [...registered].sort(() => 0.5 - Math.random());

    const newFixtures = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const team1 = shuffled[i];
      const team2 = i + 1 < shuffled.length ? shuffled[i + 1] : "BYE";

      const fixture = {
        tournamentId,
        matchNumber: i / 2 + 1,
        team1Id: team1,
        team2Id: team2,
        matchTime: `Day ${i / 2 + 1} - 6:00 PM`,
        round: `Round ${Math.floor(i / 2) + 1}`,
        createdAt: new Date(),
      };

      await setDoc(
        doc(db, "fixtures", `${tournamentId}_match${fixture.matchNumber}`),
        fixture
      );
      newFixtures.push(fixture);
    }

    setFixtures(newFixtures);
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" ref={modalRef}>
        <button className="btn-close float-end" onClick={onClose}></button>
        <h4 className="text-center mb-3 glow">
          📋 Fixtures - {tournamentName}
        </h4>

        {loading ? (
          <p>Loading...</p>
        ) : fixtures.length === 0 ? (
          <p className="text-warning text-center">Fixture not generated yet.</p>
        ) : (
          <>
            {fixtures.map((match) => (
              <div key={match.matchNumber} className="card p-2 mb-2 glass-card">
                <b>Match {match.matchNumber}:</b> {teamNames[match.team1Id]} vs{" "}
                {teamNames[match.team2Id]}
                <br />
                <small>⏰ {match.matchTime || "Time TBD"}</small>
                <br />
                <small>🎯 {match.round || "Round TBD"}</small>
              </div>
            ))}

            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-info w-50 me-2"
                onClick={exportPDF}
              >
                ⬇ PDF
              </button>
              <button
                className="btn btn-outline-success w-50"
                onClick={exportExcel}
              >
                ⬇ Excel
              </button>
            </div>
          </>
        )}

        {isAdmin && fixtures.length > 0 && (
          <button
            className="btn btn-danger mt-3 w-100"
            onClick={regenerateFixtures}
          >
            🔁 Regenerate Fixtures
          </button>
        )}

        <button onClick={onClose} className="btn btn-secondary mt-3 w-100">
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewFixtureModal;
