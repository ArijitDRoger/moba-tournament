import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { CSVLink } from "react-csv";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

import "./AdminPanel.css";

const AdminPanel = () => {
  const [sortBy, setSortBy] = useState("tournamentName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [payments, setPayments] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTournament, setSelectedTournament] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  const tabs = [
    { key: "pending", label: "Pending Approvals" },
    { key: "all", label: "All Tournaments" },
    { key: "ongoing", label: "Ongoing Tournaments" },
    { key: "upcoming", label: "Upcoming Tournaments" },
    { key: "teams", label: "All Teams" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (activeTab === "pending") {
        const snap = await getDocs(collection(db, "pendingPayments"));
        const enriched = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();

            let tournamentName = "Unknown";
            try {
              const tourDoc = await getDoc(
                doc(db, "tournaments", data.tournamentId)
              );
              if (tourDoc.exists()) {
                tournamentName = tourDoc.data().title;
              }
            } catch {}

            let teamName = "Unknown";
            try {
              const teamDoc = await getDoc(doc(db, "teams", data.teamId));
              if (teamDoc.exists())
                teamName = teamDoc.data().teamName || teamDoc.data().name;
            } catch {}

            return {
              id: docSnap.id,
              ...data,
              tournamentName,
              teamName,
            };
          })
        );
        setPayments(enriched);
      }

      if (["all", "ongoing", "upcoming"].includes(activeTab)) {
        const snap = await getDocs(collection(db, "tournaments"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const today = new Date().toISOString().split("T")[0];

        const updated = await Promise.all(
          data.map(async (t) => {
            const correctStatus = t.startDate <= today ? "ongoing" : "upcoming";
            if (t.status !== correctStatus) {
              await updateDoc(doc(db, "tournaments", t.id), {
                status: correctStatus,
              });
            }
            return { ...t, status: correctStatus };
          })
        );

        setTournaments(updated);
      }

      if (activeTab === "teams") {
        const teamSnap = await getDocs(collection(db, "teams"));
        const tournamentSnap = await getDocs(collection(db, "tournaments"));

        const tournamentMap = {};
        const gameSet = new Set();

        tournamentSnap.docs.forEach((doc) => {
          const data = doc.data();
          tournamentMap[doc.id] = data;
          gameSet.add(data.game);
        });

        const teamData = teamSnap.docs.map((doc) => {
          const data = doc.data();
          const tournament = tournamentMap[data.tournamentId] || {};

          return {
            id: doc.id,
            name: data.teamName || "Unknown",
            members: data.members || [], // ✅ correctly access members
            tournamentTitle: tournament.title || "Unknown",
            game: data.game || tournament.game || "Unknown",
          };
        });

        setTeams(teamData);
        setFilteredTeams(teamData);
        setGames([...gameSet]);
      }

      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    let filtered = [...teams];
    if (selectedGame) {
      filtered = filtered.filter((team) => team.game === selectedGame);
    }
    if (selectedTournament) {
      filtered = filtered.filter(
        (team) => team.tournamentTitle === selectedTournament
      );
    }
    setFilteredTeams(filtered);
  }, [selectedGame, selectedTournament, teams]);

  const handleApprove = async (payment) => {
    try {
      await updateDoc(doc(db, "pendingPayments", payment.id), {
        status: "approved",
      });
      await updateDoc(doc(db, "tournaments", payment.tournamentId), {
        registeredTeams: arrayUnion(payment.teamId),
      });
      await updateDoc(doc(db, "teams", payment.teamId), {
        tournamentId: payment.tournamentId,
      });
      alert("Approved & registered!");
      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "approved" } : p
        )
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const csvHeaders = [
    { label: "Email", key: "email" },
    { label: "Team", key: "teamName" },
    { label: "Tournament", key: "tournamentName" },
    { label: "Status", key: "status" },
    { label: "Screenshot URL", key: "screenshotURL" },
  ];

  const filteredAndSortedPayments = payments
    .filter(
      (p) =>
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() || "";
      const valB = b[sortBy]?.toLowerCase?.() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(
    filteredAndSortedPayments.length / paymentsPerPage
  );
  const paginatedPayments = filteredAndSortedPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  return (
    <div className="admin-container">
      <h2 className="admin-heading">🛠️ Admin Panel</h2>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
          >
            {tab.label}
          </div>
        ))}
        <div className={`tab-underline ${activeTab}`} />
      </div>

      <div className="tab-content mt-4">
        {loading ? (
          <p>Loading...</p>
        ) : activeTab === "pending" ? (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <input
                type="text"
                className="form-control w-auto"
                placeholder="🔍 Search by email or team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="tournamentName">Sort by Tournament</option>
                  <option value="teamName">Sort by Team</option>
                  <option value="status">Sort by Status</option>
                </select>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortOrder === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
                </button>

                <CSVLink
                  data={filteredAndSortedPayments}
                  headers={csvHeaders}
                  filename="pending-approvals.csv"
                  className="btn btn-outline-info"
                >
                  ⬇ Export CSV
                </CSVLink>
              </div>
            </div>

            {filteredAndSortedPayments.length === 0 ? (
              <p>No pending payments.</p>
            ) : (
              paginatedPayments.map((p) => (
                <div key={p.id} className="admin-glass-card admin-glow">
                  <p>
                    <b>Email:</b> {p.email}
                  </p>
                  <p>
                    <b>Tournament:</b> {p.tournamentName}
                  </p>
                  <p>
                    <b>Team:</b> {p.teamName}
                  </p>
                  <p>
                    <b>Status:</b>{" "}
                    <span
                      className={`badge ${
                        p.status === "pending" ? "bg-warning" : "bg-success"
                      }`}
                    >
                      {p.status}
                    </span>
                  </p>
                  <a
                    href={p.screenshotURL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-info btn-sm my-2"
                  >
                    View Screenshot
                  </a>
                  {p.status === "pending" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(p)}
                    >
                      ✅ Approve & Register
                    </button>
                  )}
                </div>
              ))
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  ⬅ Prev
                </button>
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next ➡
                </button>
              </div>
            </div>
          </>
        ) : activeTab === "teams" ? (
          <>
            <div className="d-flex gap-3 mb-3">
              <select
                className="form-select"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                <option value="">Filter by Game</option>
                {games.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                className="form-select"
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
              >
                <option value="">Filter by Tournament</option>
                {[...new Set(teams.map((t) => t.tournamentTitle))].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {filteredTeams.length === 0 ? (
              <p>No teams found.</p>
            ) : (
              filteredTeams.map((team) => (
                <div key={team.id} className="admin-glass-card admin-glow">
                  <p>
                    <b>Team Name:</b> {team.name}
                  </p>
                  <p>
                    <b>Game:</b> {team.game}
                  </p>
                  <p>
                    <b>Tournament:</b> {team.tournamentTitle}
                  </p>
                  <p>
                    <b>Members:</b>
                  </p>
                  <ul>
                    {team.members.map((member, i) => (
                      <li key={i}>{member.email}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </>
        ) : (
          tournaments
            .filter((t) => activeTab === "all" || t.status === activeTab)
            .map((tour) => (
              <div key={tour.id} className="admin-glass-card admin-glow">
                <h5>{tour.title}</h5>
                <p>
                  <b>Game:</b> {tour.game}
                </p>
                <p>
                  <b>Start Date:</b> {tour.startDate}
                </p>
                <p>
                  <b>Status:</b> {tour.status}
                </p>
                <p>
                  <b>Teams Joined:</b> {tour.registeredTeams?.length || 0} /{" "}
                  {tour.maxTeams}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
