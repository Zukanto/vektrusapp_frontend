import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Trash2, Sparkles, Upload, Image, Clock, Hash, Type, Check, CheckCheck, Download, FileText, Calendar, Zap, Info, TriangleAlert as AlertTriangle, ExternalLink, RefreshCw, ChevronDown, Smartphone, MessageCircle, Drama, Link, LayoutGrid, PenLine } from 'lucide-react';
import { GeneratedPost, WizardMode, ContentFormat } from './types';
import CarouselSlideNavigator, { CarouselExpandedList } from './CarouselSlideNavigator';
import { ContentSlot } from '../types';
import { WebhookResponse } from '../../services/contentGenerator';
import { supabase } from '../../../lib/supabase';
import { getPostImageUrl } from './PostResultsList';
import SocialIcon from '../../ui/SocialIcon';
import { convertPostFormat, getAvailableTargetFormats } from '../../../services/formatConvertService';
import AiImageGenerationModal from '../AiImageGenerationModal';

interface ReviewModalProps {
  generatedPosts: GeneratedPost[];
  wizardMode: WizardMode;
  webhookResponse?: WebhookResponse | null;
  onConfirm: (confirmedPosts: ContentSlot[]) => void;
  onClose: () => void;
}

const getPlatformLabel = (platform: string) => {
  const map: Record<string, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    facebook: 'Facebook',
    twitter: 'Twitter / X',
  };
  return map[platform] || platform;
};

const getPlatformColor = (platform: string) => {
  const map: Record<string, string> = {
    instagram: '#E1306C',
    linkedin: '#0A66C2',
    tiktok: '#010101',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
  };
  return map[platform] || '#6B7280';
};

const formatScheduleDate = (dateInputValue: string, time: string) => {
  const [year, month, day] = dateInputValue.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const weekday = d.toLocaleDateString('de-DE', { weekday: 'long' });
  const monthLabel = d.toLocaleDateString('de-DE', { month: 'long' });
  return `${weekday}, ${day}. ${monthLabel} • ${time} Uhr`;
};

const getHashtagCount = (text: string) => {
  return (text.match(/#/g) || []).length;
};

const getCharCountColor = (count: number, max: number) => {
  const ratio = count / max;
  if (ratio >= 0.95) return 'text-[#FA7E70]';
  if (ratio >= 0.80) return 'text-[#F4BE9D]';
  return 'text-[#7A7A7A]';
};

interface ContentScore {
  total: number;
  readability: number;
  hookStrength: number;
  hashtagQuality: number;
  ctaClarity: number;
  platformFit: number;
}

const getScoreColor = (score: number) => {
  if (score >= 85) return { text: 'text-[#2a8a5e]', bg: 'bg-[#49D69E]', badge: 'bg-[rgba(73,214,158,0.1)] text-[#2a8a5e]', label: 'Stark' };
  if (score >= 70) return { text: 'text-[#2a7da0]', bg: 'bg-[#49B7E3]', badge: 'bg-[rgba(73,183,227,0.1)] text-[#2a7da0]', label: 'Gut' };
  if (score >= 55) return { text: 'text-[#9a5e2a]', bg: 'bg-[#F4BE9D]', badge: 'bg-[rgba(244,190,157,0.15)] text-[#9a5e2a]', label: 'Okay' };
  return { text: 'text-[#FA7E70]', bg: 'bg-[#FA7E70]', badge: 'bg-[rgba(250,126,112,0.1)] text-[#FA7E70]', label: 'Schwach' };
};

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const c = getScoreColor(value);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#7A7A7A]">{label}</span>
        <span className={`text-xs font-semibold ${c.text}`}>{value}</span>
      </div>
      <div className="h-1.5 bg-[#F4FCFE] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bg} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const ContentScoreCard: React.FC<{ score: ContentScore }> = ({ score }) => {
  const c = getScoreColor(score.total);
  return (
    <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.18)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#49B7E3]" />
          <span className="text-xs font-semibold text-[#111111] uppercase tracking-wide">Content Score</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-4xl font-bold ${c.text}`}>{score.total}</div>
        <div className="flex-1">
          <div className="h-2 bg-[#F4FCFE] rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.bg} transition-all duration-700`} style={{ width: `${score.total}%` }} />
          </div>
          <div className="text-xs text-[#7A7A7A] mt-1">von 100 Punkten</div>
        </div>
      </div>
      <div className="space-y-2.5">
        <ScoreBar label="Lesbarkeit" value={score.readability} />
        <ScoreBar label="Hook-Stärke" value={score.hookStrength} />
        <ScoreBar label="Hashtag-Qualität" value={score.hashtagQuality} />
        <ScoreBar label="CTA-Klarheit" value={score.ctaClarity} />
        <ScoreBar label="Plattform-Fit" value={score.platformFit} />
      </div>
    </div>
  );
};

const ReviewModal: React.FC<ReviewModalProps> = ({
  generatedPosts,
  wizardMode,
  webhookResponse,
  onConfirm,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState<GeneratedPost[]>(generatedPosts);
  const [confirmedPosts, setConfirmedPosts] = useState<ContentSlot[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [designRegenLoading, setDesignRegenLoading] = useState<Record<string, boolean>>({});
  const [designRegenStatus, setDesignRegenStatus] = useState<Record<string, 'success' | 'error' | 'timeout' | null>>({});
  const [designRegenMessage, setDesignRegenMessage] = useState<Record<string, string>>({});
  const pollingRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const [textRegenLoading, setTextRegenLoading] = useState<Record<string, boolean>>({});
  const [textRegenStatus, setTextRegenStatus] = useState<Record<string, 'success' | 'error' | null>>({});
  const [textRegenMessage, setTextRegenMessage] = useState<Record<string, string>>({});

  const [formatConvertLoading, setFormatConvertLoading] = useState<Record<string, boolean>>({});
  const [formatConvertStatus, setFormatConvertStatus] = useState<Record<string, 'success' | 'error' | null>>({});
  const [formatConvertMessage, setFormatConvertMessage] = useState<Record<string, string>>({});
  const [formatConvertTarget, setFormatConvertTarget] = useState<Record<string, string>>({});
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const handleDesignRegen = async (postId: string) => {
    if (!postId) return;
    setDesignRegenLoading(prev => ({ ...prev, [postId]: true }));
    setDesignRegenStatus(prev => ({ ...prev, [postId]: null }));
    setDesignRegenMessage(prev => ({ ...prev, [postId]: '' }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const userId = sessionData?.session?.user?.id;
      if (!token || !userId) throw new Error('No session');

      const res = await fetch('https://n8n.vektrus.ai/webhook/vektrus-design-regen', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_record_id: postId, user_id: userId }),
      });

      const json = await res.json().catch(() => ({}));
      if (json?.success === false && json?.code === 'NO_BRAND_PROFILE') {
        setDesignRegenLoading(prev => ({ ...prev, [postId]: false }));
        setDesignRegenStatus(prev => ({ ...prev, [postId]: 'error' }));
        setDesignRegenMessage(prev => ({ ...prev, [postId]: 'NO_BRAND_PROFILE' }));
        return;
      }

      const startTime = Date.now();
      const interval = setInterval(async () => {
        if (Date.now() - startTime > 60000) {
          clearInterval(interval);
          delete pollingRefs.current[postId];
          setDesignRegenLoading(prev => ({ ...prev, [postId]: false }));
          setDesignRegenStatus(prev => ({ ...prev, [postId]: 'timeout' }));
          setDesignRegenMessage(prev => ({ ...prev, [postId]: 'Zeit abgelaufen. Bitte versuche es erneut.' }));
          return;
        }

        const { data } = await supabase
          .from('pulse_generated_content')
          .select('content')
          .eq('id', postId)
          .single();

        const status = data?.content?.design_status;

        if (status === 'success') {
          clearInterval(interval);
          delete pollingRefs.current[postId];
          const newImageUrl = data?.content?.design_image_url;
          setPosts(prev =>
            prev.map(p => p.id === postId ? { ...p, designImageUrl: newImageUrl, designStatus: 'success' } : p)
          );
          setDesignRegenLoading(prev => ({ ...prev, [postId]: false }));
          setDesignRegenStatus(prev => ({ ...prev, [postId]: 'success' }));
          setTimeout(() => setDesignRegenStatus(prev => ({ ...prev, [postId]: null })), 2500);
        } else if (status?.startsWith('failed_')) {
          clearInterval(interval);
          delete pollingRefs.current[postId];
          setDesignRegenLoading(prev => ({ ...prev, [postId]: false }));
          setDesignRegenStatus(prev => ({ ...prev, [postId]: 'error' }));
          setDesignRegenMessage(prev => ({ ...prev, [postId]: 'Design konnte nicht generiert werden. Erneut versuchen.' }));
        }
      }, 3000);

      pollingRefs.current[postId] = interval;
    } catch {
      setDesignRegenLoading(prev => ({ ...prev, [postId]: false }));
      setDesignRegenStatus(prev => ({ ...prev, [postId]: 'error' }));
      setDesignRegenMessage(prev => ({ ...prev, [postId]: 'Fehler beim Starten der Generierung.' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateCurrentPost({ imageUrl: url, imagePrompt: undefined, designImageUrl: undefined, designStatus: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    const remainingIds = posts.map(p => p.id).filter(Boolean);
    if (remainingIds.length > 0) {
      supabase
        .from('pulse_generated_content')
        .delete()
        .in('id', remainingIds)
        .then(({ error }) => {
          if (error) console.error('Error deleting remaining posts on close:', error);
        });
    }
    onClose();
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[var(--vektrus-radius-xl)] w-full max-w-lg p-8 shadow-modal">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(124, 108, 242, 0.08)' }}>
              <Sparkles className="w-10 h-10" style={{ color: 'var(--vektrus-ai-violet)' }} />
            </div>
            <h3 className="text-2xl font-bold text-[#111111] mb-4 font-manrope">Keine Posts generiert</h3>
            <p className="text-[#7A7A7A] mb-6 leading-relaxed">
              Es wurden noch keine Posts erstellt. Bitte versuche es erneut oder warte einen Moment.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[#49B7E3] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-all shadow-sm"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  const updateCurrentPost = (updates: Partial<GeneratedPost>) => {
    setPosts(prev =>
      prev.map((post, index) => (index === currentIndex ? { ...post, ...updates } : post))
    );
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else if (direction === 'next' && currentIndex < posts.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleFormatConvert = async (targetFormat: string) => {
    const postId = currentPost.id ?? '';
    if (!postId) return;
    setShowFormatDropdown(false);
    setFormatConvertLoading(prev => ({ ...prev, [postId]: true }));
    setFormatConvertStatus(prev => ({ ...prev, [postId]: null }));
    setFormatConvertMessage(prev => ({ ...prev, [postId]: '' }));
    setFormatConvertTarget(prev => ({ ...prev, [postId]: targetFormat }));

    try {
      console.log('[FormatConvert] Start:', { postId, targetFormat });

      const result = await convertPostFormat(postId, targetFormat);

      console.log('[FormatConvert] Result:', {
        success: result.success,
        hasContent: !!result.updated_content,
        format: result.updated_content?.content_format
      });

      if (!result.success || !result.updated_content) {
        console.warn('[FormatConvert] Keine updated_content in Response:', result);
        setFormatConvertLoading(prev => ({ ...prev, [postId]: false }));
        setFormatConvertStatus(prev => ({ ...prev, [postId]: 'error' }));
        setFormatConvertMessage(prev => ({ ...prev, [postId]: result.message || 'Konvertierung abgeschlossen, aber kein Ergebnis erhalten. Bitte Seite neu laden.' }));
        return;
      }

      const uc = result.updated_content as Record<string, unknown>;
      const newHashtags: string[] = Array.isArray(uc.hashtags)
        ? (uc.hashtags as string[]).map((h: string) => h.replace(/^#/, ''))
        : [];

      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          contentFormat: (uc.content_format as GeneratedPost['contentFormat']) ?? p.contentFormat,
          hook: (uc.hook as string) ?? p.hook,
          body: (uc.primary_text as string) ?? (uc.body as string) ?? p.body,
          cta: (uc.cta as string) ?? p.cta,
          hashtags: newHashtags.length ? newHashtags : p.hashtags,
          carouselSlides: Array.isArray(uc.carousel_slides) ? (uc.carousel_slides as GeneratedPost['carouselSlides']) : p.carouselSlides,
          imageUrl: (uc.image_url as string) ?? p.imageUrl,
          designImageUrl: (uc.design_image_url as string) ?? p.designImageUrl,
          designStatus: (uc.design_status as GeneratedPost['designStatus']) ?? p.designStatus,
        };
      }));

      console.log('[FormatConvert] ✅ Erfolgreich konvertiert zu:', uc.content_format);
      setFormatConvertLoading(prev => ({ ...prev, [postId]: false }));
      setFormatConvertStatus(prev => ({ ...prev, [postId]: 'success' }));
      setTimeout(() => setFormatConvertStatus(prev => ({ ...prev, [postId]: null })), 2000);
    } catch (err: unknown) {
      console.error('[FormatConvert] Error:', err);
      setFormatConvertLoading(prev => ({ ...prev, [postId]: false }));
      setFormatConvertStatus(prev => ({ ...prev, [postId]: 'error' }));
      setFormatConvertMessage(prev => ({
        ...prev,
        [postId]: err instanceof Error ? err.message : 'Konvertierung fehlgeschlagen',
      }));
    }
  };

  const handleRegenerateText = async () => {
    const postId = currentPost.id ?? '';
    if (!postId) return;

    setTextRegenLoading(prev => ({ ...prev, [postId]: true }));
    setTextRegenStatus(prev => ({ ...prev, [postId]: null }));
    setTextRegenMessage(prev => ({ ...prev, [postId]: '' }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const userId = sessionData?.session?.user?.id;
      if (!token || !userId) throw new Error('No session');

      const res = await fetch('https://n8n.vektrus.ai/webhook/vektrus-text-regen', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_record_id: postId, user_id: userId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);

      if (!data || data.success === false) {
        setTextRegenLoading(prev => ({ ...prev, [postId]: false }));
        setTextRegenStatus(prev => ({ ...prev, [postId]: 'error' }));
        setTextRegenMessage(prev => ({ ...prev, [postId]: 'Generierung fehlgeschlagen. Erneut versuchen.' }));
        setTimeout(() => setTextRegenStatus(prev => ({ ...prev, [postId]: null })), 4000);
        return;
      }

      const uc = data.updated_content;
      const newHashtags: string[] = Array.isArray(uc.hashtags)
        ? uc.hashtags.map((h: string) => h.replace(/^#/, ''))
        : [];

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, hook: uc.hook ?? p.hook, body: uc.primary_text ?? p.body, hashtags: newHashtags.length ? newHashtags : p.hashtags }
          : p
      ));

      setTextRegenLoading(prev => ({ ...prev, [postId]: false }));
      setTextRegenStatus(prev => ({ ...prev, [postId]: 'success' }));
      setTimeout(() => setTextRegenStatus(prev => ({ ...prev, [postId]: null })), 2000);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      setTextRegenLoading(prev => ({ ...prev, [postId]: false }));
      setTextRegenStatus(prev => ({ ...prev, [postId]: 'error' }));
      setTextRegenMessage(prev => ({
        ...prev,
        [postId]: isAbort
          ? 'Zeit abgelaufen. Bitte versuche es erneut.'
          : 'Generierung fehlgeschlagen. Erneut versuchen.',
      }));
      setTimeout(() => setTextRegenStatus(prev => ({ ...prev, [postId]: null })), 4000);
    }
  };

  const handleDiscard = async () => {
    const postToDiscard = posts[currentIndex];
    if (postToDiscard?.id) {
      supabase
        .from('pulse_generated_content')
        .delete()
        .eq('id', postToDiscard.id)
        .then(({ error }) => {
          if (error) console.error('Error deleting discarded post:', error);
        });
    }
    const newPosts = posts.filter((_, index) => index !== currentIndex);
    setPosts(newPosts);
    setShowDiscardConfirm(false);
    if (newPosts.length === 0) { onClose(); return; }
    if (currentIndex >= newPosts.length) setCurrentIndex(newPosts.length - 1);
  };

  const convertToContentSlot = (post: GeneratedPost, status: 'draft' | 'planned'): ContentSlot => ({
    id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: post.scheduledDate,
    time: post.scheduledTime,
    platform: post.platform as any,
    status: 'scheduled',
    title: post.title,
    content: `${post.hook}\n\n${post.body}\n\n${post.cta}`,
    contentType: post.type as any || 'post',
    hashtags: post.hashtags,
    tone: 'professional',
    cta: post.cta,
    media: (() => {
      const imageToUse = post.applyCI && post.designImageUrl ? post.designImageUrl : post.imageUrl;
      return imageToUse ? { type: 'image', url: imageToUse, prompt: post.imagePrompt } : undefined;
    })(),
    expectedPerformance: post.expectedPerformance,
  });

  const handleSaveAsDraft = () => {
    const draftPost = convertToContentSlot(currentPost, 'draft');
    setConfirmedPosts(prev => [...prev, draftPost]);
    if (currentIndex < posts.length - 1) setCurrentIndex(currentIndex + 1);
    else onConfirm([...confirmedPosts, draftPost]);
  };

  const handleSchedule = () => {
    const scheduledPost = convertToContentSlot(currentPost, 'planned');
    const updated = [...confirmedPosts, scheduledPost];
    setConfirmedPosts(updated);
    if (currentIndex < posts.length - 1) setCurrentIndex(currentIndex + 1);
    else onConfirm(updated);
  };

  const handleConfirmAll = () => {
    const allScheduled = posts.map(post => convertToContentSlot(post, 'planned'));
    onConfirm(allScheduled);
  };

  const platformLabel = getPlatformLabel(currentPost.platform);
  const platformColor = getPlatformColor(currentPost.platform);

  const isStoryPost = (post: GeneratedPost) =>
    post.contentFormat === 'story_teaser' || post.contentFormat === 'story_standalone';
  const currentIsStory = isStoryPost(currentPost);

  const currentPostId = currentPost.id ?? '';
  const isTextRegenLoading = !!textRegenLoading[currentPostId];
  const currentTextRegenStatus = textRegenStatus[currentPostId];
  const currentTextRegenMessage = textRegenMessage[currentPostId];

  const isFormatConverting = !!formatConvertLoading[currentPostId];
  const currentFormatConvertStatus = formatConvertStatus[currentPostId];
  const currentFormatConvertMessage = formatConvertMessage[currentPostId];
  const currentFormatConvertTarget = formatConvertTarget[currentPostId];
  const currentFormatOptions = getAvailableTargetFormats(currentPost.contentFormat || 'single_image', currentPost.platform || 'instagram');
  const showConvertButton = !isFormatConverting
    ? (currentPost.status !== 'published' && currentPost.status !== 'scheduled' && currentFormatOptions.length > 0)
    : true;

  const getFormatLabel = (fmt: string) => {
    const labels: Record<string, string> = {
      single_image: 'Einzelbild',
      carousel: 'Carousel',
      text_only: 'Text Only',
      story_teaser: 'Story Teaser',
      story_standalone: 'Story',
    };
    return labels[fmt] || fmt;
  };

  const hookCount = (currentPost.hook || '').length;
  const bodyCount = (currentPost.body || '').length;
  const hashtagText = Array.isArray(currentPost.hashtags)
    ? currentPost.hashtags.map(h => `#${h.replace(/^#+/, '')}`).join(' ')
    : '';
  const hashtagCount = getHashtagCount(hashtagText);

  const getSubtitle = (count: number, hasImages: boolean) => {
    if (count === 1) {
      return hasImages
        ? '1 Post wurde generiert — mit Bild im Brand-Stil.'
        : '1 Post wurde generiert.';
    }
    return hasImages
      ? `${count} Posts wurden generiert — mit Bildern im Brand-Stil.`
      : `${count} Posts wurden generiert.`;
  };

  const hasImages = posts.some(p => p.imageUrl);
  const platformsUsed = [...new Set(posts.map(p => getPlatformLabel(p.platform)))];
  const platformMeta = `Pulse • ${platformsUsed.join(', ')}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Bright frosted overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(244, 252, 254, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />
      <div
        className="rounded-[var(--vektrus-radius-xl)] w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col relative z-10"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)',
        }}
      >

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full pulse-gradient-icon flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#111111] font-manrope">
                  Deine strategischen Postings
                </h2>
                <span className="text-sm text-[#7A7A7A] font-normal">{platformMeta}</span>
              </div>
              <p className="text-sm text-[#7A7A7A] mt-1 ml-8">
                {getSubtitle(posts.length, hasImages)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmAll}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-[var(--vektrus-radius-sm)] font-medium text-sm transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)' }}
              >
                <CheckCheck className="w-4 h-4" />
                <span>Alle übernehmen</span>
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Post Navigation */}
        <div className="px-6 py-3 border-b border-[rgba(73,183,227,0.10)] bg-[#F4FCFE] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate('prev')}
                disabled={currentIndex === 0}
                className={`p-1.5 rounded-[var(--vektrus-radius-sm)] transition-colors ${
                  currentIndex === 0
                    ? 'text-[#7A7A7A]/30 cursor-not-allowed'
                    : 'text-[#7A7A7A] hover:text-[#49B7E3] hover:bg-[#F4FCFE]'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-[#7A7A7A] font-medium">
                Post {currentIndex + 1} von {posts.length}
              </span>
              <button
                onClick={() => handleNavigate('next')}
                disabled={currentIndex === posts.length - 1}
                className={`p-1.5 rounded-[var(--vektrus-radius-sm)] transition-colors ${
                  currentIndex === posts.length - 1
                    ? 'text-[#7A7A7A]/30 cursor-not-allowed'
                    : 'text-[#7A7A7A] hover:text-[#49B7E3] hover:bg-[#F4FCFE]'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {posts.map((post, index) => {
                const isStory = isStoryPost(post);
                const isActive = index === currentIndex;
                return (
                  <button
                    key={post.id || index}
                    onClick={() => setCurrentIndex(index)}
                    title={isStory ? (post.contentFormat === 'story_teaser' ? 'Story Teaser' : 'Story Standalone') : undefined}
                    className={`h-8 rounded-[var(--vektrus-radius-sm)] border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold gap-1 px-2 ${
                      isActive
                        ? isStory
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-transparent text-white'
                        : isStory
                          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400'
                          : 'border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-blue-300'
                    }`}
                    style={isActive && !isStory ? { background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)' } : undefined}
                  >
                    {isStory && <Smartphone className="w-2.5 h-2.5" />}
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left Column — Content Editor */}
          <div className="w-3/5 min-w-0 p-6 overflow-y-auto overflow-x-hidden border-r border-[rgba(73,183,227,0.10)]">
            <div className="space-y-6">

              {/* Platform Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <SocialIcon platform={currentPost.platform} size={40} branded={true} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#111111] text-base">{platformLabel}</span>
                    {currentIsStory && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                        currentPost.contentFormat === 'story_teaser'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        <Smartphone className="w-3.5 h-3.5" /> {currentPost.contentFormat === 'story_teaser' ? 'Story Teaser' : 'Story'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#7A7A7A]">Aktuell geplant für:</div>
                </div>
              </div>

              {/* Story info banner */}
              {currentIsStory && (
                <div className="bg-amber-50 border border-amber-200 rounded-[var(--vektrus-radius-md)] p-3">
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Dies ist eine Story</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Stories verschwinden nach 24 Stunden. Text und Design werden direkt im Story-Bild angezeigt.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling */}
              <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-lg)] p-4 border border-[rgba(73,183,227,0.18)]">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-[#49B7E3]" />
                  <span className="text-sm font-semibold text-[#111111]">Veröffentlichungszeit</span>
                  <span className="text-xs text-[#7A7A7A]">Wann soll dieser Post veröffentlicht werden?</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Datum
                    </label>
                    <input
                      type="date"
                      value={(() => {
                        const d = currentPost.scheduledDate instanceof Date
                          ? currentPost.scheduledDate
                          : new Date(currentPost.scheduledDate);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      })()}
                      onChange={(e) => {
                        const [y, m, day] = e.target.value.split('-').map(Number);
                        const newDate = new Date(y, m - 1, day, 12, 0, 0);
                        updateCurrentPost({ scheduledDate: newDate });
                      }}
                      className="w-full px-3 py-2.5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-medium focus:outline-none focus:border-[var(--vektrus-ai-violet)] focus:ring-2 focus:ring-[rgba(124,108,242,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Uhrzeit
                    </label>
                    <select
                      value={currentPost.scheduledTime}
                      onChange={(e) => updateCurrentPost({ scheduledTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-medium focus:outline-none focus:border-[var(--vektrus-ai-violet)] focus:ring-2 focus:ring-[rgba(124,108,242,0.15)] transition-all appearance-none"
                    >
                      <optgroup label="Morgens">
                        {['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'].map(t => (
                          <option key={t} value={t}>{t} Uhr</option>
                        ))}
                      </optgroup>
                      <optgroup label="Mittags">
                        {['11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'].map(t => (
                          <option key={t} value={t}>{t} Uhr</option>
                        ))}
                      </optgroup>
                      <optgroup label="Abends">
                        {['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map(t => (
                          <option key={t} value={t}>{t} Uhr</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {(() => {
                  const d = currentPost.scheduledDate instanceof Date
                    ? currentPost.scheduledDate
                    : new Date(currentPost.scheduledDate);
                  const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  return (
                    <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 rounded-[var(--vektrus-radius-sm)] px-3 py-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatScheduleDate(localDateStr, currentPost.scheduledTime)}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Text Regeneration + Format Convert Buttons — only for feed posts */}
              {!currentIsStory && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleRegenerateText}
                      disabled={isTextRegenLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-[var(--vektrus-radius-md)] text-sm font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={isTextRegenLoading
                        ? { backgroundColor: '#F3F4F6', color: '#9CA3AF', borderColor: '#E5E7EB' }
                        : { backgroundColor: 'rgba(124,108,242,0.06)', color: 'var(--vektrus-ai-violet)', borderColor: 'rgba(124,108,242,0.2)' }
                      }
                    >
                      {isTextRegenLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--vektrus-ai-violet)', borderTopColor: 'transparent' }} />
                          <span>Text wird neu generiert...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--vektrus-ai-violet)' }} />
                          <span>Text neu generieren</span>
                        </>
                      )}
                    </button>

                    {showConvertButton && (
                      <div className="relative">
                        <button
                          onClick={() => setShowFormatDropdown(prev => !prev)}
                          disabled={isFormatConverting}
                          className="flex items-center gap-2 px-4 py-2 rounded-[var(--vektrus-radius-md)] text-sm font-medium border transition-all disabled:cursor-not-allowed"
                          style={isFormatConverting
                            ? { backgroundColor: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A' }
                            : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
                          }
                        >
                          {isFormatConverting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#B45309', borderTopColor: 'transparent' }} />
                              <span>Wird konvertiert...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Format ändern</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {showFormatDropdown && !isFormatConverting && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowFormatDropdown(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 min-w-[260px] bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-lg z-50 overflow-hidden">
                              {currentFormatOptions.map((option, idx) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleFormatConvert(option.value)}
                                  className={`w-full text-left px-4 py-2.5 hover:bg-[#F4FCFE] transition-colors ${idx !== 0 ? 'border-t border-[rgba(73,183,227,0.10)]' : ''}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{option.icon}</span>
                                    <span className="text-sm font-medium text-[#111111]">{option.label}</span>
                                  </div>
                                  <p className="text-xs text-[#7A7A7A] mt-0.5 pl-6">{option.description}</p>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {currentTextRegenStatus === 'success' && (
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#49D69E' }}>
                        <Check className="w-3.5 h-3.5" />
                        <span>Text aktualisiert</span>
                      </div>
                    )}
                    {currentTextRegenStatus === 'error' && currentTextRegenMessage && (
                      <span className="text-xs" style={{ color: '#FA7E70' }}>
                        {currentTextRegenMessage}
                      </span>
                    )}
                    {currentFormatConvertStatus === 'success' && (
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#49D69E' }}>
                        <Check className="w-3.5 h-3.5" />
                        <span>Post wurde zu {getFormatLabel(currentFormatConvertTarget)} konvertiert</span>
                      </div>
                    )}
                    {currentFormatConvertStatus === 'error' && currentFormatConvertMessage && (
                      <span className="text-xs" style={{ color: '#FA7E70' }}>
                        {currentFormatConvertMessage}
                      </span>
                    )}
                  </div>

                  {isFormatConverting && (
                    <div className="rounded-[var(--vektrus-radius-md)] border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mt-0.5 flex-shrink-0" style={{ borderColor: '#B45309', borderTopColor: 'transparent' }} />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Format wird konvertiert...</p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Text und Bilder werden angepasst. Das kann bis zu 60 Sekunden dauern.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Story-specific read-only fields */}
              {currentIsStory ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-[#7A7A7A]" />
                      <span className="text-sm font-semibold text-[#111111]">Text-Overlay</span>
                      <span className="text-xs text-[#7A7A7A]">(wird im Bild angezeigt)</span>
                    </div>
                    <div className="w-full px-4 py-3 border border-amber-200 rounded-[var(--vektrus-radius-md)] text-base font-semibold text-[#111111] bg-amber-50">
                      {currentPost.hook || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-[#7A7A7A]" />
                      <span className="text-sm font-semibold text-[#111111]">Subtext</span>
                    </div>
                    <div className="w-full px-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm text-[#7A7A7A] bg-[#F4FCFE]">
                      {currentPost.body || '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4FCFE] text-[#111111]">
                      <Drama className="w-3.5 h-3.5" /> professionell
                    </span>
                    {currentPost.contentFormat === 'story_teaser' && (
                      <span className="text-xs text-[#7A7A7A]">
                        <Link className="w-3 h-3 inline-block mr-1" />Teaser für den zugehörigen Feed-Post
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Hook */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Type className="w-4 h-4 text-[#7A7A7A]" />
                      <span className="text-sm font-semibold text-[#111111]">Hook/Aufmacher</span>
                      <div className="relative group">
                        <button className="w-4 h-4 rounded-full bg-[#B6EBF7]/20 text-[#7A7A7A] text-[10px] flex items-center justify-center hover:bg-[#B6EBF7]/30 transition-colors">
                          i
                        </button>
                        <div className="absolute left-6 top-0 w-64 bg-gray-900 text-white text-xs rounded-[var(--vektrus-radius-sm)] px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Die erste Zeile deines Posts — sie entscheidet ob jemand weiterliest. Kurz, neugierig machend, emotional.
                        </div>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={currentPost.hook || ''}
                      onChange={(e) => updateCurrentPost({ hook: e.target.value })}
                      className="w-full px-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm text-[#111111] font-medium focus:outline-none focus:border-[var(--vektrus-ai-violet)] focus:ring-2 focus:ring-[rgba(124,108,242,0.15)] transition-all resize-none placeholder:text-[#B0B0B0]"
                      style={{ opacity: isTextRegenLoading ? 0.5 : 1 }}
                      placeholder="Aufmerksamkeitsstarker Einstieg..."
                    />
                    <div className={`text-right text-xs mt-1 ${getCharCountColor(hookCount, 150)}`}>
                      {hookCount} / 150 Zeichen
                    </div>
                    {isTextRegenLoading && (
                      <p className="text-xs mt-1" style={{ color: '#7A7A7A', fontFamily: 'Inter, sans-serif' }}>
                        Text wird neu generiert...
                      </p>
                    )}
                  </div>

                  <div className="border-t border-dashed border-[rgba(73,183,227,0.18)]" />

                  {/* Post Body */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <FileText className="w-4 h-4 text-[#7A7A7A]" />
                      <span className="text-sm font-semibold text-[#111111]">Post-Inhalt</span>
                    </div>
                    <textarea
                      rows={7}
                      value={currentPost.body || ''}
                      onChange={(e) => updateCurrentPost({ body: e.target.value })}
                      className="w-full px-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm text-[#111111] focus:outline-none focus:border-[var(--vektrus-ai-violet)] focus:ring-2 focus:ring-[rgba(124,108,242,0.15)] transition-all resize-y placeholder:text-[#B0B0B0]"
                      style={{ opacity: isTextRegenLoading ? 0.5 : 1 }}
                      placeholder="Hauptinhalt des Posts..."
                    />
                    <div className={`text-right text-xs mt-1 ${getCharCountColor(bodyCount, 2200)}`}>
                      {bodyCount} / 2.200 Zeichen
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Hash className="w-4 h-4 text-[#7A7A7A]" />
                      <span className="text-sm font-semibold text-[#111111]">Hashtags</span>
                    </div>
                    <div className="flex flex-wrap gap-2 p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] min-h-[60px] bg-white focus-within:border-[#49B7E3] focus-within:ring-2 focus-within:ring-[#49B7E3]/20 transition-all" style={{ opacity: isTextRegenLoading ? 0.5 : 1 }}>
                      {(currentPost.hashtags || []).map((hashtag, index) => {
                        const cleanTag = hashtag.replace(/^#+/, '');
                        return (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 bg-[rgba(73,183,227,0.08)] text-[#2a7da0] rounded-[var(--vektrus-radius-sm)] text-xs font-medium"
                        >
                          #{cleanTag}
                          <button
                            onClick={() =>
                              updateCurrentPost({
                                hashtags: currentPost.hashtags.filter((_, i) => i !== index),
                              })
                            }
                            className="ml-1.5 text-[#49B7E3] hover:text-[#3a9fd1]"
                          >
                            ×
                          </button>
                        </span>
                        );
                      })}
                      <input
                        type="text"
                        placeholder={currentPost.hashtags?.length === 0 ? '#socialmedia #marketing' : 'Hinzufügen...'}
                        className="flex-1 min-w-[100px] outline-none text-sm text-[#111111] placeholder:text-[#B0B0B0]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim().replace(/^#/, '');
                            if (value && !(currentPost.hashtags || []).includes(value)) {
                              updateCurrentPost({ hashtags: [...(currentPost.hashtags || []), value] });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#7A7A7A]">
                        {currentPost.platform === 'instagram' ? 'Instagram' : currentPost.platform === 'linkedin' ? 'LinkedIn' : currentPost.platform === 'twitter' ? 'X (Twitter)' : currentPost.platform === 'facebook' ? 'Facebook' : currentPost.platform === 'tiktok' ? 'TikTok' : 'Die Plattform'} empfiehlt 3–5 relevante Hashtags für maximale Reichweite
                      </span>
                      <span className={`text-xs ${getCharCountColor(hashtagCount, 30)}`}>
                        {hashtagCount} / 30 Hashtags
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column — Media */}
          <div className="w-2/5 min-w-0 p-6 overflow-y-auto overflow-x-hidden bg-[#F4FCFE]">
            <div className="space-y-5">
              {/* Story preview — 9:16 phone-frame */}
              {currentIsStory && (() => {
                const ds = currentPost.designStatus;
                const isPending = ds === 'pending' || ds === 'regenerating';
                const isFailed = ds === 'failed_generation' || ds === 'failed_timeout' || ds === 'failed_quality' || ds === 'failed_download';
                const hasDesignImage = ds === 'success' && !!currentPost.designImageUrl;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111111] text-sm">Vorschau</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold bg-amber-100 text-amber-700">
                        <Smartphone className="w-3 h-3" /> Story · 9:16
                      </span>
                    </div>
                    {/* Phone frame */}
                    <div className="mx-auto" style={{ maxWidth: 220 }}>
                      <div className="rounded-3xl overflow-hidden shadow-xl" style={{ background: '#1a1a1a', padding: 8 }}>
                        <div className="relative overflow-hidden" style={{ aspectRatio: '9/16', borderRadius: 20, background: '#2a2a2a' }}>
                          {isPending ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#49B7E3', borderTopColor: 'transparent' }} />
                              <p className="text-xs text-[#B0B0B0] text-center px-4">Story-Design wird generiert...</p>
                            </div>
                          ) : isFailed ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                              <AlertTriangle className="w-6 h-6 text-[#7A7A7A]" />
                              <p className="text-xs text-[#7A7A7A]">Story-Design fehlgeschlagen</p>
                            </div>
                          ) : hasDesignImage ? (
                            <img
                              src={currentPost.designImageUrl!}
                              alt="Story Design"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                              <Smartphone className="w-8 h-8 text-[#7A7A7A]" />
                              <p className="text-xs text-[#7A7A7A]">Story Preview</p>
                            </div>
                          )}
                          {/* Story label overlay */}
                          <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                            Story
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Text below frame */}
                    {currentPost.hook && (
                      <div className="text-center px-2 space-y-1">
                        <p className="text-sm font-semibold text-[#111111] leading-tight">{currentPost.hook}</p>
                        {currentPost.body && (
                          <p className="text-xs text-[#7A7A7A] leading-snug">{currentPost.body}</p>
                        )}
                      </div>
                    )}

                    {/* Story media actions */}
                    {!hasDesignImage && !isPending && (
                      <div className="rounded-[var(--vektrus-radius-md)] border border-amber-200 bg-amber-50 p-4 space-y-3">
                        <div className="text-center">
                          <p className="text-xs font-semibold text-amber-800">Story-Visual hinzufügen</p>
                          <p className="text-[11px] text-amber-600 mt-0.5">
                            Lade dein eigenes Story-Bild hoch oder lass die KI eines generieren.
                          </p>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Hochladen</span>
                          </button>
                          <button
                            onClick={() => handleDesignRegen(currentPost.id ?? '')}
                            disabled={!!designRegenLoading[currentPost.id ?? '']}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>KI generieren</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {!currentIsStory && (() => {
                const contentFormat: ContentFormat = currentPost.contentFormat || 'single_image';
                const isCarousel = contentFormat === 'carousel';
                const isTextOnly = contentFormat === 'text_only';

                if (isCarousel && currentPost.carouselSlides && currentPost.carouselSlides.length > 0) {
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111111] text-sm">Slides</span>
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold text-white"
                          style={{ backgroundColor: '#49B7E3' }}
                        >
                          <LayoutGrid className="w-3 h-3" /> {currentPost.carouselSlides.length} Slides
                        </span>
                      </div>
                      <CarouselSlideNavigator slides={currentPost.carouselSlides} />
                      <CarouselExpandedList
                        slides={currentPost.carouselSlides}
                        currentSlide={-1}
                        onSelect={() => {}}
                      />
                    </>
                  );
                }

                if (isTextOnly) {
                  return (
                    <>
                      <div className="font-semibold text-[#111111] text-sm">Format</div>
                      <div className="rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)] bg-white flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <PenLine className="w-5 h-5 text-[#49B7E3]" />
                          <div>
                            <div className="text-sm font-semibold text-[#111111]">Text-Only Post</div>
                            <div className="text-xs text-[#7A7A7A]">Kein Bild — der Text steht im Vordergrund</div>
                          </div>
                        </div>
                        <div
                          className="mt-2 rounded-[var(--vektrus-radius-sm)] p-3 text-sm text-[#111111] leading-relaxed border-l-4"
                          style={{ backgroundColor: '#F4FCFE', borderLeftColor: platformColor }}
                        >
                          {currentPost.hook && <span className="font-semibold">{currentPost.hook} </span>}
                          {currentPost.body}
                        </div>
                      </div>
                    </>
                  );
                }

                return null;
              })()}

              {!currentIsStory && (currentPost.contentFormat === 'single_image' || !currentPost.contentFormat) && currentPost.imageUrl ? (
                <div>
                  {(() => {
                    const ds = currentPost.designStatus;
                    const postId = currentPost.id ?? '';
                    const isSuccess = ds === 'success' || (!ds && currentPost.applyCI && !!currentPost.designImageUrl);
                    const isNoBrand = ds === 'no_brand_profile';
                    const isFailed = ds === 'failed_timeout' || ds === 'failed_download' || ds === 'failed_generation';
                    const showDesignImage = isSuccess && !!currentPost.designImageUrl;
                    const displayImage = showDesignImage ? currentPost.designImageUrl! : currentPost.imageUrl!;

                    const isRegenLoading = !!designRegenLoading[postId];
                    const regenStatus = designRegenStatus[postId];
                    const regenMsg = designRegenMessage[postId];

                    const showRegenButton = postId && (isSuccess || isFailed);
                    const showNoBrandInline = regenMsg === 'NO_BRAND_PROFILE';

                    return (
                      <div>
                        <div className="relative group rounded-[var(--vektrus-radius-lg)] overflow-hidden bg-[#F4FCFE] aspect-square">
                          <img
                            src={displayImage}
                            alt="Post Media"
                            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isRegenLoading ? 'opacity-60' : ''}`}
                          />
                          {showDesignImage && !isRegenLoading && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold tracking-wide" style={{ backgroundColor: '#22c55e' }}>
                              <Check className="w-2.5 h-2.5" />
                              <span>Design aktiv</span>
                            </div>
                          )}
                          {isRegenLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/30 backdrop-blur-[2px]">
                              <div
                                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                                style={{ borderColor: '#7C6CF2', borderTopColor: 'transparent' }}
                              />
                              <span className="text-[13px] font-medium" style={{ color: '#7C6CF2', fontFamily: 'Inter, sans-serif' }}>
                                Generiere Design...
                              </span>
                            </div>
                          )}
                          {regenStatus === 'success' && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold tracking-wide animate-pulse" style={{ backgroundColor: '#49D69E' }}>
                              <Check className="w-2.5 h-2.5" />
                              <span>Design aktualisiert</span>
                            </div>
                          )}
                          <button
                            onClick={() => updateCurrentPost({ imageUrl: undefined, imagePrompt: undefined })}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-[#7A7A7A] hover:text-red-500" />
                          </button>
                        </div>

                        {isRegenLoading && (
                          <p className="mt-2 text-[13px]" style={{ color: '#7A7A7A', fontFamily: 'Inter, sans-serif' }}>
                            Design wird neu generiert...
                          </p>
                        )}

                        {!isRegenLoading && regenStatus === 'error' && !showNoBrandInline && regenMsg && (
                          <p className="mt-2 text-[13px]" style={{ color: '#FA7E70', fontFamily: 'Inter, sans-serif' }}>
                            {regenMsg}
                          </p>
                        )}

                        {!isRegenLoading && regenStatus === 'timeout' && regenMsg && (
                          <p className="mt-2 text-[13px]" style={{ color: '#FA7E70', fontFamily: 'Inter, sans-serif' }}>
                            {regenMsg}
                          </p>
                        )}

                        {!isRegenLoading && showNoBrandInline && (
                          <div className="mt-2 rounded-[var(--vektrus-radius-md)] px-3 py-2.5 flex flex-col gap-1.5" style={{ backgroundColor: '#EBF8FD', border: '1px solid #B6EBF7' }}>
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#49B7E3' }} />
                              <p className="text-[13px] leading-snug" style={{ color: '#1a6f8a', fontFamily: 'Inter, sans-serif' }}>
                                Kein Brand Profile vorhanden. Richte dein Brand Studio ein.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('navigate-to-brand-studio');
                                window.dispatchEvent(event);
                              }}
                              className="self-start flex items-center gap-1 text-[12px] font-medium transition-colors"
                              style={{ color: '#49B7E3' }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Brand Studio einrichten
                            </button>
                          </div>
                        )}

                        {isNoBrand && !showNoBrandInline && (
                          <div className="mt-2 rounded-[var(--vektrus-radius-md)] px-3 py-2.5 flex flex-col gap-1.5" style={{ backgroundColor: '#EBF8FD', border: '1px solid #B6EBF7' }}>
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#49B7E3' }} />
                              <p className="text-[13px] leading-snug" style={{ color: '#1a6f8a', fontFamily: 'Inter, sans-serif' }}>
                                {currentPost.designStatusMessage || 'Kein Brand Profile gefunden. Richte dein Brand Studio ein, um CI-Designs zu erhalten.'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const event = new CustomEvent('navigate-to-brand-studio');
                                window.dispatchEvent(event);
                              }}
                              className="self-start flex items-center gap-1 text-[12px] font-medium transition-colors"
                              style={{ color: '#49B7E3' }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Brand Studio einrichten
                            </button>
                          </div>
                        )}

                        {isFailed && !showRegenButton && (
                          <div className="mt-2 rounded-[var(--vektrus-radius-md)] px-3 py-2.5" style={{ backgroundColor: '#FFF7EE', border: '1px solid #F4BE9D' }}>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#d97706' }} />
                              <p className="text-[13px] leading-snug" style={{ color: '#92400e', fontFamily: 'Inter, sans-serif' }}>
                                {currentPost.designStatusMessage || 'Das Design konnte nicht generiert werden. Das Originalfoto wird verwendet.'}
                              </p>
                            </div>
                          </div>
                        )}

                        {showRegenButton && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleDesignRegen(postId)}
                              disabled={isRegenLoading}
                              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#EEE8FF', color: '#7C6CF2' }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Design neu generieren
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[#49B7E3]/30 hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ersetzen</span>
                    </button>
                    <a
                      href={getPostImageUrl(currentPost)}
                      download={`pulse_post_${currentIndex + 1}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[#49B7E3]/30 hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ) : currentIsStory ? null : (
                <div>
                  <div className="aspect-square border-2 border-dashed border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-lg)] flex flex-col items-center justify-center bg-white gap-2">
                    <Image className="w-8 h-8 text-[#B0B0B0]" />
                    <span className="text-sm text-[#7A7A7A]">Kein Bild</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowAiImageModal(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--vektrus-ai-violet)] hover:opacity-90 text-white rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>KI generieren</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Hochladen</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Preview */}
              <div className="bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.18)] overflow-hidden">
                <div className="px-4 pt-4 pb-2 border-b border-[rgba(73,183,227,0.10)]">
                  <span className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wide">Vorschau</span>
                </div>
                <div className="p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      <SocialIcon platform={currentPost.platform} size={28} branded={true} />
                    </div>
                    <span className="text-xs font-semibold text-[#111111]">{platformLabel}</span>
                  </div>
                  {(() => {
                    const ds = currentPost.designStatus;
                    const isSuccess = ds === 'success' || (!ds && currentPost.applyCI && !!currentPost.designImageUrl);
                    const previewImg = (isSuccess && currentPost.designImageUrl) ? currentPost.designImageUrl : currentPost.imageUrl;
                    return previewImg ? (
                      <div className="relative mb-2">
                        <img
                          src={previewImg}
                          alt=""
                          className="w-full aspect-square object-cover rounded-[var(--vektrus-radius-sm)]"
                          loading="lazy"
                        />
                        {isSuccess && currentPost.designImageUrl && (
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white text-[9px] font-semibold" style={{ backgroundColor: '#22c55e' }}>
                            <Check className="w-2 h-2" />
                            <span>CI Design</span>
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  <div className="text-xs text-[#111111] font-medium leading-relaxed line-clamp-2 mb-1">
                    {currentPost.hook}
                  </div>
                  <div className="text-xs text-[#7A7A7A] line-clamp-2">{currentPost.body}</div>
                  {(currentPost.hashtags?.length ?? 0) > 0 && (
                    <div className="text-xs text-[#49B7E3] mt-1">
                      {(currentPost.hashtags || []).slice(0, 4).map(t => `#${t.replace(/^#+/, '')}`).join(' ')}
                      {(currentPost.hashtags?.length ?? 0) > 4 && ` +${(currentPost.hashtags?.length ?? 0) - 4}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Score */}
              {currentPost.contentScore && (
                <ContentScoreCard score={currentPost.contentScore} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowDiscardConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-[var(--vektrus-radius-sm)] font-medium text-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Verwerfen</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAsDraft}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[rgba(73,183,227,0.18)] hover:border-[#49B7E3] text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[10px] font-medium text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Als Entwurf speichern</span>
              </button>
              <button
                onClick={handleSchedule}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#49B7E3] hover:bg-[#3a9fd1] text-white rounded-[10px] font-semibold text-sm transition-all shadow-card hover:shadow-elevated"
              >
                <Check className="w-4 h-4" />
                <span>In Kalender übernehmen</span>
              </button>
            </div>
          </div>

          <div className="mt-2.5 text-center text-xs text-[#7A7A7A]">
            {confirmedPosts.length} von {posts.length} Posts bestätigt • Generiert von Vektrus KI
          </div>
        </div>
      </div>

      {/* Discard Confirm Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-sm p-6 shadow-elevated">
            <h3 className="text-lg font-semibold text-[#111111] mb-2">Post verwerfen?</h3>
            <p className="text-sm text-[#7A7A7A] mb-5">
              Bist du sicher? Der Post wird unwiderruflich gelöscht.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] text-[#111111] rounded-[var(--vektrus-radius-sm)] text-sm font-medium hover:bg-[#F4FCFE] transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 px-4 py-2.5 bg-[#FA7E70] hover:bg-[#f96555] text-white rounded-[var(--vektrus-radius-sm)] text-sm font-medium transition-colors"
              >
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Image Generation Modal */}
      {showAiImageModal && (
        <AiImageGenerationModal
          initialPrompt={currentPost.hook ? `${currentPost.hook} — ${currentPost.body || ''}`.slice(0, 300) : ''}
          onGenerate={(imageUrl) => {
            updateCurrentPost({ imageUrl, imagePrompt: undefined, designImageUrl: undefined, designStatus: undefined });
            setShowAiImageModal(false);
          }}
          onClose={() => setShowAiImageModal(false)}
        />
      )}

    </div>
  );
};

export default ReviewModal;
