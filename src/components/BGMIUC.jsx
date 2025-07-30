import React, { useState } from "react";
import RechargeCard from "./RechargeCard";
import RechargeModal from "./RechargeModal";

const bgmiPackages = [
  { amount: 60, price: 75 },
  { amount: 325, price: 380 },
  { amount: 660, price: 750 },
  { amount: 1800, price: 1900 },
];

const BGMIUC = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="game-section">
      <h3 className="glow text-center">🎮 BGMI UC Packages</h3>
      <div className="recharge-grid">
        {bgmiPackages.map((pkg, idx) => (
          <RechargeCard
            key={idx}
            game="BGMI"
            amount={pkg.amount}
            price={pkg.price}
            onClick={() => setSelected({ ...pkg, game: "BGMI" })}
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

export default BGMIUC;
