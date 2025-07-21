// src/components/KnockoutBracketTree.jsx
import React from "react";
import "./KnockoutBracketTree.css";

const KnockoutBracketTree = ({ fixturesByRound, teamNames }) => {
  const rounds = Object.keys(fixturesByRound).sort();

  return (
    <div className="bracket-tree">
      {rounds.map((round, rIndex) => (
        <div key={round} className="bracket-round">
          <h6 className="round-title">{round}</h6>
          <div className="match-column">
            {fixturesByRound[round].map((match, mIndex) => {
              const team1 = teamNames[match.team1Id] || match.team1Id;
              const team2 = teamNames[match.team2Id] || match.team2Id;
              const winner =
                teamNames[match.winnerId] || match.winnerId || null;

              return (
                <div className="match-box" key={match.id}>
                  <div
                    className={`team ${
                      match.winnerId === match.team1Id ? "winner" : ""
                    }`}
                  >
                    {team1}
                  </div>
                  <div
                    className={`team ${
                      match.winnerId === match.team2Id ? "winner" : ""
                    }`}
                  >
                    {team2}
                  </div>
                  {winner && <div className="winner-label">🏅 {winner}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KnockoutBracketTree;
