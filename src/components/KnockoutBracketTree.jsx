// src/components/KnockoutBracketTree.jsx
import React from "react";
import "./KnockoutBracketTree.css";

const KnockoutBracketTree = ({ fixturesByRound, teamNames }) => {
  const rounds = Object.keys(fixturesByRound).sort();

  const getRoundLabel = (roundKey, totalRounds) => {
    const roundNumber = parseInt(roundKey.replace(/\D/g, ""), 10);

    if (totalRounds === 1) return "🏆 Final";
    if (totalRounds === 2) {
      return roundNumber === 1 ? "🎯 Semi Final" : "🏆 Final";
    }
    if (totalRounds === 3) {
      if (roundNumber === 1) return "🎮 Quarter Final";
      if (roundNumber === 2) return "🎯 Semi Final";
      return "🏆 Final";
    }
    if (totalRounds >= 4) {
      const labels = {
        4: "🔰 Round 1",
        3: "🎮 Quarter Final",
        2: "🎯 Semi Final",
        1: "🏆 Final",
      };
      return labels[totalRounds - roundNumber + 1] || `Round ${roundNumber}`;
    }
    return `Round ${roundNumber}`;
  };

  return (
    <div className="bracket-tree">
      {rounds.map((round, rIndex) => (
        <div key={round} className="bracket-round">
          <h6 className="text-warning text-center">
            {getRoundLabel(round, Object.keys(fixturesByRound).length)}
          </h6>
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
