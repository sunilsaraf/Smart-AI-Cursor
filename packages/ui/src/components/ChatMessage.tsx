import React from 'react';
import clsx from 'clsx';
import type { ChatMessage as ChatMessageType } from '@codepilot/shared';

export interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={clsx(
        'flex gap-3 p-4 rounded-lg',
        isUser && 'bg-blue-50 ml-8',
        isAssistant && 'bg-gray-50 mr-8'
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold',
            isUser && 'bg-blue-600',
            isAssistant && 'bg-gray-600'
          )}
        >
          {isUser ? 'U' : 'AI'}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {isUser ? 'You' : 'CodePilot'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
            )}
          </div>
        </div>

        {message.metadata?.codeBlocks && message.metadata.codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.metadata.codeBlocks.map((block, idx) => (
              <div key={idx} className="rounded-md bg-gray-900 p-3 overflow-x-auto">
                <div className="text-xs text-gray-400 mb-2">
                  {block.language}
                  {block.filepath && ` - ${block.filepath}`}
                </div>
                <pre className="text-sm text-gray-100">
                  <code>{block.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
