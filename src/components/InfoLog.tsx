import React, { useState } from 'react';
import { LogEntry } from '../types/log';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InfoLogProps {
  entries: LogEntry[];
}

const InfoLog: React.FC<InfoLogProps> = ({ entries }: InfoLogProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${isMinimized ? 'h-8' : 'h-40'} bg-gray-900/95 border-t border-gray-700 overflow-hidden shadow-lg backdrop-blur-sm z-50 transition-all duration-300`}>
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <h3 className="text-sm font-medium text-gray-300">Registro de Información</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              {entries.length} mensajes
            </div>
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {entries.map((entry: LogEntry, index: number) => (
              <div
                key={index}
                className={`${
                  entry.type === 'info'
                    ? 'text-gray-300'
                    : entry.type === 'warning'
                    ? 'text-yellow-400'
                    : entry.type === 'error'
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                <span className="text-gray-500 mr-2">[{entry.timestamp}]</span>
                {entry.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoLog; 