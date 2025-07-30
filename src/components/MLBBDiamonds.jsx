import React, { useState } from "react";
import RechargeCard from "./RechargeCard";
import RechargeModal from "./RechargeModal";

const mlbbPackages = [
  { amount: 11, price: 25 },
  { amount: 22, price: 45 },
  { amount: 44, price: 75 },
  { amount: 56, price: 85 },
  { amount: 67, price: 100 },
  { amount: 112, price: 165 },
  { amount: 145, price: 200 },
  { amount: 168, price: 230 },
  { amount: 224, price: 320 },
  { amount: 257, price: 350 },
  { amount: 280, price: 390 },
  { amount: 336, price: 460 },
  { amount: 429, price: 570 },
  { amount: 570, price: 760 },
  { amount: 626, price: 830 },
  { amount: 706, price: 940 },
  { amount: 1018, price: 1350 },
  { amount: 1163, price: 1500 },
  { amount: 1443, price: 1850 },
  { amount: 2195, price: 2800 },
  { amount: 2400, price: 3000 },
  { amount: 3024, price: 3800 },
  { amount: 6042, price: 7400 },
  { amount: "Weekly Pass", price: 170 },
  { amount: "Twilight Pass", price: 760 },
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
