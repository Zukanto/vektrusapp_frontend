import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import EnhancedInputBar from './EnhancedInputBar';
import VektrusLoadingBubble from './VektrusLoadingBubble';
import { Message } from './types';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { useToast } from '../ui/toast';
import { sendVektrusMessageWithStatus, WorkflowStatusUpdate } from '../../services/vektrusChatService';
import { ChatSessionService, ChatSession } from '../../services/chatSessionService';
import { PanelRightOpen, PanelRightClose, Plus, MessageSquare, Trash2, Sparkles } from 'lucide-react';

interface DemoChatContainerProps {
  onModuleChange?: (module: string) => void;
}

const DemoChatContainer: React.FC<DemoChatContainerProps> = ({ onModuleChange }) => {
  const { user } = useAuth();
  const { userData, isLoading: isLoadingUserData } = useUserData();
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatusUpdate | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user?.id]);

  useEffect(() => {
    if (currentSession?.id) {
      loadMessages(currentSession.id);
    } else {
      setMessages([]);
    }
  }, [currentSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await ChatSessionService.getUserSessions();
      setSessions(data);
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await ChatSessionService.getSessionMessages(sessionId);
      const uiMessages: Message[] = data.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        isAnimating: false
      }));
      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await ChatSessionService.createSession('Neuer Chat');
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: 'Konnte Chat nicht erstellen',
        duration: 3000
      });
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ChatSessionService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        setCurrentSession(remaining[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;

    let activeSession = currentSession;
    if (!activeSession) {
      try {
        activeSession = await ChatSessionService.createSession(content.substring(0, 50));
        setSessions(prev => [activeSession!, ...prev]);
        setCurrentSession(activeSession);
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      isAnimating: false,
      imageUrl
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendVektrusMessageWithStatus(
        content,
        activeSession.id,
        (status) => setWorkflowStatus(status),
        imageUrl
      );

      setWorkflowStatus(null);

      const aiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        type: 'ai',
        content: response.output || response.raw || 'Keine Antwort erhalten',
        timestamp: new Date(),
        isAnimating: true
      };
      setMessages(prev => [...prev, aiMessage]);

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessage.id ? { ...msg, isAnimating: false } : msg
        ));

        loadMessages(activeSession.id);
      }, 5000);

      if (messages.length === 0) {
        const newTitle = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        await ChatSessionService.updateSessionTitle(activeSession.id, newTitle);
        setSessions(prev => prev.map(s =>
          s.id === activeSession!.id ? { ...s, title: newTitle } : s
        ));
      }

      loadSessions();

    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Fehler',
        description: err.message,
        duration: 3000
      });
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsTyping(false);
      setWorkflowStatus(null);
    }
  };

  const handleRetry = (messageId: string) => {
    const aiIndex = messages.findIndex(m => m.id === messageId);
    if (aiIndex < 0) return;

    let userQuery = '';
    let userImageUrl: string | undefined;
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        userQuery = messages[i].content;
        userImageUrl = messages[i].imageUrl;
        break;
      }
    }

    if (userQuery || userImageUrl) {
      handleSendMessage(userQuery, userImageUrl);
    }
  };

  return (
    <div className="flex h-full bg-[#F4FCFE]">
      {isSidebarOpen && (
        <div className="w-64 flex flex-col chat-sidebar-glass">
          <div className="p-4">
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--vektrus-radius-md)] font-semibold text-sm transition-all duration-200 bg-white/70 backdrop-blur-sm border border-white/60 text-[#111111] hover:bg-white/85 hover:shadow-[0_4px_16px_rgba(73,183,227,0.10)] hover:border-[rgba(73,183,227,0.20)]"
            >
              <Plus size={18} className="text-[#49B7E3]" />
              Neuer Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {isLoading ? (
              <div className="p-4 text-center text-[#7A7A7A] text-sm">Laden...</div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare size={20} className="mx-auto mb-2 text-[#49B7E3]/40" />
                <p className="text-[#7A7A7A] text-sm">Noch keine Chats</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSession(session)}
                  className={`p-3 mb-1.5 cursor-pointer flex items-center justify-between group transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'chat-sidebar-item active'
                      : 'chat-sidebar-item'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare size={15} className={currentSession?.id === session.id ? 'text-[#49B7E3] flex-shrink-0' : 'text-[#7A7A7A]/50 flex-shrink-0'} />
                    <span className={`truncate text-[13px] ${currentSession?.id === session.id ? 'text-[#111111] font-semibold' : 'text-[#7A7A7A]'}`}>
                      {session.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-[var(--vektrus-radius-sm)] transition-all"
                  >
                    <Trash2 size={13} className="text-[#FA7E70]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-white/40 bg-white/70 backdrop-blur-md">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#49B7E3]/10 rounded-[var(--vektrus-radius-md)] transition-all duration-200 text-[#49B7E3]"
          >
            {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="font-semibold text-[#111111]">
              {currentSession?.title || 'Vektrus Chat'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto chat-canvas-bg">
          <div className="chat-stream-wrapper px-4 py-8 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 py-20">
                <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] pulse-gradient-icon flex items-center justify-center mb-5 shadow-subtle">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>

                <h1 className="text-2xl font-semibold text-[#111111] mb-1.5 font-manrope tracking-tight">
                  Hallo {userData.name}
                </h1>
                <p className="text-[#7A7A7A] text-center mb-8 max-w-sm text-sm">
                  Was möchtest du heute für {userData.companyName} erstellen?
                </p>

                {userData.pendingPosts > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#49D69E]/10 to-[#49B7E3]/10 border border-[#49D69E]/30 rounded-[var(--vektrus-radius-md)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#49D69E] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-[#49D69E]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-[#111111] font-medium">
                        {userData.pendingPosts} {userData.pendingPosts === 1 ? 'Post wartet' : 'Posts warten'} auf dich!
                      </span>
                      <button
                        onClick={() => onModuleChange?.('planner')}
                        className="text-sm font-semibold text-[#49B7E3] hover:text-[#49D69E] ml-2 transition-colors"
                      >
                        Jetzt ansehen →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, idx) => {
                let prevUserMsg: string | undefined;
                if (msg.type === 'ai') {
                  for (let pi = idx - 1; pi >= 0; pi--) {
                    if (messages[pi].type === 'user') { prevUserMsg = messages[pi].content; break; }
                  }
                }
                return <ChatBubble key={msg.id} message={msg} onActionClick={() => {}} onRetry={handleRetry} previousUserMessage={prevUserMsg} />;
              })
            )}
            <VektrusLoadingBubble isVisible={isTyping} />
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/40 py-4 bg-white/40 backdrop-blur-md">
          <div className="chat-stream-wrapper px-4">
            <EnhancedInputBar onSendMessage={handleSendMessage} disabled={isTyping} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoChatContainer;
