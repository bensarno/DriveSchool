import React, { useState, useEffect } from 'react';
import quizData from './Questions/WaRCQQuestions.json'; // Import the JSON file

import '../Page3.css'; // Your custom styles
import { db, auth } from '../firebase'; // Import Firestore and Firebase Auth
import { doc, setDoc } from 'firebase/firestore';

function WaRCQ() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const quizName = "WaRCQ";

    const getRandomQuestions = (data, num) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, num);
    };

    useEffect(() => {
        if (quizData && quizData.length > 0) {
            const randomQuestions = getRandomQuestions(quizData, 10);
            setQuestions(randomQuestions);
            setLoading(false);
        } else {
            setError('No quiz data available.');
            setLoading(false);
        }
    }, []);

    const handleAnswer = (answer) => {
        const updatedAnswers = [...selectedAnswers, answer];
        setSelectedAnswers(updatedAnswers);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsQuizFinished(true);

            const finalScore = questions.reduce((score, q, i) => {
                return score + (q.answer === updatedAnswers[i] ? 1 : 0);
            }, 0);

            saveScoreToFirestore(finalScore);
        }
    };

    const saveScoreToFirestore = async (score) => {
        const user = auth.currentUser;
        if (!user) {
            console.error("User is not authenticated");
            return;
        }

        try {
            const userDocRef = doc(db, "quizScores", user.uid);
            await setDoc(userDocRef, {
                [quizName]: {
                    score,
                    total: questions.length,
                    timestamp: new Date()
                }
            }, { merge: true });

            console.log(`${quizName} score stored/updated for user ${user.uid}`);
        } catch (error) {
            console.error("Error storing or updating score in Firestore:", error);
        }
    };

    const getScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (q.answer === selectedAnswers[i]) {
                score++;
            }
        });
        return score;
    };

    const renderFeedback = () => {
        return questions.map((q, i) => {
            const userAnswer = selectedAnswers[i];
            const correct = q.answer === userAnswer;
            return (
                <div key={i} style={{ marginBottom: "1em" }}>
                    <strong>Q{i + 1}: {q.question}</strong><br />
                    Your answer: <span style={{ color: correct ? "green" : "red" }}>{userAnswer}</span><br />
                    {correct ? "✅ Correct" : `❌ Incorrect - Correct Answer: ${q.answer}`}
                </div>
            );
        });
    };

    if (loading) return <div className="page3-container">Loading questions...</div>;
    if (error) return <div className="page3-container error">{error}</div>;
    if (questions.length === 0) return <div className="page3-container">No questions available.</div>;

    return (
        <div className="page3-container">
            <h1 className="page3-header">UK Weather and Road Conditions Quiz</h1>
            {!isQuizFinished ? (
                <div className="quiz-question">
                    <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
                    <p>{questions[currentQuestionIndex].question}</p>
                    <div className="options">
                        {questions[currentQuestionIndex].options.map((opt, idx) => (
                            <button
                                key={idx}
                                className="option-btn"
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="quiz-results">
                    <h2>Your Score: {getScore()} / {questions.length}</h2>
                    <p>Percentage: {(getScore() / questions.length * 100).toFixed(1)}%</p>
                    <h3>Feedback:</h3>
                    <div className="feedback-scroll">
                        {renderFeedback()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WaRCQ;
