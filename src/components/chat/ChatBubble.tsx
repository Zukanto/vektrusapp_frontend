import React, { useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChatAction } from './types';
import { Copy, ThumbsUp, ThumbsDown, CheckCircle, Check, RefreshCw, CalendarPlus, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAnimatedText } from '../ui/animated-text';
import ImageMessage from './ImageMessage';
import LoadingMessage from './LoadingMessage';
import ContentSlotEditor from '../planner/ContentSlotEditor';
import AiImageGenerationModal from '../planner/AiImageGenerationModal';
import { ContentSlot } from '../planner/types';
import { shouldShowContentActions } from '../../services/messageClassifier';
import { getDisplayName } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/toast';
import { extractCaptionBlocks, detectSingleCaption, captionBlockToSlotData, CaptionBlock } from '../../lib/captionBlockExtractor';

interface ChatBubbleProps {
  message: Message;
  onActionClick: (actionId: string, messageId: string) => void;
  onRetry?: (messageId: string) => void;
  isStreaming?: boolean;
  /** The previous user message content, used for single-caption intent detection */
  previousUserMessage?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onActionClick, onRetry, isStreaming = false, previousUserMessage }) => {
  const isUser = message.type === 'user';
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [composerSlot, setComposerSlot] = useState<ContentSlot | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);

  // Extract caption blocks from AI message for targeted transfer.
  // Falls back to single-caption detection if no structured blocks found.
  const captionBlocks = useMemo(() => {
    if (isUser || isStreaming || message.messageType === 'loading') return [];
    const structured = extractCaptionBlocks(message.content);
    if (structured.length > 0) return structured;
    const single = detectSingleCaption(message.content, previousUserMessage);
    return single ? [single] : [];
  }, [message.content, isUser, isStreaming, message.messageType, previousUserMessage]);

  // Three-state response classification:
  // STATE 1: captionBlocks.length > 0 -> direct post transfer (block-level)
  // STATE 2: no blocks but socially relevant -> source-material mode
  // STATE 3: not relevant -> no content actions
  const isSociallyRelevant = useMemo(() => {
    if (isUser || isStreaming || message.messageType === 'loading') return false;
    return shouldShowContentActions(message.content);
  }, [message.content, isUser, isStreaming, message.messageType]);

  const hasPostCandidates = captionBlocks.length > 0;
  const isSourceMaterial = !hasPostCandidates && isSociallyRelevant;
  const showContentActions = hasPostCandidates || isSourceMaterial;

  // Open new composer with a specific caption block (STATE 1: direct transfer)
  const handleTransferBlock = useCallback((block: CaptionBlock) => {
    const slotData = captionBlockToSlotData(block);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const newSlot: ContentSlot = {
      id: `chat-${Date.now()}`,
      date: tomorrow,
      time: '09:00',
      platform: slotData.platform,
      status: 'draft',
      title: block.label,
      body: slotData.body,
      content: slotData.content,
      contentType: 'post',
      hashtags: slotData.hashtags,
      cta: slotData.cta || undefined,
      source: 'manual',
      generatedBy: 'ai',
    };
    setComposerSlot(newSlot);
    setShowComposer(true);
  }, []);

  // Open new composer in source-material mode (STATE 2: not post-ready)
  const handleOpenAsSource = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const newSlot: ContentSlot = {
      id: `chat-source-${Date.now()}`,
      date: tomorrow,
      time: '09:00',
      platform: 'instagram',
      status: 'draft',
      title: '',
      body: '',
      content: '',
      contentType: 'post',
      hashtags: [],
      source: 'manual',
      generatedBy: 'ai',
      sourceMaterial: message.content,
    };
    setComposerSlot(newSlot);
    setShowComposer(true);
  }, [message.content]);

  // Save to Supabase when composer saves
  const handleComposerSave = useCallback(async (updatedSlot: ContentSlot) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Nicht authentifiziert');

      const scheduledDate = new Date(updatedSlot.date);
      if (updatedSlot.time) {
        const [h, m] = updatedSlot.time.split(':');
        scheduledDate.setHours(parseInt(h), parseInt(m), 0, 0);
      }

      const contentJsonb: Record<string, any> = {
        primary_text: updatedSlot.body || updatedSlot.content || '',
        hashtags: updatedSlot.hashtags || [],
        cta: updatedSlot.cta || '',
        hook: (updatedSlot.body || updatedSlot.content || '').substring(0, 50) || 'Neuer Post',
      };
      if (updatedSlot.media?.url) {
        contentJsonb.media_urls = [updatedSlot.media.url];
      }

      const { error } = await supabase
        .from('pulse_generated_content')
        .insert({
          user_id: session.user.id,
          platform: updatedSlot.platform,
          content: contentJsonb,
          scheduled_date: scheduledDate.toISOString(),
          status: 'draft',
          source: 'chat',
          content_type: updatedSlot.contentType || 'post',
          post_number: 1,
        });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Erfolgreich!',
        description: 'Post wurde zum Contentplan hinzugefuegt',
        duration: 3000,
      });
      setShowComposer(false);
      setComposerSlot(null);
    } catch (err: any) {
      console.error('Failed to save content:', err);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: err.message || 'Konnte Post nicht hinzufuegen',
        duration: 3000,
      });
    }
  }, [addToast]);

  const shouldAnimate = !isUser && (isStreaming || message.isAnimating);

  const animatedContent = useAnimatedText(
    shouldAnimate ? message.content : "",
    ""
  );

  const displayContent = shouldAnimate && animatedContent ? animatedContent : message.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMessageStatus = () => {
    const textColor = 'text-[#7A7A7A]';
    if (isStreaming) {
      return (
        <div className={`flex items-center space-x-1 text-xs ${textColor}`}>
          <div className="w-2 h-2 bg-[#49B7E3] rounded-full animate-pulse"></div>
          <span>Wird geschrieben...</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center space-x-1 text-xs ${textColor}`}>
        <CheckCircle className="w-3 h-3 text-[#49D69E]" />
        <span>{message.timestamp.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
    );
  };
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}>
      <div className={`${isUser ? 'max-w-[70%]' : 'max-w-[85%]'} ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar for AI */}
        {!isUser && (
          <div className="flex flex-row gap-3 items-start">
              <div className="w-9 h-9 pulse-gradient-icon rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
              <div
                className="rounded-[16px] p-6 chat-ai-card transition-shadow duration-200"
              >
                {message.messageType === 'loading' ? (
                  <LoadingMessage message={message.content} />
                ) : message.messageType === 'image' && message.imageData ? (
                  <ImageMessage imageData={message.imageData} isAnimating={message.isAnimating} />
                ) : (
                  <>
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none text-[#374151]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 text-[#374151]" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-[#111111]" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-[#6B7280]" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1 text-[#374151]" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-[#111111]" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-[#111111]" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-1 text-[#1F2937]" {...props} />,
                          code: ({node, ...props}) => <code className="bg-white/60 px-1.5 py-0.5 rounded-[6px] text-sm text-[#374151]" {...props} />,
                        }}
                      >
                        {displayContent}
                      </ReactMarkdown>
                      {shouldAnimate && displayContent.length < message.content.length && (
                        <span className="inline-block w-1 h-4 bg-[#49B7E3] ml-1 animate-pulse"></span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="mt-3 flex items-center justify-between">
                      {getMessageStatus()}
                    </div>
                    {/* Content Actions — inside glass card */}
                    {!isStreaming && message.messageType !== 'loading' && showContentActions && (
                      <div className="mt-5 pt-4 border-t border-black/[0.06]">
                        {/* STATE 1: Recognized caption block transfer buttons */}
                        {hasPostCandidates && (
                          <div className="space-y-2 mb-3">
                            {captionBlocks.length > 1 && (
                              <p className="text-xs text-[#7A7A7A] font-medium mb-2">
                                {captionBlocks.length} Post-Vorschlaege erkannt
                              </p>
                            )}
                            {captionBlocks.map((block, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleTransferBlock(block)}
                                className="w-full chat-ai-action-btn px-4 py-2.5 text-[#111111] text-sm font-semibold rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-2"
                              >
                                <CalendarPlus className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />
                                <span className="truncate">
                                  {captionBlocks.length === 1
                                    ? 'Als Post uebernehmen'
                                    : `${block.label} uebernehmen`
                                  }
                                </span>
                                {block.platformHint && (
                                  <span className="ml-auto text-[10px] text-[#7A7A7A] bg-[#F4FCFE] px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    {block.platformHint}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* STATE 2: Socially relevant but not post-ready — source-material */}
                        {isSourceMaterial && (
                          <button
                            onClick={handleOpenAsSource}
                            className="w-full chat-ai-action-btn px-4 py-2.5 text-[#111111] text-sm font-semibold rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-2 mb-3"
                          >
                            <FileText className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />
                            <span>Als Grundlage oeffnen</span>
                          </button>
                        )}

                        {/* Image generation button */}
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="w-full group relative chat-ai-action-btn px-4 py-2.5 text-[var(--vektrus-ai-violet)] text-sm font-semibold rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                          <span>Bild zum Posting erstellen</span>
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#49D69E] text-white text-[10px] font-bold rounded-full shadow-sm">
                            NEU
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Response Actions — inside glass card */}
                    {message.actions && message.actions.length > 0 && !isStreaming && (
                      <div className="mt-5 pt-4 border-t border-black/[0.06]">
                        <div className="flex flex-wrap gap-2">
                          {message.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => onActionClick(action.id, message.id)}
                              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold chat-ai-action-btn transition-all duration-200 ${
                                action.type === 'primary' ? 'text-[#111111]' : 'text-[#6B7280]'
                              }`}
                            >
                              <span className="w-4 h-4 flex items-center justify-center">{action.icon}</span>
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Secondary Actions — outside card, on hover */}
              {!isUser && !isStreaming && message.messageType !== 'loading' && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-1 ${
                      copied
                        ? 'bg-[#49D69E] text-white'
                        : 'text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE]'
                    }`}
                    title="Kopieren"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                  </button>
                  <button
                    onClick={() => setLiked(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-1 ${
                      liked === true
                        ? 'bg-[#49D69E] text-white'
                        : 'text-[#7A7A7A] hover:text-[#49D69E] hover:bg-[#F4FCFE]'
                    }`}
                    title="Hilfreich"
                  >
                    <ThumbsUp className={`w-3 h-3 ${liked === true ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => setLiked(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-1 ${
                      liked === false
                        ? 'bg-[#FA7E70] text-white'
                        : 'text-[#7A7A7A] hover:text-[#FA7E70] hover:bg-[#F4FCFE]'
                    }`}
                    title="Nicht hilfreich"
                  >
                    <ThumbsDown className={`w-3 h-3 ${liked === false ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => onRetry?.(message.id)}
                    className="px-3 py-1.5 text-xs font-medium text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex items-center space-x-1"
                    title="Neu generieren"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* New Composer Modal — Chat to Planner Handoff */}
              {showComposer && composerSlot && (
                <ContentSlotEditor
                  slot={composerSlot}
                  onUpdate={handleComposerSave}
                  onClose={() => {
                    setShowComposer(false);
                    setComposerSlot(null);
                  }}
                />
              )}

              {/* AI Image Generation Modal */}
              {showImageModal && (
                <AiImageGenerationModal
                  onClose={() => setShowImageModal(false)}
                  onGenerate={(imageUrl) => {
                    console.log('Generated image:', imageUrl);
                    setShowImageModal(false);
                    setImageGenerated(true);
                    setTimeout(() => setImageGenerated(false), 3000);
                  }}
                />
              )}

              {/* Success Toast */}
              {imageGenerated && (
                <div className="mt-3 p-4 bg-gradient-to-r from-[#49D69E]/10 to-[#B4E8E5]/10 border border-[#49D69E]/30 rounded-[var(--vektrus-radius-md)] animate-in fade-in-0 slide-in-from-bottom-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#49D69E] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#111111]">Bild erfolgreich generiert!</p>
                      <p className="text-xs text-[#7A7A7A] mt-0.5">Das Bild wurde zu deinem Post hinzugefuegt.</p>
                    </div>
                  </div>
                </div>
              )}

              </div>
          </div>
        )}

        {/* User Message */}
        {isUser && (
          <div>
            <div className="mb-1 text-right">
              <span className="text-xs font-semibold text-[#7A7A7A]">{getDisplayName(user, userProfile)}</span>
            </div>
            <div
              className="rounded-[16px] rounded-br-[8px] px-5 py-4 bg-[#E0F7FA] text-[#111111] shadow-subtle"
            >
              {message.imageUrl && (
                <div className="mb-3">
                  <img
                    src={message.imageUrl}
                    alt="Hochgeladenes Bild"
                    className="max-w-[280px] max-h-[200px] rounded-[var(--vektrus-radius-sm)] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.imageUrl, '_blank')}
                  />
                </div>
              )}

              <div className="text-sm leading-relaxed font-medium prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    code: ({node, ...props}) => <code className="bg-[#49B7E3]/20 px-1 py-0.5 rounded-[var(--vektrus-radius-sm)] text-sm" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Timestamp */}
              <div className="mt-2 text-right">
                <div className="flex items-center justify-end space-x-1 text-xs text-[#7A7A7A]">
                  <CheckCircle className="w-3 h-3" />
                  <span>{message.timestamp.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
