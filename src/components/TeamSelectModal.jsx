// src/components/TeamSelectModal.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamSelectModal.css"; // Assuming you have some styles for the modal

const TeamSelectModal = ({
  tournament,
  teams,
  getRequiredMembers,
  onCancel,
}) => {
  const navigate = useNavigate();
  const eligibleTeams = teams.filter(
    (team) =>
      team.game === tournament.game &&
      team.memberIds.length >= getRequiredMembers(tournament.game)
  );

  useEffect(() => {
    console.log("Modal visible!");
  }, []);

  return (
    <div className="modal">
      <div className="modal-content p-4 glass-card">
        <h4>Select Team to Join {tournament.title}</h4>

        {eligibleTeams.length > 0 ? (
          <ul>
            {eligibleTeams.map((team) => (
              <li key={team.id} className="my-2">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    navigate(`/join/${tournament.id}/${team.id}`);
                    onCancel();
                  }}
                >
                  ✅ Join with Team: <b>{team.teamName}</b> (
                  {team.memberIds.length} players)
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-danger">
            No eligible teams available to join this tournament.
          </p>
        )}

        <button className="btn btn-outline-danger mt-2" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TeamSelectModal;
