import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, cleanTitle } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ArenaView } from './components/ArenaView';
import { ChatMessage, Attachment, ChatSession } from './types';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';

const INITIAL_SESSION_ID = 'session_default';

const getDeletedSessionIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem('omniz_deleted_sessions');
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

const addDeletedSessionId = (id: string) => {
  try {
    const set = getDeletedSessionIds();
    set.add(id);
    localStorage.setItem('omniz_deleted_sessions', JSON.stringify(Array.from(set).slice(-150)));
  } catch {}
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('omni-z-flash');
  const [deepThinkingEnabled, setDeepThinkingEnabled] = useState<boolean>(false);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'arena'>('chat');
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const deletedIds = getDeletedSessionIds();
      const saved = localStorage.getItem('omniz_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((s: ChatSession) => !deletedIds.has(s.id))
            .map((s: ChatSession) => ({
              ...s,
              title: cleanTitle(s.title || ''),
            }));
          if (filtered.length > 0) return filtered;
        }
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

  const [isTemporaryChat, setIsTemporaryChat] = useState<boolean>(false);
  const [temporarySession, setTemporarySession] = useState<ChatSession>({
    id: 'temporary_chat_session',
    title: 'Temporary chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const handleToggleTemporaryChat = () => {
    setIsTemporaryChat((prev) => {
      const nextState = !prev;
      setTemporarySession({
        id: `temp_${Date.now()}`,
        title: 'Temporary chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return nextState;
    });
  };

  const handleTurnOffTemporaryChat = () => {
    setTemporarySession({
      id: `temp_${Date.now()}`,
      title: 'Temporary chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsTemporaryChat(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem('omniz_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to storage:', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('omniz_active_session', activeSessionId);
    } catch (e) {}
  }, [activeSessionId]);

  useEffect(() => {
    if (!user || user.isGuest) return;

    let isMounted = true;
    const loadFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'users', user.uid, 'sessions'),
            orderBy('updatedAt', 'desc'),
            limit(30)
          )
        );
        if (!isMounted || querySnapshot.empty) return;

        const deletedIds = getDeletedSessionIds();
        const loadedSessions: ChatSession[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = data.id || docSnap.id;

          if (deletedIds.has(docId)) {
            deleteDoc(doc(db, 'users', user.uid, 'sessions', docId)).catch(() => {});
            return;
          }

          let parsedMessages: ChatMessage[] = [];
          if (data.messages) {
            try {
              parsedMessages = typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages;
            } catch {}
          }
          loadedSessions.push({
            id: docId,
            title: cleanTitle(data.title || 'Conversation'),
            messages: parsedMessages,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
            isPinned: Boolean(data.isPinned),
            pinnedAt: data.pinnedAt || undefined,
          });
        });

        if (loadedSessions.length > 0 && isMounted) {
          setSessions((prev) => {
            const currentDeleted = getDeletedSessionIds();
            const merged = [...loadedSessions.filter((s) => !currentDeleted.has(s.id))];
            for (const local of prev) {
              if (
                !currentDeleted.has(local.id) &&
                !merged.some((m) => m.id === local.id) &&
                local.messages.length > 0
              ) {
                merged.push(local);
              }
            }
            return merged.length > 0
              ? merged
              : [
                  {
                    id: INITIAL_SESSION_ID,
                    title: 'New conversation',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                  },
                ];
          });
        }
      } catch (err) {
        console.warn('Firestore initial session load note:', err);
      }
    };

    loadFromFirestore();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.isGuest) return;

    const syncToFirestore = async () => {
      try {
        const deletedIds = getDeletedSessionIds();
        const validChats = sessions.filter(
          (s) => !deletedIds.has(s.id) && s.messages && s.messages.length > 0
        );
        for (const s of validChats.slice(0, 15)) {
          await setDoc(
            doc(db, 'users', user.uid, 'sessions', s.id),
            {
              id: s.id,
              userId: user.uid,
              title: s.title,
              messages: JSON.stringify(s.messages.slice(-30)),
              updatedAt: s.updatedAt,
              createdAt: s.createdAt,
              isPinned: Boolean(s.isPinned),
              pinnedAt: s.pinnedAt || null,
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

  const currentSession = isTemporaryChat
    ? temporarySession
    : sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
        id: INITIAL_SESSION_ID,
        title: 'New conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

  useEffect(() => {
    if (!isTemporaryChat && currentSession && activeSessionId !== currentSession.id) {
      setActiveSessionId(currentSession.id);
    }
  }, [currentSession, activeSessionId, isTemporaryChat]);

  const handleNewChat = () => {
    if (isTemporaryChat) {
      setTemporarySession({
        id: `temp_${Date.now()}`,
        title: 'Temporary chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    if (currentSession && currentSession.messages.length === 0) {
      return;
    }

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

  const handleDeleteSession = async (id: string) => {

    addDeletedSessionId(id);

    if (user && !user.isGuest) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', id));
      } catch (err) {
        console.warn('Failed to delete session from Firestore:', err);
      }
    }

    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const newId = `session_${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: 'New conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(newId);
      try {
        localStorage.setItem('omniz_sessions', JSON.stringify([newSession]));
        localStorage.setItem('omniz_active_session', newId);
      } catch {}
      return;
    }

    setSessions(remaining);
    try {
      localStorage.setItem('omniz_sessions', JSON.stringify(remaining));
    } catch {}

    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
      try {
        localStorage.setItem('omniz_active_session', remaining[0].id);
      } catch {}
    }
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    const cleaned = cleanTitle(newTitle);
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: cleaned, updatedAt: Date.now() } : s))
    );
    if (user && !user.isGuest) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'sessions', id),
          { title: cleaned, updatedAt: Date.now() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Failed to update session title in Firestore:', err);
      }
    }
  };

  const handleTogglePinSession = async (id: string) => {
    let nextPinnedState = false;
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          nextPinnedState = !s.isPinned;
          return {
            ...s,
            isPinned: nextPinnedState,
            pinnedAt: nextPinnedState ? Date.now() : undefined,
          };
        }
        return s;
      });
      try {
        localStorage.setItem('omniz_sessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (user && !user.isGuest) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'sessions', id),
          { isPinned: nextPinnedState, pinnedAt: nextPinnedState ? Date.now() : null },
          { merge: true }
        );
      } catch (err) {
        console.warn('Failed to update session pin status in Firestore:', err);
      }
    }
  };

  const handleClearCurrentChat = async () => {
    if (isTemporaryChat) {
      setTemporarySession({
        id: `temp_${Date.now()}`,
        title: 'Temporary chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    const targetId = activeSessionId;
    if (user && !user.isGuest) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', targetId));
      } catch (err) {}
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetId
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

    const targetSessionId = currentSession?.id || activeSessionId || INITIAL_SESSION_ID;
    const currentMessages = Array.isArray(currentSession?.messages) ? currentSession.messages : [];

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const isFirstMessage = currentMessages.length === 0;
    const cleanPromptText = cleanTitle(text);
    const newTitle = isFirstMessage
      ? cleanPromptText
        ? cleanPromptText.slice(0, 35) + (cleanPromptText.length > 35 ? '...' : '')
        : 'Attachment Query'
      : cleanTitle(currentSession?.title || 'Conversation');

    const updatedMessages = [...currentMessages, userMessage];

    if (isTemporaryChat) {
      setTemporarySession((prev) => ({
        ...prev,
        messages: updatedMessages,
        updatedAt: Date.now(),
      }));
    } else {
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === targetSessionId);
        if (!exists) {
          return [
            {
              id: targetSessionId,
              title: newTitle,
              messages: updatedMessages,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...prev,
          ];
        }
        return prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                title: newTitle,
                messages: updatedMessages,
                updatedAt: Date.now(),
              }
            : s
        );
      });

      if (activeSessionId !== targetSessionId) {
        setActiveSessionId(targetSessionId);
      }
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const assistantMsgId = `msg_${Date.now()}_a`;
      const initialAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        sources: [],
        webSearchQueries: [],
        vectorMemories: [],
        codeBlocks: [],
        images: [],
      };

      let assistantMessageAdded = false;

      const appendEmptyAssistantIfFirstChunk = () => {
        if (!assistantMessageAdded) {
          assistantMessageAdded = true;
          if (isTemporaryChat) {
            setTemporarySession((prev) => ({
              ...prev,
              messages: [...prev.messages, initialAssistantMessage],
              updatedAt: Date.now(),
            }));
          } else {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === targetSessionId
                  ? {
                      ...s,
                      messages: [...(Array.isArray(s.messages) ? s.messages : updatedMessages), initialAssistantMessage],
                      updatedAt: Date.now(),
                    }
                  : s
              )
            );
          }
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json',
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          history: updatedMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments,
          enableSearch,
          enableMemory: !isTemporaryChat,
          deepThinking: (deepThinkingEnabled && (selectedModel === 'omni-z-flash' || selectedModel === 'omni-z-autonomous-builder')) || selectedModel === 'omni-z-think',
          allAiSynergy: true,
          cognitiveMode: selectedModel,
          imageAspectRatio: extraOptions?.imageAspectRatio || '1:1',
          userName: user?.displayName ? user.displayName.split(' ')[0] : undefined,
          stream: true,
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

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let finalData: any = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'chunk') {
                  appendEmptyAssistantIfFirstChunk();
                  accumulatedText += parsed.text;
                  const currentText = accumulatedText;
                  const updateStreamMsg = (msgs: ChatMessage[]) =>
                    msgs.map((m) => (m.id === assistantMsgId ? { ...m, content: currentText } : m));

                  if (isTemporaryChat) {
                    setTemporarySession((prev) => ({
                      ...prev,
                      messages: updateStreamMsg(prev.messages),
                      updatedAt: Date.now(),
                    }));
                  } else {
                    setSessions((prev) =>
                      prev.map((s) => (s.id === targetSessionId ? { ...s, messages: updateStreamMsg(s.messages) } : s))
                    );
                  }
                } else if (parsed.type === 'done') {
                  finalData = parsed;
                }
              } catch {}
            }
          }
        }

        const resolvedText = finalData?.text || accumulatedText || "I'm ready to help. What would you like to explore next?";
        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: resolvedText,
          timestamp: Date.now(),
          sources: finalData?.sources || [],
          webSearchQueries: finalData?.webSearchQueries || [],
          vectorMemories: finalData?.vectorMemories || [],
          codeBlocks: finalData?.codeBlocks || [],
          images: finalData?.images || [],
          imagePrompt: finalData?.imagePrompt || undefined,
          thinkingProcess: finalData?.thinkingProcess || undefined,
          autoSavedMemory: finalData?.autoSavedMemory || null,
        };

        if (!assistantMessageAdded) {
          if (isTemporaryChat) {
            setTemporarySession((prev) => ({
              ...prev,
              messages: [...prev.messages, assistantMessage],
              updatedAt: Date.now(),
            }));
          } else {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === targetSessionId
                  ? {
                      ...s,
                      messages: [...(Array.isArray(s.messages) ? s.messages : updatedMessages), assistantMessage],
                      updatedAt: Date.now(),
                    }
                  : s
              )
            );
          }
        } else {
          const updateFinalMsg = (msgs: ChatMessage[]) =>
            msgs.map((m) => (m.id === assistantMsgId ? assistantMessage : m));
          if (isTemporaryChat) {
            setTemporarySession((prev) => ({
              ...prev,
              messages: updateFinalMsg(prev.messages),
              updatedAt: Date.now(),
            }));
          } else {
            setSessions((prev) =>
              prev.map((s) => (s.id === targetSessionId ? { ...s, messages: updateFinalMsg(s.messages) } : s))
            );
          }
        }
      } else {
        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
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

        if (isTemporaryChat) {
          setTemporarySession((prev) => ({
            ...prev,
            messages: [...prev.messages, assistantMessage],
            updatedAt: Date.now(),
          }));
        } else {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === targetSessionId
                ? {
                    ...s,
                    messages: [...(Array.isArray(s.messages) ? s.messages : updatedMessages), assistantMessage],
                    updatedAt: Date.now(),
                  }
                : s
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('AbortError')) {

        return;
      }
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `I encountered an issue processing your request: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };

      if (isTemporaryChat) {
        setTemporarySession((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
          updatedAt: Date.now(),
        }));
      } else {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? {
                  ...s,
                  messages: [...(Array.isArray(s.messages) ? s.messages : updatedMessages), errorMessage],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSelectPrompt = async (prompt: string, customTitle?: string) => {

    let targetSessionId = activeSessionId;
    const isCurrentEmpty = currentSession && currentSession.messages.length === 0;
    const baseTitle = cleanTitle(customTitle || prompt);
    const formattedTitle = baseTitle.slice(0, 35) + (baseTitle.length > 35 ? '...' : '');

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
          deepThinking: (deepThinkingEnabled && (selectedModel === 'omni-z-flash' || selectedModel === 'omni-z-autonomous-builder')) || selectedModel === 'omni-z-think',
          allAiSynergy: true,
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

  const handleAdoptArenaWinner = (winnerContent: string, modelName: string) => {
    const adoptedMsg: ChatMessage = {
      id: `msg_arena_${Date.now()}`,
      role: 'assistant',
      content: `**[Adopted from ${modelName} in Arena Duel]**\n\n${winnerContent}`,
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSession.id
          ? {
              ...s,
              messages: [...s.messages, adoptedMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );
    setCurrentView('chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#e3e3e3] font-sans selection:bg-[#8ab4f8]/30 selection:text-white">

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          if (isTemporaryChat) {
            setIsTemporaryChat(false);
          }
          setActiveSessionId(id);
          setCurrentView('chat');
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        onNewChat={() => {
          handleNewChat();
          setCurrentView('chat');
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onSelectPrompt={(prompt) => {
          if (isTemporaryChat) {
            setIsTemporaryChat(false);
          }
          handleSelectPrompt(prompt);
          setCurrentView('chat');
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0 bg-[#131314]">

        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentView={currentView}
          onSwitchView={(v) => setCurrentView(v)}
          enableSearch={enableSearch}
          setEnableSearch={setEnableSearch}
          onClearChat={handleClearCurrentChat}
          hasMessages={currentSession.messages.length > 0}
          isTemporaryChat={isTemporaryChat}
          onToggleTemporaryChat={handleToggleTemporaryChat}
        />

        {currentView === 'arena' ? (
          <ArenaView
            onAdoptWinner={handleAdoptArenaWinner}
            onExitArena={() => setCurrentView('chat')}
          />
        ) : (
          <ChatView
            key={isTemporaryChat ? 'temporary_chat_mode' : currentSession.id}
            sessionId={currentSession.id}
            messages={currentSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            enableSearch={enableSearch}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            deepThinkingEnabled={deepThinkingEnabled}
            onToggleDeepThinking={setDeepThinkingEnabled}
            onClearChat={handleClearCurrentChat}
            onStopGeneration={handleStopGeneration}
            isTemporaryChat={isTemporaryChat}
            onTurnOffTemporaryChat={handleTurnOffTemporaryChat}
          />
        )}
      </div>
    </div>
  );
}
