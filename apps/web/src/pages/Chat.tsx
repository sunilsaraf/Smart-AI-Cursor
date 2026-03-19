import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatMessage as ChatMessageComponent, Button } from '@codepilot/ui';
import type { ChatMessage } from '@codepilot/shared';

export const Chat: React.FC = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: sessionId || 'default',
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: sessionId || 'default',
        role: 'assistant',
        content: 'This is a placeholder AI response. Connect to the API to get real responses.',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Chat Session</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm mt-2">Ask anything about your codebase</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 rounded-full border-t-transparent" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your code..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            variant="primary"
            isLoading={isLoading}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
