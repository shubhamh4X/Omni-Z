import React from 'react';
import { X } from 'lucide-react';
import { Tooltip } from './Tooltip';

export const TemporaryChatIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Segment 1: Top arc */}
    <path d="M 8.2 3.6 A 8.8 8.8 0 0 1 15.8 3.6" />
    {/* Segment 2: Right arc */}
    <path d="M 19.8 7.6 A 8.8 8.8 0 0 1 18.5 16.5" />
    {/* Segment 3: Bottom-left arc with speech pointer tail */}
    <path d="M 14.5 20 A 8.8 8.8 0 0 1 7.8 19.4 L 3.5 21 L 4.8 17.2 A 8.8 8.8 0 0 1 3.5 12 A 8.8 8.8 0 0 1 5.2 7.2" />
  </svg>
);

interface TemporaryChatButtonProps {
  isTemporaryChat: boolean;
  onToggle: () => void;
}

export const TemporaryChatButton: React.FC<TemporaryChatButtonProps> = ({
  isTemporaryChat,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      {/* Temporary Chat Toggle Button */}
      <Tooltip
        content={isTemporaryChat ? 'Temporary chat is active (click to exit)' : 'Turn on temporary chat'}
        position="bottom"
        align="end"
      >
        <button
          onClick={onToggle}
          className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center group active:scale-95 ${
            isTemporaryChat
              ? 'bg-white/10 text-white ring-1 ring-white/30 shadow-md shadow-black/40 hover:bg-white/15'
              : 'text-[#9aa0a6] hover:text-white hover:bg-[#282a2c]'
          }`}
          aria-label={isTemporaryChat ? 'Exit temporary chat' : 'Turn on temporary chat'}
        >
          <TemporaryChatIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
          
          {/* Active status indicator dot */}
          {isTemporaryChat && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white ring-2 ring-[#131314] animate-pulse" />
          )}
        </button>
      </Tooltip>

      {/* Direct Close Button in Header when in Temporary Chat (matching Gemini reference) */}
      {isTemporaryChat && (
        <Tooltip content="Close temporary chat" position="bottom" align="end">
          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-white/10 text-[#c4c7c5] hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95 animate-in fade-in zoom-in-90 duration-200"
            aria-label="Close temporary chat"
          >
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
