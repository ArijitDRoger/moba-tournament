import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
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
        memberIds: [user.uid], // ✅ added this field
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
          <input
            type="text"
            placeholder="Game Name (e.g., BGMI, MLBB)"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success">
            Create Team
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
