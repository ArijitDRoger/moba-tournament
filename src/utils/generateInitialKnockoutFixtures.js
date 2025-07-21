// utils/generateInitialKnockoutFixtures.js
import { db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export const generateInitialKnockoutFixtures = async (tournament) => {
  const fixtureRef = collection(db, "fixtures");

  // ✅ 1. Clear existing fixtures
  const q = query(fixtureRef, where("tournamentId", "==", tournament.id));
  const existingSnap = await getDocs(q);
  await Promise.all(existingSnap.docs.map((docSnap) => deleteDoc(docSnap.ref)));

  // ✅ 2. Validate and prepare teams
  const teams = Array.isArray(tournament.registeredTeams)
    ? [...tournament.registeredTeams]
    : [];

  if (teams.length < 2) {
    console.warn("⚠️ Not enough teams to create fixtures.");
    throw new Error("At least 2 teams required to generate fixtures.");
  }

  // ✅ 3. Shuffle teams randomly
  const shuffled = teams.sort(() => 0.5 - Math.random());

  console.log("🧪 Shuffled Teams:", shuffled);

  // ✅ 4. Create Round 1 fixtures
  const roundName = "Round 1";
  let matchNumber = 1;

  for (let i = 0; i < shuffled.length; i += 2) {
    const team1 = shuffled[i];
    const team2 = i + 1 < shuffled.length ? shuffled[i + 1] : "BYE";

    const fixture = {
      tournamentId: tournament.id,
      round: roundName,
      matchNumber,
      team1Id: team1,
      team2Id: team2,
      winnerId: "", // let admin set later
      createdAt: new Date().toISOString(),
    };

    const docId = `${tournament.id}_match${matchNumber}`;

    await setDoc(doc(db, "fixtures", docId), fixture);
    console.log(`✅ Match ${matchNumber} created: ${team1} vs ${team2}`);
    matchNumber++;
  }

  console.log("✅ All Round 1 fixtures generated.");
};
