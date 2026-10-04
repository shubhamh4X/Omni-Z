import React from 'react';
import { 
  Globe, 
  Trash2,
  GitCompare
} from 'lucide-react';
import { DnaRingLogo } from './DnaRingLogo';
import { UserAccountMenu } from './UserAccountMenu';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentView?: 'chat' | 'arena';
  onSwitchView?: (view: 'chat' | 'arena') => void;
  enableSearch: boolean;
  setEnableSearch: (val: boolean) => void;
  onClearChat?: () => void;
  hasMessages?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  currentView = 'chat',
  onSwitchView,
  enableSearch,
  setEnableSearch,
  onClearChat,
  hasMessages = false,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 px-3 sm:px-4 flex items-center justify-between bg-[#131314]/90 backdrop-blur-md border-b border-[#222427] select-none">
      {/* Left: Mobile Toggle + Compare Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-[#282a2c] text-[#e3e3e3] hover:text-white transition-all cursor-pointer group animate-in fade-in slide-in-from-left-2 duration-300 flex items-center justify-center"
            title="Open sidebar"
          >
            <DnaRingLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Compare Feature Button */}
        {onSwitchView && (
          <button
            onClick={() => onSwitchView(currentView === 'arena' ? 'chat' : 'arena')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              currentView === 'arena'
                ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 text-white border-purple-500/40 shadow-xs ring-1 ring-purple-500/30'
                : 'bg-[#1b1c20] text-[#c4c7c5] border-[#2d2f33] hover:text-white hover:bg-[#25272a] hover:border-[#3c4043]'
            }`}
            title={currentView === 'arena' ? 'Return to Default Chat' : 'Compare AI models side-by-side'}
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
        )}
      </div>

      {/* Right: Search Grounding + Clear Chat + Account */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={() => setEnableSearch(!enableSearch)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border ${
            enableSearch
              ? 'bg-[#1e2330] text-[#8ab4f8] border-[#8ab4f8]/30 font-medium'
              : 'text-[#80868b] border-transparent hover:text-[#c4c7c5] hover:bg-[#1e1f20]'
          }`}
          title="Toggle Google Search live grounding"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search:</span>
          <span>{enableSearch ? 'Live' : 'Off'}</span>
        </button>

        {hasMessages && onClearChat && (
          <button
            onClick={onClearChat}
            className="p-2 rounded-full hover:bg-[#282a2c] text-[#80868b] hover:text-white transition-colors cursor-pointer"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Google Account Authentication */}
        <UserAccountMenu />
      </div>
    </header>
  );
};
