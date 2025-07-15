// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPdp2FTC4mvNSU25GtiH_XlMAhkV8q8p4",
  authDomain: "moba-tournament-58885.firebaseapp.com",
  projectId: "moba-tournament-58885",
  storageBucket: "moba-tournament-58885.appspot.com", // ✅ Fixed typo: should be .app**spot**.com
  messagingSenderId: "677184442413",
  appId: "1:677184442413:web:2bf10b75bf720c5afde8a4",
};

// 🔥 Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Set persistent login AFTER auth is initialized
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to local");
  })
  .catch((error) => {
    console.error("❌ Failed to set persistence", error);
  });

export { auth, db, storage };
