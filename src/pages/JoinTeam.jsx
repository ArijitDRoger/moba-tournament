import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./JoinTeam.css";

const JoinTeam = () => {
  const [teamName, setTeamName] = useState("");
  const [allTeams, setAllTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setCurrentUserId(user.uid);

      const snap = await getDocs(collection(db, "teams"));
      const teams = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();

          let creatorName = "Unknown";
          try {
            const userDoc = await getDoc(doc(db, "users", data.createdBy));
            if (userDoc.exists()) {
              creatorName = userDoc.data().name || "Unknown";
            }
          } catch {}

          return {
            id: docSnap.id,
            ...data,
            creatorName,
          };
        })
      );
      setAllTeams(teams);
      setFilteredTeams(teams);
    };

    fetchTeams();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setTeamName(val);
    const filtered = allTeams.filter((t) =>
      t.teamName.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredTeams(filtered);
  };

  const handleJoin = async (e, selectedTeam = null) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");

      const teamToJoin = selectedTeam
        ? selectedTeam
        : filteredTeams.find((t) => t.teamName === teamName);
      if (!teamToJoin) return alert("Team not found");

      const isAlreadyMember = teamToJoin.members.some(
        (m) => m.uid === user.uid
      );
      if (isAlreadyMember) {
        alert("You are already in this team!");
        return;
      }

      if (teamToJoin.members.length >= 5) {
        alert("This team is already full (5 members).");
        return;
      }

      const snap = await getDocs(
        query(
          collection(db, "teams"),
          where("teamName", "==", teamToJoin.teamName)
        )
      );

      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          members: arrayUnion({
            uid: user.uid,
            email: user.email,
          }),
          memberIds: arrayUnion(user.uid), // ✅ Add this
        });
        alert("Joined team!");
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Error joining team: " + err.message);
    }
  };

  return (
    <div
      className="join-team-container"
      style={{
        backgroundImage: `url('/images/bg-game.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "60px 0",
      }}
    >
      <div className="glass-box p-4">
        <h2 className="glow text-white text-center mb-4">🤝 Join a Team</h2>
        <form onSubmit={handleJoin}>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Search by Team Name"
            value={teamName}
            onChange={handleSearch}
          />
          <button className="btn btn-success w-100 mb-4" type="submit">
            Search & Join
          </button>
        </form>

        <h5 className="text-white">Or select from the list below:</h5>
        <div className="team-list">
          {filteredTeams.map((team) => {
            const isMember = team.members.some((m) => m.uid === currentUserId);
            const isFull = team.members.length >= 5;

            return (
              <div key={team.id} className="team-card">
                <div className="team-info">
                  <strong>🔥 {team.teamName}</strong>
                  <br />
                  🎮 {team.game || "N/A"} | 👥 {team.members.length} Members
                  <br />
                  👑 {team.creatorName}
                </div>

                <div>
                  {isMember ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      ✅ Member
                    </button>
                  ) : isFull ? (
                    <button className="btn btn-danger btn-sm" disabled>
                      ❌ Team Full
                    </button>
                  ) : (
                    <button
                      className="join-button"
                      onClick={(e) => handleJoin(e, team)}
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;
