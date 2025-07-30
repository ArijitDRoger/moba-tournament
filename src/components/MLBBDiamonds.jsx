import React, { useState } from "react";
import RechargeCard from "./RechargeCard";
import RechargeModal from "./RechargeModal";

const mlbbPackages = [
  { amount: 86, price: 75 },
  { amount: 300, price: 380 },
  { amount: 600, price: 750 },
  { amount: 1500, price: 1900 },
];

const MLBBDiamonds = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="game-section">
      <h3 className="glow text-center">⚔️ MLBB Diamond Packages</h3>
      <div className="recharge-grid">
        {mlbbPackages.map((pkg, idx) => (
          <RechargeCard
            key={idx}
            game="MLBB"
            amount={pkg.amount}
            price={pkg.price}
            onClick={() => setSelected({ ...pkg, game: "MLBB" })}
          />
        ))}
      </div>
      {selected && (
        <RechargeModal
          game={selected.game}
          amount={selected.amount}
          price={selected.price}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default MLBBDiamonds;
