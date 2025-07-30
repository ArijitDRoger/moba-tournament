import React from "react";
import "./RechargeCard.css";
import diamondImg from "../assets/diamond.png";
import ucImg from "../assets/uc.png";

const RechargeCard = ({ game, amount, price, onClick }) => {
  const gameIcon = game === "BGMI" ? ucImg : diamondImg;

  return (
    <div className="recharge-card" onClick={onClick}>
      <img src={gameIcon} alt={game} className="recharge-icon" />
      <h5 className="recharge-amount">
        {amount} {game === "BGMI" ? "UC" : "Diamonds"}
      </h5>
      <p className="recharge-price">₹{price}</p>
    </div>
  );
};

export default RechargeCard;
