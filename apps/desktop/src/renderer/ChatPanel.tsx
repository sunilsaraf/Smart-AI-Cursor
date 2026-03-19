import React, { useState } from 'react';

export const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'This is a placeholder response from the AI assistant.',
      }]);
    }, 500);
  };

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Ask me anything about your code</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded ${
                msg.role === 'user' ? 'bg-blue-900' : 'bg-gray-700'
              }`}
            >
              <div className="text-xs text-gray-400 mb-1">
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className="text-sm">{msg.content}</div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
