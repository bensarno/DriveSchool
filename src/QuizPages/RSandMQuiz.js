import React, { useState, useEffect } from 'react';
import quizData from './Questions/RSandMQuizQuestions.json'; // Import quiz JSON
import '../Page3.css'; // Custom styles
import { saveScoreToFirestore } from '../utils/saveScore';

function RSandMQuiz({ onQuizFeedback, onReturnToMain }) {
    const [questions, setQuestions] = useState([]); // Holds quiz data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question index
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Stores user's answers
    const [isQuizFinished, setIsQuizFinished] = useState(false); // Flag indicating quiz completion
    const [loading, setLoading] = useState(true); // Loading state while questions load
    const [error, setError] = useState(""); // Error message if any

    // New states for AI feedback
    const [aiFeedback, setAiFeedback] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Function to get 10 random questions from quizData
    const getRandomQuestions = (data, num) => {
        return [...data].sort(() => Math.random() - 0.5).slice(0, num);
    };

    // Load questions once the component mounts
    useEffect(() => {
        if (quizData && quizData.length > 0) {
            setQuestions(getRandomQuestions(quizData, 10));
            setLoading(false);
        } else {
            setError("No quiz data available.");
            setLoading(false);
        }
    }, []);

    // Handle user's answer selection
    const handleAnswer = (answer) => {
        setSelectedAnswers([...selectedAnswers, answer]);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsQuizFinished(true);
            const finalScore = questions.reduce((score, q, i) => (
                score + (q.answer === selectedAnswers[i] ? 1 : 0)
            ), 0);
            saveScoreToFirestore("RSandMQuiz", finalScore, questions.length);
        }
    };

    // Calculate the user's score
    const getScore = () => {
        return questions.reduce((score, q, i) => (
            score + (q.answer === selectedAnswers[i] ? 1 : 0)
        ), 0);
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

    // Handle AI feedback request
    const handleSendFeedbackManually = async () => {
        console.log("Feedback button clicked.");
        setFeedbackLoading(true);

        // Build summary using only wrong answers, properly formatted
        const wrongSummary = questions
            .map((q, i) => {
                if (q.answer !== selectedAnswers[i]) {
                    return `Question ${i + 1}:\n- Error: ${selectedAnswers[i]} is incorrect.\n- Correct Answer: ${q.answer}.`;
                }
                return null;
            })
            .filter((item) => item !== null)
            .join("\n\n"); // Separate each feedback into its own paragraph

        const summaryText =
            `I completed the UK Road Safety and Markings Quiz.\nMy score: ${getScore()} out of ${questions.length}.\n\n give me a breif description of where i went wrong, only use one sentence for each question. do not elaborate further or give any other bonus tips.` +
            (wrongSummary ? `Mistakes:\n\n${wrongSummary}` : "I answered all questions correctly.");

        console.log("Summary built:", summaryText);

        if (!onQuizFeedback) {
            console.error("onQuizFeedback is not defined.");
            setAiFeedback("No AI feedback function provided.");
            setFeedbackLoading(false);
            return;
        }

        // If all answers are correct, provide basic feedback
        if (!wrongSummary) {
            setAiFeedback("Great job! You answered all questions correctly.");
            setFeedbackLoading(false);
            if (onReturnToMain) onReturnToMain();
            return;
        }

        try {
            const feedback = await onQuizFeedback(summaryText, { showUserMessage: false });
            console.log("Received AI feedback:", feedback);
            setAiFeedback(feedback.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)); // Ensure proper formatting
        } catch (err) {
            console.error("Error retrieving AI feedback:", err);
            setAiFeedback("There was an error retrieving AI feedback.");
        }

        setFeedbackLoading(false);

        if (onReturnToMain) onReturnToMain();
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
                            <button key={idx} className="option-btn" onClick={() => handleAnswer(opt)}>
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
                    <button className="option-btn" style={{ marginTop: "1em" }} onClick={handleSendFeedbackManually}>
                        {feedbackLoading ? "Loading Feedback..." : "Get More AI Feedback"}
                    </button>
                    {aiFeedback && (
                        <div className="ai-feedback" style={{ marginTop: "1em" }}>
                            <h4>AI Feedback:</h4>
                            {aiFeedback}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default RSandMQuiz;
