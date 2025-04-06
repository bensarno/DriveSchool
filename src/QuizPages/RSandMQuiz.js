import React, { useState } from 'react';
import '../Page3.css'; // Import unique CSS for Page3
 // Make sure you have these pages imported
import VHaMQuiz from "./VHaMQuiz";
import SaLRQ from "./SaLRQ";
import WaRCQ from "./WaRCQ";
import EcoQ from "./EcoQ";
import FAandESQ from "./FAandESQ";
import RoRQuiz from './RoRQuiz';

function RSandMQuiz() {
    // Initialize the state to track the current page
    const [currentPage, setCurrentPage] = useState("page1");

    // Function to render different pages based on the state
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
                return <div>Welcome to the Home page</div>;
        }
    };

    return (
        <div className="page3-container">
            <h1 className="page3-header">Welcome to the Road Signs and Markings Quiz</h1>

            {/* Render the page based on the currentPage */}
            {renderPage()}

            {/* Example buttons to navigate between pages */}
            
            <button onClick={() => setCurrentPage("RSandMQuiz")}>Start Quiz</button>
        </div>
    );
}

export default RSandMQuiz;
