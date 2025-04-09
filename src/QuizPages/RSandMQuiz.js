import React, { useState, useEffect } from 'react';
import quizData from './Questions/RSandMQuizQuestions.json'; // Import the JSON file
import '../Page3.css'; // Your custom styles
import { saveScoreToFirestore } from '../utils/saveScore';

function RSandMQuiz({ onQuizFeedback, onReturnToMain }) {
    const [questions, setQuestions] = useState([]); // Holds the quiz data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question index
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Stores user's answers
    const [isQuizFinished, setIsQuizFinished] = useState(false); // Flag to indicate end of quiz
    const [loading, setLoading] = useState(true); // Loading state while questions load
    const [error, setError] = useState(""); // Error message if any

    // New states for AI feedback
    const [aiFeedback, setAiFeedback] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Function to get 10 random questions from quizData
    const getRandomQuestions = (data, num) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, num);
    };

    // Load questions once the component mounts
    useEffect(() => {
        if (quizData && quizData.length > 0) {
            const randomQuestions = getRandomQuestions(quizData, 10);
            setQuestions(randomQuestions);
            setLoading(false);
        } else {
            setError("No quiz data available.");
            setLoading(false);
        }
    }, []);

    // Handle user's answer selection
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
            // Save score to Firestore
            saveScoreToFirestore("RSandMQuiz", finalScore, questions.length);
            // Feedback is triggered manually.
        }
    };

    // Calculate the user's score
    const getScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (q.answer === selectedAnswers[i]) {
                score++;
            }
        });
        return score;
    };

    // Generate visual feedback for each question
    const renderFeedback = () => {
        return questions.map((q, i) => {
            const userAnswer = selectedAnswers[i];
            const correct = q.answer === userAnswer;
            return (
                <div key={i} style={{ marginBottom: "1em" }}>
                    <strong>Q{i + 1}: {q.question}</strong>
                    <br />
                    Your answer:{" "}
                    <span style={{ color: correct ? "green" : "red" }}>{userAnswer}</span>
                    <br />
                    {correct ? "✅ Correct" : `❌ Incorrect - Correct Answer: ${q.answer}`}
                </div>
            );
        });
    };

    // Handle manual feedback button click
    const handleSendFeedbackManually = async () => {
        console.log("Feedback button clicked.");
        setFeedbackLoading(true);

        // Build summary using only wrong answers
        const wrongSummary = questions
            .map((q, i) => {
                if (q.answer !== selectedAnswers[i]) {
                    return `Q${i + 1}: ${q.question}\nYour Answer: ${selectedAnswers[i]}\nCorrect Answer: ${q.answer}`;
                }
                return null;
            })
            .filter((item) => item !== null)
            .join("\n\n");

        const summaryText =
            `I completed the UK Road Safety and Markings Quiz. My score was ${getScore()} out of ${questions.length}.\n\n` +
            (wrongSummary ? `Mistakes:\n\n${wrongSummary}` : "I answered all questions correctly.");

        // Define the feedback prompt
        const feedbackPrompt = (chunk) => `
You are a succinct AI tutor.
Only provide feedback for wrong answers.
For each wrong answer, provide exactly two sentences:
1. A sentence (max 12 words) explaining the error.
2. A sentence (max 12 words) offering one practical tip.
Do not mention correct answers or include extra details.
Keep the response under 30 words. Ensure you finish your final sentence completely.
Quiz summary:
${chunk}
`;
        const summary = feedbackPrompt(summaryText);
        console.log("Summary built:", summary);

        if (!onQuizFeedback) {
            console.error("onQuizFeedback is not defined. Please pass a valid feedback function as a prop.");
            setAiFeedback("No AI feedback function provided.");
            setFeedbackLoading(false);
            return;
        }

        // If no mistakes, set minimal feedback and redirect immediately.
        if (!wrongSummary) {
            setAiFeedback("Great job! You answered all questions correctly.");
            setFeedbackLoading(false);
            if (onReturnToMain) onReturnToMain();
            return;
        }

        try {
            const feedback = await onQuizFeedback(summary, { showUserMessage: false });
            console.log("Received AI feedback:", feedback);
            setAiFeedback(feedback);
        } catch (err) {
            console.error("Error retrieving AI feedback:", err);
            setAiFeedback("There was an error retrieving AI feedback.");
        }
        setFeedbackLoading(false);

        if (onReturnToMain) {
            onReturnToMain();
        }
    };

    if (loading) return <div className="page3-container">Loading questions...</div>;
    if (error) return <div className="page3-container error">{error}</div>;
    if (questions.length === 0) return <div className="page3-container">No questions available.</div>;

    return (
        <div className="page3-container">
            <h1 className="page3-header">UK Road Safety and Markings Quiz</h1>
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
                    <div className="feedback-scroll">{renderFeedback()}</div>
                    <button
                        className="option-btn"
                        style={{ marginTop: "1em" }}
                        onClick={handleSendFeedbackManually}
                    >
                        {feedbackLoading ? "Loading Feedback..." : "Get More AI Feedback"}
                    </button>
                    {aiFeedback && (
                        <div className="ai-feedback" style={{ marginTop: "1em" }}>
                            <h4>AI Feedback:</h4>
                            <p>{aiFeedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RSandMQuiz;
