import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import paytmQR from "../assets/qr.jpg";

const JoinWithPayment = () => {
  console.log("Navigated to JoinWithPayment", tournamentId, teamId);

  const { tournamentId, teamId } = useParams();
  const navigate = useNavigate();

  const handleSendScreenshot = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first.");
      return;
    }

    // Save pending payment info in Firestore
    try {
      await addDoc(collection(db, "pendingPayments"), {
        tournamentId,
        teamId,
        userId: user.uid,
        email: user.email,
        status: "pending",
        submittedAt: new Date(),
      });
    } catch (err) {
      console.error("Error saving payment info:", err);
      alert("Something went wrong. Please try again.");
      return;
    }

    // Open WhatsApp with prefilled message
    const message = `Hello Admin,\nI’ve paid the tournament entry fee.\nTournament ID: ${tournamentId}\nTeam ID: ${teamId}\nPlease find the payment screenshot attached.`;
    const whatsappURL = `https://wa.me/917001688122?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");

    alert("Request submitted. Please share the screenshot in WhatsApp.");
    navigate("/dashboard");
  };

  return (
    <div className="p-4">
      <h3>Join Tournament</h3>
      <p>Scan the QR code below to pay the entry fee:</p>
      <img src={paytmQR} alt="Paytm QR" style={{ width: "250px" }} />

      <p className="mt-3">After payment, click below to notify the admin:</p>
      <button className="btn btn-success mt-3" onClick={handleSendScreenshot}>
        Send Screenshot on WhatsApp
      </button>

      <button
        className="btn btn-secondary mt-3 ms-3"
        onClick={() => navigate("/tournaments")}
      >
        Back to Tournaments
      </button>
    </div>
  );
};

export default JoinWithPayment;
