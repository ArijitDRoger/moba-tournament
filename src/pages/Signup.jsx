import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./glow.css";
import "./auth.css"; // Custom styles for auth pages
// 👈 custom auth styles

const Signup = () => {
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email: user.email,
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="glow">Create Account</h2>
      <form className="auth-form" onSubmit={handleSignup}>
        <input
          placeholder="Your Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="glow-button" type="submit">
          Sign Up
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
