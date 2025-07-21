import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const ProfileImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Compress image to max 200KB and reasonable dimension
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };

    try {
      setUploading(true);
      const compressedFile = await imageCompression(file, options);

      console.log("Compressed size:", compressedFile.size / 1024, "KB");

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("User not authenticated");

      const storageRef = ref(storage, `profileImages/${uid}.jpg`);
      await uploadBytes(storageRef, compressedFile);

      const downloadURL = await getDownloadURL(storageRef);

      // ✅ Save URL in Firestore
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      setPreview(downloadURL);
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h5>Update Profile Picture</h5>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {uploading && <p>Uploading...</p>}
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ width: "150px", borderRadius: "50%" }}
        />
      )}
    </div>
  );
};

export default ProfileImageUploader;
