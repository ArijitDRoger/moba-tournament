import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import "./Dashboard.css";

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "teams"),
        where("memberIds", "array-contains", user.uid)
      );
      const snap = await getDocs(q);

      const fetchedTeams = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const emailMap = {};
          data.members.forEach((m) => {
            emailMap[m.uid] = m.email || "Unknown";
          });

          const tourQuery = query(
            collection(db, "tournaments"),
            where("registeredTeams", "array-contains", docSnap.id)
          );
          const tourSnap = await getDocs(tourQuery);

          const tournamentsJoined = tourSnap.docs.map((t) => ({
            id: t.id,
            title: t.data().title,
            status: t.data().status || "upcoming",
            startDate: t.data().startDate || "N/A",
          }));

          return {
            id: docSnap.id,
            ...data,
            isCreator: data.createdBy === user.uid,
            memberEmails: emailMap,
            tournaments: tournamentsJoined,
          };
        })
      );

      setTeams(fetchedTeams);
    };

    fetchTeams();
  }, []);

  const handleLeaveTeam = async (teamId, memberObj) => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        members: arrayRemove(memberObj),
        memberIds: arrayRemove(memberObj.uid),
      });

      alert("You left the team!");
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      alert("Failed to leave team: " + err.message);
    }
  };

  const handleKick = async (teamId, memberObj) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        members: arrayRemove(memberObj),
        memberIds: arrayRemove(memberObj.uid),
      });

      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                members: team.members.filter((m) => m.uid !== memberObj.uid),
              }
            : team
        )
      );
    } catch (err) {
      alert("Error removing member: " + err.message);
    }
  };

  const handleUpdateTeamName = async (teamId) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        teamName: newTeamName,
      });

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId ? { ...team, teamName: newTeamName } : team
        )
      );

      setEditingTeamId(null);
      alert("Team name updated!");
    } catch (err) {
      alert("Failed to update team name.");
    }
  };

  const getStatusColor = (status) => {
    if (status === "ongoing") return "#ff0";
    if (status === "finished") return "#f44";
    return "#0ff"; // upcoming
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="glow">🏠 Dashboard</h2>
        <br />
        {teams.length > 0 ? (
          teams.map((team) => (
            <div key={team.id} className="team-box mb-4">
              <h4>
                Team:{" "}
                {editingTeamId === team.id ? (
                  <>
                    <input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                    <button
                      className="btn btn-success btn-sm ms-2"
                      onClick={() => handleUpdateTeamName(team.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm ms-2"
                      onClick={() => setEditingTeamId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {team.teamName}
                    {team.isCreator && (
                      <button
                        className="btn btn-outline-light btn-sm ms-2"
                        onClick={() => {
                          setEditingTeamId(team.id);
                          setNewTeamName(team.teamName);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
              </h4>

              <p>
                <b>Game:</b> {team.game} <br />
                <b>Created By:</b>{" "}
                {team.isCreator
                  ? "You"
                  : team.memberEmails[team.createdBy] || "Unknown"}
              </p>

              <h5>Members:</h5>
              <ul>
                {team.members.map((member) => (
                  <li
                    key={member.uid}
                    className="d-flex justify-content-between"
                  >
                    <span>
                      {member.uid === auth.currentUser.uid
                        ? "You"
                        : team.memberEmails[member.uid] || member.uid}
                    </span>
                    {team.isCreator && member.uid !== auth.currentUser.uid && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleKick(team.id, member)}
                      >
                        Kick
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {!team.isCreator && (
                <button
                  className="btn btn-warning mt-2"
                  onClick={() =>
                    handleLeaveTeam(
                      team.id,
                      team.members.find((m) => m.uid === auth.currentUser.uid)
                    )
                  }
                >
                  🚪 Leave Team
                </button>
              )}

              {/* ✅ Tournaments for this team */}
              <div className="mt-3">
                <h5 style={{ color: "#0f0" }}>🎮 Tournaments Joined:</h5>
                {team.tournaments?.length > 0 ? (
                  <ul>
                    {team.tournaments.map((t) => (
                      <li key={t.id}>
                        <strong>{t.title}</strong> –{" "}
                        <span style={{ color: getStatusColor(t.status) }}>
                          {t.status}
                        </span>{" "}
                        | Start: {t.startDate}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "#ccc" }}>No tournaments joined yet.</p>
                )}
              </div>

              <hr style={{ borderColor: "#555" }} />
            </div>
          ))
        ) : (
          <p>You are not in any team yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
