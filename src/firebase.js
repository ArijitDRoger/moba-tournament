import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPdp2FTC4mvNSU25GtiH_XlMAhkV8q8p4",
  authDomain: "moba-tournament-58885.firebaseapp.com",
  projectId: "moba-tournament-58885",
  storageBucket: "moba-tournament-58885.appspot.com",
  messagingSenderId: "677184442413",
  appId: "1:677184442413:web:2bf10b75bf720c5afde8a4",
};

// ✅ Avoid re-initializing if already initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set auth persistence only once
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth, db, storage };
