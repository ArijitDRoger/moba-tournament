// src/components/BeautifulLoader.jsx
import React from "react";
import "./BeautifulLoader.css";

const BeautifulLoader = () => {
  return (
    <div className="loader-wrapper">
      <div className="spinner"></div>
      <h2 className="glow-text">Loading e-Tournament...</h2>
    </div>
  );
};

export default BeautifulLoader;
