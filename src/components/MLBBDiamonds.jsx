import React, { useState } from "react";
import RechargeCard from "./RechargeCard";
import RechargeModal from "./RechargeModal";

const mlbbPackages = [
  { amount: 11, price: 25 },
  { amount: 22, price: 45 },
  { amount: 33, price: 65 },
  { amount: 56, price: 90 },
  { amount: 67, price: 100 },
  { amount: 86, price: 105 },
  { amount: 100, price: 165 },
  { amount: 123, price: 190 },
  { amount: 172, price: 210 },
  { amount: 252, price: 320 },
  { amount: 344, price: 430 },
  { amount: 429, price: 550 },
  { amount: 514, price: 650 },
  { amount: 706, price: 850 },
  { amount: 792, price: 970 },
  { amount: 878, price: 1050 },
  { amount: 963, price: 1180 },
  { amount: 1130, price: 1380 },
  { amount: 1412, price: 1690 },
  { amount: "Weekly Pass", price: 140 },
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
