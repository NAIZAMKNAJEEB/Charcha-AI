import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css"; // Ensure you have this CSS file
import { GoogleGenerativeAI } from "@google/generative-ai";




const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

  const generateContent = async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "You are a chatbot. Your name is Charcha AI." });

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