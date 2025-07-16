import React from "react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Add this import
import "./DownloadApp.css";

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
  const apkUrl =
    "https://github.com/ArijitDRoger/moba-tournament/releases/download/v1.0.0/eTour.apk";

  return (
    <div className="download-page">
      <h2>📱 Download Moba Tournament App (Android)</h2>
      <a href={apkUrl} className="download-btn" download>
        ⬇️ Download APK
      </a>

      <div className="qr-section">
        <h3>📷 Scan QR to Download</h3>
        <QRCodeCanvas value={apkUrl} size={200} />
      </div>

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
    </div>
  );
};

export default DownloadApp;
