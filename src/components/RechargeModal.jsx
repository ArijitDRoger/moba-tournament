import React, { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const RechargeModal = ({ game, amount, price, onClose }) => {
  const [ign, setIgn] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    characterId: "",
    zoneId: "",
    nickname: "",
    serverId: "",
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSubmit = async () => {
    const isBGMI = game === "BGMI";
    const isMLBB = game === "MLBB";

    // 🔍 Validation
    if (isBGMI) {
      if (
        !formData.characterId.trim() ||
        !formData.zoneId.trim() ||
        !formData.nickname.trim()
      ) {
        setError("Please fill in all BGMI details");
        return;
      }
    } else if (isMLBB) {
      if (
        !formData.characterId.trim() ||
        !formData.serverId.trim() ||
        !ign.trim()
      ) {
        setError("Please fill in all MLBB details");
        return;
      }
    }

    try {
      const docRef = await addDoc(collection(db, "rechargeRequests"), {
        userId: user?.uid || "",
        email: user?.email || "",
        game,
        amount,
        price,
        characterId: formData.characterId.trim(),
        zoneId: isBGMI ? formData.zoneId.trim() : null,
        nickname: isBGMI ? formData.nickname.trim() : null,
        serverId: isMLBB ? formData.serverId.trim() : null,
        ign: isMLBB ? ign.trim() : null, // ✅ MLBB IGN stored
        requestedAt: serverTimestamp(),
        status: "pending",
      });

      navigate(`/pay/${docRef.id}`);
    } catch (err) {
      console.error("Error adding recharge request:", err);
      setError("Submission failed. Try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card p-4" ref={modalRef}>
        <h4 className="mb-3">Recharge Details ({game})</h4>

        <input
          className="form-control mb-2"
          placeholder={game === "MLBB" ? "User ID" : "Character ID"}
          value={formData.characterId}
          onChange={(e) =>
            setFormData({ ...formData, characterId: e.target.value })
          }
        />

        {game === "MLBB" ? (
          <>
            <input
              className="form-control mb-2"
              placeholder="Server ID"
              value={formData.serverId}
              onChange={(e) =>
                setFormData({ ...formData, serverId: e.target.value })
              }
            />
            <input
              className="form-control mb-2"
              placeholder="In-Game Name (IGN)"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              className="form-control mb-2"
              placeholder="Zone ID"
              value={formData.zoneId}
              onChange={(e) =>
                setFormData({ ...formData, zoneId: e.target.value })
              }
            />
            <input
              className="form-control mb-2"
              placeholder="In-Game Name"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
            />
          </>
        )}

        {error && (
          <div className="alert alert-danger text-center py-1 mt-2">
            {error}
          </div>
        )}

        <button className="btn btn-success w-100 mt-3" onClick={handleSubmit}>
          Proceed to Payment
        </button>
        <button className="btn btn-secondary mt-2 w-100" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RechargeModal;
