import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import { LogOut, CheckCircle2, ChevronDown, User as UserIcon, AlertCircle } from 'lucide-react';

interface UserAccountMenuProps {
  compact?: boolean;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({ compact = false }) => {
  const { user, loading, loginWithGoogle, logout, authError, clearError } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await loginWithGoogle();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1f20] border border-[#2d2f33] text-xs text-[#80868b] animate-pulse">
        <div className="w-3.5 h-3.5 border-2 border-[#80868b] border-t-transparent rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  // If user is not logged in: Show "Sign in with Google" button
  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={handleSignIn}
          disabled={isAuthenticating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f1f3f4] text-[#1f1f1f] text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-white/20"
          title="Sign in with your Google Account"
        >
          {isAuthenticating ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-[#4285F4] rounded-full animate-spin" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span className={compact ? 'hidden sm:inline' : 'inline'}>
            {isAuthenticating ? 'Signing in...' : 'Sign in with Google'}
          </span>
        </button>

        {authError && (
          <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-[#2a1717] border border-red-500/40 rounded-xl text-xs text-red-300 shadow-xl z-50 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Authentication Error</p>
                <p className="text-[11px] text-red-300/90 mt-0.5 leading-relaxed">{authError}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-white text-xs cursor-pointer ml-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user is logged in: Show Avatar + User Menu Dropdown
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-[#282a2c] border border-[#2d2f33] transition-colors cursor-pointer"
        aria-expanded={menuOpen}
        title={`Logged in as ${displayName} (${user.email})`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
            {initial}
          </div>
        )}

        <span className="hidden sm:inline text-xs font-medium text-[#e3e3e3] max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#80868b] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Account Details Popup */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-2xl p-4 z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Card */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#2d2f33]">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                <span>{displayName}</span>
              </div>
              <div className="text-xs text-[#9aa0a6] truncate">{user.email}</div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[#34a853] font-medium">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Google Verified</span>
              </div>
            </div>
          </div>

          {/* Account Status Information */}
          <div className="p-2.5 rounded-xl bg-[#282a2c]/60 border border-[#3c4043]/40 space-y-1.5 text-xs text-[#c4c7c5]">
            <div className="flex items-center justify-between">
              <span className="text-[#80868b]">Auth Provider:</span>
              <span className="flex items-center gap-1 font-medium text-white">
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#80868b]">Sync Status:</span>
              <span className="text-[#8ab4f8] font-medium">Cloud Active</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#282a2c] hover:bg-red-500/20 text-[#c4c7c5] hover:text-red-300 border border-transparent hover:border-red-500/30 text-xs font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out of Google</span>
          </button>
        </div>
      )}
    </div>
  );
};
