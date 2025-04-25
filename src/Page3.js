import React, { useState, useEffect } from 'react';
import './Account.css';
import FullMock from './QuizPages/FullMock';
import { db, auth } from './firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import FeedbackForm from './FeedbackForm';

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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
        if (!confirmed) return;

        const user = auth.currentUser;

        try {
            // Delete user data from Firestore
            const userDocRef = doc(db, "quizScores", user.uid);
            await deleteDoc(userDocRef);

            // Delete Firebase Auth user
            await user.delete();

            alert("Account deleted successfully.");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("Please sign in again before deleting your account.");
            } else {
                alert("Failed to delete account. Please try again.");
            }
        }
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
                            Take Full Mock Test (50 Questions)
                        </button>

                        <h1 className="page1-header">Your Last Scores</h1>

                        {loading ? (
                            <div>Loading scores...</div>
                        ) : (
                            <div className="scroll-container">
                                <button
                                    onClick={() => setCurrentView('feedback')}
                                    className="rectanglmock-button"
                                    style={{ marginBottom: '1rem', backgroundColor: '#007bff', color: 'white' }}
                                >
                                     Give Feedback
                                </button>

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

                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await auth.signOut();
                                                window.location.reload();
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
                                        Sign Out
                                    </button>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="rectanglmock-button"
                                        style={{
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ❌ Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'FullMock':
                return <FullMock />;
            case 'feedback':
                return <FeedbackForm />;
            default:
                return <div>Page Not Found</div>;
        }
    };

    return <div>{renderContent()}</div>;
}

export default QuizScores;
