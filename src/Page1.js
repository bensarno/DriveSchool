import React, { useState } from 'react';
import './Page1.css';

import RSandMQuiz from './QuizPages/RSandMQuiz';
import RoRQuiz from "./QuizPages/RoRQuiz";
import VHaMQuiz from "./QuizPages/VHaMQuiz";
import SaLRQ from "./QuizPages/SaLRQ";
import WaRCQ from "./QuizPages/WaRCQ";
import EcoQ from "./QuizPages/EcoQ";
import FAandESQ from './QuizPages/FAandESQ';
import FullMock from './QuizPages/FullMock';

function BlankPage({ onQuizFeedback, onReturnToMain }) {
    const [currentPage, setCurrentPage] = useState(null);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    console.log('Current Page:', currentPage);
    console.log('onQuizFeedback:', onQuizFeedback);
    console.log('onReturnToMain:', onReturnToMain);

    const renderPage = () => {
        switch (currentPage) {
            case "RSandMQuiz":
                return <RSandMQuiz onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "RoRQuiz":
                return <RoRQuiz onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "VHaMQuiz":
                return <VHaMQuiz onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "SaLRQ":
                return <SaLRQ onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "WaRCQ":
                return <WaRCQ onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "EcoQ":
                return <EcoQ onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "FAandESQ":
                return <FAandESQ onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            case "FullMock":
                return <FullMock onQuizFeedback={onQuizFeedback} onReturnToMain={onReturnToMain} />;
            default:
                return (
                    <div className="scroll-container">
                        <button onClick={() => handlePageChange("RSandMQuiz")} className="rectangle">Road Signs and Markings</button>
                        <button onClick={() => handlePageChange("RoRQuiz")} className="rectangle">Rules of the Road</button>
                        <button onClick={() => handlePageChange("VHaMQuiz")} className="rectangle">Vehicle Handling and Maintenance</button>
                        <button onClick={() => handlePageChange("SaLRQ")} className="rectangle">Safety and Legal Requirements</button>
                        <button onClick={() => handlePageChange("WaRCQ")} className="rectangle">Weather and Road Conditions</button>
                        <button onClick={() => handlePageChange("EcoQ")} className="rectangle">Eco Driving</button>
                        <button onClick={() => handlePageChange("FAandESQ")} className="rectangle">First Aid and Emergency Situations</button>
                    </div>
                );
        }
    };

    return (
        <div className="page1-container">
            <h1 className="page1-header">Mock Quizzes</h1>
            {renderPage()}
        </div>
    );
}

export default BlankPage;
