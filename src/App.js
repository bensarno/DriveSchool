import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';

// Import the newly created Page1 and Page3 components
import Page1 from './Page1';
import Page3 from './Page3';

function App() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [currentPage, setCurrentPage] = useState("home");
    const [user,setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSignUp = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setEmail("");
            setPassword("");
            alert("Sign-up successful!");
        } catch (error) {
            console.error("Error signing up:", error.message);
            alert(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setEmail("");
            setPassword("");
            alert("Sign-in successful!");
            setCurrentPage("page2");
        } catch (error) {
            console.error("Error signing in:", error.message);
            alert(error.message);
        }
    };



    const sendMessage = async () => {
        if (userInput.trim() === "") return;

        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setUserInput("");

        const botResponse = await getCohereResponse(userInput);

        setMessages([...newMessages, { role: "bot", content: botResponse }]);
    };

    const getCohereResponse = async (input) => {
        if (!input.trim()) return "Please provide a valid message.";

        const apiKey = process.env.REACT_APP_COHERE_API_KEY;
        const apiUrl = "https://api.cohere.com/v2/chat";

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        const instruction = `You are a driving instructor in the UK. Please only respond with information related to UK driving theory, such as:
        - UK traffic rules
        - UK road signs and their meanings
        - Rules for passing the UK driving test
        - Safe driving techniques in the UK
        - UK road markings
        - Rules for different types of roads (motorways, country lanes, etc.)
        - Dont send overly long messages, just reply to the users question or inroduce yourself when they say hi`;

        const body = {
            messages: [
                { role: "system", content: instruction },
                { role: "user", content: input },
            ],
            model: "command",
            max_tokens: 200,
        };

        try {
            const response = await axios.post(apiUrl, body, { headers });

            if (response.data && response.data.message && response.data.message.content && response.data.message.content.length > 0) {
                const botMessage = response.data.message.content[0].text || response.data.message.content[0];
                return botMessage;
            } else {
                return "Sorry, I didn't get a valid response from the AI.";
            }
        } catch (error) {
            console.error("API Error:", error.response ? error.response.data : error.message);
            return "Sorry, there was an issue with the chatbot.";
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case "page1":
                return <Page1 />;
            case "page2":
                return (
                    <>
                        <div className="chat-area">
                            {messages.map((msg, index) => (
                                <div key={index} className={msg.role}>
                                    <strong>{msg.role === "user" ? "You:" : "Bot:"}</strong> {msg.content}
                                </div>
                            ))}
                        </div>

                        <div className="input-area">
                            <input
                                type="text"
                                placeholder="Type here"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                            <button className="send-button" onClick={sendMessage}></button>
                        </div>
                    </>
                );
            case "page3":
                return <Page3 />;
            default:
                return (
                    <div className="HomeTitle">
                        <div>Welcome to DriveSchool</div>
                        <div>Sign in to get started</div>

                        <div className="auth-form">
                            <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button onClick={isSignUp ? handleSignUp : handleSignIn}>
                                {isSignUp ? "Sign Up" : "Sign In"}
                            </button>

                            <button onClick={() => setIsSignUp(!isSignUp)}>
                                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="app-container">
            <div className="header">
                <button onClick={() => handlePageChange("page1")} className="circle circle1"></button>
                <button onClick={() => handlePageChange("page2")} className="circle circle2"></button>
                <button onClick={() => handlePageChange("page3")} className="circle circle3"></button>
            </div>

            {renderPage()}
        </div>
    );
}

export default App;
