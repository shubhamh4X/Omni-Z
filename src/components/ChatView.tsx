import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FileText,
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
  Terminal,
  Sigma,
  Database,
  Search,
  HardDrive,
  FolderPlus,
  Sparkles,
  FileUp,
  Dna,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Presentation,
  FileCode,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { ChatMessage, Attachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DnaRingLogo } from './DnaRingLogo';
import { TemporaryChatIcon } from './TemporaryChatButton';
import { Tooltip } from './Tooltip';
import { useAuth } from '../context/AuthContext';
import { 
  fetchDriveFiles, 
  fetchDriveFileContent, 
  formatDriveFileSize, 
  formatDriveModifiedDate, 
  DriveFile 
} from '../services/googleDrive';
import { LegalModal } from './LegalModal';

const GoogleColorIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

const GoogleDriveColorIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 87.3 78" className={className}>
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

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

export const ModelDnaIcon = Dna;

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
  deepThinkingEnabled?: boolean;
  onToggleDeepThinking?: (enabled: boolean) => void;
  onClearChat?: () => void;
  onStopGeneration?: () => void;
  isTemporaryChat?: boolean;
  onTurnOffTemporaryChat?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  sessionId,
  messages,
  onSendMessage,
  isLoading,
  enableSearch,
  selectedModel = 'omni-z-flash',
  onSelectModel,
  deepThinkingEnabled = false,
  onToggleDeepThinking,
  onStopGeneration,
  isTemporaryChat = false,
  onTurnOffTemporaryChat,
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
  const { user, accessToken, isDriveConnected, driveStatus, driveEmail, connectDrive, disconnectDrive } = useAuth();

  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [driveTab, setDriveTab] = useState<'recent' | 'my-drive' | 'shared'>('recent');
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [attachingDriveFileId, setAttachingDriveFileId] = useState<string | null>(null);

  const [showImportCodeModal, setShowImportCodeModal] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [isImportingGithub, setIsImportingGithub] = useState(false);
  const [githubImportError, setGithubImportError] = useState<string | null>(null);

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'google-disclosure'>('privacy');

  const cancelDriveConnectRef = useRef(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);
  const folderFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const notebookFileInputRef = useRef<HTMLInputElement>(null);

  const loadDriveFiles = useCallback(async (userIdOrToken: string, tab: 'recent' | 'my-drive' | 'shared', queryStr: string) => {
    if (!userIdOrToken) return;
    setIsLoadingDriveFiles(true);
    setDriveError(null);
    try {
      const result = await fetchDriveFiles(userIdOrToken, { tab, query: queryStr });
      setDriveFiles(result.files);
    } catch (err: any) {
      if (
        err.message === 'UNAUTHORIZED_DRIVE_SESSION' || 
        err.message === 'GOOGLE_DRIVE_SESSION_EXPIRED' || 
        err.message === 'GOOGLE_DRIVE_REVOKED'
      ) {
        disconnectDrive();
        setDriveError('Your Google Drive authorization has expired. Please reconnect to access your files.');
      } else {
        setDriveError(err?.message || 'Failed to load files from Google Drive.');
      }
    } finally {
      setIsLoadingDriveFiles(false);
    }
  }, [disconnectDrive]);

  useEffect(() => {
    if (showDriveModal && (isDriveConnected || accessToken) && (user?.uid || accessToken)) {
      const targetId = user?.uid || accessToken || '';
      const timer = setTimeout(() => {
        loadDriveFiles(targetId, driveTab, driveSearchQuery);
      }, driveSearchQuery ? 350 : 0);
      return () => clearTimeout(timer);
    }
  }, [showDriveModal, isDriveConnected, accessToken, user?.uid, driveTab, driveSearchQuery, loadDriveFiles]);

  const handleConnectDrive = async () => {
    cancelDriveConnectRef.current = false;
    setIsConnectingDrive(true);
    setDriveError(null);
    try {
      const success = await connectDrive();
      if (cancelDriveConnectRef.current) return;
      if (success) {
        const targetId = user?.uid || accessToken || '';
        await loadDriveFiles(targetId, driveTab, driveSearchQuery);
      }
    } catch (err: any) {
      if (cancelDriveConnectRef.current) return;
      setDriveError(err?.message || 'Failed to connect Google Drive.');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleAddFromDriveClick = async () => {
    setShowDriveModal(true);
    setAttachMenuOpen(false);
    if (!isDriveConnected && !accessToken) {
      await handleConnectDrive();
    }
  };

  const handleCancelDriveConnect = () => {
    cancelDriveConnectRef.current = true;
    setIsConnectingDrive(false);
    setDriveError(null);
  };

  const handleSelectDriveFile = async (file: DriveFile) => {
    const targetId = user?.uid || accessToken;
    if (!targetId) return;
    setAttachingDriveFileId(file.id);
    try {
      const { textContent, snippet, dataUrl } = await fetchDriveFileContent(targetId, file);
      const parsedSize = typeof file.size === 'string' ? parseInt(file.size, 10) : (file.size || 0);
      setAttachments((prev) => [
        ...prev,
        {
          id: `drive_${Date.now()}_${file.id}`,
          name: file.name,
          type: file.mimeType,
          size: parsedSize,
          textContent,
          dataUrl,
        },
      ]);
      setShowDriveModal(false);
      textareaRef.current?.focus();
    } catch (err: any) {
      console.warn('Error attaching drive file:', err);
      const parsedSize = typeof file.size === 'string' ? parseInt(file.size, 10) : (file.size || 0);
      setAttachments((prev) => [
        ...prev,
        {
          id: `drive_${Date.now()}_${file.id}`,
          name: file.name,
          type: file.mimeType,
          size: parsedSize,
          textContent: `[GOOGLE DRIVE ATTACHMENT: "${file.name}"]\nFile ID: ${file.id}\nType: ${file.mimeType}\nLink: ${file.webViewLink || ''}\n[END OF ATTACHMENT]`,
        },
      ]);
      setShowDriveModal(false);
      textareaRef.current?.focus();
    } finally {
      setAttachingDriveFileId(null);
    }
  };

  const modelOptions = [
    {
      id: 'omni-z-flash',
      name: 'Omni Z',
      shortName: 'Omni Z',
      badge: 'Flagship Intelligence',
      desc: 'Multimodal analysis, real-time search grounding, and sandboxed Python code execution.',
      dotColor: 'bg-[#8ab4f8]',
      iconColor: 'text-[#8ab4f8]',
      icon: Zap,
    },
    {
      id: 'omni-z-autonomous-builder',
      name: 'Omni Z Pro',
      shortName: 'Pro',
      badge: 'Single-Prompt Software & AI Engine',
      desc: 'Build whole production software, full-stack systems, neural AI pipelines, microservices, and databases in a single prompt with zero limits.',
      dotColor: 'bg-purple-400',
      iconColor: 'text-purple-400',
      icon: Dna,
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

  const isDeepThinkingActive = Boolean(
    deepThinkingEnabled && (selectedModel === 'omni-z-flash' || selectedModel === 'omni-z-autonomous-builder')
  ) || selectedModel === 'omni-z-think';

  const currentModel = modelOptions.find((m) => m.id === selectedModel) || modelOptions[0];

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

  useEffect(() => {
    const isNewSession = prevSessionIdRef.current !== sessionId;

    if (isInitialMount.current || isNewSession) {
      isInitialMount.current = false;
      prevSessionIdRef.current = sessionId;
      prevMessageCountRef.current = messages.length;

      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }
      return;
    }

    if (messages.length > prevMessageCountRef.current || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, sessionId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use a supported browser.');
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

  const processFileList = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name);
      const reader = new FileReader();
      if (isImg) {
        reader.onload = (ev) => {
          const res = ev.target?.result as string;
          if (res) {
            setAttachments((prev) => [
              ...prev,
              {
                id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: file.name && file.name !== 'image.png' && file.name !== 'blob'
                  ? file.name
                  : `pasted_image_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.png`,
                type: file.type || 'image/png',
                size: file.size || Math.round(res.length * 0.75),
                dataUrl: res,
              },
            ]);
          }
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
  }, []);

  const handleImportGitHub = async () => {
    const trimmed = githubRepoUrl.trim();
    if (!trimmed) return;

    let owner = '';
    let repo = '';
    let branch = '';

    const urlMatch = trimmed.match(/github\.com\/([^\/]+)\/([^\/\?#]+)(?:\/tree\/([^\/\?#]+))?/i);
    const shortMatch = trimmed.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);

    if (urlMatch) {
      owner = urlMatch[1];
      repo = urlMatch[2].replace(/\.git$/i, '');
      branch = urlMatch[3] || '';
    } else if (shortMatch) {
      owner = shortMatch[1];
      repo = shortMatch[2].replace(/\.git$/i, '');
    } else {
      setGithubImportError('Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)');
      return;
    }

    setIsImportingGithub(true);
    setGithubImportError(null);

    try {
      let repoData: any = null;
      try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (repoRes.ok) {
          repoData = await repoRes.json();
          if (!branch && repoData.default_branch) {
            branch = repoData.default_branch;
          }
        }
      } catch (e) {
        console.warn('GitHub API info fetch note:', e);
      }

      let readmeText = '';
      try {
        const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' },
        });
        if (readmeRes.ok) {
          readmeText = await readmeRes.text();
        }
      } catch (e) {
        console.warn('GitHub API readme fetch note:', e);
      }

      let contentsSummary = '';
      try {
        const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents${branch ? `?ref=${branch}` : ''}`);
        if (contentsRes.ok) {
          const items = await contentsRes.json();
          if (Array.isArray(items)) {
            contentsSummary = items.slice(0, 30).map((it: any) => `- ${it.type === 'dir' ? '📁' : '📄'} ${it.name}`).join('\n');
          }
        }
      } catch (e) {
        console.warn('GitHub API contents fetch note:', e);
      }

      const description = repoData?.description || 'Public GitHub Repository';
      const stars = repoData?.stargazers_count ?? 0;
      const language = repoData?.language || 'Various';
      const targetBranch = branch || repoData?.default_branch || 'main';

      let markdownContent = `# GitHub Repository: ${owner}/${repo}\n\n`;
      markdownContent += `- **URL**: https://github.com/${owner}/${repo}\n`;
      markdownContent += `- **Stars**: ⭐ ${stars}\n`;
      markdownContent += `- **Primary Language**: ${language}\n`;
      markdownContent += `- **Branch**: ${targetBranch}\n`;
      if (description) {
        markdownContent += `- **About**: ${description}\n\n`;
      }
      if (contentsSummary) {
        markdownContent += `### Project Structure:\n${contentsSummary}\n\n`;
      }
      if (readmeText) {
        markdownContent += `### README.md:\n\`\`\`markdown\n${readmeText.slice(0, 8000)}\n\`\`\`\n`;
      }

      const newAttachment: Attachment = {
        id: `gh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${owner}/${repo} (GitHub)`,
        type: 'text/markdown',
        size: Math.max(1024, markdownContent.length),
        textContent: markdownContent,
      };

      setAttachments((prev) => [...prev, newAttachment]);
      setShowImportCodeModal(false);
      setGithubRepoUrl('');
      setGithubImportError(null);
    } catch (err: any) {
      console.error('Failed to import GitHub repo:', err);
      const fallbackAttachment: Attachment = {
        id: `gh_${Date.now()}`,
        name: `${owner}/${repo} (GitHub)`,
        type: 'text/markdown',
        size: 512,
        textContent: `GitHub Repository: https://github.com/${owner}/${repo}\nPlease analyze this repository, its architecture, and codebase.`,
      };
      setAttachments((prev) => [...prev, fallbackAttachment]);
      setShowImportCodeModal(false);
      setGithubRepoUrl('');
    } finally {
      setIsImportingGithub(false);
    }
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const filteredFiles = fileArray.filter((f) => {
      const relPath = (f as any).webkitRelativePath || f.name;
      if (
        relPath.includes('node_modules/') ||
        relPath.includes('.git/') ||
        relPath.includes('dist/') ||
        relPath.includes('build/') ||
        relPath.includes('.next/') ||
        relPath.includes('__pycache__/')
      ) {
        return false;
      }
      return /\.(py|ts|tsx|js|jsx|json|sql|cpp|c|h|rs|go|sh|html|css|yaml|yml|md|txt|env|xml|toml|ipynb|svg)$/i.test(f.name);
    });

    const chosen = filteredFiles.length > 0 ? filteredFiles.slice(0, 25) : fileArray.slice(0, 15);
    processFileList(chosen);
    setShowImportCodeModal(false);
    e.target.value = '';
  };

  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const imageFiles: File[] = [];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const fileName = blob.name && blob.name !== 'image.png' && blob.name !== 'blob'
              ? blob.name
              : `pasted_image_${Date.now()}.${ext}`;
            const file = new File([blob], fileName, { type: blob.type || 'image/png' });
            imageFiles.push(file);
          }
        }
      }
    }

    if (imageFiles.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name)) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length === 0) {
      const html = clipboardData.getData('text/html');
      if (html) {
        const match = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
        if (match && match[1]) {
          const src = match[1];
          const mime = src.substring(5, src.indexOf(';'));
          setAttachments((prev) => [
            ...prev,
            {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: `pasted_image_${Date.now()}.png`,
              type: mime || 'image/png',
              size: Math.round(src.length * 0.75),
              dataUrl: src,
            },
          ]);
          e.preventDefault();
          e.stopPropagation();
          textareaRef.current?.focus();
          return;
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      processFileList(imageFiles);
      textareaRef.current?.focus();
    }
  }, [processFileList]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {

      const target = e.target as HTMLElement;
      if (
        target &&
        target !== textareaRef.current &&
        (target.tagName === 'INPUT' || (target.tagName === 'TEXTAREA' && target !== textareaRef.current))
      ) {
        return;
      }
      handlePaste(e);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handlePaste]);

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
      className={`flex-1 flex flex-col h-[calc(100vh-56px)] relative overflow-hidden transition-colors duration-500 ease-in-out ${
        isTemporaryChat ? 'bg-[#000000]' : 'bg-[#131314]'
      }`}
      onPaste={handlePaste}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);

        const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
        if (droppedText && (!e.dataTransfer.files || e.dataTransfer.files.length === 0)) {
          insertTextAtCursor(droppedText);
          return;
        }

        if (e.dataTransfer.files?.length) {
          processFileList(e.dataTransfer.files);
        }
      }}
    >

      {isTemporaryChat ? (
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-60 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle 700px at 50% 35%, rgba(35, 35, 40, 0.4) 0%, rgba(12, 12, 14, 0.8) 50%, rgba(0, 0, 0, 1) 100%)'
          }}
        />
      ) : (
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(74, 137, 243, 0.18) 0%, rgba(197, 138, 249, 0.10) 40%, rgba(19, 19, 20, 0) 80%)'
          }}
        />
      )}

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
        ref={folderFileInputRef}
        onChange={handleFolderUpload}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
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

      {dragOver && (
        <div className="absolute inset-0 z-50 bg-[#131314]/90 backdrop-blur-sm border-2 border-dashed border-[#8ab4f8] flex flex-col items-center justify-center text-white">
          <Paperclip className="w-12 h-12 mb-3 text-[#8ab4f8] animate-bounce" />
          <p className="text-lg font-medium">Drop documents, code files, or images here</p>
          <p className="text-xs text-[#9aa0a6] mt-1">Omni Z will analyze and synthesize the content</p>
        </div>
      )}

      {isTemporaryChat && !isInitialState && (
        <div className="z-20 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-[#1c1c1e] px-4 py-2.5 flex items-center justify-between text-xs text-[#c4c7c5] shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-white/10 text-white">
              <TemporaryChatIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white mr-1.5">Temporary Chat</span>
              <span className="text-[#80868b] hidden sm:inline">
                — Conversations aren't saved to history, don't use memories, and clear when you exit.
              </span>
            </div>
          </div>
          {onTurnOffTemporaryChat && (
            <button
              onClick={onTurnOffTemporaryChat}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#8ab4f8] hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              Turn off
            </button>
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto px-4 sm:px-6 relative z-10 transition-opacity duration-300 ${
          isInitialState ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
        }`}
      >
        <div className="max-w-4xl mx-auto w-full py-8 space-y-8 px-2 sm:px-6">
          {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <div key={message.id} className="space-y-4">

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

                    <div className="flex gap-4 items-start">

                      <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#2d2f33] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <DnaRingLogo className="w-5 h-5" />
                      </div>

                      <div className="flex-1 space-y-4 min-w-0 pr-1">

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

                        <div className="text-[15.5px] text-[#e3e3e3] leading-[1.8] font-normal tracking-[0.01em]">
                          <MarkdownRenderer content={message.content} />
                        </div>

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

                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-10">

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

            {isLoading && (
              <div className="flex gap-4 items-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#2d2f33] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {isDeepThinkingActive ? (
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  ) : (
                    <DnaRingLogo className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 space-y-2 py-1">
                  {isDeepThinkingActive ? (
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
                        {(() => {
                          const lastUserText = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
                          const isCasualGreetingMsg = /^(hey+|hi+|hello+|howdy|hola|greetings|good\s*(morning|afternoon|evening|night)|what'?s\s*up|sup|yo|how\s*are\s*you|who\s*are\s*you|help|test|ping)[.!?\s]*$/i.test(lastUserText.trim());
                          const isBrowsingLiveWeb = enableSearch && !isCasualGreetingMsg && /search|news|latest|today|current|price|weather|who is|what is|when did|source|article|website|stock|live|202[4-9]/i.test(lastUserText);
                          return isBrowsingLiveWeb ? 'Omni Z is browsing the live web and synthesizing facts...' : 'Omni Z is generating response...';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
      </div>

      <div
        className={`w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-20 ${
          isInitialState
            ? '-translate-y-[calc(50vh-40px)] sm:-translate-y-[calc(50vh-45px)] px-4 py-2'
            : 'translate-y-0 p-4 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent'
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-2 px-2 sm:px-4">

          <div
            key={`welcome_${sessionId}_${isTemporaryChat ? 'temp' : 'reg'}`}
            className={`w-full max-w-3xl mx-auto px-4 text-center transition-all duration-500 ease-out relative z-10 ${
              isInitialState
                ? 'opacity-100 max-h-[350px] mb-6 sm:mb-8 animate-slide-up-from-search'
                : 'opacity-0 max-h-0 mb-0 overflow-hidden pointer-events-none -translate-y-6'
            }`}
          >
            {isTemporaryChat ? (
              <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
                <div className="mb-4 inline-flex items-center justify-center p-2 rounded-full text-white">
                  <TemporaryChatIcon className="w-9 h-9" />
                </div>

                <h1 className="text-3xl sm:text-[38px] font-normal text-white mb-3 tracking-tight font-sans">
                  Just stopping by?
                </h1>

                <p className="text-xs sm:text-[13.5px] text-[#9aa0a6] max-w-lg mx-auto leading-relaxed font-sans">
                  <span className="underline decoration-dotted underline-offset-4 cursor-default text-[#c4c7c5]">Temporary chats</span> don't appear in <span className="underline decoration-dotted underline-offset-4 cursor-default text-[#c4c7c5]">recent chats</span> and aren't used to improve AI. Stored for 72 hours for safety.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-5 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-rose-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <DnaRingLogo className="w-16 h-16 mx-auto relative z-10" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-normal text-[#e3e3e3] tracking-tight font-sans">
                  Hello, what can I do for you?
                </h1>
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#1e1f20] border border-[#2d2f33] space-y-2.5 text-xs shadow-xl animate-in fade-in duration-200">

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

          {showImageStudio && (
            <div className="p-4 rounded-3xl bg-[#1e1f20] border border-[#3c4043] space-y-3.5 text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">

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

            <div className="relative flex items-center shrink-0" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setAttachMenuOpen(!attachMenuOpen);
                  setActiveSubmenu(null);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                  attachMenuOpen
                    ? 'bg-[#2d2f33] text-white rotate-45'
                    : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
                }`}
                aria-label="Add to prompt / attach files & tools"
                aria-expanded={attachMenuOpen}
              >
                <Plus className="w-5 h-5" />
              </button>

              {attachMenuOpen && (
                <div className={`absolute left-0 z-50 flex animate-in fade-in zoom-in-95 duration-150 ${
                  isInitialState ? 'top-full mt-2.5 items-start' : 'bottom-full mb-2.5 items-end'
                }`}>

                  <div className={`w-[230px] sm:w-[245px] overflow-y-auto rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_16px_48px_rgba(0,0,0,0.85)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md ${
                    isInitialState ? 'max-h-[min(460px,calc(54vh-20px))]' : 'max-h-[min(460px,calc(100vh-140px))]'
                  }`}>

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

                    <button
                      type="button"
                      onMouseEnter={() => setActiveSubmenu(null)}
                      onClick={handleAddFromDriveClick}
                      className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-[#282a2c] text-left transition-colors cursor-pointer group"
                    >
                      <GoogleDriveOutlineIcon className="w-4 h-4 text-[#c4c7c5] group-hover:text-white shrink-0" />
                      <span>Add from Drive</span>
                    </button>

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

                    <div className="my-1.5 border-t border-[#2d2f33]" />

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

                  {activeSubmenu === 'uploads' && (
                    <div
                      onMouseEnter={() => setActiveSubmenu('uploads')}
                      className={`ml-2.5 w-[200px] overflow-y-auto rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-3 duration-200 ease-out origin-left ${
                        isInitialState ? 'max-h-[min(460px,calc(54vh-20px))]' : 'max-h-[min(460px,calc(100vh-140px))]'
                      }`}
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
                          setShowImportCodeModal(true);
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

                  {activeSubmenu === 'tools' && (
                    <div
                      onMouseEnter={() => setActiveSubmenu('tools')}
                      className={`ml-2.5 w-[220px] overflow-y-auto rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-2 text-[#e3e3e3] text-[13.5px] select-none backdrop-blur-md animate-in fade-in-0 zoom-in-95 slide-in-from-left-3 duration-200 ease-out origin-left ${
                        isInitialState ? 'max-h-[min(460px,calc(54vh-20px))]' : 'max-h-[min(460px,calc(100vh-140px))]'
                      }`}
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

            <Tooltip content="Image studio & ratios" position="top">
              <button
                type="button"
                onClick={() => setShowImageStudio((prev) => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-0.5 ${
                  showImageStudio
                    ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                    : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
                }`}
                aria-label="Toggle AI Image Studio & Aspect Ratios"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </Tooltip>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
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

            <div className="flex items-center gap-1.5 shrink-0 ml-1">

              {inputText.trim().length > 3 && (
                <Tooltip content="Enhance prompt with AI" position="top">
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/30 text-purple-200 hover:text-white text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    aria-label="Enhance prompt with AI"
                  >
                    <Wand2 className={`w-3.5 h-3.5 text-purple-300 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline font-medium">
                      {isEnhancingPrompt ? 'Enhancing...' : 'Enhance'}
                    </span>
                  </button>
                </Tooltip>
              )}

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white'
                }`}
                aria-label={isRecording ? 'Listening... click to stop' : 'Voice dictation'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#282a2c] text-xs font-medium transition-colors cursor-pointer ${
                    isDeepThinkingActive
                      ? 'border border-purple-500/50 bg-[#1e1528] text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.18)]'
                      : 'border border-[#2d2f33] bg-[#18191b] text-[#e3e3e3]'
                  }`}
                  aria-label="Select Model Intelligence"
                  aria-expanded={modelDropdownOpen}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    isDeepThinkingActive ? 'bg-purple-400 animate-pulse' : (currentModel.dotColor || 'bg-[#8ab4f8]')
                  }`}></span>
                  <span className="hidden sm:inline text-xs">
                    {currentModel.name}
                    {isDeepThinkingActive && <span className="ml-1 text-purple-300 font-normal">+ Deep Think</span>}
                  </span>
                  <span className="sm:hidden text-xs">
                    {currentModel.shortName || 'Model'}
                    {isDeepThinkingActive && <span className="ml-0.5 text-purple-300">+ Think</span>}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#80868b] transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdownOpen && (
                  <div className={`absolute right-0 z-50 w-[340px] sm:w-[390px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_12px_40px_rgba(0,0,0,0.65)] p-2 animate-in fade-in zoom-in-95 duration-150 ${
                    isInitialState ? 'top-full mt-3.5 max-h-[min(460px,calc(54vh-20px))]' : 'bottom-full mb-3.5 max-h-[calc(100vh-140px)]'
                  }`}>

                    <div className="px-3 py-2 border-b border-[#2d2f33] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DnaRingLogo className="w-4 h-4" animate={false} />
                        <span className="text-[11px] font-semibold text-[#c4c7c5] uppercase tracking-wider">
                          Model Intelligence
                        </span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
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
                            className={`w-full text-left px-2.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                              isSel
                                ? 'bg-[#282a2c] text-white'
                                : 'bg-transparent text-[#e3e3e3] hover:bg-[#282a2c]/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                {isSel ? (
                                  <Check className="w-4 h-4 text-white stroke-[2.5]" />
                                ) : (
                                  <span className="w-4 h-4 inline-block" />
                                )}
                              </div>
                              <div className="w-7 h-7 rounded-lg bg-[#18191b] flex items-center justify-center shrink-0">
                                <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
                              </div>
                              <span className="font-medium text-[13px] text-white tracking-tight truncate">
                                {opt.name}
                              </span>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${
                              isSel
                                ? 'bg-[#8ab4f8]/15 text-[#8ab4f8] border border-[#8ab4f8]/30'
                                : 'bg-[#18191b] text-[#9aa0a6] border border-[#2d2f33]'
                            }`}>
                              {opt.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-[#3c4043] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        const next = !isDeepThinkingActive;
                        if (onToggleDeepThinking) {
                          onToggleDeepThinking(next);
                        }

                        if (next && selectedModel !== 'omni-z-flash' && selectedModel !== 'omni-z-autonomous-builder') {
                          if (onSelectModel) onSelectModel('omni-z-flash');
                        }
                      }}
                      className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        isDeepThinkingActive
                          ? 'bg-[#282a2c] text-white'
                          : 'bg-transparent text-[#c4c7c5] hover:bg-[#282a2c]/60'
                      }`}
                      title="Turn Extended Thinking On/Off with Omni Z or Omni Z Pro"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          {isDeepThinkingActive ? (
                            <Check className="w-4 h-4 text-purple-400 stroke-[2.5]" />
                          ) : (
                            <span className="w-4 h-4 inline-block" />
                          )}
                        </div>
                        <div className={`w-7 h-7 rounded-lg bg-[#18191b] flex items-center justify-center shrink-0 ${
                          isDeepThinkingActive ? 'ring-1 ring-purple-500/50' : ''
                        }`}>
                          <Brain className={`w-3.5 h-3.5 ${isDeepThinkingActive ? 'text-purple-400' : 'text-[#9aa0a6]'}`} />
                        </div>
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[13px] text-white tracking-tight truncate">
                              Omni Z Deep Think
                            </span>
                          </div>
                          <div className="text-[11px] text-[#9aa0a6]">
                            Extended thinking · Complex problem solving
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          isDeepThinkingActive ? 'bg-purple-500' : 'bg-[#3c4043]'
                        }`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            isDeepThinkingActive ? 'translate-x-3.5' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                    </button>

                    <div className="px-3 py-1.5 border-t border-[#2d2f33] text-[11px] text-[#80868b] text-center">
                      Switch cognitive engines or toggle deep reasoning anytime.
                    </div>
                  </div>
                )}
              </div>

              {isLoading ? (
                <Tooltip content="Stop generating" position="top" align="end">
                  <button
                    type="button"
                    onClick={onStopGeneration}
                    className="w-8 h-8 rounded-full bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-90 text-white flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md shrink-0 ml-1 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-in zoom-in-75 fade-in"
                    aria-label="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-white text-white rounded-xs" />
                  </button>
                </Tooltip>
              ) : (
                (inputText.trim().length > 0 || attachments.length > 0) && (
                  <Tooltip content="Send message" position="top" align="end">
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full bg-white hover:bg-[#e8eaed] active:scale-90 text-[#131314] flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md shrink-0 ml-1 focus:outline-none focus:ring-2 focus:ring-[#8ab4f8] animate-in zoom-in-75 fade-in"
                      aria-label="Send message"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.75]" />
                    </button>
                  </Tooltip>
                )
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer - Full width edge-to-edge without top border line */}
      <div className="w-full relative z-20 px-4 sm:px-6 pb-2.5 pt-1 text-[11px] text-[#80868b]">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <span>Verify important facts with live sources</span>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9aa0a6] hover:text-[#8ab4f8] transition-colors cursor-pointer hover:underline"
            >
              Privacy Policy
            </a>
            <span>&bull;</span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9aa0a6] hover:text-[#8ab4f8] transition-colors cursor-pointer hover:underline"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>

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

      {showDriveModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDriveModal(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2f33]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#282a2c] flex items-center justify-center border border-[#3c4043]">
                  <GoogleDriveColorIcon className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-[#f1f3f4]">Google Drive</h3>
                    {(isDriveConnected || driveStatus === 'connected' || accessToken) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Google Drive connected
                      </span>
                    ) : (driveStatus === 'authorizing' || isConnectingDrive) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Connecting Google Drive...
                      </span>
                    ) : (driveStatus === 'error' || driveError) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Couldn't connect Google Drive
                      </span>
                    ) : (driveStatus === 'expired' || driveStatus === 'revoked') ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Authorization expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#282a2c] text-[#9aa0a6] border border-[#3c4043]">
                        Connect Google Drive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9aa0a6]">
                    {(isDriveConnected || driveStatus === 'connected' || accessToken)
                      ? 'Browse and select files from your Google Drive'
                      : 'Connect your Google Drive account to import files'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {(isDriveConnected || driveStatus === 'connected' || accessToken) && (
                  <button
                    type="button"
                    onClick={() => loadDriveFiles(user?.uid || accessToken || '', driveTab, driveSearchQuery)}
                    disabled={isLoadingDriveFiles}
                    title="Refresh files"
                    className="p-1.5 rounded-full hover:bg-[#282a2c] text-[#9aa0a6] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingDriveFiles ? 'animate-spin' : ''}`} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#282a2c] text-[#9aa0a6] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {(!isDriveConnected && !accessToken) ? (
              /* Unconnected state: Ask to connect Google Drive */
              <div className="p-6 sm:p-7 flex flex-col items-center text-center overflow-y-auto max-h-[calc(85vh-90px)]">
                <div className="w-16 h-16 rounded-2xl bg-[#282a2c] border border-[#3c4043] flex items-center justify-center mb-4 shadow-xl relative">
                  <GoogleDriveColorIcon className="w-8 h-8" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-[#1e1f20]" />
                </div>

                <h4 className="text-xl font-bold text-[#f1f3f4] mb-2 tracking-tight">Connect Google Drive</h4>
                <p className="text-xs text-[#9aa0a6] max-w-md mb-3 leading-relaxed">
                  Allow Omni Z to access your Google Drive so you can search, browse, and select your documents, spreadsheets, and files directly in chat.
                </p>

                {(driveEmail || user?.email) && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1f20] border border-[#3c4043] text-xs text-[#c4c7c5]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Account: <strong className="text-white font-medium">{driveEmail || user?.email}</strong></span>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="w-full max-w-sm mb-5 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleConnectDrive}
                    disabled={isConnectingDrive || driveStatus === 'authorizing'}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#1f1f1f] font-semibold text-sm transition-all shadow-xl hover:shadow-2xl active:scale-98 cursor-pointer disabled:opacity-75 group"
                  >
                    {(isConnectingDrive || driveStatus === 'authorizing') ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#1f1f1f]" />
                        <span>Connecting Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <GoogleColorIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>Connect Google Drive</span>
                      </>
                    )}
                  </button>

                  {(isConnectingDrive || driveStatus === 'authorizing') && (
                    <div className="mt-2.5 text-center space-y-1.5 animate-in fade-in duration-200">
                      <p className="text-[11.5px] text-[#9aa0a6] leading-relaxed max-w-xs">
                        Connecting your Google Drive account. If a Google sign-in window was opened, please grant permission.
                      </p>
                      <button
                        type="button"
                        onClick={handleCancelDriveConnect}
                        className="text-xs text-[#8ab4f8] hover:text-white underline cursor-pointer font-medium"
                      >
                        Cancel / Try Again
                      </button>
                    </div>
                  )}

                  {!isConnectingDrive && (
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowDriveModal(false);
                      }}
                      className="mt-3 text-xs text-[#8ab4f8] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>Or upload files directly from your device</span>
                    </button>
                  )}
                </div>

                {driveError && (
                  <div className="w-full max-w-md mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between gap-2 text-left animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span className="flex-1">{driveError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDriveError(null)}
                      className="text-red-400 hover:text-white shrink-0 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="w-full max-w-md bg-[#18191b] rounded-xl border border-[#2d2f33] p-3.5 text-left space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-[#e3e3e3] block">Import Docs, Sheets &amp; Presentations</span>
                      <span className="text-[#9aa0a6]">Seamlessly parse content and tables for reasoning and synthesis</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-[#e3e3e3] block">Direct Google OAuth Authorization</span>
                      <span className="text-[#9aa0a6]">Secured with official Google authentication and user consent</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-[#e3e3e3] block">Safe In-Memory Analysis</span>
                      <span className="text-[#9aa0a6]">Your files are read in active memory only and never stored permanently</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Connected state: Live Drive file browser */
              <>
                <div className="px-5 pt-3 pb-2 border-b border-[#2d2f33] space-y-2.5">
                  <div className="relative flex items-center bg-[#131314] rounded-xl px-3 py-2 border border-[#2d2f33]">
                    <Search className="w-4 h-4 text-[#80868b] mr-2 shrink-0" />
                    <input
                      type="text"
                      value={driveSearchQuery}
                      onChange={(e) => setDriveSearchQuery(e.target.value)}
                      placeholder="Search files in your Google Drive..."
                      className="bg-transparent text-sm text-[#e3e3e3] placeholder-[#80868b] focus:outline-none flex-1"
                    />
                    {driveSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDriveSearchQuery('')}
                        className="text-[#80868b] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                        {tab === 'recent' ? 'Recent' : tab === 'my-drive' ? 'My Drive' : 'Shared with me'}
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

                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[260px] max-h-[380px]">
                  {isLoadingDriveFiles ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <RefreshCw className="w-6 h-6 text-[#8ab4f8] animate-spin mb-3" />
                      <p className="text-xs text-[#9aa0a6]">Fetching files from Google Drive...</p>
                    </div>
                  ) : driveError ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-red-400 mb-3">{driveError}</p>
                      <button
                        type="button"
                        onClick={handleConnectDrive}
                        className="px-4 py-1.5 rounded-lg bg-[#282a2c] hover:bg-[#333538] text-white text-xs font-medium cursor-pointer transition-colors"
                      >
                        Reconnect Google Drive
                      </button>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#282a2c] text-[#80868b] flex items-center justify-center mx-auto mb-3 border border-[#3c4043]">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-[#e3e3e3] mb-1">No files found</p>
                      <p className="text-xs text-[#9aa0a6]">
                        {driveSearchQuery ? `No files match "${driveSearchQuery}"` : 'No files in this Drive view.'}
                      </p>
                    </div>
                  ) : (
                    driveFiles.map((file) => {
                      const isAttaching = attachingDriveFileId === file.id;
                      const formattedSize = formatDriveFileSize(file.size);
                      const formattedDate = formatDriveModifiedDate(file.modifiedTime);

                      return (
                        <div
                          key={file.id}
                          onClick={() => {
                            if (!isAttaching) handleSelectDriveFile(file);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl hover:bg-[#282a2c] border border-transparent hover:border-[#3c4043] transition-all cursor-pointer group ${
                            isAttaching ? 'opacity-70 pointer-events-none bg-[#282a2c]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className="w-8 h-8 rounded-lg bg-[#18191b] border border-[#2d2f33] flex items-center justify-center shrink-0">
                              {file.mimeType === 'application/vnd.google-apps.document' ? (
                                <FileText className="w-4 h-4 text-[#8ab4f8]" />
                              ) : file.mimeType === 'application/vnd.google-apps.spreadsheet' ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                              ) : file.mimeType === 'application/vnd.google-apps.presentation' ? (
                                <Presentation className="w-4 h-4 text-amber-400" />
                              ) : file.mimeType === 'application/pdf' ? (
                                <FileText className="w-4 h-4 text-rose-400" />
                              ) : file.mimeType.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4 text-purple-400" />
                              ) : file.mimeType.includes('code') || file.mimeType.includes('json') ? (
                                <FileCode className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-[#9aa0a6]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#e3e3e3] truncate group-hover:text-white">
                                {file.name}
                              </p>
                              <p className="text-xs text-[#9aa0a6] truncate flex items-center gap-1.5">
                                {file.owners?.[0]?.displayName && (
                                  <span>{file.owners[0].displayName}</span>
                                )}
                                {formattedSize && <span>• {formattedSize}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isAttaching ? (
                              <span className="text-xs text-[#8ab4f8] flex items-center gap-1.5">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Attaching...</span>
                              </span>
                            ) : (
                              <>
                                {formattedDate && (
                                  <span className="text-xs text-[#80868b] group-hover:hidden">
                                    {formattedDate}
                                  </span>
                                )}
                                <span className="text-xs font-medium text-[#8ab4f8] hidden group-hover:inline-block">
                                  Select file
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#2d2f33] bg-[#18191b] flex items-center justify-between text-xs text-[#9aa0a6]">
              {(isDriveConnected || accessToken) ? (
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[220px] text-[#c4c7c5]">
                    {driveEmail || user?.email || 'Google Drive connected'}
                  </span>
                  <button
                    type="button"
                    onClick={disconnectDrive}
                    className="text-[#9aa0a6] hover:text-red-400 transition-colors cursor-pointer text-[11px] underline ml-1"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <span>Google Drive Integration</span>
              )}
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

      {showImportCodeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (!isImportingGithub) {
              setShowImportCodeModal(false);
              setGithubImportError(null);
            }
          }}
        >
          <div 
            className="w-full max-w-[500px] rounded-2xl bg-[#1e1f20] border border-[#3c4043] shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-6 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5">
              <h3 className="text-xl font-medium text-[#f1f3f4] tracking-tight">Import code</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImportCodeModal(false);
                  setGithubImportError(null);
                }}
                disabled={isImportingGithub}
                className="p-1 rounded-full text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Row with outlined label and Import pill button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImportGitHub();
              }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <div className={`relative border rounded-xl px-3.5 pt-3.5 pb-2.5 bg-transparent transition-all ${
                    githubImportError
                      ? 'border-red-400 focus-within:ring-1 focus-within:ring-red-400'
                      : 'border-[#8ab4f8] focus-within:ring-1 focus-within:ring-[#8ab4f8]'
                  }`}>
                    <label className="absolute -top-2.5 left-3 bg-[#1e1f20] px-1 text-xs text-[#8ab4f8] font-medium select-none pointer-events-none">
                      GitHub repository or branch URL
                    </label>
                    <input
                      type="text"
                      value={githubRepoUrl}
                      onChange={(e) => {
                        setGithubRepoUrl(e.target.value);
                        if (githubImportError) setGithubImportError(null);
                      }}
                      placeholder="e.g. https://github.com/user/repo"
                      className="w-full bg-transparent text-sm text-[#f1f3f4] placeholder-[#80868b] focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!githubRepoUrl.trim() || isImportingGithub}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    githubRepoUrl.trim() && !isImportingGithub
                      ? 'bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49] active:scale-95 shadow-sm'
                      : 'bg-[#282a2c] text-[#80868b] cursor-not-allowed opacity-60'
                  }`}
                >
                  {isImportingGithub ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#041e49]/30 border-t-[#041e49] rounded-full animate-spin" />
                      <span>Import</span>
                    </div>
                  ) : (
                    'Import'
                  )}
                </button>
              </div>

              {githubImportError && (
                <p className="text-xs text-red-400 pl-1">{githubImportError}</p>
              )}

              {/* Helper text */}
              <p className="text-xs text-[#9aa0a6] pl-0.5">
                Clicking Import will enable GitHub.
              </p>

              {/* Upload folder action link */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => folderFileInputRef.current?.click()}
                  className="text-sm font-medium text-[#8ab4f8] hover:text-[#a8c7fa] hover:underline cursor-pointer transition-colors"
                >
                  Upload folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};
