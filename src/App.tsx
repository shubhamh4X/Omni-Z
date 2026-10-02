import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatMessage, Attachment, ChatSession } from './types';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const INITIAL_SESSION_ID = 'session_default';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('omni-z-flash');
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Multi-session chat management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('omniz_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load sessions from storage:', e);
    }
    return [
      {
        id: INITIAL_SESSION_ID,
        title: 'New conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('omniz_active_session');
      if (savedId) return savedId;
    } catch (e) {}
    return INITIAL_SESSION_ID;
  });

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omniz_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to storage:', e);
    }
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omniz_active_session', activeSessionId);
    } catch (e) {}
  }, [activeSessionId]);

  // Sync sessions to Firestore when user is authenticated with Google
  useEffect(() => {
    if (!user) return;

    const syncToFirestore = async () => {
      try {
        const validChats = sessions.filter((s) => s.messages && s.messages.length > 0);
        for (const s of validChats.slice(0, 15)) {
          await setDoc(
            doc(db, 'users', user.uid, 'sessions', s.id),
            {
              id: s.id,
              userId: user.uid,
              title: s.title,
              updatedAt: s.updatedAt,
              createdAt: s.createdAt,
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('Firestore session sync note:', err);
      }
    };
    syncToFirestore();
  }, [sessions, user]);

  // Current session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleNewChat = () => {
    // If current session is already an empty new conversation, remain on it
    if (currentSession && currentSession.messages.length === 0) {
      return;
    }
    // Check if there is already an existing empty session to switch to
    const existingEmpty = sessions.find((s) => s.messages.length === 0);
    if (existingEmpty) {
      setActiveSessionId(existingEmpty.id);
      return;
    }
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      // Just clear current session
      setSessions([
        {
          id: `session_${Date.now()}`,
          title: 'New conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      return;
    }

    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const handleClearCurrentChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], title: 'New conversation', updatedAt: Date.now() }
          : s
      )
    );
  };

  const handleSendMessage = async (
    text: string, 
    attachments: Attachment[] = [],
    extraOptions?: { imageAspectRatio?: string }
  ) => {
    if (!text && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    // Update session title if first message
    const isFirstMessage = currentSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? text ? text.slice(0, 35) + (text.length > 35 ? '...' : '') : 'Attachment Query'
      : currentSession.title;

    // Append user message immediately
    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments,
          enableSearch,
          enableMemory: true,
          deepThinking: selectedModel === 'omni-z-think',
          cognitiveMode: selectedModel,
          imageAspectRatio: extraOptions?.imageAspectRatio || '1:1',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMessage = errorData.error || `HTTP error! status: ${response.status}`;
        try {
          const parsed = JSON.parse(errMessage);
          if (parsed?.error?.message) {
            errMessage = parsed.error.message;
          }
        } catch {}
        throw new Error(errMessage);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: data.text || data.reply || "I'm ready to help. What would you like to explore next?",
        timestamp: Date.now(),
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        vectorMemories: data.recalledMemories || [],
        codeBlocks: data.codeBlocks || [],
        images: data.images || [],
        imagePrompt: data.imagePrompt || undefined,
        thinkingProcess: data.thinkingProcess || undefined,
        autoSavedMemory: data.autoSavedMemory || null,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `I encountered an issue processing your request: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...updatedMessages, errorMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPrompt = async (prompt: string, customTitle?: string) => {
    // If the current active session is already empty, reuse it
    let targetSessionId = activeSessionId;
    const isCurrentEmpty = currentSession && currentSession.messages.length === 0;
    const formattedTitle = customTitle || prompt.slice(0, 32) + (prompt.length > 32 ? '...' : '');

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      attachments: [],
    };

    if (isCurrentEmpty) {
      targetSessionId = currentSession.id;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, title: formattedTitle, messages: [userMessage], updatedAt: Date.now() }
            : s
        )
      );
    } else {
      targetSessionId = `session_${Date.now()}`;
      const newSession: ChatSession = {
        id: targetSessionId,
        title: formattedTitle,
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(targetSessionId);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [],
          attachments: [],
          enableSearch,
          enableMemory: true,
          deepThinking: selectedModel === 'omni-z-think',
          cognitiveMode: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: data.text || data.reply || "I'm ready to help. What would you like to explore next?",
        timestamp: Date.now(),
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        vectorMemories: data.recalledMemories || [],
        codeBlocks: data.codeBlocks || [],
        images: data.images || [],
        imagePrompt: data.imagePrompt || undefined,
        thinkingProcess: data.thinkingProcess || undefined,
        autoSavedMemory: data.autoSavedMemory || null,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [userMessage, assistantMessage], updatedAt: Date.now() }
            : s
        )
      );
    } catch (err: any) {
      console.error('Prompt error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `I encountered an issue starting this session: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? { ...s, messages: [userMessage, errorMessage], updatedAt: Date.now() }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3] font-sans selection:bg-[#8ab4f8]/30 selection:text-white">
      {/* Sidebar with Chat History */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onSelectPrompt={handleSelectPrompt}
      />

      {/* Main AI Agent Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0 bg-[#131314]">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          enableSearch={enableSearch}
          setEnableSearch={setEnableSearch}
          onClearChat={handleClearCurrentChat}
          hasMessages={currentSession.messages.length > 0}
        />

        {/* Omni Z AI Agent Chat View */}
        <ChatView
          messages={currentSession.messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          enableSearch={enableSearch}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onClearChat={handleClearCurrentChat}
        />
      </div>
    </div>
  );
}
