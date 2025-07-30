import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./UPIPaymentPage.css";

const UPIPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);

  const adminWhatsappNumber = "917908486640";

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "rechargeRequests", id));
      if (snap.exists()) setRequest(snap.data());
    };
    fetchData();
  }, [id]);

  const handleWhatsappShare = () => {
    const message = `
📥 *Recharge Payment Done*
Game: ${request?.game}
in-game Name: ${request?.nickname || request?.ign}
Character ID: ${request?.characterId}
Zone ID: ${request?.zoneId || request?.serverId}
Amount: ${request?.amount}
Price: ₹${request?.price}
User: ${request?.email}
User name: ${request?.name || request?.userId}
Please confirm the payment and process the recharge.


🖼 *Please attach your payment screenshot here.*
    `;
    const whatsappLink = `https://wa.me/${adminWhatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.location.href = whatsappLink;
  };

  return (
    <div className="upi-page-container">
      <div className="upi-card">
        <button
          className="btn btn-outline-light btn-sm mb-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2 className="glow mb-3">💸 UPI Payment</h2>

        {request ? (
          <>
            <p className="upi-info">
              Pay <strong>₹{request.price}</strong> for{" "}
              <strong>{request.amount}</strong>{" "}
              {request.game === "BGMI" ? "UC" : "Diamonds"} in{" "}
              <strong>{request.game}</strong>.
            </p>

            <div className="qr-box my-4">
              <img src="/qr-code.jpg" alt="UPI QR Code" className="qr-image" />
              <p className="text-light mt-2">Scan with any UPI app</p>
            </div>

            <button className="whatsapp-btn" onClick={handleWhatsappShare}>
              <img
                src="/whatsapp.png"
                alt="whatsapp"
                className="whatsapp-icon"
              />
              Share Payment on WhatsApp
            </button>

            <p className="mt-3 text-light small">
              After clicking, manually attach your payment screenshot in
              WhatsApp.
            </p>
          </>
        ) : (
          <p className="text-white">Loading payment details...</p>
        )}
      </div>
    </div>
  );
};

export default UPIPaymentPage;
