import React from "react";
import "./PurchasePage.css";
import BGMIUC from "../components/BGMIUC";
import MLBBDiamonds from "../components/MLBBDiamonds";

const PurchasePage = () => (
  <div className="purchase-wrapper">
    <h2 className="glow text-center mb-4">💎 Purchase UC & Diamonds</h2>
    <div className="purchase-cards">
      <MLBBDiamonds />
      <BGMIUC />
    </div>
  </div>
);

export default PurchasePage;
