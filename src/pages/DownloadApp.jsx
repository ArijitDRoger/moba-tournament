import React from "react";
import "./DownloadApp.css";
import { QRCodeCanvas } from "qrcode.react";

// import apkQR from "../assets/apk-qr.png"; // Optional QR code image

const changelog = [
  {
    version: "1.0.0",
    date: "July 14, 2025",
    changes: [
      "Initial release",
      "Join & create teams",
      "Admin panel with fixture system",
    ],
  },
  {
    version: "1.1.0",
    date: "Coming Soon",
    changes: ["Push notifications", "Live score updates", "Download analytics"],
  },
];

const DownloadApp = () => {
  const apkUrl = "/assets/eTour.apk"; // Update if hosted elsewhere
  const whatsappLink = `https://wa.me/?text=Hey!%20Download%20the%20eTournament%20App:%20${window.location.origin}${apkUrl}`;

  return (
    <div className="download-page">
      <h2>📱 Download Moba Tournament App (Android)</h2>
      <a href={apkUrl} className="download-btn" download>
        Download APK
      </a>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="download-btn whatsapp-btn"
      >
        📤 Send via WhatsApp
      </a>

      <h3>📌 What's New</h3>
      <ul className="changelog">
        {changelog.map((log) => (
          <li key={log.version}>
            <strong>
              {log.version} - {log.date}
            </strong>
            <ul>
              {log.changes.map((change, i) => (
                <li key={i}>- {change}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="qr-section">
        <h3>Scan to Download</h3>
        <QRCodeCanvas
          value="https://etournament.netlify.app/assets/eTour.apk"
          size={200}
        />
      </div>
    </div>
  );
};

export default DownloadApp;
