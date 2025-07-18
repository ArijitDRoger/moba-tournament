import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import promoImg from "../assets/landing-hero.png"; // your hero image

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">🎮 e-Tournament</div>
        <div className="auth-buttons">
          <Link to="/login" className="btn login">
            Login
          </Link>
          <Link to="/signup" className="btn signup">
            Sign Up
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>
            Run & Join <span className="highlight">Mobile-Esports</span>{" "}
            Tournaments in <span className="highlight">Minutes</span>
          </h1>
          <p>
            Create teams, pay entry fees, auto-generate fixtures, and track live
            brackets <br /> all in one responsive web & Android app.
          </p>
          <Link to="/signup" className="btn primary">
            Get Started Free
          </Link>
        </div>

        <div className="hero-image">
          <img src={promoImg} alt="eTournament banner" />
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <ul>
          <li>
            <span>1</span> Create or join a team & pick a tournament
          </li>
          <li>
            <span>2</span> Pay securely via Paytm QR – auto verified
          </li>
          <li>
            <span>3</span> Track live fixtures & knockout brackets
          </li>
        </ul>
      </section>

      <footer className="landing-footer">
        <p>© 2025 eTournament. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
