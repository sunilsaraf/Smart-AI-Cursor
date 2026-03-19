import React, { useEffect, useRef, useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { DiffPanel } from './DiffPanel';
import { TerminalPanel } from './TerminalPanel';

export const App: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      console.log('Monaco editor would be initialized here');
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="flex-1 flex items-center gap-4">
          <h1 className="text-lg font-semibold">CodePilot Desktop</h1>
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {showChat ? 'Hide' : 'Show'} Chat
          </button>
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {showDiff ? 'Hide' : 'Show'} Diff
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {showTerminal ? 'Hide' : 'Show'} Terminal
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div
            ref={editorRef}
            className="flex-1 bg-gray-900"
          >
            <div className="h-full flex items-center justify-center text-gray-500">
              Monaco Editor Placeholder
            </div>
          </div>
          {showTerminal && <TerminalPanel />}
        </div>

        {showChat && <ChatPanel />}
        {showDiff && <DiffPanel />}
      </div>
    </div>
  );
};
