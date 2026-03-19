import React, { useState } from 'react';

export const TerminalPanel: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);

  const handleExecute = async () => {
    if (!command.trim()) return;

    setOutput([...output, `$ ${command}`, 'Command execution placeholder']);
    setCommand('');

    if (window.electron) {
      try {
        const result = await window.electron.executeCommand(command);
        setOutput((prev) => [...prev, result.output]);
      } catch (error) {
        setOutput((prev) => [...prev, `Error: ${error}`]);
      }
    }
  };

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-700 flex flex-col">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Terminal</h3>
        <button
          onClick={() => setOutput([])}
          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {output.map((line, idx) => (
          <div key={idx} className="text-gray-300">
            {line}
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
};
