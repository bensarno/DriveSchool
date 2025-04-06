/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import './Page1.css'; // Import your shared CSS file
import RSandMQuiz from './QuizPages/RSandMQuiz';
import RoRQuiz from "./QuizPages/RoRQuiz";
import VHaMQuiz from "./QuizPages/VHaMQuiz";
import SaLRQ from "./QuizPages/SaLRQ";
import WaRCQ from "./QuizPages/WaRCQ";
import EcoQ from "./QuizPages/EcoQ";
import FAandESQ from "./QuizPages/FAandESQ";

function BlankPage() {
    const [currentPage, setCurrentPage] = useState(null);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "RSandMQuiz":
                return <RSandMQuiz />;
            case "RoRQuiz":
                return <RoRQuiz />;
            case "VHaMQuiz":
                return <VHaMQuiz />;
            case "SaLRQ":
                return <SaLRQ />;
            case "WaRCQ":
                return <WaRCQ />;
            case "EcoQ":
                return <EcoQ />;
            case "FAandESQ":
                return <FAandESQ />;
            default:
                return (
                    <div className="scroll-container">
                        <a onClick={() => handlePageChange("RSandMQuiz")} className="rectangle">Road Signs and Markings</a>
                        <a onClick={() => handlePageChange("RoRQuiz")} className="rectangle">Rules of the Road</a>
                        <a onClick={() => handlePageChange("VHaMQuiz")} className="rectangle">Vehicle Handling and Maintenance</a>
                        <a onClick={() => handlePageChange("SaLRQ")} className="rectangle">Safety and Legal Requirements</a>
                        <a onClick={() => handlePageChange("WaRCQ")} className="rectangle">Weather and Road Conditions</a>
                        <a onClick={() => handlePageChange("EcoQ")} className="rectangle">Eco Driving</a>
                        <a onClick={() => handlePageChange("FAandESQ")} className="rectangle">First Aid and Emergency Situations</a>
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
