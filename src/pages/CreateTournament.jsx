import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./CreateTournament.css"; // ✅ Import your custom glassy styles

const CreateTournament = () => {
  const [form, setForm] = useState({
    title: "",
    game: "",
    entryFee: "",
    maxTeams: "",
    startDate: "",
    rules: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return alert("Login required");

      const docRef = await addDoc(collection(db, "tournaments"), {
        ...form,
        entryFee: parseInt(form.entryFee),
        maxTeams: parseInt(form.maxTeams),
        createdBy: user.uid,
        registeredTeams: [],
        status: "upcoming", // Add default status
        createdAt: new Date(),
      });

      alert("🎉 Tournament created!");
    } catch (err) {
      console.error("🔥 Firestore Error:", err);
      alert("Error creating tournament");
    }
  };

  return (
    <div className="create-tournament-container">
      <div className="glass-form p-4">
        <h2 className="glow text-white mb-4 text-center">
          🎮 Create New Tournament
        </h2>
        <form onSubmit={handleCreate}>
          <div className="mb-3">
            <label className="form-label text-white">🏷️ Title</label>
            <input
              className="form-control"
              name="title"
              placeholder="Enter tournament title"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">🎮 Game</label>
            <select
              className="form-control"
              name="game"
              onChange={handleChange}
              required
            >
              <option value="">Select game</option>
              <option value="BGMI">BGMI</option>
              <option value="MLBB">Mobile Legends 5v5</option>
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-white">💰 Entry Fee (₹)</label>
              <input
                className="form-control"
                name="entryFee"
                type="number"
                placeholder="Entry fee"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-white">👥 Max Teams</label>
              <input
                className="form-control"
                name="maxTeams"
                type="number"
                placeholder="Number of teams"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-white">📅 Start Date</label>
            <input
              className="form-control"
              name="startDate"
              type="date"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-white">📜 Rules</label>
            <textarea
              className="form-control"
              name="rules"
              placeholder="Enter tournament rules"
              rows="4"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-warning w-100 fw-bold">
            🚀 Create Tournament
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;
