import React from 'react';

export const DiffPanel: React.FC = () => {
  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-semibold">Code Changes</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 mt-8">
          <p>No pending changes</p>
          <p className="text-sm mt-2">AI-suggested changes will appear here</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium">
          Apply All
        </button>
        <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium">
          Reject All
        </button>
      </div>
    </div>
  );
};
