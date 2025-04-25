import React, { useState, useEffect } from 'react';
import quizData from './Questions/EcoQQuestions.json';
import '../Page3.css';
import { saveScoreToFirestore } from '../utils/saveScore';

function EcoQ({ onQuizFeedback, onReturnToMain }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // AI feedback states
    const [aiFeedback, setAiFeedback] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const getRandomQuestions = (data, num) => {
        return [...data].sort(() => Math.random() - 0.5).slice(0, num);
    };

    useEffect(() => {
        if (quizData && quizData.length > 0) {
            setQuestions(getRandomQuestions(quizData, 10));
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

            saveScoreToFirestore("EcoQ", finalScore, questions.length);
        }
    };

    const getScore = () => {
        return questions.reduce((score, q, i) => (
            score + (q.answer === selectedAnswers[i] ? 1 : 0)
        ), 0);
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

    const handleSendFeedbackManually = async () => {
        console.log("Feedback button clicked.");
        setFeedbackLoading(true);

        // Build summary using only wrong answers, formatted for AI feedback
        const wrongSummary = questions
            .map((q, i) => {
                if (q.answer !== selectedAnswers[i]) {
                    return `Question ${i + 1}:\n- Error: ${selectedAnswers[i]} is incorrect.\n- Correct Answer: ${q.answer}.`;
                }
                return null;
            })
            .filter((item) => item !== null)
            .join("\n\n"); // Separate feedback into distinct paragraphs

        const summaryText =
            `I completed the Eco Driving Quiz.\nMy score: ${getScore()} out of ${questions.length}.\n\n` +
            (wrongSummary ? `Mistakes:\n\n${wrongSummary}` : "I answered all questions correctly.");

        // AI feedback prompt
        const feedbackPrompt = (chunk) => `
You are a succinct AI tutor.
Provide feedback only for incorrect answers.
Each mistake should be separated into its own paragraph.

For each incorrect answer:
Question {questionNumber}:
- Error: {brief explanation of the mistake, max 12 words}.
- Correct Answer: {correct answer for the question}.
- Tip: {short practical tip, max 12 words}.

Ensure responses use proper line breaks ("\\n\\n") to separate each question properly.
${chunk}
`;

        const summary = feedbackPrompt(summaryText);
        console.log("Summary built:", summary);

        if (!onQuizFeedback) {
            console.error("onQuizFeedback is not defined.");
            setAiFeedback("No AI feedback function provided.");
            setFeedbackLoading(false);
            return;
        }

        // If all answers are correct, give simple feedback
        if (!wrongSummary) {
            setAiFeedback("Great job! You answered all questions correctly.");
            setFeedbackLoading(false);
            if (onReturnToMain) onReturnToMain();
            return;
        }

        try {
            const feedback = await onQuizFeedback(summary, { showUserMessage: false });
            console.log("Received AI feedback:", feedback);
            setAiFeedback(feedback.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>));
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
            <h1 className="page3-header">UK Eco Driving Quiz</h1>
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

export default EcoQ;
