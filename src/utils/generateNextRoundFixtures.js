import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

export const generateNextRoundFixtures = async (tournamentId) => {
  const snap = await getDocs(
    query(collection(db, "fixtures"), where("tournamentId", "==", tournamentId))
  );

  const allFixtures = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const rounds = Array.from(new Set(allFixtures.map((f) => f.round))).sort();
  const lastRound = rounds[rounds.length - 1];
  const lastRoundMatches = allFixtures.filter((f) => f.round === lastRound);

  const winners = lastRoundMatches.map((f) => f.winnerId).filter(Boolean);

  if (winners.length < 2) {
    throw new Error("Not enough winners to generate the next round.");
  }

  // ✅ Shuffle winners to distribute BYEs
  const shuffledWinners = [...winners].sort(() => 0.5 - Math.random());

  const nextRound = `Round ${rounds.length + 1}`;
  let matchNumber = allFixtures.length + 1;

  for (let i = 0; i < shuffledWinners.length; i += 2) {
    const team1 = shuffledWinners[i];
    const team2 = shuffledWinners[i + 1] || "BYE";

    const fixture = {
      tournamentId,
      matchNumber,
      round: nextRound,
      team1Id: team1,
      team2Id: team2,
      winnerId: "",
      createdAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, "fixtures", `${tournamentId}_match${matchNumber}`),
      fixture
    );
    matchNumber++;
  }
};
