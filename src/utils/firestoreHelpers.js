import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

export const saveScoreToFirestore = async (user, quizName, score, total) => {
    if (!user) {
        console.error("User is not authenticated");
        return;
    }

    try {
        const userDocRef = doc(db, "quizScores", user.uid);
        await setDoc(userDocRef, {
            [quizName]: {
                score,
                total,
                timestamp: new Date()
            }
        }, { merge: true }); // merge ensures old quiz data isn't overwritten
        console.log(`${quizName} score stored successfully for user ${user.uid}`);
    } catch (error) {
        console.error("Error saving score to Firestore:", error);
    }
};
