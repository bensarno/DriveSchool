import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

// Save or update the quiz score for the authenticated user
export const saveScoreToFirestore = async (quizName, score, total) => {
    const user = auth.currentUser;

    if (!user) {
        console.error("User is not authenticated");
        return;
    }

    try {
        const userRef = doc(db, "quizScores", user.uid);
        await setDoc(userRef, {
            [quizName]: {
                score,
                total,
                timestamp: serverTimestamp()
            }
        }, { merge: true });

        console.log(`Score saved for quiz '${quizName}'`);
    } catch (error) {
        console.error("Error saving score to Firestore:", error);
    }
};
