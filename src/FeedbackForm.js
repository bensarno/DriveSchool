import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './FeedbackForm.css';

function FeedbackForm() {
    const [ratings, setRatings] = useState({
        question1: 1,
        question2: 1,
        question3: 1,
        question4: 1,
        question5: 1,
    });
    const [submitted, setSubmitted] = useState(false);

    const handleRatingChange = (e) => {
        const { name, value } = e.target;
        setRatings((prevRatings) => ({
            ...prevRatings,
            [name]: Number(value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addDoc(collection(db, "feedback"), {
                ratings,
                timestamp: new Date(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting feedback:", err);
        }
    };

    if (submitted) {
        return <div>Thanks for your feedback!</div>;
    }

    return (
        <div className="feedback-form-container">
            <form className="feedback-form" onSubmit={handleSubmit}>
                <h2>Give Feedback on the AI Driving Theory App</h2>

                {[
                    { id: 1, text: "The AI explains driving theory concepts clearly and effectively." },
                    { id: 2, text: "The AI’s interface and response format make it easy to use and learn from." },
                    { id: 3, text: "The AI helps me understand UK traffic rules better than other study resources." },
                    { id: 4, text: "I would recommend this app to a friend who is also studying driving theory." },
                    { id: 5, text: "I feel confident using the AI as a study tool for my driving theory test." }
                ].map(({ id, text }) => (
                    <div key={id} className="feedback-question">
                        <p>{id}. {text}</p>

                        <div className="radio-group">
                            <div className="radio-label">
                                {['1', '2', '3', '4', '5'].map((value) => (
                                    <div key={value}>
                                        {value}
                                        {value === '1' && " (Strongly Disagree)"}
                                        {value === '5' && " (Strongly Agree)"}
                                    </div>
                                ))}
                            </div>

                            <div className="radio-buttons">
                                {['1', '2', '3', '4', '5'].map((value) => (
                                    <label key={value}>
                                        <input
                                            type="radio"
                                            name={`question${id}`}
                                            value={value}
                                            checked={ratings[`question${id}`] === Number(value)}
                                            onChange={handleRatingChange}
                                            required
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                <div>
                    <button type="submit">Submit Feedback</button>
                </div>
            </form>
        </div>
    );
}

export default FeedbackForm;
