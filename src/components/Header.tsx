import React from 'react';
import { 
  GitCompare,
  Sparkles
} from 'lucide-react';
import { DnaRingLogo } from './DnaRingLogo';
import { TemporaryChatButton } from './TemporaryChatButton';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentView?: 'chat' | 'arena';
  onSwitchView?: (view: 'chat' | 'arena') => void;
  enableSearch?: boolean;
  setEnableSearch?: (val: boolean) => void;
  onClearChat?: () => void;
  hasMessages?: boolean;
  isTemporaryChat?: boolean;
  onToggleTemporaryChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  currentView = 'chat',
  onSwitchView,
  isTemporaryChat = false,
  onToggleTemporaryChat,
}) => {
  return (
    <header className={`sticky top-0 z-30 h-14 px-3 sm:px-4 flex items-center justify-between backdrop-blur-md select-none transition-colors duration-300 ${
      isTemporaryChat
        ? 'bg-[#000000]/95 border-b border-[#1c1c1e]'
        : 'bg-[#131314]/90 border-b border-[#222427]'
    }`}>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {!sidebarOpen && (
          <Tooltip content="Open sidebar" position="bottom" align="start">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 -ml-1 rounded-xl hover:bg-[#282a2c] text-[#e3e3e3] hover:text-white transition-all cursor-pointer group animate-in fade-in slide-in-from-left-2 duration-300 flex items-center justify-center"
              aria-label="Open sidebar"
            >
              <DnaRingLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </Tooltip>
        )}

        {onSwitchView && (
          <Tooltip
            content={currentView === 'arena' ? 'Return to Default Chat' : 'Compare AI models side-by-side'}
            position="bottom"
            align="start"
          >
            <button
              onClick={() => onSwitchView(currentView === 'arena' ? 'chat' : 'arena')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                currentView === 'arena'
                  ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 text-white border-purple-500/40 shadow-xs ring-1 ring-purple-500/30'
                  : 'bg-[#1b1c20] text-[#c4c7c5] border-[#2d2f33] hover:text-white hover:bg-[#25272a] hover:border-[#3c4043]'
              }`}
              aria-label="Compare AI models"
            >
              <GitCompare
                className={`w-3.5 h-3.5 ${
                  currentView === 'arena' ? 'text-purple-400' : 'text-[#8ab4f8]'
                }`}
              />
              <span>Compare</span>
              {currentView === 'arena' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-mono">
                  Active
                </span>
              )}
            </button>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {onToggleTemporaryChat && (
          <TemporaryChatButton
            isTemporaryChat={isTemporaryChat}
            onToggle={onToggleTemporaryChat}
          />
        )}
      </div>
    </header>
  );
};
