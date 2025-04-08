import React, { useState, useEffect } from 'react';
import './Account.css';
import FullMock from './QuizPages/FullMock';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

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
    const [currentView, setCurrentView] = useState('home');
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            if (!auth.currentUser) {
                console.error("User not authenticated");
                setLoading(false);
                return;
            }

            try {
                const userRef = doc(db, "quizScores", auth.currentUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setScores(docSnap.data());
                } else {
                    console.log("No score data found for this user.");
                }
            } catch (err) {
                console.error("Error fetching quiz scores:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    const handleFullMockClick = () => {
        setCurrentView('FullMock');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return (
                    <div className="page1-container">
                        <button
                            onClick={handleFullMockClick}
                            className="rectanglmock-button"
                            style={{ marginBottom: '1rem' }}
                        >
                            🚗 Take Full Mock Test (50 Questions)
                        </button>

                        <h1 className="page1-header">Your Last Scores</h1>

                        {loading ? (
                            <div>Loading scores...</div>
                        ) : (
                                <div className="scroll-container">





                                {Object.keys(quizTitles).map((key) => {
                                    const quizData = scores[key];
                                    const scoreText = quizData
                                        ? `${quizData.score} / ${quizData.total}`
                                        : "Not Attempted";

                                    return (
                                        <div key={key} className="rectangle">
                                            <strong>{quizTitles[key]}</strong><br />
                                            <span className="score-line">Last Score: {scoreText}</span>
                                        </div>
                                    );
                                })}

                                {/* 🚪 Sign Out Button inside scrollable container */}
                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await auth.signOut();
                                                window.location.reload(); // Reset app after sign-out
                                            } catch (err) {
                                                console.error("Error signing out:", err);
                                            }
                                        }}
                                        className="rectanglmock-button"
                                        style={{
                                            backgroundColor: '#ff4d4f',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🚪 Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'FullMock':
                return <FullMock />;
            default:
                return <div>Page Not Found</div>;
        }
    };

    return <div>{renderContent()}</div>;
}

export default QuizScores;
