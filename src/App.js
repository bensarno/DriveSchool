import React, { useState } from "react";
import "./App.css";
import axios from "axios";  // Ensure axios is installed via npm

function App() {
    const [messages, setMessages] = useState([]); // State to store messages
    const [userInput, setUserInput] = useState(""); // State to store user input

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

    const apiKey = "WRK5B61lDuEGLzya0bImevarywNiVii99j3ne3QL";  // Replace with your Cohere API key
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
            { role: "system", content: instruction },  // Instruction to focus on UK driving theory
            { role: "user", content: input }           // User's input message
        ],
        model: "command",  // Ensure you're using the correct model name if needed
        max_tokens: 150,   // Adjust tokens based on your response length needs
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

  




    return (
        <div className="app-container">
            {/* Header Section */}
            <div className="header">
                <div className="circle"></div>
                <div className="circle">
                    <img src="./robot.jpg" alt="Chatbot" width="30" />
                </div>
                <div className="circle"></div>
                <div className="circle">??</div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.role}>
                        <strong>{msg.role === "user" ? "You:" : "Bot:"}</strong> {msg.content}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="input-area">
                <input
                    type="text"
                    placeholder="User types in here"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;
