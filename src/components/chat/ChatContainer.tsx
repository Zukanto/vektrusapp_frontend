import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import InputBar from './InputBar';
import VektrusLoadingBubble from './VektrusLoadingBubble';
import SmartActionPanel from './SmartActionPanel';
import { Message, ChatAction, MediaFile } from './types';
import { Lightbulb, ArrowRight, Sparkles, Calendar, BarChart3, ThumbsUp, ClipboardList, PenLine, Palette, AlertCircle } from 'lucide-react';
import { useChatCompletion } from '../../hooks/useChatCompletion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import { ChatService } from '../../services/chatService';
import { supabase, externalSupabase } from '../../lib/supabase';

const ChatContainer: React.FC = () => {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSmartActions, setShowSmartActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { send, isLoading, error: chatError } = useChatCompletion({
    endpoint: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
    jwt: session?.access_token || ''
  });

  // Initialize chat thread and load messages
  useEffect(() => {
    const initializeChat = async () => {
      if (!session?.user) return;

      try {
        // Get user's team
        const teamMember = await ChatService.getUserTeam(session.user.id);
        if (!teamMember) {
          throw new Error('Du bist keinem Team zugeordnet. Bitte kontaktiere den Support.');
        }
        
        // Verify team exists
        const team = await ChatService.getTeam(teamMember.team_id);
        if (!team) {
          throw new Error('Dein Team wurde nicht gefunden. Bitte kontaktiere den Support.');
        }
        
        setCurrentTeamId(teamMember.team_id);
        
        // Get or create chat thread
        const thread = await ChatService.getOrCreateThread(teamMember.team_id, session.user.id);
        setCurrentThreadId(thread.id);

        // Load existing messages
        const existingMessages = await ChatService.getThreadMessages(thread.id);

        if (existingMessages.length > 0) {
          console.log('[Chat] Lade existierende Nachrichten:', existingMessages.length);

          const parsedMessages: Message[] = [];
          for (const msg of existingMessages) {
            const parsed = await parseMessageWithImages(msg);
            parsedMessages.push(...parsed);
          }

          console.log('[Chat] Nachrichten nach Parsing:', parsedMessages.length);
          setMessages(parsedMessages);
        } else {
          setMessages([{
            id: 'welcome',
            type: 'ai',
            content: 'Hallo! Ich bin dein Vektrus Content-Assistent. Wie kann ich dir heute bei deiner Social Media Strategie helfen?',
            timestamp: new Date(),
            isAnimating: true,
            actions: [
              { id: 'plan', label: 'Wochenplan erstellen', icon: <Calendar className="w-4 h-4" />, type: 'primary' },
              { id: 'ideas', label: 'Content-Ideen', icon: <Lightbulb className="w-4 h-4" />, type: 'secondary' },
              { id: 'insights', label: 'Performance analysieren', icon: <BarChart3 className="w-4 h-4" />, type: 'secondary' }
            ]
          }]);

          setTimeout(() => {
            setMessages(prev => prev.map(m =>
              m.id === 'welcome' ? { ...m, isAnimating: false } : m
            ));
          }, 5000);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Chat initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        addToast({
          type: 'error',
          title: 'Chat-Initialisierung fehlgeschlagen',
          description: errorMessage.includes('Team') || errorMessage.includes('team')
            ? `${errorMessage} Für die Einrichtung wende dich an: support@vektrus.com`
            : 'Bitte lade die Seite neu oder kontaktiere den Support.',
        });
        
        // Show helpful setup instructions for team assignment issues
        if (errorMessage.includes('Team') || errorMessage.includes('team')) {
          setMessages([{
            id: 'setup-required',
            type: 'ai',
            content: `**Setup erforderlich**\n\nDein Account muss einem Team zugeordnet werden, bevor du den Chat nutzen kannst.\n\n**Nächste Schritte:**\n1. Kontaktiere deinen Administrator oder support@vektrus.com\n2. Stelle sicher, dass dein Account einem Team zugeordnet ist\n3. Lade die Seite neu, sobald die Zuordnung erfolgt ist\n\n*Hinweis: Dies ist eine einmalige Einrichtung.*`,
            timestamp: new Date()
          }]);
          setIsInitialized(true);
        }
      }
    };

    initializeChat();
  }, [session, addToast]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!currentThreadId) return;

    let subscription: any = null;

    const setupSubscription = async () => {
      try {
        subscription = await ChatService.subscribeToMessages(currentThreadId, async (message) => {
          console.log('[Chat] Neue Nachricht empfangen:', message.role, message.content.substring(0, 100));

          const imageInfo = extractImageFromMarkdown(message.content);

          if (imageInfo.hasImage && imageInfo.imageUrl && message.role === 'assistant') {
            console.log('[Bilder-Integration] Markdown-Bild erkannt:', imageInfo.imageUrl);

            const imageData = await createImageMessageFromUrl(imageInfo.imageUrl, imageInfo.altText || 'Generiertes Bild');

            if (imageData) {
              setMessages(prev => {
                const textMessage: Message = {
                  id: `${message.id}-text`,
                  type: 'ai',
                  content: imageInfo.textWithoutImage || 'Hier ist dein Bild:',
                  timestamp: new Date(message.created_at || ''),
                  isAnimating: false
                };

                const imageMessage: Message = {
                  id: `${message.id}-image`,
                  type: 'ai',
                  content: 'Dein Bild ist fertig!',
                  timestamp: new Date(message.created_at || ''),
                  messageType: 'image',
                  imageData: imageData,
                  isAnimating: false
                };

                const filtered = prev.filter(m => m.id !== message.id && m.id !== `${message.id}-text` && m.id !== `${message.id}-image`);
                return [...filtered, textMessage, imageMessage];
              });
              return;
            }
          }

          // Update existing message or add new one
          setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.id === message.id);
            const isNewMessage = existingIndex < 0;
            const formattedMessage: Message = {
              id: message.id,
              type: message.role === 'assistant' ? 'ai' : 'user',
              content: message.content,
              timestamp: new Date(message.created_at || ''),
              actions: message.role === 'assistant' && message.status === 'committed'
                ? generateResponseActions(message.content)
                : undefined,
              isAnimating: isNewMessage && message.role === 'assistant' && message.status === 'committed'
            };

            if (existingIndex >= 0) {
              // Update existing message
              const newMessages = [...prev];
              newMessages[existingIndex] = formattedMessage;
              return newMessages;
            } else {
              // Add new message
              return [...prev, formattedMessage];
            }
          });

          // Stop typing indicator and remove animation flag after animation completes
          if (message.role === 'assistant' && message.status === 'committed') {
            setIsTyping(false);

            // Remove animation flag after animation duration
            setTimeout(() => {
              setMessages(prev => prev.map(m =>
                m.id === message.id ? { ...m, isAnimating: false } : m
              ));
            }, 8000);
          }
        });
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [currentThreadId]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadExistingImages = async () => {
      try {
        console.log('[Bilder-Integration] Lade existierende Bilder für User:', session.user.id);
        console.log('[Bilder-Integration] Nutze EXTERNE Supabase:', import.meta.env.VITE_EXTERNAL_SUPABASE_URL);

        const { data: existingImages, error } = await externalSupabase
          .from('media_files')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[Bilder-Integration] Fehler beim Laden:', error);
          return;
        }

        console.log('[Bilder-Integration] Gefundene Bilder:', existingImages?.length || 0);

        if (existingImages && existingImages.length > 0) {
          const imageMessages: Message[] = existingImages.map((img: MediaFile) => ({
            id: `image-${img.id}`,
            type: 'ai' as const,
            content: 'Dein Bild ist fertig!',
            timestamp: new Date(img.created_at),
            messageType: 'image' as const,
            imageData: img,
            isAnimating: false
          }));

          console.log('[Bilder-Integration] Füge Bilder zum Chat hinzu:', imageMessages.length);
          setMessages(prev => [...prev, ...imageMessages]);
        }
      } catch (error) {
        console.error('[Bilder-Integration] Exception beim Laden:', error);
      }
    };

    loadExistingImages();

    console.log('[Bilder-Integration] Starte Real-time Subscription für User:', session.user.id);
    console.log('[Bilder-Integration] Subscription auf EXTERNE DB:', import.meta.env.VITE_EXTERNAL_SUPABASE_URL);

    const channel = externalSupabase
      .channel('media_files_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'media_files',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        console.log('[Bilder-Integration] Neues Bild empfangen von EXTERNE DB:', payload.new);
        const newImage = payload.new as MediaFile;

        setMessages(prev => {
          const updatedMessages = prev.filter(m => m.messageType !== 'loading');

          const imageMessage: Message = {
            id: `image-${newImage.id}`,
            type: 'ai',
            content: 'Dein Bild ist fertig!',
            timestamp: new Date(newImage.created_at),
            messageType: 'image',
            imageData: newImage,
            isAnimating: false
          };

          console.log('[Bilder-Integration] Füge neues Bild zum Chat hinzu');
          return [...updatedMessages, imageMessage];
        });

        addToast({
          type: 'success',
          title: 'Bild fertig!',
          description: 'Dein generiertes Bild ist im Chat verfügbar.',
          duration: 3000
        });
      })
      .subscribe((status) => {
        console.log('[Bilder-Integration] EXTERNE Subscription Status:', status);
      });

    return () => {
      externalSupabase.removeChannel(channel);
    };
  }, [session?.user?.id, addToast]);

  const extractImageFromMarkdown = (content: string): { hasImage: boolean; imageUrl?: string; altText?: string; textWithoutImage?: string } => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const match = content.match(imageRegex);

    if (match) {
      return {
        hasImage: true,
        altText: match[1],
        imageUrl: match[2],
        textWithoutImage: content.replace(imageRegex, '').trim()
      };
    }

    return { hasImage: false };
  };

  const createImageMessageFromUrl = async (imageUrl: string, altText: string): Promise<MediaFile | null> => {
    try {
      console.log('[Bilder-Integration] Suche Bild in DB mit URL:', imageUrl);

      const { data: imageData, error } = await externalSupabase
        .from('media_files')
        .select('*')
        .eq('public_url', imageUrl)
        .maybeSingle();

      if (error) {
        console.error('[Bilder-Integration] Fehler beim Suchen des Bildes:', error);
        return null;
      }

      if (imageData) {
        console.log('[Bilder-Integration] Bild gefunden in DB:', imageData);
        return imageData as MediaFile;
      }

      console.log('[Bilder-Integration] Kein Bild in DB gefunden, erstelle Fallback');
      return {
        id: `manual-${Date.now()}`,
        user_id: session?.user?.id || '',
        filename: altText || 'Generiertes Bild',
        file_type: 'image/png',
        public_url: imageUrl,
        storage_path: imageUrl,
        generated_by: 'dalle',
        generation_prompt: altText || 'Generiertes Bild',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Bilder-Integration] Exception beim Bild-Lookup:', error);
      return null;
    }
  };

  const parseMessageWithImages = async (msg: any): Promise<Message[]> => {
    const imageInfo = extractImageFromMarkdown(msg.content);

    if (imageInfo.hasImage && imageInfo.imageUrl && msg.role === 'assistant') {
      console.log('[Bilder-Integration] Markdown-Bild beim Laden erkannt:', imageInfo.imageUrl);

      const imageData = await createImageMessageFromUrl(imageInfo.imageUrl, imageInfo.altText || 'Generiertes Bild');

      if (imageData) {
        const textMessage: Message = {
          id: `${msg.id}-text`,
          type: 'ai',
          content: imageInfo.textWithoutImage || 'Hier ist dein Bild:',
          timestamp: new Date(msg.created_at || ''),
          isAnimating: false
        };

        const imageMessage: Message = {
          id: `${msg.id}-image`,
          type: 'ai',
          content: 'Dein Bild ist fertig!',
          timestamp: new Date(msg.created_at || ''),
          messageType: 'image',
          imageData: imageData,
          isAnimating: false
        };

        return [textMessage, imageMessage];
      }
    }

    return [{
      id: msg.id,
      type: msg.role === 'assistant' ? 'ai' : 'user',
      content: msg.content,
      timestamp: new Date(msg.created_at || ''),
      actions: msg.role === 'assistant' ? generateResponseActions(msg.content) : undefined,
      isAnimating: false
    }];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!currentThreadId || !currentTeamId) {
      addToast({
        type: 'error',
        title: 'Chat nicht bereit',
        description: 'Bitte warte, bis der Chat initialisiert ist.',
      });
      return;
    }

    try {
      // Create user message in database first
      const userMessage = await ChatService.createMessage(
        currentThreadId,
        currentTeamId,
        'user',
        content,
        session?.user?.id
      );

      // Add user message to UI immediately
      const userMessageUI: Message = {
        id: userMessage.id,
        type: 'user',
        content,
        timestamp: new Date(),
        isAnimating: false
      };

      setMessages(prev => [...prev, userMessageUI]);
      setShowSmartActions(false);
      setIsTyping(true);

      await send(
        {
          threadId: currentThreadId,
          content
        },
        async (responseContent: string) => {
          setIsTyping(false);

          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: responseContent,
            timestamp: new Date(),
            isAnimating: true,
            actions: generateResponseActions(content)
          };

          setMessages(prev => [...prev, aiMessage]);

          setTimeout(() => {
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessage.id ? { ...msg, isAnimating: false } : msg
            ));
          }, 5000);

          try {
            await ChatService.updateThreadTimestamp(currentThreadId);
          } catch (error) {
            console.error('Error updating thread timestamp:', error);
          }
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      addToast({
        type: 'error',
        title: 'Chat-Fehler',
        description: 'Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.',
      });
      setIsTyping(false);
    }
  };

  const generateResponseActions = (userInput: string): ChatAction[] => {
    const input = userInput.toLowerCase();

    if (input.includes('wochenplan') || input.includes('planen')) {
      return [
        { id: 'add-to-planner', label: 'In Planner übertragen', icon: <Calendar className="w-4 h-4" />, type: 'primary' },
        { id: 'customize', label: 'Anpassen', icon: <PenLine className="w-4 h-4" />, type: 'secondary' },
        { id: 'generate-visuals', label: 'Visuals generieren', icon: <Palette className="w-4 h-4" />, type: 'secondary' }
      ];
    }

    if (input.includes('ideen') || input.includes('content')) {
      return [
        { id: 'create-post', label: 'Post erstellen', icon: <Sparkles className="w-4 h-4" />, type: 'primary' },
        { id: 'more-ideas', label: 'Mehr Ideen', icon: <Lightbulb className="w-4 h-4" />, type: 'secondary' },
        { id: 'schedule', label: 'Einplanen', icon: <Calendar className="w-4 h-4" />, type: 'secondary' }
      ];
    }

    return [
      { id: 'helpful', label: 'Hilfreich', icon: <ThumbsUp className="w-4 h-4" />, type: 'secondary' },
      { id: 'more-info', label: 'Mehr Details', icon: <ClipboardList className="w-4 h-4" />, type: 'secondary' }
    ];
  };

  const handleActionClick = (actionId: string, messageId: string) => {
    // Handle different actions
    switch (actionId) {
      case 'add-to-planner':
        // Simulate adding to planner
        const confirmMessage: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: 'Perfekt! Ich habe deinen Wochenplan in den Planner übertragen. Du findest ihn unter "Geplante Inhalte".',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMessage]);
        addToast({
          type: 'success',
          title: 'In Planner übertragen',
          description: 'Der Wochenplan wurde erfolgreich übertragen.',
        });
        break;
        
      case 'plan':
        handleSendMessage('Erstelle mir einen Wochenplan');
        break;
        
      case 'ideas':
        handleSendMessage('Gib mir Content-Ideen');
        break;
        
      case 'insights':
        handleSendMessage('Zeig mir meine Performance-Analyse');
        break;
        
      default:
        // Unhandled actions are ignored
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleGenerateRecommendations = (context: any) => {
    setShowSmartActions(false);

    // Kontextuellen Prompt erstellen
    let prompt = '';
    if (context.quickAction) {
      prompt = context.prompt;
    } else {
      const audienceMap: Record<string, string> = {
        'b2b': 'B2B Kunden',
        'consumers': 'Endverbraucher', 
        'creators': 'Content Creator',
        'startups': 'Startups'
      };

      const goalMap: Record<string, string> = {
        'awareness': 'Markenbekanntheit',
        'engagement': 'Engagement', 
        'leads': 'Lead Generation',
        'sales': 'Verkäufe'
      };

      const platformMap: Record<string, string> = {
        'instagram': 'Instagram',
        'linkedin': 'LinkedIn',
        'facebook': 'Facebook',
        'tiktok': 'TikTok'
      };

      const audience = audienceMap[context.audience] || context.audience;
      const goal = goalMap[context.goal] || context.goal;
      const platform = platformMap[context.platform] || context.platform;

      prompt = `Generiere mir 3 Content-Ideen für ${audience} auf ${platform} mit dem Ziel ${goal}.`;
    }

    handleSendMessage(prompt);
  };

  const handleRetry = (messageId: string) => {
    const aiIndex = messages.findIndex(m => m.id === messageId);
    if (aiIndex < 0) return;

    let userQuery = '';
    for (let i = aiIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        userQuery = messages[i].content;
        break;
      }
    }

    if (userQuery) {
      handleSendMessage(userQuery);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4FCFE] overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-[rgba(73,183,227,0.18)] px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#111111] font-manrope">Vektrus KI</h1>
              <p className="text-sm text-[#7A7A7A]">
                {isInitialized ? 'Dein Content Assistant' : 'Wird initialisiert...'}
              </p>
            </div>
            {isLoading && (
              <div className="ml-auto flex items-center space-x-2 text-sm text-[#7A7A7A]">
                <div className="w-2 h-2 bg-[#49B7E3] rounded-full animate-pulse"></div>
                <span>KI antwortet...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="chat-stream-wrapper px-4 py-8">
            <div className="space-y-6 min-h-full flex flex-col">
            {!isInitialized ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="w-12 h-12 pulse-gradient-icon rounded-[var(--vektrus-radius-md)] flex items-center justify-center mx-auto mb-4 animate-pulse shadow-card">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-[#7A7A7A]">Chat wird initialisiert...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {messages.every(m => m.id === 'welcome' || m.id === 'setup-required') && messages.length <= 1 && (
                  <div className="flex justify-center pt-4 pb-2">
                    <div className="max-w-md bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-5 shadow-subtle">
                      <div className="flex flex-col items-center text-center">
                        <Lightbulb className="w-6 h-6 text-[#49B7E3] mb-3" />
                        <p className="font-semibold text-[#111111]">Tipp für bessere Ergebnisse</p>
                        <p className="text-sm text-[#7A7A7A] mt-2">
                          Fülle zuerst dein AI-Profil mit Brand Voice, Zielgruppe und Kernbotschaften aus. Je mehr Vektrus über dein Unternehmen weiß, desto bessere Antworten bekommst du.
                        </p>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-profile'))}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#49B7E3] hover:text-[#3a9fd1] mt-3 transition-colors"
                        >
                          Zum AI-Profil
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onActionClick={handleActionClick}
                    onRetry={handleRetry}
                  />
                ))}

                {isTyping && <VektrusLoadingBubble isVisible={isTyping} />}
                <div ref={messagesEndRef} />
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[rgba(73,183,227,0.10)] py-5 flex-shrink-0">
          <div className="chat-stream-wrapper px-4">
          <InputBar
            onSendMessage={handleSendMessage}
            disabled={isLoading || !currentThreadId || !isInitialized}
            showSuggestions={showSmartActions}
            onQuickAction={handleQuickAction}
          />
          
          {/* Error Display */}
          {chatError && (
            <div className="mt-3 p-3 bg-[#FA7E70]/10 border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)]">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FA7E70] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#FA7E70]">
                  {chatError}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-[#FA7E70] hover:text-[#FA7E70]/80 underline mt-1"
              >
                Seite neu laden
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Smart Actions Panel */}
      <div className="flex-shrink-0">
        <SmartActionPanel onGenerateRecommendations={handleGenerateRecommendations} />
      </div>
    </div>
  );
};

export default ChatContainer;