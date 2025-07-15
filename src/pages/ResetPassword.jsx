import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import resetBg from "../assets/login.jpg"; // reuse login background
import "./glow.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📧 Password reset email sent. Check your inbox.");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${resetBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          padding: "40px",
          borderRadius: "12px",
          color: "white",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <h2
          className="glow"
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          Reset Password
        </h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Send Reset Email
          </button>
        </form>
        {message && (
          <p
            style={{ marginTop: "15px", textAlign: "center", color: "#00ffc3" }}
          >
            {message}
          </p>
        )}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to="/login" style={{ color: "#00f0ff" }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "none",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#00f0ff",
  color: "#000",
  fontWeight: "bold",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default ResetPassword;
