import React, { useState } from "react";
import "./App.css";
import axios from "axios"; // Ensure axios is installed via npm

// Import the newly created Page1 and Page3 components
import Page1 from './Page1';
import Page3 from './Page3';
import RSandMQuiz from "./QuizPages/RSandMQuiz";
import RoRQuiz from "./QuizPages/RoRQuiz";
import VHaMQuiz from "./QuizPages/VHaMQuiz";
import SaLRQ from "./QuizPages/SaLRQ";
import WaRCQ from "./QuizPages/WaRCQ";
import EcoQ from "./QuizPages/EcoQ";
import FAandESQ from "./QuizPages/FAandESQ";

// Example Component for Page2 (you can create this as needed)
function Page2() {
    return <div></div>;
}

function App() {
    const [messages, setMessages] = useState([]); // State to store messages
    const [userInput, setUserInput] = useState(""); // State to store user input
    const [currentPage, setCurrentPage] = useState("home"); // Track current view/page

    // Function to send the message and get response from Cohere
    const sendMessage = async () => {
        if (userInput.trim() === "") return; // Don't send empty messages

        // Add user message to the chat
        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setUserInput(""); // Clear input field

        // Call the Cohere API to get the bot's response
        const botResponse = await getCohereResponse(userInput);

        // Add bot response to the chat
        setMessages([...newMessages, { role: "bot", content: botResponse }]);
    };

    // Function to interact with the Cohere API
    const getCohereResponse = async (input) => {
        if (!input.trim()) {
            return "Please provide a valid message.";
        }

        const apiKey = "WRK5B61lDuEGLzya0bImevarywNiVii99j3ne3QL"; // Replace with your Cohere API key
        const apiUrl = "https://api.cohere.com/v2/chat";

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        // Instruction to focus on UK driving theory
        const instruction = `You are a driving instructor in the UK. Please only respond with information related to UK driving theory, such as:
        - UK traffic rules
        - UK road signs and their meanings
        - Rules for passing the UK driving test
        - Safe driving techniques in the UK
        - UK road markings
        - Rules for different types of roads (motorways, country lanes, etc.)
        Please do not discuss anything unrelated to UK driving theory or driving tests.`;

        const body = {
            messages: [
                { role: "system", content: instruction }, // Instruction to focus on UK driving theory
                { role: "user", content: input }, // User's input message
            ],
            model: "command", // Ensure you're using the correct model name if needed
            max_tokens: 150, // Adjust tokens based on your response length needs
        };

        try {
            const response = await axios.post(apiUrl, body, { headers });

            // Extract the response text
            if (response.data && response.data.message && response.data.message.content && response.data.message.content.length > 0) {
                const botMessage = response.data.message.content[0].text || response.data.message.content[0];
                return botMessage;
            } else {
                console.error("Invalid response structure:", response.data);
                return "Sorry, I didn't get a valid response from the AI.";
            }
        } catch (error) {
            console.error("API Error:", error.response ? error.response.data : error.message);
            return "Sorry, there was an issue with the chatbot.";
        }
    };

    // Function to handle navigation between pages
    const handlePageChange = (page) => {
        setCurrentPage(page); // Set the current page based on button click
    };

    // Render different pages based on the state
    const renderPage = () => {
        switch (currentPage) {
            case "page1":
                return <Page1 />;
            case "page2":
                return <Page2 />;
            case "page3":
                return <Page3 />;
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
                return <div>Welcome to the Home Page</div>;
        }
    };

    return (
        <div className="app-container">
            {/* Header Section with Circle Buttons */}
            <div className="header">
                <button onClick={() => handlePageChange("page1")} className="circle circle1"></button>
                <button onClick={() => handlePageChange("page2")} className="circle circle2"></button>
                <button onClick={() => handlePageChange("page3")} className="circle circle3"></button>
            </div>

            {/* Render the selected page */}
            {renderPage()}

            {/* Chat Area (only visible if the current page is page2) */}
            {currentPage === "page2" && (
                <div className="chat-area">
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.role}>
                            <strong>{msg.role === "user" ? "You:" : "Bot:"}</strong> {msg.content}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area (only visible if the current page is page2) */}
            {currentPage === "page2" && (
                <div className="input-area">
                    <input
                        type="text"
                        placeholder="Type here"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <button className="send-button" onClick={sendMessage}></button>
                </div>
            )}
        </div>
    );
}

export default App;
