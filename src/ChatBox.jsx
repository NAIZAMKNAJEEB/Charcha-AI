import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css"; // Ensure you have this CSS file
import { GoogleGenerativeAI } from "@google/generative-ai";




const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateContent = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "You are a chatbot. Your name is Charcha AI. Charcha Ai developed by Naizam K Najeeb. Naizam K Najeeb is a web developer, ethical hacker, and digital marketer. you developed by 2025 february 05. charcha is malayalam word. Charcha (ചർച്ച) is a Malayalam word meaning discussion or conversation. It signifies the act of exchanging ideas, thoughts, and opinions in a meaningful and engaging way. Traditionally, charcha has been a cornerstone of community gatherings, where people come together to share knowledge, resolve issues, and build connections." });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      return responseText;
    } catch (error) {
      console.error("Error generating content:", error);
      return "Failed to generate response. Please try again.";
    }
  };

  const preprocessResponse = (text) => {
    const formattedText = text
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks    
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") // Convert bold (**...**) to <b>...</b>
      .replace(/(^|\n)\*\s/g, "<br>• ") // Convert `*` at the beginning of lines to bullets
      .replace(/\n/g, "<br>"); // Replace remaining line breaks with <br>

    return formattedText;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      // Add the user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, sender: "user" },
      ]);
      setInputValue("");

      // Simulate AI response
      setIsLoading(true);
      const aiResponse = await generateContent(inputValue);
      const processedResponse = preprocessResponse(aiResponse);

      console.log(aiResponse);

      setIsLoading(false);

      // Add the AI's response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: processedResponse, sender: "ai", isHTML: true},
      ]);
    }
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>

            {
            message.isHTML ? ( 
            <span className="message-text" dangerouslySetInnerHTML={{ __html: message.text }}></span>
          ) :( 
          <span className="message-text">{message.text}</span>
        ) }
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <span className="message-text">Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
          disabled={isLoading}
          ref={inputRef}
          autoFocus
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div >
  );
};

export default ChatBox;