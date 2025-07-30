import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { CSVLink } from "react-csv";

const RechargeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "rechargeRequests"));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(list);
    };
    fetch();
  }, []);

  const approve = async (id) => {
    await updateDoc(doc(db, "rechargeRequests", id), { status: "approved" });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const filtered = requests.filter(
    (r) =>
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.game?.toLowerCase().includes(search.toLowerCase())
  );

  const csvHeaders = [
    { label: "Email", key: "email" },
    { label: "In-Game Name", key: "nickname" }, // fallback handled in csvData
    { label: "Zone ID", key: "zoneId" },
    { label: "In-Game ID", key: "characterId" },
    { label: "Game", key: "game" },
    { label: "Amount", key: "amount" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status" },
  ];

  const csvData = filtered.map((r) => ({
    email: r.email,
    nickname: r.nickname || r.ign || "N/A",
    zoneId: r.zoneId || "N/A",
    characterId: r.characterId || "N/A",
    game: r.game,
    amount: r.amount,
    price: r.price,
    status: r.status || "pending",
  }));

  return (
    <div className="container mt-4">
      <h3 className="glow mb-3">📊 Recharge Requests</h3>

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by email or game"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename={"recharge_requests.csv"}
          className="btn btn-primary"
        >
          Export CSV
        </CSVLink>
      </div>

      <table className="table table-bordered table-striped table-hover bg-white">
        <thead>
          <tr>
            <th>Email</th>
            <th>In-Game Name</th>
            <th>Zone ID</th>
            <th>In-Game ID</th>
            <th>Game</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Status</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center text-muted">
                No recharge requests found.
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.nickname || r.ign || "N/A"}</td>
                <td>{r.zoneId || "N/A"}</td>
                <td>{r.characterId || "N/A"}</td>
                <td>{r.game}</td>
                <td>{r.amount}</td>
                <td>₹{r.price}</td>
                <td>
                  <span
                    className={`badge ${
                      r.status === "approved"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {r.status || "pending"}
                  </span>
                </td>
                <td>
                  {r.status !== "approved" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => approve(r.id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RechargeRequests;
