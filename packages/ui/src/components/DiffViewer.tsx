import React, { useState } from 'react';
import clsx from 'clsx';
import type { Patch } from '@codepilot/shared';

export interface DiffViewerProps {
  patch: Patch;
  onApply?: () => void;
  onReject?: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  patch,
  onApply,
  onReject,
}) => {
  const [selectedFile, setSelectedFile] = useState(0);

  const parseDiffLine = (line: string) => {
    if (line.startsWith('+')) {
      return { type: 'addition', content: line.slice(1) };
    } else if (line.startsWith('-')) {
      return { type: 'deletion', content: line.slice(1) };
    } else if (line.startsWith('@@')) {
      return { type: 'hunk', content: line };
    }
    return { type: 'context', content: line };
  };

  const currentFile = patch.files[selectedFile];

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900">Changes</h3>
          <span className="text-sm text-gray-600">
            {patch.files.length} file{patch.files.length !== 1 ? 's' : ''} modified
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reject
          </button>
          <button
            onClick={onApply}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Apply Changes
          </button>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 border-r bg-gray-50 overflow-y-auto max-h-[600px]">
          {patch.files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedFile(idx)}
              className={clsx(
                'w-full text-left px-4 py-2 text-sm border-b hover:bg-gray-100 transition-colors',
                selectedFile === idx && 'bg-white border-l-2 border-l-blue-600'
              )}
            >
              <div className="font-mono text-xs truncate">{file.path}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {file.action === 'create' && 'Created'}
                {file.action === 'modify' && 'Modified'}
                {file.action === 'delete' && 'Deleted'}
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="font-mono text-xs">
            <div className="sticky top-0 px-4 py-2 bg-gray-800 text-white">
              {currentFile.path}
            </div>
            <div className="divide-y">
              {currentFile.hunks.map((hunk, hunkIdx) => (
                <div key={hunkIdx}>
                  <div className="px-4 py-1 bg-gray-100 text-gray-600">
                    @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                  </div>
                  {hunk.lines.map((line, lineIdx) => {
                    const parsed = parseDiffLine(line);
                    return (
                      <div
                        key={lineIdx}
                        className={clsx(
                          'px-4 py-0.5 flex',
                          parsed.type === 'addition' && 'bg-green-50 text-green-900',
                          parsed.type === 'deletion' && 'bg-red-50 text-red-900',
                          parsed.type === 'context' && 'bg-white text-gray-800'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-6 flex-shrink-0 select-none',
                            parsed.type === 'addition' && 'text-green-600',
                            parsed.type === 'deletion' && 'text-red-600'
                          )}
                        >
                          {parsed.type === 'addition' && '+'}
                          {parsed.type === 'deletion' && '-'}
                          {parsed.type === 'context' && ' '}
                        </span>
                        <span className="flex-1">{parsed.content}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
