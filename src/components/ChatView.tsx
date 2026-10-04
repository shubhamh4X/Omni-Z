import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  ArrowUp, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Paperclip, 
  X,
  Cpu,
  Code,
  Compass,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  Download,
  Maximize2,
  Brain,
  RefreshCw,
  Wand2,
  Ratio,
  Eye,
  Layers,
  Sun,
  Camera,
  Scan,
  Table,
  BarChart2,
  Smartphone,
  Monitor,
  Square,
  Zap,
  ChevronDown,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  Music2,
  Terminal,
  Sigma,
  Database,
  Search,
  HardDrive,
  FolderPlus,
  FileUp,
  Sparkles
} from 'lucide-react';
import { ChatMessage, Attachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DnaRingLogo } from './DnaRingLogo';

// Pixel-perfect SVG icons matching Google Gemini design
const GoogleDriveOutlineIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="8.5 2 15.5 2 21.5 12.5 18 18.5 6 18.5 2.5 12.5" />
    <line x1="8.5" y1="2" x2="18" y2="18.5" />
    <line x1="15.5" y1="2" x2="6" y2="18.5" />
  </svg>
);

const GooglePhotosIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12V4a4 4 0 0 1 4 4v4h-4z" />
    <path d="M12 12h8a4 4 0 0 1-4 4h-4v-4z" />
    <path d="M12 12v8a4 4 0 0 1-4-4v-4h4z" />
    <path d="M12 12H4a4 4 0 0 1 4-4h4v4z" />
  </svg>
);

const AvatarSmileIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="1.2" fill="currentColor" />
    <circle cx="15" cy="10" r="1.2" fill="currentColor" />
    <path d="M8 14.5c1.2 1.5 2.8 2 4 2s2.8-.5 4-2" />
  </svg>
);

const CodeBracketsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const NotebookOutlineIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="12" y1="8" x2="16" y2="8" />
    <line x1="12" y1="12" x2="16" y2="12" />
  </svg>
);

const FrameImageIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const VideoClapperIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M6 4l2 4" />
    <path d="M11 4l2 4" />
    <path d="M16 4l2 4" />
    <line x1="2" y1="8" x2="22" y2="8" />
  </svg>
);

const CanvasSquareIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const DeepResearchAtomIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2.5" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)" />
  </svg>
);

interface ChatViewProps {
  sessionId?: string;
  messages: ChatMessage[];
  onSendMessage: (
    text: string, 
    attachments: Attachment[], 
    extraOptions?: { imageAspectRatio?: string }
  ) => Promise<void>;
  isLoading: boolean;
  enableSearch: boolean;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
  onClearChat?: () => void;
}

const STARTER_PROMPTS = [
  {
    icon: ImageIcon,
    title: 'AI Image Generation',
    prompt: 'Generate a high-fidelity cinematic cyberpunk city at night with glowing neon reflections.',
  },
  {
    icon: Compass,
    title: 'Research & Live Web',
    prompt: 'Search the web for the latest artificial intelligence breakthroughs and tech news this week.',
  },
  {
    icon: Code,
    title: 'Code & Run Python',
    prompt: 'Write and run a Python script that calculates statistics, benchmarks performance, and prints a formatted summary table.',
  },
  {
    icon: Lightbulb,
    title: 'Creative Planning',
    prompt: 'Draft an executive launch plan and feature roadmap for an autonomous developer platform.',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  sessionId,
  messages,
  onSendMessage,
  isLoading,
  enableSearch,
  selectedModel = 'omni-z-flash',
  onSelectModel,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedThoughtId, setCopiedThoughtId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [dragOver, setDragOver] = useState(false);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; prompt?: string } | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [studioCategory, setStudioCategory] = useState<'style' | 'lighting' | 'camera'>('style');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'uploads' | 'tools' | null>(null);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [driveTab, setDriveTab] = useState<'recent' | 'my-drive' | 'shared'>('recent');

  const attachMenuRef = useRef<HTMLDivElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const notebookFileInputRef = useRef<HTMLInputElement>(null);

  const sampleDriveFiles = [
    {
      id: 'gdoc_1',
      name: 'Omni Z Product Architecture & System Blueprint.gdoc',
      type: 'application/vnd.google-apps.document',
      size: 245000,
      updatedAt: 'Today, 2:15 PM',
      snippet: 'Complete technical specification covering vector DB, multi-model cascade, and Python execution sandbox.',
    },
    {
      id: 'gsheet_1',
      name: 'Financial Projections & API Unit Economics 2026.gsheet',
      type: 'application/vnd.google-apps.spreadsheet',
      size: 512000,
      updatedAt: 'Yesterday',
      snippet: 'Quarterly breakdown of token usage, compute tiers, margin analysis, and enterprise revenue forecasts.',
    },
    {
      id: 'gdoc_2',
      name: 'Autonomous Agent Research & Grounding Benchmark.gdoc',
      type: 'application/vnd.google-apps.document',
      size: 180000,
      updatedAt: '3 days ago',
      snippet: 'Empirical evaluation of tool-augmented LLM reasoning, chain of thought verification, and factual latency.',
    },
    {
      id: 'gdoc_3',
      name: 'Executive Launch Strategy & Go-To-Market Plan.gdoc',
      type: 'application/vnd.google-apps.document',
      size: 320000,
      updatedAt: 'May 12, 2026',
      snippet: 'Strategic launch phases, developer community onboarding, social campaigns, and benchmark publications.',
    },
    {
      id: 'gsheet_2',
      name: 'Distributed Systems Latency & Reliability Matrix.gsheet',
      type: 'application/vnd.google-apps.spreadsheet',
      size: 410000,
      updatedAt: 'Apr 28, 2026',
      snippet: 'P99 response latency benchmarks across model tiers, vector retrieval embeddings, and sandboxed runtimes.',
    },
  ];

  const modelOptions = [
    {
      id: 'omni-z-flash',
      name: 'Omni Z Ultra',
      shortName: 'Ultra',
      badge: 'Flagship Intelligence',
      desc: 'Multimodal analysis, real-time Google search grounding, and sandboxed Python code execution.',
      dotColor: 'bg-[#8ab4f8]',
      iconColor: 'text-[#8ab4f8]',
      icon: Zap,
    },
    {
      id: 'omni-z-think',
      name: 'Omni Z Deep Think',
      shortName: 'Think',
      badge: 'Extended Reasoning',
      desc: 'Deep analytical chain of thought, mathematical proofs, and step-by-step logic verification.',
      dotColor: 'bg-purple-400',
      iconColor: 'text-purple-400',
      icon: Brain,
    },
    {
      id: 'omni-z-code',
      name: 'Code Architect',
      shortName: 'Code',
      badge: 'Production Systems',
      desc: 'Full-stack software architecture, algorithmic optimization, debugging, and live execution.',
      dotColor: 'bg-blue-400',
      iconColor: 'text-blue-400',
      icon: Code,
    },
    {
      id: 'omni-z-tutor',
      name: 'Masterclass Tutor',
      shortName: 'Tutor',
      badge: 'Socratic Learning',
      desc: 'Pedagogical breakdowns, LaTeX math equations, and intuitive conceptual explanations.',
      dotColor: 'bg-emerald-400',
      iconColor: 'text-emerald-400',
      icon: GraduationCap,
    },
  ];

  const currentModel = modelOptions.find((m) => m.id === selectedModel) || modelOptions[0];

  // Close Model Intelligence dropdown when clicking elsewhere
  useEffect(() => {
    if (!modelDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modelDropdownOpen]);

  // Close Attach dropdown when clicking elsewhere
  useEffect(() => {
    if (!attachMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setAttachMenuOpen(false);
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAttachMenuOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [attachMenuOpen]);

  const handleCopyThought = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedThoughtId(msgId);
    setTimeout(() => setCopiedThoughtId(null), 2000);
  };

  // AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!inputText.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    try {
      const isImage = /generate|draw|image|picture|render|cyberpunk|photo|wallpaper|painting|artwork/i.test(inputText);
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText, type: isImage ? 'image' : 'general' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setInputText(data.enhancedPrompt);
        }
      }
    } catch (err) {
      console.warn('Enhance prompt failed:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // AI Image Remix / Variation generator
  const handleRemixImage = (promptText?: string) => {
    if (!promptText) return;
    const remixPrompt = `Generate a high-fidelity visual remix and variation of: "${promptText}". Introduce dramatic lighting shifts, elevated detail, and cinematic perspective.`;
    onSendMessage(remixPrompt, [], { imageAspectRatio: selectedAspectRatio });
  };

  const handleDownloadImage = async (imgUrl: string, promptText?: string) => {
    setDownloadingUrl(imgUrl);
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const sanitizedName = (promptText || 'omni-z-generated-image')
        .slice(0, 40)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      link.download = `${sanitizedName || 'artwork'}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(imgUrl, '_blank');
    } finally {
      setDownloadingUrl(null);
    }
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const prevSessionIdRef = useRef<string | undefined>(sessionId);
  const prevMessageCountRef = useRef<number>(messages.length);
  const isInitialMount = useRef<boolean>(true);

  // Directly navigate to target chat without scrolling effect on session change
  useEffect(() => {
    const isNewSession = prevSessionIdRef.current !== sessionId;

    if (isInitialMount.current || isNewSession) {
      isInitialMount.current = false;
      prevSessionIdRef.current = sessionId;
      prevMessageCountRef.current = messages.length;

      // Instant jump to bottom without smooth scrolling animation
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }
      return;
    }

    // Only smooth-scroll when a new message is actively streaming or sent in the current session
    if (messages.length > prevMessageCountRef.current || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, sessionId]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Voice dictation
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  // Text to speech
  const handleToggleTTS = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeechId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*`_~]/g, '')
      .slice(0, 1000);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    speechRef.current = utterance;
    setActiveSpeechId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const insertTextAtCursor = (textToInsert: string) => {
    if (!textToInsert) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? inputText.length;
      const end = textarea.selectionEnd ?? inputText.length;
      const newText = inputText.slice(0, start) + textToInsert + inputText.slice(end);
      setInputText(newText);
      setTimeout(() => {
        textarea.focus();
        const newPos = start + textToInsert.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 10);
    } else {
      setInputText((prev) => (prev ? `${prev} ${textToInsert}` : textToInsert));
    }
  };

  const insertPromptTemplate = (template: string) => {
    setInputText((prev) => {
      if (!prev.trim()) return template;
      return `${template} ${prev}`;
    });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 10);
  };

  const processFileList = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = (ev) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              type: file.type,
              size: file.size,
              dataUrl: ev.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (ev) => {
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              type: file.type || 'text/plain',
              size: file.size,
              textContent: ev.target?.result as string,
            },
          ]);
        };
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
    e.target.value = '';
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    const currentAttachments = [...attachments];
    setInputText('');
    setAttachments([]);
    await onSendMessage(trimmed, currentAttachments, { imageAspectRatio: selectedAspectRatio });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInitialState = messages.length === 0;

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-56px)] relative overflow-hidden bg-[#131314]"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);

        // 1. Text drag and drop (mouse selected text dropped anywhere)
        const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
        if (droppedText && (!e.dataTransfer.files || e.dataTransfer.files.length === 0)) {
          insertTextAtCursor(droppedText);
          return;
        }

        // 2. File drag and drop
        if (e.dataTransfer.files?.length) {
          processFileList(e.dataTransfer.files);
        }
      }}
    >
      {/* Subtle radial glow background */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(74, 137, 243, 0.18) 0%, rgba(197, 138, 249, 0.10) 40%, rgba(19, 19, 20, 0) 80%)'
        }}
      />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={codeFileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".py,.ts,.tsx,.js,.jsx,.json,.sql,.cpp,.c,.h,.rs,.go,.sh,.html,.css,.yaml,.yml"
        className="hidden"
      />
      <input
        type="file"
        ref={photoFileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={notebookFileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".ipynb,.md,.txt,.json"
        className="hidden"
      />

      {/* Drag overlay indicator */}
      {dragOver && (
        <div className="absolute inset-0 z-50 bg-[#131314]/90 backdrop-blur-sm border-2 border-dashed border-[#8ab4f8] flex flex-col items-center justify-center text-white">
          <Paperclip className="w-12 h-12 mb-3 text-[#8ab4f8] animate-bounce" />
          <p className="text-lg font-medium">Drop documents, code files, or images here</p>
          <p className="text-xs text-[#9aa0a6] mt-1">Omni Z will analyze and synthesize the content</p>
        </div>
      )}

      {/* Main Messages Scroll Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 relative z-10">
        {isInitialState ? (
          /* Minimalist Welcome Screen */
          <div className="max-w-3xl mx-auto min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center py-10 px-4">
            {/* Ring-like DNA structure logo */}
            <div className="mb-5 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <DnaRingLogo className="w-16 h-16 mx-auto relative z-10" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-normal text-[#e3e3e3] mb-3 tracking-tight font-sans">
              Hello, what can I do for you?
            </h1>
            <p className="text-[#9aa0a6] text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Your universal AI agent with live Google Search, backend Python execution, and multimodal intelligence.
            </p>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              {STARTER_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(item.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-[#2d2f33] hover:border-[#3c4043] transition-all cursor-pointer group text-left shadow-xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8ab4f8] mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                    <div className="text-xs text-[#c4c7c5] group-hover:text-white line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-4xl mx-auto w-full py-8 space-y-8 px-2 sm:px-6">
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <div key={message.id} className="space-y-4">
                  {/* User Message */}
                  {isUser ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[78%] bg-[#242629] border border-[#333538] text-[#f1f3f4] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm">
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2.5 flex flex-wrap gap-2">
                            {message.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1b1d] border border-[#3c4043] text-xs text-[#c4c7c5]"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-[#8ab4f8]" />
                                <span className="truncate max-w-[180px]">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap font-normal select-text">{message.content}</div>
                      </div>
                    </div>
                  ) : (
                    /* Omni Z Response */
                    <div className="flex gap-4 items-start">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#2d2f33] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <DnaRingLogo className="w-5 h-5" />
                      </div>

                      <div className="flex-1 space-y-4 min-w-0 pr-1">
                        {/* Deep Reasoning & Chain-of-Thought (Visible when deep thinking is enabled) */}
                        {message.thinkingProcess && (() => {
                          const rawThought = message.thinkingProcess;
                          const hasPhases = /Phase\s*\d+|Step\s*\d+/i.test(rawThought);
                          let stepSections: { title: string; body: string }[] = [];

                          if (hasPhases) {
                            const parts = rawThought.split(/(?=(?:Phase|Step)\s*\d+[:\-]?)/i).filter(Boolean);
                            stepSections = parts.map((part) => {
                              const firstLineBreak = part.indexOf('\n');
                              if (firstLineBreak !== -1) {
                                return {
                                  title: part.slice(0, firstLineBreak).replace(/[*#]/g, '').trim(),
                                  body: part.slice(firstLineBreak).trim(),
                                };
                              }
                              return { title: 'Analytical Phase', body: part.trim() };
                            });
                          }

                          return (
                            <div className="mb-4 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/25 to-[#1a1b1d] overflow-hidden text-xs shadow-lg">
                              {/* Header bar */}
                              <div className="w-full px-4 py-2.5 flex items-center justify-between text-purple-300 bg-purple-950/40 border-b border-purple-500/20">
                                <button
                                  onClick={() =>
                                    setExpandedThoughts((prev) => ({
                                      ...prev,
                                      [message.id]: !prev[message.id],
                                    }))
                                  }
                                  className="flex items-center gap-2 text-left cursor-pointer hover:text-white transition-colors"
                                >
                                  <Brain className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
                                  <span className="font-semibold tracking-wide">
                                    {stepSections.length > 0 ? `Reasoning Chain (${stepSections.length} Analytical Steps)` : 'Deep Reasoning & Chain-of-Thought'}
                                  </span>
                                  <span className="text-[11px] text-purple-300/80 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-400/20">
                                    {expandedThoughts[message.id] ? 'Hide Steps ▲' : 'Inspect Steps ▼'}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleCopyThought(message.id, rawThought)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-purple-900/40 text-purple-300/80 hover:text-white text-[11px] transition-colors cursor-pointer border border-purple-500/20"
                                  title="Copy reasoning chain"
                                >
                                  {copiedThoughtId === message.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-medium">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Expanded Content with Structured Step Cards */}
                              {expandedThoughts[message.id] && (
                                <div className="p-4 space-y-2.5 bg-black/40">
                                  {stepSections.length > 0 ? (
                                    stepSections.map((step, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3.5 space-y-1.5"
                                      >
                                        <div className="flex items-center gap-2 font-medium text-purple-200 text-xs">
                                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 text-[10px] font-mono border border-purple-400/30 font-bold">
                                            {idx + 1}
                                          </span>
                                          <span className="font-semibold">{step.title}</span>
                                        </div>
                                        <div className="text-[#c4c7c5] text-[12px] leading-relaxed whitespace-pre-wrap pl-7 font-mono opacity-90">
                                          {step.body}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-[#c4c7c5] leading-relaxed whitespace-pre-wrap font-mono text-[12px] max-h-72 overflow-y-auto">
                                      {rawThought}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Markdown Content */}
                        <div className="text-[15.5px] text-[#e3e3e3] leading-[1.8] font-normal tracking-[0.01em]">
                          <MarkdownRenderer content={message.content} />
                        </div>

                        {/* Generated AI Images with On-Hover Download & Remix Overlay */}
                        {message.images && message.images.length > 0 && (
                          <div className="pt-2 space-y-3">
                            {message.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="group relative rounded-2xl overflow-hidden border border-[#2d2f33] bg-[#1a1b1d] shadow-2xl max-w-xl cursor-pointer"
                                onClick={() => setPreviewModalImage({ url: imgUrl, prompt: message.imagePrompt })}
                              >
                                <img
                                  src={imgUrl}
                                  alt={message.imagePrompt || 'Generated visual art'}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-auto object-cover max-h-[520px] transition-transform duration-500 group-hover:scale-[1.02]"
                                  loading="lazy"
                                />

                                {/* Dark Gradient Scrim on Mouse Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Floating Top-Right Controls on Hover */}
                                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-10">
                                  {/* Remix AI button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemixImage(message.imagePrompt);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-900/80 hover:bg-purple-800 backdrop-blur-md text-purple-200 hover:text-white text-xs font-medium border border-purple-400/30 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    title="Generate AI variation / remix"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Remix</span>
                                  </button>

                                  {/* Download button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadImage(imgUrl, message.imagePrompt);
                                    }}
                                    disabled={downloadingUrl === imgUrl}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md text-white text-xs font-medium border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    title="Download image to device"
                                  >
                                    {downloadingUrl === imgUrl ? (
                                      <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-3.5 h-3.5 text-white" />
                                        <span>Download</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Fullscreen button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewModalImage({ url: imgUrl, prompt: message.imagePrompt });
                                    }}
                                    className="p-1.5 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md text-white border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    title="View Fullscreen"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Floating Bottom Prompt Caption (Appears on Mouse Hover) */}
                                <div className="absolute bottom-0 inset-x-0 p-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-10 flex items-center justify-between text-xs text-white pointer-events-none">
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <ImageIcon className="w-3.5 h-3.5 text-[#8ab4f8] shrink-0" />
                                    <span className="truncate italic font-medium drop-shadow-md">
                                      {message.imagePrompt || 'AI Generated Visual'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-white/80 shrink-0 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-xs font-mono border border-white/10">
                                    1024 × 1024
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grounding Web Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="pt-3.5 border-t border-[#2d2f33]/60 space-y-2">
                            <div className="text-xs text-[#9aa0a6] font-medium flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-[#8ab4f8]" />
                              <span>Referenced Live Sources</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((src, idx) => {
                                let domain = '';
                                try {
                                  domain = new URL(src.url).hostname.replace('www.', '');
                                } catch {
                                  domain = 'source';
                                }

                                return (
                                  <a
                                    key={idx}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1f20] hover:bg-[#282a2c] text-[#8ab4f8] hover:text-[#a8c7fa] text-xs border border-[#2d2f33] transition-colors group shadow-2xs"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                                    <span className="max-w-[200px] truncate">{src.title || domain}</span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-3 text-[#80868b] pt-3 mt-2 border-t border-[#2d2f33]/40">
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="p-1.5 rounded-full hover:bg-[#282a2c] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleTTS(message.id, message.content)}
                            className="p-1.5 rounded-full hover:bg-[#282a2c] hover:text-[#e3e3e3] transition-colors cursor-pointer"
                            title={activeSpeechId === message.id ? 'Stop listening' : 'Listen'}
                          >
                            {activeSpeechId === message.id ? (
                              <VolumeX className="w-4 h-4 text-[#8ab4f8]" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>

                          {/* Retry button for transient error / service notices */}
                          {(message.content.includes('I encountered an issue') || message.content.includes('Service Notice')) && (
                            <button
                              onClick={() => {
                                const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                                if (lastUserMsg) {
                                  onSendMessage(lastUserMsg.content, lastUserMsg.attachments || [], { imageAspectRatio: selectedAspectRatio });
                                }
                              }}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] text-[#8ab4f8] hover:text-[#a8c7fa] border border-[#3c4043] text-xs font-medium cursor-pointer transition-colors shadow-2xs active:scale-95"
                              title="Retry request"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                              <span>Retry Request</span>
                            </button>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => setFeedback((prev) => ({ ...prev, [message.id]: 'up' }))}
                              className={`p-1.5 rounded-full hover:bg-[#282a2c] transition-colors cursor-pointer ${
                                feedback[message.id] === 'up' ? 'text-white' : 'hover:text-[#e3e3e3]'
                              }`}
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setFeedback((prev) => ({ ...prev, [message.id]: 'down' }))}
                              className={`p-1.5 rounded-full hover:bg-[#282a2c] transition-colors cursor-pointer ${
                                feedback[message.id] === 'down' ? 'text-white' : 'hover:text-[#e3e3e3]'
                              }`}
                              title="Bad response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Streaming Indicator */}
            {isLoading && (
              <div className="flex gap-4 items-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#2d2f33] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {selectedModel === 'omni-z-think' ? (
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  ) : (
                    <DnaRingLogo className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 space-y-2 py-1">
                  {selectedModel === 'omni-z-think' ? (
                    <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-xs space-y-2.5 max-w-lg">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                        <span>Omni Z Extended Reasoning Active</span>
                      </div>
                      <p className="text-[13px] text-[#c4c7c5] leading-relaxed">
                        Formulating problem decomposition, testing edge cases, and verifying mathematical logic.
                      </p>
                      <div className="h-1 w-full bg-purple-950/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[14px] text-[#9aa0a6] flex items-center gap-2.5 py-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] animate-ping" />
                      <span className="font-normal">
                        {enableSearch ? 'Omni Z is browsing the live web and synthesizing facts...' : 'Omni Z is generating response...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input Dock at bottom */}
      <div className="p-4 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent relative z-20">
        <div className="max-w-4xl mx-auto space-y-2 px-2 sm:px-4">
          {/* Multimodal File Preview & Vision Actions Deck */}
          {attachments.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#1e1f20] border border-[#2d2f33] space-y-2.5 text-xs shadow-xl animate-in fade-in duration-200">
              {/* Attachment preview cards */}
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => {
                  const isImage = att.type?.startsWith('image/');
                  const sizeKb = Math.round(att.size / 1024);
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#282a2c] border border-[#3c4043] text-xs text-[#e3e3e3] group relative"
                    >
                      {isImage && att.dataUrl ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-10 h-10 object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1e1f20] flex items-center justify-center text-[#8ab4f8]">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 max-w-[140px]">
                        <div className="truncate font-medium text-xs text-white">{att.name}</div>
                        <div className="text-[10px] text-[#80868b]">{sizeKb > 1024 ? `${(sizeKb/1024).toFixed(1)} MB` : `${sizeKb} KB`}</div>
                      </div>
                      <button
                        onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                        className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-400 text-[#80868b] transition-colors cursor-pointer ml-1"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 6 Rich AI Vision Action Chips */}
              <div>
                <div className="text-[11px] font-semibold text-[#8ab4f8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> Multimodal Vision Intelligence:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                  {[
                    {
                      icon: Scan,
                      title: 'Extract OCR & Tables',
                      desc: 'Converts printed/handwritten text and figures into clean Markdown tables.',
                      prompt: 'Extract all text, numbers, and tabular data from this attachment cleanly into structured Markdown tables.',
                    },
                    {
                      icon: BarChart2,
                      title: 'Chart & Visual Analytics',
                      desc: 'Analyzes chart trends, axes, statistical anomalies, and key takeaways.',
                      prompt: 'Analyze this chart/diagram thoroughly: identify all axes, variables, data trends, anomalies, component flows, and critical conclusions.',
                    },
                    {
                      icon: Code,
                      title: 'Screenshot to Code',
                      desc: 'Converts UI mockups or screenshots into production Tailwind CSS and React code.',
                      prompt: 'Convert this UI screenshot/wireframe into complete, modern, responsive Tailwind CSS and React component code.',
                    },
                    {
                      icon: Eye,
                      title: 'Art & Design Critique',
                      desc: 'Evaluates composition, color palette, lighting, and aesthetic medium.',
                      prompt: 'Provide an in-depth artistic critique of this visual: evaluate composition, color harmony, lighting sources, and aesthetics.',
                    },
                    {
                      icon: FileText,
                      title: 'Executive Summary',
                      desc: 'Synthesizes key findings, pros/cons, and actionable bullet points.',
                      prompt: 'Provide a concise executive summary, critical takeaways, and actionable bullet points from this attachment.',
                    },
                    {
                      icon: Layers,
                      title: 'Detect Objects & Elements',
                      desc: 'Inventories all people, objects, text elements, and background entities.',
                      prompt: 'Inspect and inventory all objects, people, text elements, background features, and semantic layers detected in this visual.',
                    },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          onSendMessage(action.prompt, attachments, { imageAspectRatio: selectedAspectRatio });
                          setAttachments([]);
                        }}
                        className="p-2 rounded-xl border border-[#2d2f33] bg-[#222427]/80 hover:bg-[#282a2c] hover:border-[#8ab4f8]/50 text-left transition-all cursor-pointer group flex items-start gap-2"
                        title={action.desc}
                      >
                        <div className="p-1.5 rounded-lg bg-[#1e1f20] text-[#8ab4f8] group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-xs flex items-center gap-1">
                            <span>{action.title}</span>
                            <span className="text-[10px] text-[#8ab4f8] opacity-0 group-hover:opacity-100 transition-opacity">→ Run</span>
                          </div>
                          <div className="text-[10px] text-[#80868b] truncate leading-tight mt-0.5">{action.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive AI Image Studio & Aspect Ratio Suite */}
          {showImageStudio && (
            <div className="p-4 rounded-3xl bg-[#1e1f20] border border-[#3c4043] space-y-3.5 text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
              {/* Studio Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2d2f33]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 text-white">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                      AI Image Studio <span className="text-[10px] px-2 py-0.2 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">Pro Engine</span>
                    </div>
                    <div className="text-[11px] text-[#80868b]">Select aspect ratio, cinematography presets, and direct generation</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowImageStudio(false)}
                  className="p-1 rounded-full hover:bg-[#282a2c] text-[#80868b] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Aspect Ratio Visual Cards */}
              <div>
                <div className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Ratio className="w-3.5 h-3.5 text-[#8ab4f8]" /> 1. Select Aspect Ratio
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '1:1', label: '1:1 Square', sub: '1024 × 1024', icon: <Square className="w-4 h-4" /> },
                    { id: '16:9', label: '16:9 Cinema', sub: '1280 × 720', icon: <Monitor className="w-4 h-4" /> },
                    { id: '9:16', label: '9:16 Portrait', sub: '720 × 1280', icon: <Smartphone className="w-4 h-4" /> },
                    { id: '4:3', label: '4:3 Canvas', sub: '1024 × 768', icon: <Layers className="w-4 h-4" /> },
                  ].map((item) => {
                    const isSelected = selectedAspectRatio === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedAspectRatio(item.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8ab4f8] bg-[#8ab4f8]/10 text-white shadow-md'
                            : 'border-[#2d2f33] bg-[#282a2c]/60 text-[#c4c7c5] hover:border-[#3c4043] hover:text-white'
                        }`}
                      >
                        <div className={isSelected ? 'text-[#8ab4f8]' : 'text-[#80868b]'}>{item.icon}</div>
                        <div className="font-semibold text-xs">{item.label}</div>
                        <div className="text-[10px] text-[#80868b] font-mono">{item.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Tabs: Style / Lighting / Camera */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-semibold text-[#80868b] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#8ab4f8]" /> 2. Cinematography Presets
                  </div>
                  <div className="flex items-center gap-1 bg-[#282a2c] p-0.5 rounded-lg text-[11px]">
                    {(['style', 'lighting', 'camera'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setStudioCategory(cat)}
                        className={`px-2.5 py-0.5 rounded-md capitalize transition-all cursor-pointer ${
                          studioCategory === cat
                            ? 'bg-[#1e1f20] text-white font-medium shadow-xs'
                            : 'text-[#80868b] hover:text-[#c4c7c5]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {studioCategory === 'style' &&
                    [
                      'Cinematic Cyberpunk',
                      'Photorealistic 8K',
                      'Studio Anime',
                      '3D Octane Render',
                      'Moody Watercolor',
                      'Dark Fantasy Oil',
                      'Minimalist Bauhaus',
                      'Retro Pixel Art',
                    ].map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setInputText((prev) =>
                            prev ? `${prev}, ${style.toLowerCase()}` : `Generate an artwork of a futuristic city, in ${style.toLowerCase()} style`
                          );
                          textareaRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#282a2c] hover:bg-[#383b40] text-[#c4c7c5] hover:text-white text-xs transition-all border border-[#2d2f33] cursor-pointer"
                      >
                        + {style}
                      </button>
                    ))}

                  {studioCategory === 'lighting' &&
                    [
                      'Golden Hour Sunbeams',
                      'Neon Rim Lighting',
                      'Volumetric Misty Haze',
                      'Studio Softbox Ambient',
                      'Dramatic Chiaroscuro',
                      'Bioluminescent Glow',
                    ].map((light) => (
                      <button
                        key={light}
                        onClick={() => {
                          setInputText((prev) =>
                            prev ? `${prev}, with ${light.toLowerCase()}` : `Generate a portrait with ${light.toLowerCase()}`
                          );
                          textareaRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#282a2c] hover:bg-[#383b40] text-[#c4c7c5] hover:text-white text-xs transition-all border border-[#2d2f33] cursor-pointer"
                      >
                        + {light}
                      </button>
                    ))}

                  {studioCategory === 'camera' &&
                    [
                      'Wide Angle 24mm',
                      'Macro 100mm Detail',
                      '85mm Portrait Bokeh',
                      'Aerial Cinematic Drone',
                      'Fish-Eye Lens',
                      'Cinematic Pan Shot',
                    ].map((cam) => (
                      <button
                        key={cam}
                        onClick={() => {
                          setInputText((prev) =>
                            prev ? `${prev}, shot on ${cam.toLowerCase()}` : `Generate a cinematic scene shot on ${cam.toLowerCase()}`
                          );
                          textareaRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#282a2c] hover:bg-[#383b40] text-[#c4c7c5] hover:text-white text-xs transition-all border border-[#2d2f33] cursor-pointer"
                      >
                        + {cam}
                      </button>
                    ))}
                </div>
              </div>

              {/* Direct Studio Generation Bar */}
              <div className="pt-2 border-t border-[#2d2f33] flex items-center justify-between">
                <div className="text-[11px] text-[#80868b]">
                  Ratio active: <span className="text-[#8ab4f8] font-mono font-semibold">{selectedAspectRatio}</span>
                </div>
                <button
                  onClick={() => {
                    const promptToRun = inputText.trim() || 'Generate a high-fidelity cinematic artwork of an ethereal fantasy landscape with glowing aurora';
                    onSendMessage(promptToRun, [], { imageAspectRatio: selectedAspectRatio });
                    setShowImageStudio(false);
                    setInputText('');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Artwork ({selectedAspectRatio})</span>
                </button>
              </div>
            </div>
          )}

          {/* Pill Bar Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
              if (text && (!e.dataTransfer.files || e.dataTransfer.files.length === 0)) {
                e.preventDefault();
                e.stopPropagation();
                insertTextAtCursor(text);
                return;
              }
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                processFileList(e.dataTransfer.files);
                return;
              }
            }}
            className="relative flex items-center bg-[#1e1f20] hover:bg-[#222427] focus-within:bg-[#222427] border border-[#2d2f33] focus-within:border-[#3c4043] rounded-full px-3 py-2 shadow-2xl transition-all"
          >
            {/* Gemini-Style Plus / Attach Menu Component */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setAttachMenuOpen(!attachMenuOpen);
                  setActiveSubmenu(null);
                }}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer mr-0.5 shrink-0 ${
                  attachMenuOpen
                    ? 'bg-[#2d2f33] text-white rotate-45'
                    : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
                }`}
                title="Add to prompt / attach files & tools"
                aria-expanded={attachMenuOpen}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Gemini-Style Attachment Menu Popup (matches user reference image) */}
              {attachMenuOpen && (
                <div className="absolute left-0 bottom-full mb-3.5 z-50 flex items-start animate-in fade-in zoom-in-95 duration-150">
                  {/* Left Main Card */}
                  <div className="w-[230px] sm:w-[245px] rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_16px_48px_rgba(0,0,0,0.85)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md">
                    {/* Header: [X] Close and Title "Ask Omni Z" */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 mb-1 text-[#e3e3e3] font-medium border-b border-[#2d2f33]">
                      <button
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="p-1 rounded-full hover:bg-[#282a2c] text-[#9aa0a6] hover:text-white transition-colors cursor-pointer"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="text-[14px] font-medium tracking-tight">Ask Omni Z</span>
                    </div>

                    {/* 1. Upload files */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        fileInputRef.current?.click();
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <Paperclip className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 stroke-[1.8]" />
                      <span>Upload files</span>
                    </button>

                    {/* 2. Add from Drive */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        setShowDriveModal(true);
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <GoogleDriveOutlineIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Add from Drive</span>
                    </button>

                    {/* 3. More uploads > */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu('uploads')}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubmenu((prev) => (prev === 'uploads' ? null : 'uploads'))}
                        className={`w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#282a2c] text-left transition-all duration-200 cursor-pointer group ${
                          activeSubmenu === 'uploads' ? 'bg-[#282a2c] text-white shadow-xs' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <MoreHorizontal className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                          <span>More uploads</span>
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 transition-all duration-300 ease-out shrink-0 ${
                            activeSubmenu === 'uploads' 
                              ? 'translate-x-1.5 text-[#8ab4f8] scale-110' 
                              : 'text-[#9aa0a6] group-hover:translate-x-1.5 group-hover:text-white'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="my-1.5 border-t border-[#2d2f33]" />

                    {/* 4. Create image */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        setShowImageStudio(true);
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <FrameImageIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Create image</span>
                    </button>

                    {/* 5. Create video */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        insertPromptTemplate('Create a cinematic video storyboard, scene-by-scene script, and camera motion directions for: ');
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <VideoClapperIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Create video</span>
                    </button>

                    {/* 6. Create music */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        insertPromptTemplate('Compose an original music track structure, chord progressions, tempo, instrumentation, and lyric sheet for: ');
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <Music2 className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 stroke-[1.8]" />
                      <span>Create music</span>
                    </button>

                    {/* 7. Canvas */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        insertPromptTemplate('Create an interactive modular workspace and code architecture canvas for: ');
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <CanvasSquareIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Canvas</span>
                    </button>

                    {/* 8. Deep Research */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={() => {
                        insertPromptTemplate('Conduct an exhaustive Deep Research investigation with multi-source verified findings on: ');
                        setAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <DeepResearchAtomIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Deep Research</span>
                    </button>

                    {/* 9. More tools > */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveSubmenu('tools')}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSubmenu((prev) => (prev === 'tools' ? null : 'tools'))}
                        className={`w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#282a2c] text-left transition-all duration-200 cursor-pointer group ${
                          activeSubmenu === 'tools' ? 'bg-[#282a2c] text-white shadow-xs' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <MoreHorizontal className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                          <span>More tools</span>
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 transition-all duration-300 ease-out shrink-0 ${
                            activeSubmenu === 'tools' 
                              ? 'translate-x-1.5 text-[#8ab4f8] scale-110' 
                              : 'text-[#9aa0a6] group-hover:translate-x-1.5 group-hover:text-white'
                          }`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Submenu 1: More uploads flyout with sleek fluid animation */}
                  {activeSubmenu === 'uploads' && (
                    <div
                      onMouseEnter={() => setActiveSubmenu('uploads')}
                      className="ml-2.5 w-[200px] rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-3 duration-200 ease-out origin-left"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          photoFileInputRef.current?.click();
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <GooglePhotosIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Google Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowImageStudio(true);
                          insertPromptTemplate('Generate a photorealistic 3D character avatar with expressive facial details and lighting for: ');
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <AvatarSmileIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Avatar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          codeFileInputRef.current?.click();
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <CodeBracketsIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Import code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          notebookFileInputRef.current?.click();
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <NotebookOutlineIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Notebooks</span>
                      </button>
                    </div>
                  )}

                  {/* Submenu 2: More tools flyout with sleek fluid animation */}
                  {activeSubmenu === 'tools' && (
                    <div
                      onMouseEnter={() => setActiveSubmenu('tools')}
                      className="ml-2.5 w-[220px] rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-3 duration-200 ease-out origin-left"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          insertPromptTemplate('Write and execute a self-contained Python script in the sandbox to: ');
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <Terminal className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Python Sandbox</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertPromptTemplate('Derive the formal mathematical proof and KaTeX formulas for: ');
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <Sigma className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Equation Solver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertPromptTemplate('Search the live web for verified 2026 data regarding: ');
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <Globe className="w-4 h-4 text-[#8ab4f8] shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Live Web Search</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          insertPromptTemplate('Retrieve relevant cross-session vector memories regarding: ');
                          setAttachMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[#282a2c] hover:translate-x-1 text-left transition-all duration-150 cursor-pointer group"
                      >
                        <Database className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Vector Memory</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Image Studio Toggle button */}
            <button
              onClick={() => setShowImageStudio((prev) => !prev)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer mr-1 shrink-0 ${
                showImageStudio
                  ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                  : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
              }`}
              title="Toggle AI Image Studio & Aspect Ratios"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Auto-expanding Input Field with 'Ask Omni Z' placeholder and Drag-and-Drop Text Support */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
                if (text && (!e.dataTransfer.files || e.dataTransfer.files.length === 0)) {
                  e.preventDefault();
                  e.stopPropagation();
                  insertTextAtCursor(text);
                  return;
                }
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  e.preventDefault();
                  e.stopPropagation();
                  processFileList(e.dataTransfer.files);
                  return;
                }
              }}
              placeholder="Ask Omni Z"
              className="flex-1 bg-transparent text-[#e3e3e3] placeholder-[#80868b] text-[15px] focus:outline-none resize-none py-1.5 px-2 max-h-40 leading-relaxed font-sans"
            />

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              {/* AI Prompt Enhancer Button (Appears when text is entered) */}
              {inputText.trim().length > 3 && (
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/30 text-purple-200 hover:text-white text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Enhance prompt with AI"
                >
                  <Wand2 className={`w-3.5 h-3.5 text-purple-300 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline font-medium">
                    {isEnhancingPrompt ? 'Enhancing...' : 'Enhance'}
                  </span>
                </button>
              )}

              {/* Microphone dictation button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Model Intelligence Selector on Right Side */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#282a2c] text-xs font-medium text-[#e3e3e3] border border-[#2d2f33] transition-colors cursor-pointer bg-[#18191b]"
                  title="Select Model Intelligence"
                  aria-expanded={modelDropdownOpen}
                >
                  <span className={`w-2 h-2 rounded-full ${currentModel.dotColor || 'bg-[#8ab4f8]'}`}></span>
                  <span className="hidden sm:inline text-xs">{currentModel.name}</span>
                  <span className="sm:hidden text-xs">{currentModel.shortName || 'Model'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#80868b] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-3.5 w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_12px_40px_rgba(0,0,0,0.65)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-[#2d2f33] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#8ab4f8]" />
                        <span className="text-[11px] font-semibold text-[#c4c7c5] uppercase tracking-wider">
                          Model Intelligence
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8ab4f8] font-medium bg-[#8ab4f8]/10 px-2 py-0.5 rounded-full border border-[#8ab4f8]/20">
                        Google Gemini
                      </span>
                    </div>

                    {/* Model Items */}
                    <div className="py-1.5 space-y-1">
                      {modelOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSel = opt.id === selectedModel;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              if (onSelectModel) onSelectModel(opt.id);
                              setModelDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                              isSel
                                ? 'bg-[#282a2c] border-[#8ab4f8]/40 shadow-sm'
                                : 'bg-transparent border-transparent hover:bg-[#282a2c]/60 hover:border-[#3c4043]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon container */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isSel ? 'bg-[#18191b] ring-1 ring-[#8ab4f8]/30' : 'bg-[#18191b]'
                              }`}>
                                <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                              </div>

                              {/* Text content */}
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-[13px] text-white tracking-tight">
                                    {opt.name}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${
                                    isSel
                                      ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] border border-[#8ab4f8]/30'
                                      : 'bg-[#18191b] text-[#9aa0a6] border border-[#2d2f33]'
                                  }`}>
                                    {opt.badge}
                                  </span>
                                </div>
                                <div className="text-xs text-[#9aa0a6] leading-relaxed mt-1">
                                  {opt.desc}
                                </div>
                              </div>

                              {/* Active Checkmark */}
                              {isSel && (
                                <div className="w-5 h-5 rounded-full bg-[#8ab4f8]/20 border border-[#8ab4f8]/50 flex items-center justify-center text-[#8ab4f8] shrink-0 mt-1">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-3 py-1.5 border-t border-[#2d2f33] text-[11px] text-[#80868b] text-center">
                      Switch cognitive engines anytime during your conversation.
                    </div>
                  </div>
                )}
              </div>

              {/* Enter / Send Up Arrow Button (Appears immediately when user types or adds attachments) */}
              {(inputText.trim().length > 0 || attachments.length > 0) && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#e8eaed] active:scale-90 text-[#131314] flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md shrink-0 ml-1 focus:outline-none focus:ring-2 focus:ring-[#8ab4f8] animate-in zoom-in-75 fade-in"
                  title="Send message (Enter)"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.75]" />
                </button>
              )}
            </div>
          </form>

          <div className="text-[11px] text-[#80868b] text-center pt-0.5">
            Omni Z can make mistakes. Verify important facts with live sources.
          </div>
        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 right-0 flex items-center gap-3">
              <button
                onClick={() => handleDownloadImage(previewModalImage.url, previewModalImage.prompt)}
                disabled={downloadingUrl === previewModalImage.url}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              >
                {downloadingUrl === previewModalImage.url ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={previewModalImage.url}
              alt={previewModalImage.prompt || 'Artwork preview'}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />

            {previewModalImage.prompt && (
              <div className="mt-3 text-xs text-[#c4c7c5] max-w-xl text-center italic bg-black/60 px-4 py-1.5 rounded-full border border-white/10">
                "{previewModalImage.prompt}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Drive Import Modal */}
      {showDriveModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDriveModal(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2f33]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#282a2c] flex items-center justify-center border border-[#3c4043]">
                  <GoogleDriveOutlineIcon className="w-5 h-5 text-[#8ab4f8]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[#f1f3f4]">Google Drive</h3>
                  <p className="text-xs text-[#9aa0a6]">Select documents or sheets to attach to your prompt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="p-1.5 rounded-full hover:bg-[#282a2c] text-[#9aa0a6] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Tabs */}
            <div className="px-5 pt-3 pb-2 border-b border-[#2d2f33] space-y-2.5">
              <div className="relative flex items-center bg-[#131314] rounded-xl px-3 py-2 border border-[#2d2f33]">
                <Search className="w-4 h-4 text-[#80868b] mr-2 shrink-0" />
                <input
                  type="text"
                  value={driveSearchQuery}
                  onChange={(e) => setDriveSearchQuery(e.target.value)}
                  placeholder="Search in Drive..."
                  className="bg-transparent text-sm text-[#e3e3e3] placeholder-[#80868b] focus:outline-none flex-1"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                {(['recent', 'my-drive', 'shared'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDriveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                      driveTab === tab
                        ? 'bg-[#282a2c] text-[#8ab4f8] font-medium border border-[#3c4043]'
                        : 'text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#282a2c]/60'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowDriveModal(false);
                  }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8ab4f8]/10 hover:bg-[#8ab4f8]/20 text-[#8ab4f8] transition-colors cursor-pointer font-medium"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Local File</span>
                </button>
              </div>
            </div>

            {/* Drive Files List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[220px]">
              {sampleDriveFiles
                .filter((f) => f.name.toLowerCase().includes(driveSearchQuery.toLowerCase()))
                .map((file) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      setAttachments((prev) => [
                        ...prev,
                        {
                          id: `drive_${Date.now()}_${file.id}`,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          textContent: `[GOOGLE DRIVE ATTACHMENT: ${file.name}]\nSnippet: ${file.snippet}\nType: Google Workspace Document\nModified: ${file.updatedAt}\n[END OF ATTACHMENT]`,
                        },
                      ]);
                      setShowDriveModal(false);
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282a2c] border border-transparent hover:border-[#3c4043] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-[#18191b] border border-[#2d2f33] flex items-center justify-center shrink-0">
                        {file.name.includes('.gsheet') ? (
                          <Table className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#8ab4f8]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#e3e3e3] truncate group-hover:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-[#9aa0a6] truncate">{file.snippet}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#80868b] shrink-0">{file.updatedAt}</span>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#2d2f33] bg-[#18191b] flex items-center justify-between text-xs text-[#9aa0a6]">
              <span>Connected via Google Drive</span>
              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#282a2c] hover:bg-[#333538] text-white transition-colors cursor-pointer font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
