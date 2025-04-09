import React, { useState, useRef } from "react";
import "./App.css";
import axios from "axios";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";

// Import components
import Page1 from "./Page1";
import Page3 from "./Page3";

// Import the audio files
import pop2 from "./SoundEffects/pop2.mp3";
import pop3 from "./SoundEffects/pop3.mp3";

function App() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [currentPage, setCurrentPage] = useState("home");
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);

    console.log("pop2:", pop2);
    console.log("pop3:", pop3);

    // Create Audio objects using useRef, with imported audio files.
    const messageSentAudioRef = useRef(new Audio(pop2));
    const messageReceivedAudioRef = useRef(new Audio(pop3));

    // Clear chat function: resets messages to an empty array.
    const clearChat = () => {
        setMessages([]);
    };

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

    const handleForgotPassword = async () => {
        const emailPrompt = prompt("Please enter your email address for password reset:");
        if (!emailPrompt) return;

        try {
            await sendPasswordResetEmail(auth, emailPrompt);
            alert("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Password reset error:", error.message);
            alert("Error sending password reset email: " + error.message);
        }
    };


    const sendQuizSummaryToAI = async (summary) => {
        // Play sent sound before making request
        messageSentAudioRef.current.play();

        const botResponse = await getCohereResponse(summary);
        setMessages((prev) => [
            ...prev,
            { role: "user", content: summary },
            { role: "bot", content: botResponse },
        ]);

        // Play received sound after response is received
        messageReceivedAudioRef.current.play();
    };

    const splitIntoChunks = (text, maxChars) => {
        const parts = [];
        let start = 0;

        while (start < text.length) {
            let end = start + maxChars;
            if (end < text.length) {
                const lastPeriod = text.lastIndexOf(".", end);
                if (lastPeriod > start) end = lastPeriod + 1;
            }
            parts.push(text.slice(start, end).trim());
            start = end;
        }

        return parts;
    };

    const handleQuizFeedback = async (summary, options = { showUserMessage: true }) => {
        const chunks = splitIntoChunks(summary, 1000);
        let fullResponse = "";

        for (const chunk of chunks) {
            try {
                const response = await getCohereResponse(chunk);
                fullResponse += response + "\n\n";
            } catch (error) {
                console.error("Error getting AI feedback:", error);
                fullResponse += "\n\n[Error generating feedback for one of the sections]";
            }
        }

        setMessages((prev) => {
            const newMessages = [...prev];
            if (options.showUserMessage) {
                newMessages.push({ role: "user", content: summary });
            }
            newMessages.push({ role: "bot", content: fullResponse.trim() });
            return newMessages;
        });
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

        // Play message sent sound
        messageSentAudioRef.current.play();

        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setUserInput("");

        const botResponse = await getCohereResponse(userInput);

        setMessages([...newMessages, { role: "bot", content: botResponse }]);
        // Play message received sound
        messageReceivedAudioRef.current.play();
    };

    const getCohereResponse = async (input) => {
        if (!input.trim()) return "Please provide a valid message.";
        const apiKey = process.env.REACT_APP_COHERE_API_KEY;
        const apiUrl = "https://api.cohere.com/v2/chat";

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        const instruction = `
  You are a driving instructor in the UK.
  Provide concise, bullet-point feedback when addressing a question.
  Limit your response to a maximum of three sentences or 100 words.
  Only provide information related to UK driving theory, such as UK traffic rules, road signs, and safe driving techniques.
    `;

        const body = {
            messages: [
                { role: "system", content: instruction },
                { role: "user", content: input },
            ],
            model: "command",
            max_tokens: 300,
        };

        try {
            const response = await axios.post(apiUrl, body, { headers });
            if (
                response.data &&
                response.data.message &&
                response.data.message.content &&
                response.data.message.content.length > 0
            ) {
                const botMessage =
                    response.data.message.content[0].text ||
                    response.data.message.content[0];
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
                return (
                    <Page1
                        onQuizFeedback={handleQuizFeedback}
                        onReturnToMain={() => setCurrentPage("page2")}
                    />
                );
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
                        {/* Clear Chat Button */}
                        <div className="clear-chat-container">
                            <button
                                onClick={clearChat}
                                style={{
                                    backgroundColor: "#ff4d4f",
                                    color: "#fff",
                                    padding: "10px 20px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    margin: "10px"
                                }}
                            >
                                Clear Chat
                            </button>
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
                return <Page3 onQuizFeedback={sendQuizSummaryToAI} setCurrentPage={setCurrentPage} />;
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
                            <button onClick={handleForgotPassword} style={{ marginTop: "10px", background: "none", border: "none", color: "#007bff", cursor: "pointer" }}>
                                Forgot Password?
                            </button>

                        </div>
                    </div>
                );
        }
    };

    const isSignInPage = !["page1", "page2", "page3"].includes(currentPage);

    return (
        <div className="app-container">
            <div className="header">
                <button
                    onClick={() => handlePageChange("page1")}
                    className="circle circle1"
                    disabled={isSignInPage}
                />
                <button
                    onClick={() => handlePageChange("page2")}
                    className="circle circle2"
                    disabled={isSignInPage}
                />
                <button
                    onClick={() => handlePageChange("page3")}
                    className="circle circle3"
                    disabled={isSignInPage}
                />
            </div>
            {renderPage()}
        </div>
    );
}

export default App;
