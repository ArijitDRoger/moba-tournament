import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const RechargeStatus = ({ user }) => {
  const [userRequests, setUserRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchUserRequests = async () => {
      const q = query(
        collection(db, "rechargeRequests"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserRequests(list);
    };

    fetchUserRequests();
  }, [user]);

  return (
    <div className="container mt-4">
      <h4 className="glow">💎 Your Recharge Requests</h4>

      {userRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="table table-bordered table-striped table-hover bg-white">
          <thead>
            <tr>
              <th>Game</th>
              <th>Amount</th>
              <th>price</th>
              <th>IGN</th>
              <th>Zone ID</th>
              <th>Character ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {userRequests.map((r) => (
              <tr key={r.id}>
                <td>{r.game}</td>
                <td>{r.amount}</td>
                <td>₹{r.price}</td>
                <td>{r.ign || "N/A"}</td>
                <td>{r.zoneId || r.serverId || "N/A"}</td>
                <td>{r.characterId || "N/A"}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RechargeStatus;
