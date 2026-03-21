import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Save, Copy, Wand2, Clock, Hash, Image, Type, Zap, MessageSquare, Upload, Sparkles, Check, Send, ChevronDown, CalendarClock, AlertCircle, Loader2, FileText, BookOpen, Film, Layers, Briefcase, Smile, GraduationCap, ArrowRight } from 'lucide-react';
import { ContentSlot } from './types';
import AiImageGenerationModal from './AiImageGenerationModal';
import AIRewritePanel from './AIRewritePanel';
import { ButtonLoading } from './LoadingStates';
import { postToSocialMedia, checkAccountAvailable, getPostErrorMessage } from '../../services/socialPostingService';
import type { PostResponse } from '../../services/socialPostingService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/toast';
import { formatContentForCopy, getContentTypeBadgeText, getEngagementColor, getEngagementText } from '../../lib/contentParser';

// Mock MediaItem interface für die Sidebar
interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  format: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  dimensions: { width: number; height: number };
  createdAt: Date;
  source: 'upload' | 'ai_generated';
  tags: string[];
  isFavorite: boolean;
  usedIn: Array<{
    platform: string;
    postTitle: string;
    date: Date;
  }>;
  aiPrompt?: string;
  inspirationImage?: string;
}

interface ContentSlotEditorProps {
  slot: ContentSlot;
  onUpdate: (slot: ContentSlot) => void;
  onClose: () => void;
  onPostStatusChange?: (slotId: string, status: ContentSlot['status'], publishedAt?: string) => void;
}

const ensureDate = (d: Date | string): Date => {
  if (d instanceof Date) return d;
  return new Date(d);
};

const ContentSlotEditor: React.FC<ContentSlotEditorProps> = ({ slot, onUpdate, onClose, onPostStatusChange }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [editedSlot, setEditedSlot] = useState<ContentSlot>(() => ({
    ...slot,
    date: ensureDate(slot.date),
  }));
  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [selectedLibraryMedia, setSelectedLibraryMedia] = useState<MediaItem | null>(null);
  const [showAIRewrite, setShowAIRewrite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostDropdown, setShowPostDropdown] = useState(false);
  const [accountConnected, setAccountConnected] = useState<boolean | null>(null);
  const [postResult, setPostResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransformingSource, setIsTransformingSource] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(!!slot.sourceMaterial);
  const initialSlotRef = useRef(slot);
  const postDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);

  const standardTimes = [
    '06:00','07:00','08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00','19:00',
    '20:00','21:00','22:00',
  ];
  const isCustomTime = editedSlot.time && !standardTimes.includes(editedSlot.time);

  const formatLocalDate = (d: Date | string): string => {
    const date = ensureDate(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocalDate(new Date());

  useEffect(() => {
    const platform = editedSlot.platform;
    checkAccountAvailable(platform).then(setAccountConnected);
  }, [editedSlot.platform]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (postDropdownRef.current && !postDropdownRef.current.contains(e.target as Node)) {
        setShowPostDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (postResult) {
      const timer = setTimeout(() => setPostResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [postResult]);

  const handlePost = async (publishNow: boolean) => {
    setShowPostDropdown(false);
    setIsPosting(true);
    setPostResult(null);

    try {
      const scheduledDate = editedSlot.date instanceof Date
        ? editedSlot.date
        : new Date(editedSlot.date);

      if (editedSlot.time) {
        const [hours, minutes] = editedSlot.time.split(':').map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);
      }

      const response: PostResponse = await postToSocialMedia(
        {
          id: editedSlot.id,
          platform: editedSlot.platform,
          body: editedSlot.body || editedSlot.content || '',
          hashtags: editedSlot.hashtags,
          scheduled_date: scheduledDate,
          media: editedSlot.media,
        },
        publishNow
      );

      const newStatus = response.status === 'published' ? 'published' : 'scheduled';
      const updatedSlot = {
        ...editedSlot,
        status: newStatus as ContentSlot['status'],
        publishedAt: response.status === 'published' ? new Date().toISOString() : undefined,
      };

      setEditedSlot(updatedSlot);
      onPostStatusChange?.(editedSlot.id, newStatus, updatedSlot.publishedAt);

      if (response.status === 'published') {
        setPostResult({
          type: 'success',
          message: `Post erfolgreich auf ${editedSlot.platform} veröffentlicht!`,
        });
      } else {
        const formattedDate = scheduledDate.toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
        setPostResult({
          type: 'success',
          message: `Post geplant für ${formattedDate}`,
        });
      }
    } catch (error: any) {
      const message = getPostErrorMessage(error);
      setPostResult({ type: 'error', message });
      onPostStatusChange?.(editedSlot.id, 'failed');
    } finally {
      setIsPosting(false);
    }
  };

  const loadMediaLibrary = async () => {
    if (!user?.id) return;

    setIsLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedMedia: MediaItem[] = (data || []).map(file => ({
        id: file.id,
        name: file.filename,
        type: file.file_type.startsWith('image') ? 'image' : 'video',
        format: file.file_type.split('/')[1]?.toUpperCase() || 'JPG',
        url: file.public_url,
        thumbnailUrl: file.public_url,
        size: 0,
        dimensions: { width: 1080, height: 1080 },
        createdAt: new Date(file.created_at),
        source: file.generated_by === 'upload' ? 'upload' : 'ai_generated',
        tags: [],
        isFavorite: false,
        usedIn: [],
        aiPrompt: file.generation_prompt || undefined,
      }));

      setMediaLibrary(mappedMedia);
    } catch (error) {
      console.error('Error loading media library:', error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    loadMediaLibrary();
  }, [user?.id]);

  const contentTypes = [
    { id: 'post', label: 'Post', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'story', label: 'Story', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'reel', label: 'Reel', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'carousel', label: 'Carousel', icon: <Layers className="w-3.5 h-3.5" /> }
  ];

  const tones = [
    { id: 'professional', label: 'Professionell', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'casual', label: 'Locker', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'inspiring', label: 'Inspirierend', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'educational', label: 'Lehrreich', icon: <GraduationCap className="w-3.5 h-3.5" /> }
  ];

  const ctaOptions = [
    'Mehr erfahren', 'Jetzt buchen', 'Link in Bio', 'DM für Details',
    'Kommentiere unten', 'Teile deine Meinung', 'Folge für mehr', 'Speichere diesen Post'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedSlot);
    } catch {
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    onClose();
  };

  const handleApplyRewrite = (newContent: string, tone: string) => {
    setEditedSlot(prev => ({
      ...prev,
      body: newContent,
      content: newContent,
      tone: tone as any,
      version: {
        original: prev.version?.original || prev.body || prev.content || '',
        edited: newContent,
        lastModified: new Date()
      }
    }));
    setShowAIRewrite(false);
  };

  const generateHashtags = () => {
    const aiHashtags = [
      '#business', '#entrepreneur', '#success', '#growth', '#motivation',
      '#innovation', '#leadership', '#strategy', '#marketing', '#productivity'
    ];
    setEditedSlot(prev => ({
      ...prev,
      hashtags: aiHashtags.slice(0, 5)
    }));
  };

  const handleAiImageGenerated = (imageUrl: string) => {
    setEditedSlot(prev => ({
      ...prev,
      media: {
        ...prev.media,
        type: 'image',
        url: imageUrl
      }
    }));
    setShowAiImageModal(false);
    loadMediaLibrary();
  };

  const handleMediaLibrarySelect = (media: MediaItem) => {
    setSelectedLibraryMedia(media);
  };

  const handleInsertFromLibrary = (media: MediaItem) => {
    setEditedSlot(prev => ({
      ...prev,
      media: {
        ...prev.media,
        type: media.type,
        url: media.url,
        style: media.type === 'video' ? undefined : 'photo'
      }
    }));
    setShowMediaLibrary(false);
    setSelectedLibraryMedia(null);
  };

  const validateVideo = (file: File): { valid: boolean; error?: string } => {
    if (file.size > 100 * 1024 * 1024) {
      return { valid: false, error: 'Video darf maximal 100MB groß sein.' };
    }

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Nur MP4, MOV und WebM Videos sind erlaubt.' };
    }

    return { valid: true };
  };

  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const processFileUpload = async (file: File) => {
    if (!user?.id) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      addToast('Nur Bilder und Videos sind erlaubt.', 'error');
      return;
    }

    if (isVideo) {
      const validation = validateVideo(file);
      if (!validation.valid) {
        addToast(validation.error || 'Video-Validierung fehlgeschlagen', 'error');
        return;
      }

      const duration = await checkVideoDuration(file);
      if (duration > 90) {
        addToast('Video ist zu lang. Maximum: 90 Sekunden für Reels.', 'error');
        return;
      }
    }

    if (editedSlot.media?.type === 'video' && isImage) {
      addToast('Du kannst kein Bild zu einem Video-Post hinzufügen.', 'error');
      return;
    }

    if (editedSlot.media?.type === 'image' && isVideo) {
      addToast('Du kannst kein Video zu einem Bild-Post hinzufügen. Entferne zuerst das Bild.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const bucket = isVideo ? 'temp-videos' : 'user-images';
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        addToast('Fehler beim Hochladen', 'error');
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setEditedSlot(prev => ({
        ...prev,
        media: {
          type: isVideo ? 'video' : 'image',
          url: urlData.publicUrl,
          style: isVideo ? undefined : 'photo'
        }
      }));

      addToast(`${isVideo ? 'Video' : 'Bild'} erfolgreich hochgeladen!`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Fehler beim Hochladen', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFileUpload(file);
  }, [editedSlot.media, user?.id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ── Status & layout helpers ──

  const isNewPost = editedSlot.id.startsWith('temp-') || editedSlot.id.startsWith('chat-');

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Entwurf', scheduled: 'Geplant', published: 'Veröffentlicht',
      failed: 'Fehlgeschlagen', planned: 'Geplant', ai_suggestion: 'KI-Vorschlag',
      rejected: 'Abgelehnt',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-[#F4BE9D]/20 text-[#D4864A]',
      scheduled: 'bg-[#49B7E3]/15 text-[#49B7E3]',
      published: 'bg-[#49D69E]/15 text-[#1a7a4c]',
      failed: 'bg-[#FA7E70]/15 text-[#c0392b]',
      ai_suggestion: 'bg-[rgba(124,108,242,0.10)] text-[var(--vektrus-ai-violet)]',
      planned: 'bg-[#49B7E3]/15 text-[#49B7E3]',
      rejected: 'bg-[#FA7E70]/10 text-[#c0392b]',
    };
    return colors[status] || 'bg-gray-100 text-[#7A7A7A]';
  };

  const platformCharLimits: Record<string, number> = {
    twitter: 280, instagram: 2200, linkedin: 3000, facebook: 63206, tiktok: 2200,
  };
  const currentCharLimit = platformCharLimits[editedSlot.platform] || 2200;
  const currentCharCount = (editedSlot.body || editedSlot.content || '').length;

  // ── Unsaved changes detection ──

  const hasUnsavedChanges = useMemo(() => {
    const initial = initialSlotRef.current;
    return (
      editedSlot.title !== initial.title ||
      (editedSlot.body || '') !== (initial.body || '') ||
      (editedSlot.content || '') !== (initial.content || '') ||
      editedSlot.platform !== initial.platform ||
      editedSlot.time !== initial.time ||
      formatLocalDate(editedSlot.date) !== formatLocalDate(initial.date) ||
      editedSlot.contentType !== initial.contentType ||
      editedSlot.tone !== initial.tone ||
      (editedSlot.cta || '') !== (initial.cta || '') ||
      editedSlot.hashtags.join(',') !== initial.hashtags.join(',') ||
      editedSlot.media?.url !== initial.media?.url ||
      editedSlot.pillar !== initial.pillar ||
      editedSlot.funnelStage !== initial.funnelStage ||
      (editedSlot.targetAudience || '') !== (initial.targetAudience || '')
    );
  }, [editedSlot]);

  const handleCloseAttempt = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleDiscardAndClose = useCallback(() => {
    setShowCloseConfirm(false);
    onClose();
  }, [onClose]);

  const handleSaveAndClose = useCallback(async () => {
    setShowCloseConfirm(false);
    await handleSave();
  }, [handleSave]);

  // ── Smart empty state ideas ──

  const contentIdeas = useMemo(() => {
    const ideas: Record<string, Array<{ label: string; prompt: string }>> = {
      instagram: [
        { label: 'Behind the Scenes', prompt: 'Ein Blick hinter die Kulissen bei uns – so sieht unser Alltag wirklich aus.' },
        { label: 'Community-Frage', prompt: 'Was beschäftigt euch gerade am meisten? Schreibt es in die Kommentare!' },
        { label: 'Tipp teilen', prompt: 'Unser Tipp der Woche: So könnt ihr in 5 Minuten...' },
      ],
      linkedin: [
        { label: 'Brancheninsight', prompt: 'Ein Trend, den wir gerade in unserer Branche beobachten:' },
        { label: 'Learning teilen', prompt: 'Was wir diese Woche gelernt haben – und warum es wichtig ist:' },
        { label: 'Diskussion starten', prompt: 'Eine Frage an mein Netzwerk: Wie geht ihr mit... um?' },
      ],
      tiktok: [
        { label: 'Hook-Video', prompt: 'Das wusstest du noch nicht über...' },
        { label: 'Vorher/Nachher', prompt: 'So sah es vorher aus – und so sieht es jetzt aus:' },
        { label: '3 Tipps', prompt: '3 Dinge, die du sofort ausprobieren kannst:' },
      ],
      facebook: [
        { label: 'Update teilen', prompt: 'Neuigkeiten von uns: Wir haben...' },
        { label: 'Frage stellen', prompt: 'Wir sind neugierig – was denkt ihr darüber?' },
        { label: 'Angebot vorstellen', prompt: 'Für euch haben wir etwas Besonderes vorbereitet:' },
      ],
      twitter: [
        { label: 'Quick Take', prompt: 'Unpopular opinion:' },
        { label: 'Thread-Start', prompt: 'Ein paar Gedanken zu einem Thema, das mich beschäftigt:' },
        { label: 'Frage', prompt: 'Kurze Frage an euch:' },
      ],
    };
    return ideas[editedSlot.platform] || ideas.instagram;
  }, [editedSlot.platform]);

  const isContentEmpty = currentCharCount === 0;

  // Source-material mode: content was passed from chat as raw material, not as a finished caption
  const isSourceMode = !!editedSlot.sourceMaterial && showSourcePanel;

  // Transform source material into post content via n8n webhook (vektrus-chat-to-post)
  const handleTransformSource = useCallback(async () => {
    if (!editedSlot.sourceMaterial) return;
    setIsTransformingSource(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Nicht eingeloggt.');
      }

      // Build scheduled_date from editedSlot.date + editedSlot.time
      let scheduledDate: string | undefined;
      if (editedSlot.date) {
        const d = editedSlot.date instanceof Date ? editedSlot.date : new Date(editedSlot.date);
        if (editedSlot.time) {
          const [hours, minutes] = editedSlot.time.split(':').map(Number);
          d.setHours(hours, minutes, 0, 0);
        }
        scheduledDate = d.toISOString();
      }

      const response = await fetch('https://n8n.vektrus.ai/webhook/vektrus-chat-to-post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          chat_text: editedSlot.sourceMaterial,
          platform: (editedSlot.platform || 'instagram').toLowerCase(),
          scheduled_date: scheduledDate,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Webhook-Fehler');
      }

      const updatedContent = result.updated_content;
      const primaryText = updatedContent?.primary_text || '';

      // Extract hashtags from the result if present
      const hashtagMatches = primaryText.match(/#(\w+)/g) || [];
      const extractedHashtags = hashtagMatches.map((h: string) => h.replace(/^#/, ''));
      const bodyWithoutHashtags = primaryText.replace(/\s*(?:#\w+[\s,]*)+\s*$/, '').trim();

      // Use hashtags from structured response if available, otherwise extract from text
      const finalHashtags = updatedContent?.hashtags?.length
        ? updatedContent.hashtags.map((h: string) => h.replace(/^#/, ''))
        : extractedHashtags;

      setEditedSlot(prev => ({
        ...prev,
        body: bodyWithoutHashtags,
        content: bodyWithoutHashtags,
        hashtags: finalHashtags.length > 0 ? finalHashtags : prev.hashtags,
        title: prev.title || 'Neuer Post',
        contentRecordId: result.content_record_id || prev.contentRecordId,
      }));

      addToast({
        type: 'success',
        title: 'Posting erstellt',
        description: 'Die Grundlage wurde in Post-Inhalt umgewandelt.',
        duration: 3000,
      });
    } catch (err) {
      console.error('Source transform error:', err);
      addToast({
        type: 'error',
        title: 'Post konnte nicht erstellt werden',
        description: 'Bitte versuche es erneut.',
        duration: 3000,
      });
    } finally {
      setIsTransformingSource(false);
    }
  }, [editedSlot.sourceMaterial, editedSlot.platform, editedSlot.date, editedSlot.time, addToast]);

  // Platform data for compact chips
  const platformOptions = [
    { id: 'instagram', label: 'Instagram', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="25%" stopColor="#F77737" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="75%" stopColor="#C13584" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#ig-grad)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)" />
      </svg>
    )},
    { id: 'linkedin', label: 'LinkedIn', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )},
    { id: 'tiktok', label: 'TikTok', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#111111">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
      </svg>
    )},
    { id: 'facebook', label: 'Facebook', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )},
    { id: 'twitter', label: 'X', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#111111">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )},
  ];

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] animate-in fade-in-0 duration-200" onClick={handleCloseAttempt} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[501] p-3 pointer-events-none">
        <div className="w-full max-w-5xl bg-white rounded-[var(--vektrus-radius-xl)] shadow-modal flex flex-col max-h-[92vh] pointer-events-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-400 border border-[rgba(73,183,227,0.10)] overflow-hidden">

          {/* ═══ HEADER ═══ */}
          <div className="px-6 py-4 border-b border-[rgba(73,183,227,0.10)] bg-gradient-to-r from-[#F4FCFE] via-white to-[#F4FCFE] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Type className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#111111] font-manrope leading-tight">
                    {isSourceMode ? 'Post aus Grundlage erstellen' : isNewPost ? 'Neuen Post erstellen' : 'Post bearbeiten'}
                  </h2>
                  <p className="text-xs text-[#7A7A7A] leading-tight mt-0.5 truncate">
                    {isSourceMode ? 'Diese Antwort wurde als Grundlage aus dem Chat uebernommen.' : isNewPost ? 'Erstelle und plane deinen Post' : editedSlot.title}
                  </p>
                </div>
                <span className={`ml-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 ${getStatusColor(editedSlot.status)}`}>
                  {getStatusLabel(editedSlot.status)}
                </span>
              </div>
              <button
                onClick={handleCloseAttempt}
                className="p-2 text-[#7A7A7A] hover:text-[#FA7E70] hover:bg-[#FA7E70]/8 rounded-[var(--vektrus-radius-sm)] transition-all duration-200 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ═══ TWO-COLUMN BODY ═══ */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

            {/* ─── LEFT COLUMN: Composer ─── */}
            <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-5">

              {/* Platform Selection — compact chips */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2.5 block">Plattform</label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(platform => {
                    const isSelected = Array.isArray(editedSlot.platforms)
                      ? editedSlot.platforms.includes(platform.id as any)
                      : editedSlot.platform === platform.id;

                    return (
                      <button
                        key={platform.id}
                        onClick={() => {
                          if (Array.isArray(editedSlot.platforms)) {
                            const newPlatforms = isSelected
                              ? editedSlot.platforms.filter(p => p !== platform.id)
                              : [...editedSlot.platforms, platform.id as any];
                            setEditedSlot(prev => ({ ...prev, platforms: newPlatforms }));
                          } else {
                            setEditedSlot(prev => ({
                              ...prev,
                              platform: platform.id as any,
                              platforms: [platform.id as any]
                            }));
                          }
                        }}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-[var(--vektrus-radius-sm)] border text-[13px] font-semibold transition-all duration-200
                          ${isSelected
                            ? 'border-[#49B7E3] bg-[#F4FCFE] shadow-sm'
                            : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE]/50'
                          }
                        `}
                      >
                        <span className="flex-shrink-0">{platform.icon}</span>
                        <span className="text-[#111111]">{platform.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#49D69E] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Type — compact row */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2.5 block">Format</label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setEditedSlot(prev => ({ ...prev, contentType: type.id as any }))}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] border text-xs font-bold transition-all duration-200
                        ${editedSlot.contentType === type.id
                          ? 'border-[#49B7E3] bg-[#F4FCFE] text-[#111111] shadow-sm'
                          : 'border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[#B6EBF7] hover:text-[#111111]'
                        }
                      `}
                    >
                      <span className="text-[#49B7E3]">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2 block">Titel</label>
                <input
                  type="text"
                  value={editedSlot.title}
                  onChange={(e) => setEditedSlot(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49B7E3]/30 focus:border-[#49B7E3] transition-all duration-200 text-sm font-medium text-[#111111] bg-white"
                  placeholder="Post-Titel eingeben..."
                />
              </div>

              {/* Source Material Panel — shown when composer opened from chat as source */}
              {isSourceMode && editedSlot.sourceMaterial && (
                <div className="rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.20)] bg-[#F4FCFE] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[rgba(73,183,227,0.12)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#49B7E3]" />
                      <span className="text-xs font-semibold text-[#111111]">Grundlage aus dem Chat</span>
                    </div>
                    <button
                      onClick={() => setShowSourcePanel(false)}
                      className="text-[10px] font-medium text-[#7A7A7A] hover:text-[#111111] px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] hover:bg-white/60 transition-colors"
                    >
                      Ausblenden
                    </button>
                  </div>
                  <div className="px-4 py-3 max-h-[180px] overflow-y-auto">
                    <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-wrap">
                      {editedSlot.sourceMaterial.length > 1200
                        ? editedSlot.sourceMaterial.substring(0, 1200) + '...'
                        : editedSlot.sourceMaterial
                      }
                    </p>
                  </div>
                  <div className="px-4 py-3 border-t border-[rgba(73,183,227,0.12)] bg-white/50">
                    <button
                      onClick={handleTransformSource}
                      disabled={isTransformingSource}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--vektrus-radius-sm)] text-sm font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
                      style={{ background: 'var(--vektrus-ai-violet)' }}
                    >
                      {isTransformingSource ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Wird erstellt...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>Posting ready machen</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-[#AAAAAA] text-center mt-2">
                      Die KI erstellt daraus Caption, Hashtags und CTA.
                    </p>
                  </div>
                </div>
              )}

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider">Inhalt</label>
                  <button
                    onClick={() => setShowAIRewrite(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{ background: 'var(--vektrus-ai-violet)' }}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>KI Umschreiben</span>
                  </button>
                </div>

                {/* Pulse-Post formatted preview */}
                {editedSlot.source === 'pulse' && (editedSlot.contentTypeDetail || editedSlot.estimatedEngagement) && (
                  <div className="mb-3 p-4 bg-gradient-to-br from-[#E8F7F1]/60 to-[#E5F5FB]/40 rounded-[var(--vektrus-radius-md)] border border-[#B4E8E5]/40">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {editedSlot.contentTypeDetail && (
                          <span className="inline-flex items-center px-2 py-1 rounded-[var(--vektrus-radius-sm)] text-[10px] font-bold bg-white border border-[#B6EBF7] text-[#111111]">
                            {getContentTypeBadgeText(editedSlot.contentTypeDetail)}
                          </span>
                        )}
                        {editedSlot.estimatedEngagement && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-[var(--vektrus-radius-sm)] bg-white border border-[rgba(73,183,227,0.15)]">
                            <div className={`w-1.5 h-1.5 rounded-full ${getEngagementColor(editedSlot.estimatedEngagement)}`} />
                            <span className="text-[10px] font-semibold text-[#7A7A7A]">
                              {getEngagementText(editedSlot.estimatedEngagement)} Engagement
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const contentForCopy = formatContentForCopy({
                            primary_text: editedSlot.body || editedSlot.content || '',
                            hashtags: editedSlot.hashtags,
                            cta: editedSlot.cta || '',
                            content_type: editedSlot.contentTypeDetail || 'general',
                            hook: editedSlot.title,
                            estimated_engagement: (editedSlot.estimatedEngagement as 'high' | 'medium' | 'low') || 'medium'
                          });
                          navigator.clipboard.writeText(contentForCopy);
                          addToast({ type: 'success', title: 'Text kopiert', description: 'Post-Text wurde in die Zwischenablage kopiert', duration: 2000 });
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--vektrus-radius-sm)] bg-white hover:bg-[#B4E8E5]/20 text-[#111111] border border-[rgba(73,183,227,0.15)] transition-all duration-200 text-[10px] font-semibold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Kopieren</span>
                      </button>
                    </div>
                    {editedSlot.cta && (
                      <div className="p-2.5 bg-white/70 rounded-[var(--vektrus-radius-sm)] border border-[#49D69E]/25 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#49D69E]" />
                        <span className="text-xs font-bold text-[#111111]">{editedSlot.cta}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Smart empty state + Textarea (suppressed in source mode — user should use "Posting ready machen") */}
                {isContentEmpty && !isSourceMode && (
                  <div className="mb-3 p-4 bg-[#FAFEFF] rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.12)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--vektrus-ai-violet)]" />
                      <span className="text-xs font-semibold text-[#111111]">Ideen für deinen Post</span>
                    </div>
                    <div className="space-y-1.5">
                      {contentIdeas.map((idea, index) => (
                        <button
                          key={index}
                          onClick={() => setEditedSlot(prev => ({ ...prev, body: idea.prompt, content: idea.prompt }))}
                          className="w-full flex items-center gap-2.5 p-2.5 bg-white rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.10)] hover:border-[var(--vektrus-ai-violet)]/25 hover:bg-[rgba(124,108,242,0.03)] transition-all duration-200 text-left group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--vektrus-ai-violet)]/40 group-hover:bg-[var(--vektrus-ai-violet)] transition-colors flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-[#111111] block">{idea.label}</span>
                            <span className="text-[10px] text-[#7A7A7A] block truncate mt-0.5">{idea.prompt}</span>
                          </div>
                          <span className="text-[10px] text-[var(--vektrus-ai-violet)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex-shrink-0">
                            Übernehmen
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#AAAAAA] mt-2.5">Klicke eine Idee an oder beginne direkt zu schreiben.</p>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={editedSlot.body || editedSlot.content || ''}
                    onChange={(e) => setEditedSlot(prev => ({ ...prev, body: e.target.value, content: e.target.value }))}
                    rows={isContentEmpty ? 3 : 5}
                    className="w-full p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49B7E3]/30 focus:border-[#49B7E3] resize-none transition-all duration-200 bg-white text-sm text-[#111111] placeholder:text-[#7A7A7A]/60 hover:border-[#B6EBF7]"
                    placeholder={isContentEmpty ? 'Schreibe deinen Post-Inhalt oder wähle eine Idee oben...' : 'Schreibe deinen Post-Inhalt...'}
                  />
                  <div className={`absolute bottom-3 right-3 text-[11px] font-medium px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] border ${
                    currentCharCount > currentCharLimit
                      ? 'bg-[#FA7E70]/10 text-[#c0392b] border-[#FA7E70]/20'
                      : 'bg-white text-[#7A7A7A] border-[rgba(73,183,227,0.15)]'
                  }`}>
                    {currentCharCount} / {currentCharLimit}
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    Hashtags
                  </label>
                  <button
                    onClick={generateHashtags}
                    className="flex items-center gap-1 text-[11px] font-bold text-[var(--vektrus-ai-violet)] hover:bg-[rgba(124,108,242,0.08)] px-2.5 py-1 rounded-[var(--vektrus-radius-sm)] transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>KI-Hashtags</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] min-h-[60px] focus-within:border-[#49B7E3] focus-within:ring-2 focus-within:ring-[#49B7E3]/15 transition-all duration-200 bg-white hover:border-[#B6EBF7]">
                  {editedSlot.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-[#B6EBF7] to-[#B4E8E5] text-white rounded-[var(--vektrus-radius-sm)] text-xs font-bold"
                    >
                      #{hashtag.replace(/^#/, '')}
                      <button
                        onClick={() => setEditedSlot(prev => ({
                          ...prev,
                          hashtags: prev.hashtags.filter((_, i) => i !== index)
                        }))}
                        className="ml-1.5 hover:text-[#FA7E70] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Hashtag hinzufügen..."
                    className="flex-1 min-w-[120px] outline-none text-xs bg-transparent text-[#111111] placeholder:text-[#7A7A7A]/50 font-medium"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim().replace('#', '');
                        if (value && !editedSlot.hashtags.includes(value)) {
                          setEditedSlot(prev => ({
                            ...prev,
                            hashtags: [...prev.hashtags, value]
                          }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#AAAAAA] mt-1.5 ml-0.5">Enter zum Hinzufügen</p>
              </div>

              {/* Media Zone */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2.5 block">Medien</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/quicktime,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {editedSlot.media?.url ? (
                  /* Current media display */
                  <div className="relative rounded-[var(--vektrus-radius-md)] overflow-hidden border border-[rgba(73,183,227,0.18)] bg-[#F4FCFE] mb-3">
                    {editedSlot.media.type === 'video' ? (
                      <div className="relative w-full">
                        <video
                          key={editedSlot.media.url}
                          ref={currentVideoRef}
                          src={`${editedSlot.media.url}#t=0.1`}
                          className="w-full max-h-[240px] object-cover rounded-[var(--vektrus-radius-md)]"
                          controls
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] pointer-events-none">
                          Video
                        </div>
                      </div>
                    ) : (
                      <img
                        src={editedSlot.media.url}
                        alt="Post Media"
                        className="w-full max-h-[240px] object-cover"
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentVideoRef.current) currentVideoRef.current.pause();
                        setEditedSlot(prev => ({ ...prev, media: undefined }));
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-[var(--vektrus-radius-sm)] transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5 text-[#7A7A7A]" />
                    </button>
                  </div>
                ) : (
                  /* Upload drop zone with drag & drop */
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-[var(--vektrus-radius-md)] p-8 text-center transition-all duration-200 cursor-pointer mb-3 ${
                      isDragging
                        ? 'border-[#49B7E3] bg-[#E5F5FB] scale-[1.01]'
                        : 'border-[rgba(73,183,227,0.25)] hover:border-[#49B7E3] hover:bg-[#F4FCFE]'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#49B7E3] mb-2" />
                        <p className="text-sm text-[#7A7A7A]">Wird hochgeladen...</p>
                      </div>
                    ) : isDragging ? (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 text-[#49B7E3] mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#49B7E3]">Datei hier ablegen</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#B6EBF7] mx-auto mb-2" />
                        <p className="text-sm font-medium text-[#7A7A7A]">Bild oder Video hochladen</p>
                        <p className="text-[11px] text-[#AAAAAA] mt-1">Klicken oder Datei hierher ziehen</p>
                      </>
                    )}
                  </div>
                )}

                {isUploading && (
                  <div className="w-full bg-[#B6EBF7]/20 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-[#49B7E3] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {/* Media action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#111111] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] transition-all duration-200 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#49B7E3]" />
                    <span>Hochladen</span>
                  </button>
                  <button
                    onClick={() => setShowAiImageModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[var(--vektrus-ai-violet)] border border-[rgba(124,108,242,0.18)] rounded-[var(--vektrus-radius-sm)] hover:bg-[rgba(124,108,242,0.06)] transition-all duration-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>KI-Bild</span>
                  </button>
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#111111] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] transition-all duration-200"
                  >
                    <Image className="w-3.5 h-3.5 text-[#49B7E3]" />
                    <span>Mediathek</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: Preview + Controls ─── */}
            <div className="w-full md:w-[380px] flex-shrink-0 md:border-l border-t md:border-t-0 border-[rgba(73,183,227,0.10)] overflow-y-auto p-6 bg-[#FAFEFF] space-y-5">

              {/* Preview */}
              <div>
                <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-3">Vorschau</h3>
                <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.15)] shadow-subtle overflow-hidden">
                  {/* Social post header */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[rgba(73,183,227,0.08)]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] flex-shrink-0 flex items-center justify-center">
                      {platformOptions.find(p => p.id === editedSlot.platform)?.icon || <Type className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-[#111111]">Dein Account</div>
                      <div className="text-[10px] text-[#7A7A7A] capitalize">{editedSlot.platform}</div>
                    </div>
                    <div className="text-[10px] text-[#AAAAAA]">
                      {ensureDate(editedSlot.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  {/* Media preview */}
                  {editedSlot.media?.url ? (
                    <div className="max-h-[200px] overflow-hidden bg-[#F4FCFE]">
                      {editedSlot.media.type === 'video' ? (
                        <video
                          src={`${editedSlot.media.url}#t=0.1`}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img src={editedSlot.media.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-[#F4FCFE] to-[#EDF7FA] flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-5 h-5 text-[#B6EBF7] mx-auto mb-1" />
                        <p className="text-[9px] text-[#AAAAAA]">Kein Medium</p>
                      </div>
                    </div>
                  )}
                  {/* Text preview */}
                  <div className="px-3.5 py-3">
                    {(editedSlot.body || editedSlot.content) ? (
                      <>
                        {editedSlot.title && (
                          <p className="text-[11px] font-bold text-[#111111] mb-1">{editedSlot.title}</p>
                        )}
                        <p className="text-[11px] text-[#111111] whitespace-pre-wrap leading-relaxed line-clamp-6">
                          {editedSlot.body || editedSlot.content}
                        </p>
                        {editedSlot.hashtags.length > 0 && (
                          <p className="text-[10px] text-[#49B7E3] mt-1.5 leading-relaxed">
                            {editedSlot.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}
                          </p>
                        )}
                        {editedSlot.cta && (
                          <p className="text-[10px] font-semibold text-[#49D69E] mt-1.5">{editedSlot.cta}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-[#AAAAAA] italic">Dein Text erscheint hier...</p>
                    )}
                  </div>
                  {/* Interaction bar */}
                  <div className="px-3.5 py-2 border-t border-[rgba(73,183,227,0.06)] flex items-center gap-4">
                    <svg className="w-4 h-4 text-[#AAAAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                    <svg className="w-4 h-4 text-[#AAAAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                    <svg className="w-4 h-4 text-[#AAAAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    <svg className="w-4 h-4 text-[#AAAAAA] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                  </div>
                </div>
                {/* Content type badge below preview */}
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] font-semibold text-[#7A7A7A] bg-[#F4FCFE] px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.10)] capitalize">
                    {editedSlot.contentType}
                  </span>
                  {editedSlot.tone && (
                    <span className="text-[10px] text-[#AAAAAA] capitalize">{editedSlot.tone}</span>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.12)] shadow-subtle">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-[#49B7E3] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111111] font-manrope">Zeitplanung</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#7A7A7A] block mb-1.5">Datum</label>
                    <input
                      type="date"
                      value={formatLocalDate(editedSlot.date)}
                      min={todayStr}
                      onChange={(e) => {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        const newDate = new Date(y, m - 1, d);
                        setEditedSlot(prev => ({ ...prev, date: newDate }));
                      }}
                      className="w-full px-3 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#49B7E3]/30 focus:border-[#49B7E3] hover:border-[#B6EBF7] transition-all duration-200 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#7A7A7A] block mb-1.5">Uhrzeit</label>
                    <div className="relative">
                      <select
                        value={editedSlot.time}
                        onChange={(e) => setEditedSlot(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2.5 pr-9 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#49B7E3]/30 focus:border-[#49B7E3] hover:border-[#B6EBF7] transition-all duration-200 cursor-pointer appearance-none"
                      >
                        {isCustomTime && (
                          <option value={editedSlot.time}>{editedSlot.time} Uhr</option>
                        )}
                        <optgroup label="Morgens">
                          <option value="06:00">06:00 Uhr</option>
                          <option value="07:00">07:00 Uhr</option>
                          <option value="08:00">08:00 Uhr</option>
                          <option value="09:00">09:00 Uhr</option>
                          <option value="10:00">10:00 Uhr</option>
                        </optgroup>
                        <optgroup label="Mittags">
                          <option value="11:00">11:00 Uhr</option>
                          <option value="12:00">12:00 Uhr</option>
                          <option value="13:00">13:00 Uhr</option>
                          <option value="14:00">14:00 Uhr</option>
                          <option value="15:00">15:00 Uhr</option>
                          <option value="16:00">16:00 Uhr</option>
                        </optgroup>
                        <optgroup label="Abends">
                          <option value="17:00">17:00 Uhr</option>
                          <option value="18:00">18:00 Uhr</option>
                          <option value="19:00">19:00 Uhr</option>
                          <option value="20:00">20:00 Uhr</option>
                          <option value="21:00">21:00 Uhr</option>
                          <option value="22:00">22:00 Uhr</option>
                        </optgroup>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6EBF7] pointer-events-none" />
                    </div>
                  </div>

                  {/* Best time suggestion */}
                  <button
                    type="button"
                    onClick={() => setEditedSlot(prev => ({ ...prev, time: '18:00' }))}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] hover:bg-[#E5F5FB] transition-colors text-left border border-[rgba(73,183,227,0.10)]"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#49B7E3] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#111111]">18:00 Uhr übernehmen</span>
                      <span className="text-[10px] text-[#AAAAAA] block">Oft ein guter Zeitpunkt für Engagement</span>
                    </div>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-[rgba(73,183,227,0.10)]">
                  <div className="text-xs text-[#7A7A7A] flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-[#49D69E]" />
                    <span className="font-semibold text-[#111111]">
                      {ensureDate(editedSlot.date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })} · {editedSlot.time} Uhr
                    </span>
                  </div>
                </div>
              </div>

              {/* Tone */}
              <div>
                <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2.5">Tonalität</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setEditedSlot(prev => ({ ...prev, tone: t.id as any }))}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-[var(--vektrus-radius-sm)] border text-xs font-bold transition-all duration-200
                        ${editedSlot.tone === t.id
                          ? 'border-[#B6EBF7] bg-[#F4FCFE] text-[#111111]'
                          : 'border-[rgba(73,183,227,0.15)] text-[#7A7A7A] hover:border-[#B6EBF7] hover:text-[#111111]'
                        }
                      `}
                    >
                      <span className="text-[#49B7E3]">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div>
                <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2">Call-to-Action</h3>
                <select
                  value={editedSlot.cta || ''}
                  onChange={(e) => setEditedSlot(prev => ({ ...prev, cta: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#49B7E3]/30 focus:border-[#49B7E3] transition-all duration-200 cursor-pointer"
                >
                  <option value="">CTA wählen (optional)</option>
                  {ctaOptions.map(cta => (
                    <option key={cta} value={cta}>{cta}</option>
                  ))}
                </select>
              </div>

              {/* Strategy Context */}
              <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.12)]">
                <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-3">Strategie</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-[#AAAAAA] block mb-1">Content-Pillar</label>
                    <select
                      value={editedSlot.pillar || editedSlot.contentTypeDetail || ''}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setEditedSlot(prev => ({ ...prev, pillar: val || undefined, contentTypeDetail: val || undefined }));
                      }}
                      className="w-full px-2.5 py-2 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.15)] bg-white text-xs text-[#111111] font-medium focus:outline-none focus:ring-1 focus:ring-[#49B7E3]/30 transition-all cursor-pointer"
                    >
                      <option value="">Nicht zugeordnet</option>
                      <option value="educational">Educational</option>
                      <option value="entertaining">Entertaining</option>
                      <option value="promotional">Promotional</option>
                      <option value="behind_the_scenes">Behind the Scenes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-[#AAAAAA] block mb-1">Funnel-Stufe</label>
                    <select
                      value={editedSlot.funnelStage || ''}
                      onChange={(e) => setEditedSlot(prev => ({ ...prev, funnelStage: (e.target.value as any) || undefined }))}
                      className="w-full px-2.5 py-2 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.15)] bg-white text-xs text-[#111111] font-medium focus:outline-none focus:ring-1 focus:ring-[#49B7E3]/30 transition-all cursor-pointer"
                    >
                      <option value="">Nicht zugeordnet</option>
                      <option value="tofu">Top of Funnel</option>
                      <option value="mofu">Mid Funnel</option>
                      <option value="bofu">Bottom Funnel</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-[10px] font-medium text-[#AAAAAA] block mb-1">Zielgruppe</label>
                  <select
                    value={editedSlot.targetAudience || ''}
                    onChange={(e) => setEditedSlot(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.15)] bg-white text-xs text-[#111111] font-medium focus:outline-none focus:ring-1 focus:ring-[#49B7E3]/30 transition-all cursor-pointer"
                  >
                    <option value="">Standard-Zielgruppe</option>
                    <option value="awareness">Awareness</option>
                    <option value="conversion">Conversion</option>
                    <option value="engagement">Engagement</option>
                    <option value="retention">Kundenbindung</option>
                  </select>
                </div>
              </div>

              {/* Content Score */}
              {editedSlot.contentScore && (
                <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.12)]">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider">Content Score</h3>
                    <span className={`text-sm font-bold ${editedSlot.contentScore.total >= 85 ? 'text-[#49D69E]' : editedSlot.contentScore.total >= 70 ? 'text-[#49B7E3]' : 'text-[#F4BE9D]'}`}>
                      {editedSlot.contentScore.total}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#F4FCFE] rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${editedSlot.contentScore.total >= 85 ? 'bg-[#49D69E]' : editedSlot.contentScore.total >= 70 ? 'bg-[#49B7E3]' : 'bg-[#F4BE9D]'}`}
                      style={{ width: `${editedSlot.contentScore.total}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#7A7A7A]">
                    <span>Lesbarkeit: {editedSlot.contentScore.readability}</span>
                    <span>Hook: {editedSlot.contentScore.hookStrength}</span>
                    <span>Hashtags: {editedSlot.contentScore.hashtagQuality}</span>
                    <span>CTA: {editedSlot.contentScore.ctaClarity}</span>
                  </div>
                </div>
              )}

              {/* Version history */}
              {editedSlot.version && (
                <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.12)]">
                  <h3 className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider mb-2.5">Versionen</h3>
                  <div className="space-y-1.5">
                    <div className="p-2.5 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#111111]">Aktuelle Version</span>
                        <span className="text-[10px] text-[#7A7A7A]">
                          {editedSlot.version.lastModified.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white border border-[rgba(73,183,227,0.12)] rounded-[var(--vektrus-radius-sm)] hover:border-[#49D69E]/50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#7A7A7A]">KI-Original</span>
                        <button
                          onClick={() => setEditedSlot(prev => ({
                            ...prev,
                            body: prev.version?.original || prev.body || prev.content || '',
                            content: prev.version?.original || prev.body || prev.content || ''
                          }))}
                          className="text-[10px] bg-[#49D69E] text-white px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Wiederherstellen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Result Banner */}
          {postResult && (
            <div className={`px-6 py-3 flex items-center gap-2.5 text-sm font-medium border-t flex-shrink-0 ${
              postResult.type === 'success'
                ? 'bg-[#E8F7F1] text-[#1a7a4c] border-[#49D69E]/30'
                : 'bg-[#FEF2F0] text-[#c0392b] border-[#FA7E70]/30'
            }`}>
              {postResult.type === 'success' ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{postResult.message}</span>
            </div>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="px-6 py-4 border-t border-[rgba(73,183,227,0.10)] bg-white flex-shrink-0">
            <div className="flex items-center justify-end gap-3">
              {/* Cancel */}
              <button
                onClick={handleCloseAttempt}
                disabled={isSaving || isPosting}
                className="px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] hover:bg-[#F4FCFE] text-sm font-semibold text-[#7A7A7A] hover:text-[#111111] transition-all duration-200 disabled:opacity-50"
              >
                Abbrechen
              </button>

              {/* Save draft */}
              <button
                onClick={handleSave}
                disabled={isSaving || isPosting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7] hover:bg-[#F4FCFE] text-sm font-semibold text-[#111111] transition-all duration-200 disabled:opacity-50"
              >
                <ButtonLoading isLoading={isSaving}>
                  <>
                    <Save className="w-4 h-4 text-[#49B7E3]" />
                    <span>Entwurf speichern</span>
                  </>
                </ButtonLoading>
              </button>

              {/* Primary split button: Planen */}
              <div className="relative" ref={postDropdownRef}>
                <div className="flex">
                  <button
                    onClick={() => handlePost(false)}
                    disabled={isPosting || isSaving || accountConnected === false || editedSlot.status === 'published'}
                    className="flex items-center gap-2 py-2.5 pl-4 pr-3 rounded-l-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    style={{
                      background: accountConnected === false || editedSlot.status === 'published' ? '#9ca3af' : '#49B7E3',
                      color: '#ffffff',
                    }}
                    title={
                      accountConnected === false
                        ? `Verbinde zuerst deinen ${editedSlot.platform}-Account`
                        : editedSlot.status === 'published'
                          ? 'Bereits veröffentlicht'
                          : 'Post zum geplanten Zeitpunkt veröffentlichen'
                    }
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Wird geplant...</span>
                      </>
                    ) : (
                      <>
                        <CalendarClock className="w-4 h-4" />
                        <span>Planen</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPostDropdown(!showPostDropdown)}
                    disabled={isPosting || isSaving || accountConnected === false || editedSlot.status === 'published'}
                    className="flex items-center justify-center px-2.5 py-2.5 rounded-r-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/20"
                    style={{
                      background: accountConnected === false || editedSlot.status === 'published' ? '#9ca3af' : '#49B7E3',
                      color: '#ffffff',
                    }}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPostDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showPostDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-[var(--vektrus-radius-md)] shadow-elevated border border-[rgba(73,183,227,0.15)] overflow-hidden z-50">
                    <button
                      onClick={() => handlePost(true)}
                      disabled={isPosting}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#111111] hover:bg-[#E8F7F1] transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-[#49D69E]" />
                      <div className="text-left">
                        <div className="font-semibold">Jetzt veröffentlichen</div>
                        <div className="text-[11px] text-[#7A7A7A] font-normal">Sofort posten</div>
                      </div>
                    </button>
                    <div className="border-t border-[rgba(73,183,227,0.08)]" />
                    <button
                      onClick={() => handlePost(false)}
                      disabled={isPosting}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#111111] hover:bg-[#E5F5FB] transition-colors disabled:opacity-50"
                    >
                      <CalendarClock className="w-4 h-4 text-[#49B7E3]" />
                      <div className="text-left">
                        <div className="font-semibold">Zum Zeitpunkt planen</div>
                        <div className="text-[11px] text-[#7A7A7A] font-normal">
                          {ensureDate(editedSlot.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} · {editedSlot.time} Uhr
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {accountConnected === false && (
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#FEF2F0] border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)] text-xs text-[#c0392b] flex items-center gap-2 w-64">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Verbinde zuerst deinen {editedSlot.platform}-Account in den Einstellungen</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CLOSE CONFIRMATION ═══ */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[700] animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F4BE9D]/15 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#D4864A]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111] font-manrope">Ungespeicherte Änderungen</h3>
                <p className="text-xs text-[#7A7A7A] mt-0.5">Deine Änderungen gehen verloren, wenn du ohne Speichern schließt.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-3.5 py-2 rounded-[var(--vektrus-radius-sm)] text-xs font-semibold text-[#7A7A7A] hover:bg-[#F4FCFE] transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={handleDiscardAndClose}
                className="px-3.5 py-2 rounded-[var(--vektrus-radius-sm)] border border-[#FA7E70]/30 text-xs font-semibold text-[#c0392b] hover:bg-[#FEF2F0] transition-colors"
              >
                Verwerfen
              </button>
              <button
                onClick={handleSaveAndClose}
                className="px-3.5 py-2 rounded-[var(--vektrus-radius-sm)] bg-[#49B7E3] text-white text-xs font-semibold hover:bg-[#3A9FD1] transition-colors shadow-sm"
              >
                Entwurf speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OVERLAYS ═══ */}

      {showAIRewrite && (
        <AIRewritePanel
          originalContent={editedSlot.body || editedSlot.content || ''}
          currentTone={editedSlot.tone}
          onApplyRewrite={handleApplyRewrite}
          onClose={() => setShowAIRewrite(false)}
        />
      )}

      {showAiImageModal && (
        <AiImageGenerationModal
          onGenerate={handleAiImageGenerated}
          onClose={() => setShowAiImageModal(false)}
        />
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[600] p-4">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#111111] font-manrope">Aus Mediathek wählen</h2>
                  <p className="text-sm text-[#7A7A7A] mt-1">Wähle ein Medium aus deiner Bibliothek</p>
                </div>
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex h-[60vh]">
              {/* Media Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isLoadingMedia ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#49B7E3] mx-auto mb-2" />
                      <p className="text-sm text-[#7A7A7A]">Mediathek wird geladen...</p>
                    </div>
                  </div>
                ) : mediaLibrary.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-sm">
                      <div className="w-14 h-14 bg-[#F4FCFE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-7 h-7 text-[#B6EBF7]" />
                      </div>
                      <p className="text-sm text-[#7A7A7A] mb-1.5">Noch keine Medien vorhanden</p>
                      <p className="text-xs text-[#AAAAAA]">Erstelle Bilder mit KI oder lade deine eigenen hoch</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaLibrary.map(media => (
                      <div
                        key={media.id}
                        onClick={() => handleMediaLibrarySelect(media)}
                        className={`relative aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
                          selectedLibraryMedia?.id === media.id
                            ? 'ring-3 ring-[#49D69E] shadow-lg'
                            : 'hover:shadow-md border border-[rgba(73,183,227,0.15)]'
                        }`}
                      >
                        {media.type === 'video' ? (
                          <div className="relative w-full h-full bg-gray-900">
                            <video
                              src={`${media.url}#t=0.1`}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-black/50 rounded-full p-2.5">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                        )}

                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
                            {media.format}
                          </span>
                        </div>

                        {media.source === 'ai_generated' && (
                          <div className="absolute top-2 right-2">
                            <div className="px-1.5 py-0.5 bg-[rgba(124,108,242,0.15)] text-[var(--vektrus-ai-violet)] text-[10px] font-medium rounded-[var(--vektrus-radius-sm)] flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>KI</span>
                            </div>
                          </div>
                        )}

                        {selectedLibraryMedia?.id === media.id && (
                          <div className="absolute inset-0 bg-[#49D69E]/20 flex items-center justify-center">
                            <div className="w-7 h-7 bg-[#49D69E] rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Media Preview */}
              {selectedLibraryMedia && (
                <div className="w-72 border-l border-[rgba(73,183,227,0.18)] p-5">
                  <h3 className="font-semibold text-[#111111] text-sm mb-4">Vorschau</h3>
                  <div className="rounded-[var(--vektrus-radius-md)] overflow-hidden mb-4 bg-gray-900">
                    {selectedLibraryMedia.type === 'video' ? (
                      <video
                        key={selectedLibraryMedia.id}
                        src={`${selectedLibraryMedia.url}#t=0.1`}
                        className="w-full rounded-[var(--vektrus-radius-md)]"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={selectedLibraryMedia.url}
                        alt={selectedLibraryMedia.name}
                        className="w-full h-full object-cover aspect-square"
                      />
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#7A7A7A]">Name:</span>
                      <div className="font-medium text-[#111111] truncate">{selectedLibraryMedia.name}</div>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A]">Format:</span>
                      <div className="font-medium text-[#111111]">{selectedLibraryMedia.format}</div>
                    </div>
                    <div>
                      <span className="text-[#7A7A7A]">Größe:</span>
                      <div className="font-medium text-[#111111]">{formatFileSize(selectedLibraryMedia.size * 1024 * 1024)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[rgba(73,183,227,0.18)] flex items-center justify-between">
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="px-4 py-2.5 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={() => selectedLibraryMedia && handleInsertFromLibrary(selectedLibraryMedia)}
                disabled={!selectedLibraryMedia}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200 ${
                  selectedLibraryMedia
                    ? 'bg-[#49B7E3] hover:bg-[#3A9FD1] text-white shadow-sm hover:shadow-md'
                    : 'bg-[#B6EBF7]/20 text-[#AAAAAA] cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Medium übernehmen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentSlotEditor;
