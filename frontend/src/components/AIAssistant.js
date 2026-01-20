import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader, Sparkles, TrendingUp } from 'lucide-react';
import './AIAssistant.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function AIAssistant() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState([
    "What's my total revenue this month?",
    "Which channel has the best ROAS?",
    "How many orders did I get yesterday?",
    "Show me my top performing products",
    "What's my average order value?",
    "Compare Facebook vs Google Ads performance"
  ]);
  const messagesEndRef = useRef(null);

  // Listen for theme changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically in case it's same window
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      if (currentTheme !== theme) {
        setTheme(currentTheme);
      }
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: text,
          conversationId: conversationId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        context: response.data.context
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  return (
    <div className={`ai-assistant-container ${theme}`}>
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-icon">
            <Bot size={24} />
          </div>
          <div>
            <h2>Ask Edge</h2>
            <p>Optimized decisions from your business data.</p>
          </div>
        </div>
        <button className="new-chat-button" onClick={startNewConversation}>
          <Sparkles size={16} />
          New Chat
        </button>
      </div>

      <div className="ai-chat-container">
        {messages.length === 0 ? (
          <div className="ai-welcome">
            <div className="welcome-icon">
              <Bot size={48} />
            </div>
            <h3>Hi! I'm your decision copilot.</h3>
            <p>I can help you understand your business metrics, identify trends, and make data-driven decisions.</p>
            
            <div className="suggestions-grid">
              <h4>Try asking me:</h4>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <TrendingUp size={14} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`message ${message.role} ${message.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? (
                    <User size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  {message.context && (
                    <div className="message-context">
                      <details>
                        <summary>View data context</summary>
                        <pre>{JSON.stringify(message.context, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                  <div className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="ai-input-container">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your business metrics..."
            rows="1"
            disabled={loading}
          />
          <button
            className="send-button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <Loader size={20} className="spinning" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
