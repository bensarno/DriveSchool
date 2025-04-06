import React, { useState, useEffect } from 'react';
import quizData from './Questions/VHaMQQuestions.json'; // Import the JSON file

import '../Page3.css'; // Your custom styles

function VHaMQuiz() {
    const [questions, setQuestions] = useState([]); // Holds the quiz data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question index
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Stores user's answers
    const [isQuizFinished, setIsQuizFinished] = useState(false); // Flag to show results after quiz ends
    const [loading, setLoading] = useState(true); // Loading state while questions are being "fetched"
    const [error, setError] = useState(""); // Error handling

    // Function to get 10 random questions from quizData
    const getRandomQuestions = (data, num) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5); // Shuffle questions randomly
        return shuffled.slice(0, num); // Pick the first `num` questions
    };

    // Simulate loading of 10 random questions from the JSON file
    useEffect(() => {
        if (quizData && quizData.length > 0) {
            const randomQuestions = getRandomQuestions(quizData, 10); // Get 10 random questions
            setQuestions(randomQuestions); // Set the loaded questions
            setLoading(false); // Turn off loading state once data is loaded
        } else {
            setError('No quiz data available.');
            setLoading(false); // Set loading state to false if no data is available
        }
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    // Handle user's answer selection
    const handleAnswer = (answer) => {
        const updatedAnswers = [...selectedAnswers, answer];
        setSelectedAnswers(updatedAnswers);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsQuizFinished(true);

            // ⬇️ Save score and total to localStorage when quiz finishes
            const finalScore = questions.reduce((score, q, i) => {
                return score + (q.answer === updatedAnswers[i] ? 1 : 0);
            }, 0);

            localStorage.setItem("VHaMQuiz_Score", finalScore);
            localStorage.setItem("VHaMQuiz_Total", questions.length);
        }
    };


    // Calculate the user's score
    const getScore = () => {
        let score = 0;
        questions.forEach((q, i) => {
            if (q.answer === selectedAnswers[i]) {
                score++; // Increment score for each correct answer
            }
        });
        return score; // Return final score
    };

    // Generate feedback for each question
    const renderFeedback = () => {
        return questions.map((q, i) => {
            const userAnswer = selectedAnswers[i];
            const correct = q.answer === userAnswer; // Check if the answer is correct
            return (
                <div key={i} style={{ marginBottom: "1em" }}>
                    <strong>Q{i + 1}: {q.question}</strong><br />
                    Your answer: <span style={{ color: correct ? "green" : "red" }}>{userAnswer}</span><br />
                    {correct ? "✅ Correct" : `❌ Incorrect - Correct Answer: ${q.answer}`}
                </div>
            );
        });
    };

    if (loading) return <div className="page3-container">Loading questions...</div>; // Show loading state while fetching data
    if (error) return <div className="page3-container error">{error}</div>; // Handle errors

    // Ensure we have questions and they are loaded properly
    if (questions.length === 0) {
        return <div className="page3-container">No questions available.</div>;
    }

    return (
        <div className="page3-container">
            <h1 className="page3-header">UK Vehicle and Maintenance Quiz</h1>
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

export default VHaMQuiz;
