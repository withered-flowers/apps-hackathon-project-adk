import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import AgentStatus from './AgentStatus';
import DecisionMatrix from './DecisionMatrix';
import { sendChat, getHistory } from '../services/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [matrix, setMatrix] = useState(null);
  const [sessionId] = useState(`session_${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load history on mount
    getHistory(sessionId).then(data => {
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        setMessages([{ role: 'system', content: 'Welcome to Decidely.ai! I am your Orchestrator. What decision are you struggling with today?' }]);
      }
      if (data.decision_matrix) setMatrix(data.decision_matrix);
    }).catch(err => console.error("Could not load history", err));
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChat(sessionId, userMessage.content);
      setMessages(prev => [...prev, { role: 'system', content: data.response }]);
      if (data.matrix) setMatrix(data.matrix); // If the backend returns a new matrix
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Sorry, the Board is currently unavailable. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">The Board of Directors</h2>
          <p className="text-sm text-gray-500">Decidely.ai - Your Personal AI Swarm</p>
        </div>
        <div className="flex space-x-2">
          <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {matrix && <DecisionMatrix matrixData={matrix} />}
        {loading && <AgentStatus statusText="Researcher is gathering data..." />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your dilemma here..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
