import React, { useState } from 'react';
import './Account.css'; // Reuse your rectangle styles
import FullMock from './QuizPages/FullMock'; // Import FullMock component

const quizTitles = {
    FullMock: "Full Mock Test",
    RSandMQuiz: "Road Signs and Markings",
    RoRQuiz: "Rules of the Road",
    VHaMQuiz: "Vehicle Handling and Maintenance",
    SaLRQ: "Safety and Legal Requirements",
    WaRCQ: "Weather and Road Conditions",
    EcoQ: "Eco Driving",
    FAandESQ: "First Aid and Emergency Situations",
    
};

function QuizScores() {
    const [currentView, setCurrentView] = useState('home'); // State to control the view (home or fullmock)

    const scores = Object.keys(quizTitles).map((key) => {
        const score = localStorage.getItem(`${key}_Score`);
        const total = localStorage.getItem(`${key}_Total`);
        return {
            key,
            title: quizTitles[key],
            score: score !== null ? `${score} / ${total}` : "Not Attempted",
        };
    });

    // Function to handle showing the FullMock component
    const handleFullMockClick = () => {
        setCurrentView('FullMock'); // Change view to 'fullmock'
    };

    // Switch statement to render content based on the currentView state
    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return (
                    <div className="page1-container">
                        {/* 🚗 Full Mock Test Button */}
                        <button
                            onClick={handleFullMockClick}
                            className="rectanglmock-button"
                            style={{ marginBottom: '1rem' }}
                        >
                            🚗 Take Full Mock Test (50 Questions)
                        </button>

                        <h1 className="page1-header">Your Last Scores</h1>

                        <div className="scroll-container">
                            {scores.map(({ key, title, score }) => (
                                <div key={key} className="rectangle">
                                    <strong>{title}</strong><br />
                                    <span className="score-line">Last Score: {score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'FullMock':
                return <FullMock />; // Show the FullMock component when currentView is 'fullmock'
            default:
                return <div>Page Not Found</div>; // In case of an unexpected view state
        }
    };

    return <div>{renderContent()}</div>;
}

export default QuizScores;
