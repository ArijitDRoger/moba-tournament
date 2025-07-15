import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import paytmQR from "../assets/qr.jpg";

const JoinWithPayment = () => {
  const { tournamentId, teamId } = useParams();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState(null);

  const handleSendScreenshot = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first.");
      return;
    }

    let screenshotURL = "";

    // Upload screenshot to Firebase Storage (if uploaded)
    if (screenshot) {
      const storageRef = ref(
        storage,
        `screenshots/${Date.now()}_${screenshot.name}`
      );
      try {
        const snap = await uploadBytes(storageRef, screenshot);
        screenshotURL = await getDownloadURL(snap.ref);
      } catch (err) {
        console.error("Error uploading screenshot", err);
        alert("Screenshot upload failed.");
        return;
      }
    }

    // Save pending payment info
    try {
      await addDoc(collection(db, "pendingPayments"), {
        tournamentId,
        teamId,
        userId: user.uid,
        email: user.email,
        screenshotURL: screenshotURL || "",
        status: "pending",
        submittedAt: new Date(),
      });
    } catch (err) {
      console.error("Error saving to Firestore", err);
      alert("Error saving payment status");
      return;
    }

    const message = `Hello Admin,\nI've paid for the tournament.\nTournament ID: ${tournamentId}\nTeam ID: ${teamId}\nPlease find the payment screenshot attached.`;
    const whatsappLink = `https://wa.me/917001688122?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");

    alert("Payment request sent. Please wait for approval.");
    navigate("/dashboard");
  };

  return (
    <div className="p-4">
      <h3>Join Tournament</h3>
      <p>Scan the QR below and pay the tournament entry fee.</p>
      <img src={paytmQR} alt="Paytm QR" style={{ width: "250px" }} />

      <p className="mt-3">Upload your payment screenshot:</p>
      <input type="file" onChange={(e) => setScreenshot(e.target.files[0])} />

      <p className="mt-3">Then click below to notify admin:</p>
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
