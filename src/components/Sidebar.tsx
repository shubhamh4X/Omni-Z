import React, { useState, useEffect, useRef } from 'react';
import { 
  SquarePen, 
  Search, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  PanelLeftClose, 
  ChevronLeft,
  LogOut,
  MoreVertical,
  Music2,
  Pin
} from 'lucide-react';
import { ChatSession } from '../types';
import { DnaRingLogo } from './DnaRingLogo';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import { Tooltip } from './Tooltip';

export const FrameImageIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

export const VideoClapperIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M6 4l2 4" />
    <path d="M11 4l2 4" />
    <path d="M16 4l2 4" />
    <line x1="2" y1="8" x2="22" y2="8" />
  </svg>
);

export const CanvasSquareIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession?: (id: string) => void;
  onSelectPrompt?: (prompt: string, title?: string) => void;
}

export const cleanTitle = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onClose,
  onOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onSelectPrompt,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'image' | 'video' | 'music' | 'canvas' | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { user, loginWithGoogle, logout } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const sidebarRef = useRef<HTMLElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const directionLockedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const isEdgeDragRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onToggle();
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    } else {
      onToggle();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    directionLockedRef.current = null;
    isEdgeDragRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    if (!directionLockedRef.current) {
      if (Math.hypot(diffX, diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          directionLockedRef.current = 'horizontal';
          setIsDragging(true);
        } else {
          directionLockedRef.current = 'vertical';
          return;
        }
      } else {
        return;
      }
    }

    if (directionLockedRef.current === 'horizontal') {
      if (e.cancelable) e.preventDefault();
      const width = sidebarRef.current?.offsetWidth || 256;
      if (diffX < 0) {

        setDragOffset(Math.max(-width, diffX));
      } else {

        setDragOffset(Math.min(18, diffX * 0.15));
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      directionLockedRef.current = null;
      return;
    }

    const elapsed = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = dragOffset / elapsed; 

    if (dragOffset < -50 || velocity < -0.25) {
      handleClose();
    }

    setIsDragging(false);
    setDragOffset(0);
    directionLockedRef.current = null;
  };

  const handleEdgeTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    directionLockedRef.current = null;
    isEdgeDragRef.current = true;
  };

  const handleEdgeTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    if (!directionLockedRef.current) {
      if (Math.hypot(diffX, diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY) && diffX > 0) {
          directionLockedRef.current = 'horizontal';
          setIsDragging(true);
        } else {
          directionLockedRef.current = 'vertical';
          return;
        }
      } else {
        return;
      }
    }

    if (directionLockedRef.current === 'horizontal') {
      if (e.cancelable) e.preventDefault();
      const width = 256;

      const offset = Math.min(width, Math.max(0, diffX)) - width;
      setDragOffset(offset);
    }
  };

  const handleEdgeTouchEnd = () => {
    if (!isMobile || !isDragging || !isEdgeDragRef.current) {
      setIsDragging(false);
      setDragOffset(0);
      isEdgeDragRef.current = false;
      directionLockedRef.current = null;
      return;
    }

    const width = 256;
    const movedRight = width + dragOffset; 
    const elapsed = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = movedRight / elapsed;

    if (movedRight > 55 || velocity > 0.25) {
      handleOpen();
    }

    setIsDragging(false);
    setDragOffset(0);
    isEdgeDragRef.current = false;
    directionLockedRef.current = null;
  };

  const handlePointerDownHandle = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMoveHandle = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const diffX = e.clientX - pointerStartRef.current.x;
    const width = sidebarRef.current?.offsetWidth || 256;
    if (diffX < 0) {
      setDragOffset(Math.max(-width, diffX));
    } else {
      setDragOffset(Math.min(18, diffX * 0.15));
    }
  };

  const handlePointerUpHandle = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const diffX = e.clientX - pointerStartRef.current.x;
    const elapsed = Math.max(1, Date.now() - pointerStartRef.current.time);
    const velocity = diffX / elapsed;
    pointerStartRef.current = null;
    setIsDragging(false);

    if (diffX < -50 || velocity < -0.25) {
      handleClose();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    const handleCloseMenu = () => setMenuOpenId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleSearchClick = () => {
    if (!isOpen) {
      onToggle();
      setSearchOpen(true);
    } else {
      setSearchOpen((prev) => !prev);
    }
  };

  const handlePromptSelect = (prompt: string, title?: string) => {
    setActiveModal(null);
    if (onSelectPrompt) {
      onSelectPrompt(prompt, title);
    }
  };

  const filteredSessions = sessions.filter(
    (s) => s.messages.length > 0 && s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => Boolean(s.isPinned));
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const renderChatItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          setMenuOpenId(null);
          onSelectSession(session.id);
        }}
        className={`group relative flex items-center justify-between min-h-[32px] px-[10px] py-[6px] rounded-full text-[13px] leading-snug transition-colors duration-150 cursor-pointer select-none ${
          isActive
            ? 'bg-[#282a2c] text-[#f1f3f4] font-medium'
            : 'text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#202124]'
        }`}
      >
        <div className="truncate flex-1 min-w-0 pr-1 flex items-center gap-1.5">
          {session.isPinned && (
            <Pin className="w-3 h-3 text-[#8ab4f8] fill-[#8ab4f8]/30 shrink-0" />
          )}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(session.id, e);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="bg-[#131314] border border-[#8ab4f8] rounded-full px-2.5 py-0.5 text-xs text-white focus:outline-none w-full"
            />
          ) : (
            <span className="truncate block font-normal text-[13px]" title={cleanTitle(session.title)}>
              {cleanTitle(session.title)}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="relative shrink-0 flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === session.id ? null : session.id);
              }}
              className={`p-0.5 rounded-full text-[#9aa0a6] hover:text-white hover:bg-[#3c4043] transition-colors cursor-pointer ${
                menuOpenId === session.id
                  ? 'opacity-100 bg-[#3c4043] text-white'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpenId === session.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-50 w-36 py-1 bg-[#282a2c] border border-[#3c4043] rounded-xl shadow-2xl animate-in fade-in zoom-in-95"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(null);
                    onTogglePinSession?.(session.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#e3e3e3] hover:text-white hover:bg-[#3c4043] transition-colors cursor-pointer text-left"
                >
                  <Pin className={`w-3.5 h-3.5 ${session.isPinned ? 'text-[#8ab4f8] fill-[#8ab4f8]/30' : 'text-[#9aa0a6]'}`} />
                  <span>{session.isPinned ? 'Unpin chat' : 'Pin chat'}</span>
                </button>
                <button
                  onClick={(e) => {
                    setMenuOpenId(null);
                    handleStartRename(session, e);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#e3e3e3] hover:text-white hover:bg-[#3c4043] transition-colors cursor-pointer text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#9aa0a6]" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    setMenuOpenId(null);
                    onDeleteSession(session.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#3c4043] transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => handleSaveRename(session.id, e)}
              className="p-1 hover:text-white cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(null);
              }}
              className="p-1 hover:text-neutral-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>

      <div
        onClick={handleClose}
        onTouchStart={isOpen ? handleTouchStart : undefined}
        onTouchMove={isOpen ? handleTouchMove : undefined}
        onTouchEnd={isOpen ? handleTouchEnd : undefined}
        onTouchCancel={isOpen ? handleTouchEnd : undefined}
        style={
          isMobile && isDragging
            ? {
                opacity: isOpen
                  ? Math.max(0, 1 - Math.abs(dragOffset) / 256)
                  : Math.max(0, Math.min(1, (256 + dragOffset) / 256)),
                transition: 'none',
              }
            : undefined
        }
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300 ease-in-out ${
          isOpen || (isMobile && isDragging && isEdgeDragRef.current)
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={
          isMobile && isDragging
            ? {
                transform: `translateX(${dragOffset}px)`,
                transition: 'none',
              }
            : undefined
        }
        className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-40 h-full
          bg-[#18191b] flex flex-col select-none border-r border-[#27282b]
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          shrink-0 shadow-2xl md:shadow-none
          touch-pan-y
          ${
            isOpen || (isMobile && isDragging && isEdgeDragRef.current)
              ? 'w-64 translate-x-0 overflow-visible md:overflow-hidden'
              : 'w-0 -translate-x-full md:w-[68px] md:translate-x-0 overflow-hidden md:overflow-visible'
          }
        `}
      >

        <div
          className={`w-[68px] h-full flex flex-col items-center py-3.5 justify-between shrink-0 transition-opacity duration-200 overflow-visible relative z-40 ${
            isOpen || (isMobile && isDragging && isEdgeDragRef.current) ? 'hidden' : 'flex'
          }`}
        >

          <div className="flex flex-col items-center gap-4 w-full overflow-visible">

            <div className="relative group flex items-center justify-center w-full">
              <button
                onClick={onToggle}
                className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#e3e3e3] hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                aria-label="Expand sidebar"
              >
                <DnaRingLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="
                    flex items-center px-4 py-2 rounded-[18px]
                    bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                    text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                    shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                    cursor-pointer select-none transition-all duration-200
                    ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                    opacity-0 -translate-x-3 scale-90
                    group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                    hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                  "
                >
                  Expand sidebar
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 w-full px-2 overflow-visible">

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={onNewChat}
                  className="w-10 h-10 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] text-[#e3e3e3] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shadow-xs shrink-0"
                  aria-label="New chat"
                >
                  <svg
                    className="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="newChatPenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#78a9ff" />
                        <stop offset="60%" stopColor="#8ab4f8" />
                        <stop offset="100%" stopColor="#f87171" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M7 16.5c-2.2-1.5-3-4.2-2-6.5 1.2-2.8 4.2-4.5 7.5-4 3 .5 5.5 2.8 6 5.8"
                      stroke="url(#newChatPenGrad)"
                    />
                    <path
                      d="M17 3.5a2.121 2.121 0 0 1 3 3L8.5 18 4 19l1-4.5L17 3.5z"
                      stroke="url(#newChatPenGrad)"
                    />
                  </svg>
                </button>

                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewChat();
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    New chat
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={handleSearchClick}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Search history"
                >
                  <Search className="w-5 h-5 text-[#9aa0a6] transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchClick();
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    Search history
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('image')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Create image"
                >
                  <FrameImageIcon className="w-5 h-5 text-emerald-400 transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('image');
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    Create image
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('video')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Create video"
                >
                  <VideoClapperIcon className="w-5 h-5 text-sky-400 transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('video');
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    Create video
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('music')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Create music"
                >
                  <Music2 className="w-5 h-5 text-pink-400 transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('music');
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    Create music
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('canvas')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Canvas"
                >
                  <CanvasSquareIcon className="w-5 h-5 text-indigo-400 transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('canvas');
                    }}
                    className="
                      flex items-center px-4 py-2 rounded-[18px]
                      bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                      text-[#1f1f1f] text-sm font-medium tracking-tight whitespace-nowrap
                      shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                      cursor-pointer select-none transition-all duration-200
                      ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                      opacity-0 -translate-x-3 scale-90
                      group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                      hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
                    "
                  >
                    Canvas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {user ? (
            <div className="relative group flex items-center justify-center w-full">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 shadow-sm cursor-pointer hover:border-white/50 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm cursor-pointer">
                  {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="
                  flex items-center gap-2 px-3.5 py-2 rounded-[18px]
                  bg-[#e3e3e3] text-[#1f1f1f] text-xs font-medium tracking-tight whitespace-nowrap
                  shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                  select-none transition-all duration-200
                  ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                  opacity-0 -translate-x-3 scale-90
                  group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                ">
                  <div className="w-2 h-2 rounded-full bg-[#34a853]" />
                  <span>{user.displayName || user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => loginWithGoogle()}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-800 text-xs shrink-0 shadow-sm cursor-pointer transition-colors active:scale-95"
                title="Sign in with Google"
                aria-label="Sign in with Google"
              >
                <GoogleIcon className="w-4 h-4" />
              </button>
              <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loginWithGoogle();
                  }}
                  className="
                    flex items-center gap-2 px-3.5 py-2 rounded-[18px]
                    bg-[#e3e3e3] hover:bg-white active:bg-[#d4d6d8]
                    text-[#1f1f1f] text-xs font-medium tracking-tight whitespace-nowrap
                    shadow-[0_6px_26px_rgba(0,0,0,0.5)] border border-black/5
                    cursor-pointer select-none transition-all duration-200
                    ease-[cubic-bezier(0.16,1,0.3,1)] origin-left
                    opacity-0 -translate-x-3 scale-90
                    group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100
                  "
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`w-64 h-full flex flex-col shrink-0 transition-opacity duration-200 overflow-hidden ${
            isOpen || (isMobile && isDragging && isEdgeDragRef.current) ? 'flex' : 'hidden'
          }`}
        >

          <div className="px-3 pt-3.5 pb-2.5 flex items-center justify-between min-h-[44px]">
            <div className="flex items-center gap-2.5">
              <DnaRingLogo className="w-5 h-5 shrink-0" animate={true} glow={true} />
              <span className="font-semibold text-[15px] tracking-tight text-[#e3e3e3] select-none">
                Omni Z
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="md:hidden flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#202124] text-[10px] text-[#9aa0a6] select-none border border-[#2d2f33]">
                <ChevronLeft className="w-3 h-3 text-[#8ab4f8] animate-pulse" />
                <span>Slide</span>
              </div>
              <Tooltip content="Collapse sidebar" position="bottom">
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-[8px] hover:bg-[#282a2c] text-[#9aa0a6] hover:text-[#e3e3e3] transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="px-3 pb-1.5">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-3.5 py-2 min-h-[36px] rounded-full bg-[#1e1f20] hover:bg-[#282a2c] text-[#e3e3e3] text-[13px] font-medium transition-colors cursor-pointer shadow-2xs border border-[#2d2f33] active:scale-[0.99] select-none"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <SquarePen className="w-4 h-4 text-[#8ab4f8]" />
              </div>
              <span>New chat</span>
            </button>
          </div>

          <div className="px-3 flex flex-col gap-1">
            <div>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-full flex items-center gap-3 px-3 py-1.5 min-h-[32px] rounded-full text-[13px] font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left select-none"
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-[#9aa0a6]" />
                </div>
                <span className="truncate">Search history</span>
              </button>

              {searchOpen && (
                <div className="pt-1.5 px-0.5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask Omni Z"
                    autoFocus
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-full px-3 py-1.5 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-[#8ab4f8]"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModal('image')}
              className="w-full flex items-center gap-3 px-3 py-1.5 min-h-[32px] rounded-full text-[13px] font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left select-none"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <FrameImageIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="truncate">Create image</span>
            </button>

            <button
              onClick={() => setActiveModal('video')}
              className="w-full flex items-center gap-3 px-3 py-1.5 min-h-[32px] rounded-full text-[13px] font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left select-none"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <VideoClapperIcon className="w-4 h-4 text-sky-400" />
              </div>
              <span className="truncate">Create video</span>
            </button>

            <button
              onClick={() => setActiveModal('music')}
              className="w-full flex items-center gap-3 px-3 py-1.5 min-h-[32px] rounded-full text-[13px] font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left select-none"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <Music2 className="w-4 h-4 text-pink-400" />
              </div>
              <span className="truncate">Create music</span>
            </button>

            <button
              onClick={() => setActiveModal('canvas')}
              className="w-full flex items-center gap-3 px-3 py-1.5 min-h-[32px] rounded-full text-[13px] font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left select-none"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <CanvasSquareIcon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="truncate">Canvas</span>
            </button>
          </div>

          <div className="px-3 pt-2.5 pb-1">
            <div className="border-t border-[#27282b]/40" />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 scrollbar-none">
            {filteredSessions.length === 0 ? (
              <div>
                <div className="text-xs font-medium text-[#80868b] px-2.5 mb-[8px] select-none tracking-normal">
                  Recent
                </div>
                <div className="px-3 py-3 text-xs text-[#80868b] text-center italic">
                  {searchQuery ? 'No matching chats' : 'No chats yet'}
                </div>
              </div>
            ) : (
              <>
                {pinnedSessions.length > 0 && (
                  <div className="mb-2.5">
                    <div className="text-xs font-medium text-[#80868b] px-2.5 mb-[8px] select-none tracking-normal flex items-center gap-1.5">
                      <Pin className="w-3 h-3 text-[#8ab4f8] fill-[#8ab4f8]/30" />
                      <span>Pinned</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {pinnedSessions.map((session) => renderChatItem(session))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-[#80868b] px-2.5 mb-[8px] select-none tracking-normal">
                    Recent
                  </div>
                  <div className="flex flex-col gap-1">
                    {recentSessions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-[#80868b] text-center italic">
                        {searchQuery ? 'No other matching chats' : 'No other chats'}
                      </div>
                    ) : (
                      recentSessions.map((session) => renderChatItem(session))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-3 border-t border-[#27282b] bg-[#18191b] shrink-0">
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[#e3e3e3] truncate">
                      {user.displayName || 'User'}
                    </div>
                    <div className="text-[11px] text-[#80868b] truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg text-[#80868b] hover:text-red-400 hover:bg-[#282a2c] transition-colors cursor-pointer shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {(isOpen || (isMobile && isDragging && isEdgeDragRef.current)) && (
          <div
            onPointerDown={handlePointerDownHandle}
            onPointerMove={handlePointerMoveHandle}
            onPointerUp={handlePointerUpHandle}
            onPointerCancel={handlePointerUpHandle}
            className="md:hidden absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center py-6 px-1.5 cursor-grab active:cursor-grabbing touch-none select-none group"
            title="Slide left with finger to collapse"
            aria-label="Slide left with finger to collapse sidebar"
          >
            <div className="w-1.5 h-12 rounded-full bg-white/30 group-hover:bg-white/50 group-active:bg-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-xs transition-all flex items-center justify-center ring-1 ring-black/20">
              <div className="w-0.5 h-4 rounded-full bg-black/40" />
            </div>
          </div>
        )}
      </aside>

      {!isOpen && (
        <div
          onTouchStart={handleEdgeTouchStart}
          onTouchMove={handleEdgeTouchMove}
          onTouchEnd={handleEdgeTouchEnd}
          onTouchCancel={handleEdgeTouchEnd}
          className="fixed inset-y-0 left-0 w-6 z-30 md:hidden touch-none pointer-events-auto"
          aria-hidden="true"
          title="Slide right to open sidebar"
        />
      )}

      {activeModal === 'image' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                  <FrameImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Create image</h3>
                  <p className="text-xs text-[#9aa0a6]">High-resolution generative imagery, character concepts & landscapes</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium text-[#c4c7c5]">Inspiration presets:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'A futuristic cyberpunk metropolis at twilight with neon rain reflections',
                  'Ultra-detail macro portrait of a mystical snow owl with natural ambient light',
                  'Cinematic photorealistic villa integrated into a cliffside overlooking Aegean waters',
                  'A vibrant 3D claymation character coding on a laptop with glowing holographic icons'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(`Generate a photorealistic, ultra-high-resolution image of: ${sample}`, 'Create image')}
                    className="p-2.5 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-emerald-500/50 text-left text-xs text-[#e3e3e3] hover:text-white transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <span className="line-clamp-2">{sample}</span>
                    <span className="text-[10px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 group-hover:underline">
                      Launch prompt →
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('prompt') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handlePromptSelect(`Generate a high-detail photorealistic image of: ${input.value.trim()}`, 'Create image');
                  }
                }}
                className="pt-2 space-y-2.5 border-t border-[#2d2f33]"
              >
                <label className="block text-xs font-medium text-[#c4c7c5]">Custom image description:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prompt"
                    placeholder="Describe what you want to create..."
                    autoFocus
                    className="flex-1 bg-[#131314] border border-[#3c4043] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all shadow-md shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'video' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
                  <VideoClapperIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Create video</h3>
                  <p className="text-xs text-[#9aa0a6]">Cinematic video storyboard, scene-by-scene script & camera directions</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium text-[#c4c7c5]">Video templates & concepts:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Cinematic sci-fi trailer: exploration team discovers an ancient orbital monolith',
                  'Luxury mechanical timepiece commercial with slow-motion macro tracking shots',
                  'Atmospheric thriller opening: rainy nighttime cobblestone alleyway in 1920s Prague',
                  'High-energy tech keynote product reveal with dynamic lighting and camera pans'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(`Create a cinematic video storyboard, scene-by-scene script, and camera motion directions for: ${sample}`, 'Create video')}
                    className="p-2.5 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-sky-500/50 text-left text-xs text-[#e3e3e3] hover:text-white transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <span className="line-clamp-2">{sample}</span>
                    <span className="text-[10px] text-sky-400 font-medium mt-1.5 flex items-center gap-1 group-hover:underline">
                      Launch storyboard →
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('prompt') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handlePromptSelect(`Create a cinematic video storyboard, scene-by-scene script, and camera motion directions for: ${input.value.trim()}`, 'Create video');
                  }
                }}
                className="pt-2 space-y-2.5 border-t border-[#2d2f33]"
              >
                <label className="block text-xs font-medium text-[#c4c7c5]">Custom video scene or narrative:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prompt"
                    placeholder="Describe your video storyline..."
                    autoFocus
                    className="flex-1 bg-[#131314] border border-[#3c4043] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all shadow-md shrink-0"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'music' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shadow-inner">
                  <Music2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Create music</h3>
                  <p className="text-xs text-[#9aa0a6]">Chord progressions, arrangements, tempo, lyrics & track structures</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium text-[#c4c7c5]">Genres & musical moods:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Lo-fi study chillhop with dusty Rhodes piano, vinyl crackle, and laid-back beat',
                  'Cinematic orchestral battle theme with rising French horns and tribal war drums',
                  'Upbeat 80s synthwave anthem with analog arpeggios and punchy gated reverb',
                  'Warm acoustic indie folk ballad with intimate fingerstyle acoustic guitar'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(`Compose an original music track structure, chord progressions, tempo, instrumentation, and lyric sheet for: ${sample}`, 'Create music')}
                    className="p-2.5 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-pink-500/50 text-left text-xs text-[#e3e3e3] hover:text-white transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <span className="line-clamp-2">{sample}</span>
                    <span className="text-[10px] text-pink-400 font-medium mt-1.5 flex items-center gap-1 group-hover:underline">
                      Compose track →
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('prompt') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handlePromptSelect(`Compose an original music track structure, chord progressions, tempo, instrumentation, and lyric sheet for: ${input.value.trim()}`, 'Create music');
                  }
                }}
                className="pt-2 space-y-2.5 border-t border-[#2d2f33]"
              >
                <label className="block text-xs font-medium text-[#c4c7c5]">Custom music style & instrumentation:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prompt"
                    placeholder="Describe your musical vision or genre..."
                    autoFocus
                    className="flex-1 bg-[#131314] border border-[#3c4043] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all shadow-md shrink-0"
                  >
                    Compose
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'canvas' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                  <CanvasSquareIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Canvas</h3>
                  <p className="text-xs text-[#9aa0a6]">Interactive workspaces, live code blueprints, schemas & architecture</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-medium text-[#c4c7c5]">Canvas workspace templates:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Full-stack cloud application architecture with API gateways and cache layers',
                  'Interactive React design system and reusable component catalog with code',
                  'PostgreSQL schema model with relationships, indexing strategies & migrations',
                  'Multi-agent autonomous cognitive pipeline workflow and state machine'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(`Create an interactive modular workspace and code architecture canvas for: ${sample}`, 'Canvas')}
                    className="p-2.5 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-indigo-500/50 text-left text-xs text-[#e3e3e3] hover:text-white transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <span className="line-clamp-2">{sample}</span>
                    <span className="text-[10px] text-indigo-400 font-medium mt-1.5 flex items-center gap-1 group-hover:underline">
                      Launch canvas →
                    </span>
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('prompt') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handlePromptSelect(`Create an interactive modular workspace and code architecture canvas for: ${input.value.trim()}`, 'Canvas');
                  }
                }}
                className="pt-2 space-y-2.5 border-t border-[#2d2f33]"
              >
                <label className="block text-xs font-medium text-[#c4c7c5]">Custom workspace topic:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="prompt"
                    placeholder="Describe what canvas or architecture to build..."
                    autoFocus
                    className="flex-1 bg-[#131314] border border-[#3c4043] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all shadow-md shrink-0"
                  >
                    Launch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
