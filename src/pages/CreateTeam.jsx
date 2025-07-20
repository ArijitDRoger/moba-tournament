import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./CreateTeam.css";

const CreateTeam = () => {
  const [teamName, setTeamName] = useState("");
  const [gameName, setGameName] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");

      // ✅ Only block if already in a team *for this game*
      const q = query(
        collection(db, "teams"),
        where("game", "==", gameName),
        where("memberIds", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert(
          `You're already in a ${gameName} team. Leave it to create a new one.`
        );
        return;
      }

      // ✅ Proceed to create team
      await addDoc(collection(db, "teams"), {
        teamName,
        game: gameName,
        createdBy: user.uid,
        members: [
          {
            uid: user.uid,
            email: user.email,
          },
        ],
        memberIds: [user.uid],
        createdAt: new Date(),
      });

      alert("Team created!");
      navigate("/dashboard");
    } catch (err) {
      alert("Error creating team: " + err.message);
    }
  };

  return (
    <div className="create-team-container">
      <div className="form-box">
        <h2 className="glow">Create a Team</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          <div className="mb-3">
            <label className="form-label text-white">🎮 Game</label>
            <select
              className="form-control"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              required
            >
              <option value="">Select game</option>
              <option value="BGMI">BGMI</option>
              <option value="MLBB">Mobile Legends 5v5</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success">
            Create Team
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
