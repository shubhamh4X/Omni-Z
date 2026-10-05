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
  MessageSquare,
  GraduationCap,
  BookOpen,
  Layers,
  ArrowRight,
  ExternalLink,
  Code,
  Brain,
  Globe,
  LogOut,
  MoreVertical
} from 'lucide-react';
import { ChatSession } from '../types';
import { DnaRingLogo } from './DnaRingLogo';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';
import { Tooltip } from './Tooltip';

export const GemsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M7.5 14.5c1.8 2.2 4.8 2 6.5-.5 1-1.5 1.8-2.5 2.2-3-1 0-2.5.5-4 1.5-1.5 1-3.2 1.5-4.7 2z" />
  </svg>
);

export const ProjectsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="7" width="18" height="13" rx="4" />
    <path d="M8.5 7V4.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5V7" />
    <circle cx="12" cy="13.5" r="1.2" fill="currentColor" />
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
  onSelectPrompt,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'tutor' | 'gems' | 'projects' | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [tutorTopic, setTutorTopic] = useState('');
  const [tutorLevel, setTutorLevel] = useState<'Beginner' | 'Undergraduate' | 'Advanced'>('Beginner');
  const [tutorStyle, setTutorStyle] = useState<'Socratic' | 'First Principles' | 'Practice & Quiz'>('Socratic');
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

  const handleStartCustomTutor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const topic = tutorTopic.trim() || 'Quantum Physics & Entanglement';
    const prompt = `You are Omni Z acting as my personal, dedicated Guided Tutor.
Topic: "${topic}"
Learner Skill Level: ${tutorLevel} (tailor depth, vocabulary, and prerequisite assumptions accordingly).
Pedagogical Teaching Style: ${tutorStyle}.

Your tutoring methodology:
1. Start with an engaging intuitive hook and the fundamental "why this matters" mental model.
2. Break down the core concepts step-by-step. Use vivid analogies, structured bullet points, and clean math/code where helpful.
3. Keep the lesson interactive! End your opening lesson with one thought-provoking check-in question or mini-challenge to test my intuition before we proceed to the next step.

Begin our masterclass on "${topic}" now.`;

    handlePromptSelect(prompt, `🎓 Tutor: ${topic.slice(0, 24)}`);
    setTutorTopic('');
  };

  const filteredSessions = sessions.filter(
    (s) => s.messages.length > 0 && s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  onClick={() => setActiveModal('tutor')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Guided Tutor & Learning"
                >
                  <GraduationCap className="w-5 h-5 text-[#c58af9] transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('tutor');
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
                    Guided Tutor
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('gems')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Explore Gems & Agents"
                >
                  <GemsIcon className="w-5 h-5 text-[#f43f5e] transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('gems');
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
                    Explore Gems
                  </button>
                </div>
              </div>

              <div className="relative group flex items-center justify-center w-full">
                <button
                  onClick={() => setActiveModal('projects')}
                  className="w-10 h-10 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 shrink-0"
                  aria-label="Projects & Artifacts"
                >
                  <ProjectsIcon className="w-5 h-5 text-[#fb923c] transition-transform duration-200 group-hover:scale-105" />
                </button>
                <div className="absolute left-[46px] top-1/2 -translate-y-1/2 pl-2.5 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModal('projects');
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
                    Projects
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

          <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DnaRingLogo className="w-6 h-6 shrink-0" animate={false} glow={true} />
              <span className="font-semibold text-lg tracking-normal text-[#e3e3e3]">
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
                  className="p-1.5 rounded-lg hover:bg-[#282a2c] text-[#9aa0a6] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="px-3 pt-3 pb-1">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] text-[#e3e3e3] text-sm font-medium transition-colors cursor-pointer shadow-xs border border-[#2d2f33]"
            >
              <SquarePen className="w-4 h-4 text-[#8ab4f8]" />
              <span>New chat</span>
            </button>
          </div>

          <div className="px-3 pt-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left"
            >
              <Search className="w-4 h-4 text-[#9aa0a6]" />
              <span>Search history</span>
            </button>

            {searchOpen && (
              <div className="px-1 py-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask Omni Z"
                  autoFocus
                  className="w-full bg-[#131314] border border-[#3c4043] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#80868b] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>
            )}
          </div>

          <div className="px-3 pt-1 pb-2 space-y-0.5 border-b border-[#27282b]/60">
            <button
              onClick={() => setActiveModal('tutor')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left"
            >
              <GraduationCap className="w-4 h-4 text-[#c58af9]" />
              <span>Guided Tutor</span>
            </button>
            <button
              onClick={() => setActiveModal('gems')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left"
            >
              <GemsIcon className="w-4 h-4 text-[#f43f5e]" />
              <span>Explore Gems</span>
            </button>
            <button
              onClick={() => setActiveModal('projects')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-[#c4c7c5] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer text-left"
            >
              <ProjectsIcon className="w-4 h-4 text-[#fb923c]" />
              <span>Saved Projects</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pt-0.5 space-y-0.5 scrollbar-none">
            <div className="text-[13px] font-medium text-[#c4c7c5] px-3 pt-1.5 pb-0.5 select-none">
              Recent
            </div>

            {filteredSessions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-[#80868b] text-center italic">
                {searchQuery ? 'No matching chats' : 'No chats yet'}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = editingId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setMenuOpenId(null);
                      onSelectSession(session.id);
                    }}
                    className={`group relative flex items-center justify-between px-3 py-1 rounded-full text-[13px] leading-snug transition-all duration-150 cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#282a2c] text-white font-medium shadow-xs'
                        : 'text-[#e3e3e3] hover:text-white hover:bg-[#202124]'
                    }`}
                  >
                    <div className="truncate flex-1 pr-1">
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
                        <span className="truncate block font-normal" title={cleanTitle(session.title)}>
                          {cleanTitle(session.title)}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="relative shrink-0 flex items-center">
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
                            className="absolute right-0 top-8 z-50 w-32 py-1 bg-[#282a2c] border border-[#3c4043] rounded-xl shadow-2xl animate-in fade-in zoom-in-95"
                          >
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
              })
            )}
          </div>

          <div className="p-3 border-t border-[#27282b] bg-[#18191b]">
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

      {activeModal === 'tutor' && (
        <div 
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
          >

            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-[#c58af9] flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Guided Tutor & Learning</h3>
                  <p className="text-xs text-[#9aa0a6]">Personalized masterclasses, Socratic inquiry, and step-by-step breakdowns</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartCustomTutor} className="space-y-4 bg-[#131314]/70 p-4 rounded-xl border border-[#2d2f33]">
              <div>
                <label className="block text-xs font-semibold text-[#e3e3e3] mb-1.5">
                  What would you like to learn today?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tutorTopic}
                    onChange={(e) => setTutorTopic(e.target.value)}
                    placeholder="e.g. Quantum Computing, Calculus III, Dynamic Programming, Rust..."
                    className="w-full bg-[#1e1f20] border border-[#3c4043] focus:border-[#c58af9] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#80868b] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#80868b] block mb-1.5">Popular topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '⚛️ Quantum Physics',
                    '💻 Dynamic Programming',
                    '📐 Linear Algebra',
                    '🧬 CRISPR & Genetics',
                    '🤖 Transformer LLMs',
                    '⚡ Maxwell\'s Equations',
                  ].map((topic) => (
                    <button
                      type="button"
                      key={topic}
                      onClick={() => setTutorTopic(topic.replace(/^[^\s]+\s/, ''))}
                      className="px-2.5 py-1 rounded-lg bg-[#282a2c] hover:bg-[#3c4043] text-[11px] text-[#c4c7c5] hover:text-white transition-colors cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9aa0a6] mb-1">Knowledge Level</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1e1f20] p-1 rounded-lg border border-[#2d2f33]">
                    {(['Beginner', 'Undergraduate', 'Advanced'] as const).map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setTutorLevel(lvl)}
                        className={`text-[10px] py-1 px-1 rounded-md font-medium transition-colors cursor-pointer truncate ${
                          tutorLevel === lvl
                            ? 'bg-[#c58af9] text-gray-950 font-bold shadow-xs'
                            : 'text-[#9aa0a6] hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9aa0a6] mb-1">Teaching Style</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1e1f20] p-1 rounded-lg border border-[#2d2f33]">
                    {(['Socratic', 'First Principles', 'Practice & Quiz'] as const).map((style) => (
                      <button
                        type="button"
                        key={style}
                        onClick={() => setTutorStyle(style)}
                        className={`text-[10px] py-1 px-1 rounded-md font-medium transition-colors cursor-pointer truncate ${
                          tutorStyle === style
                            ? 'bg-[#c58af9] text-gray-950 font-bold shadow-xs'
                            : 'text-[#9aa0a6] hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9b51e0] to-[#c58af9] hover:opacity-95 text-gray-950 text-xs font-bold shadow-lg shadow-purple-500/20 transition-all cursor-pointer active:scale-98"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Start Tutoring Session {tutorTopic ? `on "${tutorTopic}"` : ''}</span>
              </button>
            </form>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-[#9aa0a6] uppercase tracking-wider px-1">
                Or jump into a masterclass:
              </div>
              {[
                {
                  title: 'Quantum Physics & Superposition',
                  desc: "Explain quantum superposition and quantum entanglement like I'm a first-year undergraduate with intuitive math.",
                  prompt: "Explain quantum superposition and entanglement step-by-step with intuitive analogies and the foundational mathematical formalism.",
                },
                {
                  title: 'High-Performance Algorithm Mastery',
                  desc: 'Interactive tutorial on Dynamic Programming and memoization with Python code execution.',
                  prompt: "Walk me through Dynamic Programming from first principles. Give me an interactive problem, explain recurrence relations, and provide Python code.",
                },
                {
                  title: 'Distributed Systems Architecture',
                  desc: 'Deep dive into Raft consensus, CAP theorem, and event-driven microservices.',
                  prompt: "Explain the Raft consensus algorithm step-by-step: leader election, log replication, and safety guarantees with ASCII diagrams.",
                },
                {
                  title: 'Genomics & CRISPR Technology',
                  desc: 'Molecular biology breakdown of Cas9 gene editing mechanisms and vectors.',
                  prompt: "Explain how CRISPR-Cas9 precision gene editing works at the molecular level, including gRNA recognition and DNA repair pathways.",
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(item.prompt, item.title)}
                  className="w-full text-left p-3 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-[#c58af9]/50 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-[#e3e3e3] group-hover:text-[#c58af9] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#9aa0a6] leading-relaxed line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#80868b] group-hover:text-[#c58af9] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'gems' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-[#f43f5e] flex items-center justify-center">
                  <GemsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Omni Z Specialized Gems</h3>
                  <p className="text-xs text-[#9aa0a6]">Specialized agent roles for coding, research, writing, and math</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                {
                  icon: Code,
                  name: 'Code Architect',
                  tag: 'Full-Stack',
                  color: 'text-blue-400 bg-blue-500/10',
                  prompt: "Act as a Principal Staff Software Architect. Analyze software architecture, review code, identify memory leaks, and generate high-performance TypeScript/Python.",
                },
                {
                  icon: Globe,
                  name: 'Research Scholar',
                  tag: 'Live Search',
                  color: 'text-emerald-400 bg-emerald-500/10',
                  prompt: "Act as an academic research scholar. Synthesize recent breakthroughs with verified facts, live citations, and rigorous empirical validation.",
                },
                {
                  icon: BookOpen,
                  name: 'Creative Storyteller',
                  tag: 'Narrative',
                  color: 'text-rose-400 bg-rose-500/10',
                  prompt: "Act as a master creative writer and worldbuilder. Write compelling, atmospheric narratives with rich prose, distinct character voices, and sensory detail.",
                },
                {
                  icon: Brain,
                  name: 'Quantitative Analyst',
                  tag: 'Math & Logic',
                  color: 'text-amber-400 bg-amber-500/10',
                  prompt: "Act as a quantitative analyst and mathematician. Provide step-by-step mathematical proofs, statistical inference, and computational verification.",
                },
              ].map((gem, idx) => {
                const IconComponent = gem.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePromptSelect(gem.prompt)}
                    className="p-3.5 rounded-xl bg-[#282a2c]/60 hover:bg-[#282a2c] border border-[#3c4043]/50 hover:border-[#8ab4f8]/50 transition-all cursor-pointer text-left space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${gem.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#9aa0a6] px-2 py-0.5 rounded-full bg-[#18191b] border border-[#3c4043]">
                        {gem.tag}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#e3e3e3] group-hover:text-white">
                        {gem.name}
                      </div>
                      <div className="text-[11px] text-[#80868b] leading-tight mt-0.5">
                        Launch focused agent session
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'projects' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1e1f20] border border-[#3c4043] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2d2f33] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#fb923c] flex items-center justify-center">
                  <ProjectsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Projects & Saved Artifacts</h3>
                  <p className="text-xs text-[#9aa0a6]">Quick access to your conversation vaults, code, and files</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-[#282a2c]/60 border border-[#3c4043]/40">
                  <div className="text-xl font-bold text-[#8ab4f8]">{sessions.length}</div>
                  <div className="text-[11px] text-[#9aa0a6]">Total Conversations</div>
                </div>
                <div className="p-3 rounded-xl bg-[#282a2c]/60 border border-[#3c4043]/40">
                  <div className="text-xl font-bold text-emerald-400">
                    {sessions.reduce((acc, s) => acc + s.messages.length, 0)}
                  </div>
                  <div className="text-[11px] text-[#9aa0a6]">Total Messages Exchanged</div>
                </div>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <div className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider px-1">
                  Active Projects
                </div>
                {sessions.filter((s) => s.messages.length > 0).slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSession(s.id);
                      setActiveModal(null);
                    }}
                    className="p-2.5 rounded-xl bg-[#282a2c]/40 hover:bg-[#282a2c] border border-transparent hover:border-[#3c4043] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="truncate text-xs font-medium text-[#e3e3e3] pr-2">
                      {cleanTitle(s.title)}
                    </div>
                    <div className="text-[10px] text-[#80868b] shrink-0">
                      {s.messages.length} msg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
