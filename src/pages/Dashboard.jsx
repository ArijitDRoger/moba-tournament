import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import "./Dashboard.css";

const Dashboard = () => {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberEmails, setMemberEmails] = useState({});
  const [isCreator, setIsCreator] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "teams"),
        where("memberIds", "array-contains", user.uid)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const teamDoc = snap.docs[0];
        const data = teamDoc.data();
        setTeam({ id: teamDoc.id, ...data });
        setIsCreator(data.createdBy === user.uid);
        setMembers(data.members);

        const emailMap = {};
        await Promise.all(
          data.members.map(async (member) => {
            const uid = member.uid || member; // fallback if data is string
            emailMap[uid] = member.email || "Unknown";
          })
        );
        setMemberEmails(emailMap);
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      if (!team) return;

      const q = query(
        collection(db, "tournaments"),
        where("registeredTeams", "array-contains", team.id)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJoinedTournaments(data);
    };

    const fetchPendingPayments = async () => {
      const user = auth.currentUser;
      if (!user || !team) return;

      const q = query(
        collection(db, "pendingPayments"),
        where("userId", "==", user.uid),
        where("teamId", "==", team.id),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => doc.data());
      setPendingPayments(data);
    };

    fetchTournaments();
    fetchPendingPayments();
  }, [team]);

  const handleKick = async (memberObj) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const teamRef = doc(db, "teams", team.id);
      await updateDoc(teamRef, {
        members: arrayRemove(memberObj),
        memberIds: arrayRemove(memberObj.uid),
      });
      alert("Member removed");
      setMembers((prev) => prev.filter((m) => m.uid !== memberObj.uid));
    } catch (err) {
      alert("Error removing member");
    }
  };

  const handleLeave = async () => {
    const confirm = window.confirm("Are you sure you want to leave this team?");
    if (!confirm) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const memberObj = members.find((m) => m.uid === user.uid);
      const teamRef = doc(db, "teams", team.id);
      await updateDoc(teamRef, {
        members: arrayRemove(memberObj),
        memberIds: arrayRemove(user.uid),
      });

      alert("You left the team!");
      setTeam(null);
      setMembers([]);
    } catch (err) {
      alert("Failed to leave team: " + err.message);
    }
  };

  const handleEditTeamName = async () => {
    try {
      const teamRef = doc(db, "teams", team.id);
      await updateDoc(teamRef, {
        teamName: newTeamName,
      });
      setTeam((prev) => ({ ...prev, teamName: newTeamName }));
      setEditing(false);
      alert("Team name updated!");
    } catch (err) {
      alert("Failed to update team name.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="glow">🏠 Dashboard</h2>
        <br />
        {team ? (
          <div>
            <h4>
              Team:{" "}
              {editing ? (
                <>
                  <input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                  <button
                    className="btn btn-success btn-sm ms-2"
                    onClick={handleEditTeamName}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-secondary btn-sm ms-2"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {team.teamName}{" "}
                  {isCreator && (
                    <button
                      className="btn btn-sm btn-outline-light ms-2"
                      onClick={() => {
                        setEditing(true);
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
              <b>Created By:</b>{" "}
              {isCreator ? "You" : memberEmails[team.createdBy] || "Unknown"}
            </p>
            <br />
            <h5 className="mt-3">Members:</h5>
            <ul>
              {members.map((member) => {
                const uid = member.uid || member;
                return (
                  <li key={uid} className="d-flex justify-content-between">
                    <span>
                      {uid === auth.currentUser.uid
                        ? "You"
                        : memberEmails[uid] || uid}
                    </span>
                    {isCreator && uid !== auth.currentUser.uid && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleKick(member)}
                      >
                        Kick
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {!isCreator && (
              <button className="btn btn-warning mt-3" onClick={handleLeave}>
                🚪 Leave Team
              </button>
            )}
            <br />
            {pendingPayments.length > 0 && (
              <div className="mt-4">
                <h5>⏳ Pending Tournaments:</h5>
                <ul>
                  {pendingPayments.map((p, idx) => (
                    <li key={idx}>
                      Tournament ID: <b>{p.tournamentId}</b> - Status:{" "}
                      <span className="text-warning">{p.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {joinedTournaments.length > 0 && (
              <div className="mt-4">
                <h5>🏆 Tournaments Joined:</h5>
                <ul>
                  {joinedTournaments.map((t) => (
                    <li key={t.id}>
                      <b>{t.title}</b> - {t.game} (Starts on {t.startDate})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>You are not in any team yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
