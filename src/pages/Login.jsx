import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import loginBg from "../assets/login.jpg"; // Your image
import "./glow.css";
import "./auth.css"; // Same auth style used in Signup

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.85)), url(${loginBg})`,
      }}
    >
      <form className="auth-form" onSubmit={handleLogin}>
        <h2 className="glow" style={{ textAlign: "center" }}>
          Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-visibility"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button className="glow-button" type="submit">
          Login
        </button>
        <p className="auth-switch">
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        <Link to="/reset-password" style={{ color: "#00ffc3" }}>
          Forgot Password?
        </Link>
      </p>
    </div>
  );
};

export default Login;
