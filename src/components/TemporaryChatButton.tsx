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

    <path d="M 8.2 3.6 A 8.8 8.8 0 0 1 15.8 3.6" />

    <path d="M 19.8 7.6 A 8.8 8.8 0 0 1 18.5 16.5" />

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
    <Tooltip
      content={isTemporaryChat ? 'Close temporary chat' : 'Turn on temporary chat'}
      position="bottom"
      align="end"
    >
      <button
        onClick={onToggle}
        className="p-2 rounded-full text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95"
        aria-label={isTemporaryChat ? 'Close temporary chat' : 'Turn on temporary chat'}
      >
        {isTemporaryChat ? (
          <X className="w-5 h-5 text-[#c4c7c5] hover:text-white animate-in fade-in zoom-in-90 duration-200" />
        ) : (
          <TemporaryChatIcon className="w-5 h-5 transition-transform" />
        )}
      </button>
    </Tooltip>
  );
};
