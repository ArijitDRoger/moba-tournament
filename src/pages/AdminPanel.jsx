import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { CSVLink } from "react-csv";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import AdminBracketManager from "../components/AdminBracketManager";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [teamsMap, setTeamsMap] = useState({});
  const [tournamentsMap, setTournamentsMap] = useState({});
  const [sortBy, setSortBy] = useState("tournamentName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [activeTab, setActiveTab] = useState("recharges");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [payments, setPayments] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  const tabs = [
    { key: "pending", label: "Pending Approvals" },
    { key: "all", label: "All Tournaments" },
    { key: "ongoing", label: "Ongoing Tournaments" },
    { key: "upcoming", label: "Upcoming Tournaments" },
    { key: "bracket", label: "Bracket Manager" },
    { key: "recharges", label: "Recharges" },
  ];

  useEffect(() => {
    const fetchTournamentsMap = async () => {
      const snap = await getDocs(collection(db, "tournaments"));
      const map = {};
      snap.forEach((doc) => {
        map[doc.id] = doc.data();
      });
      setTournamentsMap(map);
    };
    fetchTournamentsMap();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (activeTab === "recharges") {
        const snap = await getDocs(collection(db, "rechargeRequests"));
        const enriched = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPayments(enriched);
      }

      if (activeTab === "pending") {
        const snap = await getDocs(collection(db, "pendingPayments"));
        const enriched = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Fetch team names
        const teamSnap = await getDocs(collection(db, "teams"));
        const teamsObj = {};
        teamSnap.docs.forEach((d) => {
          teamsObj[d.id] = d.data().teamName || "Unknown Team";
        });

        // ✅ Fetch tournament titles
        const tourSnap = await getDocs(collection(db, "tournaments"));
        const tourObj = {};
        tourSnap.docs.forEach((d) => {
          tourObj[d.id] = d.data().title || "Unknown Tournament";
        });

        setTeamsMap(teamsObj);
        setTournamentsMap(tourObj);
        setPayments(enriched);
      }

      if (["all", "ongoing", "upcoming", "bracket"].includes(activeTab)) {
        const snap = await getDocs(collection(db, "tournaments"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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

      setLoading(false);
    };

    fetchData(); // ✅ call the async function
  }, [activeTab]);

  const refreshRecharges = async () => {
    const snap = await getDocs(collection(db, "rechargeRequests"));
    const enriched = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPayments(enriched);
  };

  const csvHeaders = [
    { label: "Email", key: "email" },
    { label: "In-Game Name", key: "nickname" },
    { label: "Zone ID", key: "zoneId" },
    { label: "In-Game ID", key: "characterId" },
    { label: "Game", key: "game" },
    { label: "Amount", key: "amount" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status" },
    { label: "Requested At", key: "requestedAtFormatted" },
  ];

  const filteredAndSortedPayments = payments
    .filter(
      (p) =>
        (p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.game?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!onlyPending || p.status === "pending")
    )
    .sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() || "";
      const valB = b[sortBy]?.toLowerCase?.() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const csvData = filteredAndSortedPayments.map((p) => ({
    email: p.email,
    nickname: p.nickname || p.ign || "N/A",
    zoneId: p.zoneId || "N/A",
    characterId: p.characterId || "N/A",
    game: p.game,
    amount: p.amount,
    price: p.price,
    status: p.status || "pending",
    requestedAtFormatted: p.requestedAt
      ? new Date(p.requestedAt.seconds * 1000).toLocaleString()
      : "N/A",
  }));

  const totalPages = Math.ceil(
    filteredAndSortedPayments.length / paymentsPerPage
  );
  const paginatedPayments = filteredAndSortedPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  const pendingCsvHeaders = [
    { label: "Email", key: "email" },
    { label: "Team Name", key: "teamName" },
    { label: "Tournament Name", key: "tournamentName" },
    { label: "Status", key: "status" },
  ];

  const pendingCsvData = payments.map((p) => ({
    email: p.email,
    teamName: teamsMap[p.teamId] || p.teamId,
    tournamentName: tournamentsMap[p.tournamentId] || p.tournamentId,
    status: p.status,
  }));

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
              setSelectedTournamentId("");
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
          <div>
            {/* ✅ Show pendingPayments here */}
            <h5>Pending Team Joins</h5>
            <div className="d-flex justify-content-end mb-2">
              <CSVLink
                data={pendingCsvData}
                headers={pendingCsvHeaders}
                filename={"pending_approvals.csv"}
                className="btn btn-primary"
              >
                Download CSV
              </CSVLink>
            </div>

            <ul className="list-group">
              {payments.length === 0 ? (
                <li className="list-group-item">No pending payments</li>
              ) : (
                payments.map((p) => (
                  <li
                    key={p.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <b>Email:</b> {p.email} <br />
                      <b>Team:</b> {teamsMap[p.teamId] || p.teamId} <br />
                      <b>Tournament:</b>{" "}
                      {tournamentsMap[p.tournamentId] || p.tournamentId}
                    </div>
                    <div>
                      {p.status === "approved" ? (
                        <span className="badge bg-success">Approved</span>
                      ) : (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={async () => {
                              try {
                                // Mark payment as approved
                                await updateDoc(
                                  doc(db, "pendingPayments", p.id),
                                  {
                                    status: "approved",
                                  }
                                );

                                // Get tournament data
                                const tournamentRef = doc(
                                  db,
                                  "tournaments",
                                  p.tournamentId
                                );
                                const tournamentSnap = await getDoc(
                                  tournamentRef
                                );
                                const existing = tournamentSnap.exists()
                                  ? tournamentSnap.data().registeredTeams || []
                                  : [];

                                // Avoid duplicates
                                const updated = Array.from(
                                  new Set([...existing, p.teamId])
                                );

                                await updateDoc(tournamentRef, {
                                  registeredTeams: updated,
                                });

                                toast.success("Approved & team added!");

                                setPayments((prev) =>
                                  prev.map((item) =>
                                    item.id === p.id
                                      ? { ...item, status: "approved" }
                                      : item
                                  )
                                );
                              } catch (err) {
                                console.error("Approval failed", err);
                                toast.error("Failed to approve.");
                              }
                            }}
                          >
                            Approve
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              if (window.confirm("Delete this request?")) {
                                await deleteDoc(
                                  doc(db, "pendingPayments", p.id)
                                );
                                toast.error("Deleted");
                                setPayments((prev) =>
                                  prev.filter((item) => item.id !== p.id)
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : activeTab === "recharges" ? (
          // your existing recharge table here
          <div>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Search by email or game"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="filterPending"
                  checked={onlyPending}
                  onChange={(e) => setOnlyPending(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="filterPending">
                  Only Pending
                </label>
              </div>
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={"recharges.csv"}
                className="btn btn-primary"
              >
                Export CSV
              </CSVLink>
            </div>

            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>In-Game Name</th>
                  <th>Zone ID / Server ID</th>
                  <th>In-Game ID</th>
                  <th>Game</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Approve</th>
                  <th>Reject</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.email}</td>
                    <td>{p.nickname || p.ign || "N/A"}</td>
                    <td>{p.zoneId || p.serverId || "N/A"}</td>
                    <td>{p.characterId || "N/A"}</td>
                    <td>{p.game}</td>
                    <td>{p.amount}</td>
                    <td>₹{p.price}</td>
                    <td>
                      {p.requestedAt
                        ? new Date(
                            p.requestedAt.seconds * 1000
                          ).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === "approved"
                            ? "bg-success"
                            : p.status === "rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status !== "approved" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={async () => {
                            await updateDoc(doc(db, "rechargeRequests", p.id), {
                              status: "approved",
                            });
                            toast.success("Approved!");
                            refreshRecharges();
                          }}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                    <td>
                      {p.status !== "rejected" && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={async () => {
                            await updateDoc(doc(db, "rechargeRequests", p.id), {
                              status: "rejected",
                            });
                            toast.info("Rejected.");
                            refreshRecharges();
                          }}
                        >
                          Reject
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (
                            window.confirm("Are you sure you want to delete?")
                          ) {
                            await deleteDoc(doc(db, "rechargeRequests", p.id));
                            toast.error("Deleted.");
                            refreshRecharges();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-sm ${
                      currentPage === idx + 1
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } mx-1`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "bracket" ? (
          <>
            <select
              className="form-select mb-3"
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
            >
              <option value="">Select Tournament</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            {selectedTournamentId && (
              <AdminBracketManager tournamentId={selectedTournamentId} />
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
                  <b>Teams Joined:</b> {tour.registeredTeams?.length || 0}/
                  {tour.maxTeams}
                </p>
              </div>
            ))
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminPanel;
