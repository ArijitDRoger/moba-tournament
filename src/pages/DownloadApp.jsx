import React from "react";
import "./DownloadApp.css";
import apkQR from "../assets/apk-qr.png"; // Optional QR code image
import apkFile from "../assets/moba-tournament.apk"; // Your actual APK

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
  return (
    <div className="download-page">
      <h2>📱 Download Moba Tournament App (Android)</h2>
      <a href={apkFile} download className="download-btn">
        ⬇️ Download Latest APK
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
        <p>📷 Scan QR Code to download directly:</p>
        <img src={apkQR} alt="Download QR" />
      </div>
    </div>
  );
};

export default DownloadApp;
