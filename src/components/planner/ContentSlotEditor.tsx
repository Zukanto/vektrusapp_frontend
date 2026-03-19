import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Copy, Trash2, Wand2, Clock, Hash, Image, Type, Zap, RefreshCw, Palette, MessageSquare, Upload, Sparkles, Check, Send, ChevronDown, CalendarClock, AlertCircle, Loader2, ExternalLink, FileText, BookOpen, Film, Layers, Briefcase, Smile, GraduationCap } from 'lucide-react';
import { ContentSlot } from './types';
import AiImageGenerationModal from './AiImageGenerationModal';
import MediaDetailSidebar from '../media/MediaDetailSidebar';
import AIRewritePanel from './AIRewritePanel';
import { ButtonLoading } from './LoadingStates';
import { useModuleColors } from '../../hooks/useModuleColors';
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
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'options'>('content');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiOptions, setShowAiOptions] = useState(false);
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const postDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);

  const plannerColors = useModuleColors('planner');

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

  // Mock media library data
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
    { id: 'post', label: 'Post', icon: <FileText className="w-5 h-5" /> },
    { id: 'story', label: 'Story', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'reel', label: 'Reel', icon: <Film className="w-5 h-5" /> },
    { id: 'carousel', label: 'Carousel', icon: <Layers className="w-5 h-5" /> }
  ];

  const tones = [
    { id: 'professional', label: 'Professionell', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'casual', label: 'Locker', icon: <Smile className="w-5 h-5" /> },
    { id: 'inspiring', label: 'Inspirierend', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'educational', label: 'Lehrreich', icon: <GraduationCap className="w-5 h-5" /> }
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

  const handleAIEnhance = (type: 'rewrite' | 'emotionalize' | 'shorten') => {
    const enhancedContent = enhanceContentWithAI(editedSlot.body || editedSlot.content || '', editedSlot.platform, type);
    setEditedSlot(prev => ({
      ...prev,
      body: enhancedContent,
      content: enhancedContent,
      version: {
        original: prev.version?.original || prev.body || prev.content || '',
        edited: enhancedContent,
        lastModified: new Date()
      }
    }));
  };

  const enhanceContentWithAI = (content: string, platform: string, type: string): string => {
    const enhancements: Record<string, Record<string, string>> = {
      instagram: {
        rewrite: content + '\n\n✨ Überarbeitet für mehr Engagement!',
        emotionalize: content + '\n\n💫 Mit emotionalen Hooks optimiert!',
        shorten: content.substring(0, 100) + '... ⚡ Auf den Punkt gebracht!'
      },
      linkedin: {
        rewrite: content + '\n\n🔧 Professionell überarbeitet.',
        emotionalize: content + '\n\n💼 Mit Business-Impact optimiert.',
        shorten: content.substring(0, 150) + '... 📊 Kompakt und präzise.'
      }
    };

    return enhancements[platform]?.[type] || content + '\n\n✨ KI-optimiert!';
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

  const generateAISuggestions = () => {
    const suggestions = [
      `Basierend auf Insights: "5 Tipps für ${editedSlot.platform}"`,
      `Trending: "Warum ${editedSlot.platform} 2024 anders funktioniert"`,
      `Community-Frage: "Was ist euer größter ${editedSlot.platform} Fehler?"`
    ];
    setAiSuggestions(suggestions);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  React.useEffect(() => {
    generateAISuggestions();
  }, [editedSlot.platform]);

  const renderContentTab = () => (
    <div className="space-y-5">
      {/* Platform Selection */}
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Plattformen</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'instagram', label: 'Instagram', icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            )},
            { id: 'tiktok', label: 'TikTok', icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111111">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
              </svg>
            )},
            { id: 'facebook', label: 'Facebook', icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )},
            { id: 'twitter', label: 'X (Twitter)', icon: (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#111111">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )},
          ].map(platform => {
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
                  group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-300 overflow-hidden
                  ${isSelected
                    ? 'border-[#49B7E3] bg-[#F4FCFE] shadow-card'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE]'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-9 h-9 rounded-[var(--vektrus-radius-md)] flex items-center justify-center shadow-sm transition-all duration-300
                      ${isSelected
                        ? 'bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] shadow-md'
                        : 'bg-white border border-[rgba(73,183,227,0.18)] group-hover:border-[#B6EBF7]'
                      }
                    `}>
                      {platform.icon}
                    </div>
                    <span className="text-sm font-bold text-[#111111]">{platform.label}</span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-[#49D69E] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time - Now Editable */}
      <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-lg)] p-5 border border-[rgba(73,183,227,0.18)] shadow-subtle">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[#49B7E3] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-manrope text-[#111111]">
              Zeitplanung
            </h3>
            <p className="text-xs text-[#7A7A7A]">Wann soll dieser Post veröffentlicht werden?</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Datum */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-2 flex items-center space-x-1.5">
              <span>Datum</span>
            </label>
            <input
              type="date"
              value={formatLocalDate(editedSlot.date)}
              min={todayStr}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-').map(Number);
                const newDate = new Date(y, m - 1, d);
                setEditedSlot(prev => ({ ...prev, date: newDate }));
              }}
              className="w-full px-4 py-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-subtle hover:border-[#B6EBF7] transition-all duration-200 cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Uhrzeit */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-2 flex items-center space-x-1.5">
              <span>Uhrzeit</span>
            </label>
            <div className="relative">
              <select
                value={editedSlot.time}
                onChange={(e) => setEditedSlot(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3 pr-10 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-subtle hover:border-[#B6EBF7] transition-all duration-200 cursor-pointer appearance-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#B6EBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[rgba(73,183,227,0.18)]">
          <div className="text-xs text-[#7A7A7A] flex items-center space-x-1.5">
            <svg className="w-3.5 h-3.5 text-[#49D69E]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-[#111111]">
              {ensureDate(editedSlot.date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} - {editedSlot.time} Uhr
            </span>
          </div>
          {editedSlot.contentScore && (
            <div className="text-xs text-blue-600 font-medium mt-2">
              Score {editedSlot.contentScore.total} / 100
            </div>
          )}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <Type className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Content-Typ</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {contentTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setEditedSlot(prev => ({ ...prev, contentType: type.id as any }))}
              className={`
                group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-center transition-all duration-300
                ${editedSlot.contentType === type.id
                  ? 'border-[#B6EBF7] bg-[#F4FCFE] shadow-card scale-[1.02]'
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE]'
                }
              `}
            >
              <div className="mb-2 text-[#49B7E3]">{type.icon}</div>
              <div className="text-xs font-bold text-[#111111]">{type.label}</div>
            </button>
          ))}
        </div>
        
        {/* Dynamische Felder je Content-Typ */}
        {editedSlot.contentType === 'carousel' && (
          <div className="mt-4 p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
            <label className="text-sm font-medium text-[#111111] block mb-2">Slide-Überschriften</label>
            <input
              type="text"
              placeholder="Slide 1, Slide 2, Slide 3..."
              className="w-full p-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#49D69E] text-sm"
            />
          </div>
        )}
        
        {editedSlot.contentType === 'reel' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[#111111] block mb-2">Hook-Titel</label>
              <input
                type="text"
                placeholder="Aufmerksamkeit in 3 Sekunden..."
                className="w-full p-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#49D69E] text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111111] block mb-2">Dauer</label>
              <select className="w-full p-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] text-sm">
                <option>15 Sekunden</option>
                <option>30 Sekunden</option>
                <option>60 Sekunden</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium text-[#111111] block mb-2">Titel</label>
        <input
          type="text"
          value={editedSlot.title}
          onChange={(e) => setEditedSlot(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-3 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49D69E] focus:border-[#49D69E] transition-all duration-200"
          placeholder="Post-Titel eingeben..."
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Inhalt</span>
          </label>
          <button
            onClick={() => setShowAIRewrite(true)}
            className="group flex items-center space-x-2 text-sm font-bold text-white px-4 py-2 rounded-[var(--vektrus-radius-sm)] transition-all duration-200 shadow-card hover:shadow-elevated"
            style={{
              background: 'var(--vektrus-ai-violet)',
            }}
            title="KI Text-Optimierung öffnen"
            aria-label="Text mit KI umschreiben"
          >
            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>KI Umschreiben</span>
          </button>
        </div>

        {/* Pulse-Post Formatierte Vorschau */}
        {editedSlot.source === 'pulse' && (editedSlot.contentTypeDetail || editedSlot.estimatedEngagement) && (
          <div className="mb-4 p-5 bg-gradient-to-br from-[#E8F7F1] to-[#E5F5FB] rounded-[var(--vektrus-radius-md)] border-2 border-[#B4E8E5]/50 shadow-sm">
            {/* Header mit Badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {editedSlot.contentTypeDetail && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] text-xs font-bold bg-white border-2 border-[#B6EBF7] text-[#111111] shadow-sm">
                    {getContentTypeBadgeText(editedSlot.contentTypeDetail)}
                  </span>
                )}
                {editedSlot.estimatedEngagement && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] bg-white border border-[rgba(73,183,227,0.18)] shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${getEngagementColor(editedSlot.estimatedEngagement)}`}></div>
                    <span className="text-xs font-semibold text-[#7A7A7A]">
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
                  addToast({
                    type: 'success',
                    title: 'Text kopiert',
                    description: 'Post-Text wurde in die Zwischenablage kopiert',
                    duration: 2000
                  });
                }}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] bg-white hover:bg-[#B4E8E5] text-[#111111] border border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Text kopieren</span>
              </button>
            </div>

            {/* Post-Text */}
            <div className="mb-4 p-4 bg-white rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] shadow-sm">
              <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {editedSlot.body || editedSlot.content || ''}
              </p>
            </div>

            {/* Hashtags */}
            {editedSlot.hashtags && editedSlot.hashtags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {editedSlot.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#B6EBF7] to-[#B4E8E5] text-white rounded-[var(--vektrus-radius-sm)] text-xs font-bold shadow-sm"
                  >
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            {editedSlot.cta && (
              <div className="p-3 bg-gradient-to-r from-[#49D69E]/20 to-[#B4E8E5]/20 rounded-[var(--vektrus-radius-sm)] border-2 border-[#49D69E]/30">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#49D69E]" />
                  <span className="text-sm font-bold text-[#111111]">{editedSlot.cta}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            value={editedSlot.body || editedSlot.content || ''}
            onChange={(e) => setEditedSlot(prev => ({ ...prev, body: e.target.value, content: e.target.value }))}
            rows={6}
            className="w-full p-4 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] resize-none transition-all duration-300 bg-white text-[#111111] placeholder:text-[#7A7A7A]/60 shadow-sm hover:border-[#B6EBF7]"
            placeholder="Schreibe deinen Post-Inhalt..."
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <div className="absolute bottom-3 right-3 text-xs text-[#7A7A7A] font-medium bg-white px-2 py-1 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)]">
            {(editedSlot.body || editedSlot.content || '').length} Zeichen
          </div>
        </div>
        
        {/* KI-Vorschlag-Box */}
        {aiSuggestions.length > 0 && (
          <div className="mt-3 p-4 bg-gradient-to-br from-[#E8F7F1]/50 to-[#E5F5FB]/30 rounded-[var(--vektrus-radius-md)] border-2 border-[#49D69E] relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💡</span>
                <span className="text-sm font-medium text-[#111111]">KI-Vorschläge</span>
                <span className="text-xs bg-[#49D69E] text-white px-2 py-0.5 rounded-full font-medium shadow-sm">
                  {aiSuggestions.length}
                </span>
              </div>
              <button
                onClick={() => setShowAiOptions(!showAiOptions)} 
                className="text-xs text-[var(--vektrus-ai-violet)] hover:opacity-80"
              >
                {showAiOptions ? 'Weniger' : 'Mehr'} anzeigen
              </button>
            </div>
            {showAiOptions && (
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-[var(--vektrus-radius-md)] border-2 hover:border-[#49D69E] transition-all duration-200 group relative z-20 hover:shadow-sm">
                    <span className="text-sm text-[#111111] flex-1">{suggestion}</span>
                    <button
                      onClick={() => setEditedSlot(prev => ({ ...prev, content: suggestion }))}
                      className="text-xs bg-[#49D69E] hover:bg-[#49B7E3] text-white px-3 py-1 rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      Übernehmen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tone Selection */}
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#F4BE9D] to-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Tonalität</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tones.map(t => (
            <button
              key={t.id}
              onClick={() => setEditedSlot(prev => ({ ...prev, tone: t.id as any }))}
              className={`
                group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-300
                ${editedSlot.tone === t.id
                  ? 'border-[#B6EBF7] bg-gradient-to-br from-[#B6EBF7]/10 to-[#B4E8E5]/10 shadow-lg shadow-[#B6EBF7]/20 scale-[1.02]'
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/5'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="text-[#49B7E3]">{t.icon}</div>
                <span className="text-sm font-bold text-[#111111]">{t.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA Selection */}
      <div>
        <label className="text-sm font-medium text-[#111111] block mb-2">Call-to-Action</label>
        <select
          value={editedSlot.cta || ''}
          onChange={(e) => setEditedSlot(prev => ({ ...prev, cta: e.target.value }))}
          className="w-full p-3 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#49D69E] focus:border-[#49D69E] transition-all duration-200"
        >
          <option value="">CTA wählen (optional)</option>
          {ctaOptions.map(cta => (
            <option key={cta} value={cta}>{cta}</option>
          ))}
        </select>
      </div>

      {/* Hashtags */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-[#111111] flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
              <Hash className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Hashtags</span>
          </label>
          <button
            onClick={generateHashtags}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] transition-colors"
            style={{
              color: '#9D4EDD',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(157, 78, 221, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>KI-Hashtags</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 p-4 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] min-h-[80px] focus-within:border-[#B6EBF7] focus-within:ring-2 focus-within:ring-[#B6EBF7]/20 transition-all duration-300 bg-white shadow-sm hover:border-[#B6EBF7]">
          {editedSlot.hashtags.map((hashtag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#B6EBF7] to-[#B4E8E5] text-white rounded-[var(--vektrus-radius-sm)] text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 animate-in zoom-in-50"
            >
              #{hashtag}
              <button
                onClick={() => setEditedSlot(prev => ({
                  ...prev,
                  hashtags: prev.hashtags.filter((_, i) => i !== index)
                }))}
                className="ml-2 hover:text-[#FA7E70] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Hashtag hinzufügen..."
            className="flex-1 min-w-[140px] outline-none text-sm bg-transparent text-[#111111] placeholder:text-[#7A7A7A]/60 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
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
        <p className="text-xs text-[#7A7A7A] mt-2 ml-1">Drücke Enter zum Hinzufügen</p>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      {/* Letzte Uploads Galerie */}
      <div>
        <label className="text-sm font-medium text-[#111111] block mb-3">
          <Image className="w-4 h-4 inline mr-2" />
          Medien-Galerie
        </label>
        
        {/* Current Media Display */}
        {editedSlot.media?.url ? (
          <div className="mb-4">
            <div className="relative bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] overflow-hidden border border-[rgba(73,183,227,0.18)]">
              {editedSlot.media.type === 'video' ? (
                <div className="relative w-full">
                  <video
                    key={editedSlot.media.url}
                    ref={currentVideoRef}
                    src={`${editedSlot.media.url}#t=0.1`}
                    className="w-full rounded-[var(--vektrus-radius-sm)]"
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-[var(--vektrus-radius-sm)] pointer-events-none z-10">
                    Video
                  </div>
                </div>
              ) : (
                <img
                  src={editedSlot.media.url}
                  alt="Post Media"
                  className="w-full h-full object-cover aspect-square"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentVideoRef.current) {
                    currentVideoRef.current.pause();
                  }
                  setEditedSlot(prev => ({ ...prev, media: undefined }));
                }}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-[#7A7A7A]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="aspect-square bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#B6EBF7] transition-colors">
                <Image className="w-6 h-6 text-[#7A7A7A]" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-[#111111] block mb-3">Neues Medium hinzufügen</label>
        
        {/* Upload Buttons */}
        <div className="space-y-3 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group w-full flex items-center justify-center space-x-2 py-4 px-5 text-white rounded-[var(--vektrus-radius-sm)] font-bold transition-all duration-200 hover:scale-[1.01] shadow-card hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#4169E1' }}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Wird hochgeladen...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span>Datei hochladen</span>
              </>
            )}
          </button>

          {isUploading && (
            <div className="w-full bg-[#B6EBF7]/20 rounded-full h-2">
              <div
                className="bg-[#4169E1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={() => setShowAiImageModal(true)}
            className="group w-full flex items-center justify-center space-x-2 py-4 px-5 text-white rounded-[var(--vektrus-radius-sm)] font-bold transition-all duration-300 hover:scale-[1.01] shadow-card hover:shadow-elevated relative overflow-hidden"
            style={{ background: 'var(--vektrus-ai-violet)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 33%, #E8A0D6 66%, #F4BE9D 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--vektrus-ai-violet)';
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
            <span className="relative z-10">KI-Bild generieren</span>
          </button>

          <button
            onClick={() => setShowMediaLibrary(true)}
            className="group w-full flex items-center justify-center space-x-2 py-4 px-5 border-2 text-[#111111] rounded-[var(--vektrus-radius-md)] font-bold transition-all duration-300 hover:scale-[1.01] shadow-sm"
            style={{
              borderColor: '#4169E1',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Image className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: '#4169E1' }} />
            <span>Aus Mediathek wählen</span>
          </button>
        </div>

        <div className="mt-5 p-4 bg-[rgba(124,108,242,0.06)] rounded-[var(--vektrus-radius-md)] border border-[rgba(124,108,242,0.15)]">
          <p className="text-sm text-[#111111] text-center font-medium">
            <Sparkles className="w-4 h-4 inline mr-1" style={{ color: '#9D4EDD' }} />
            Lasse dir ein Bild von der KI erstellen – mit Beschreibung oder inspirierenden Bildern
          </p>
        </div>
      </div>

      {/* AI Image Generation Modal */}
      {showAiImageModal && (
        <AiImageGenerationModal
          onGenerate={handleAiImageGenerated}
          onClose={() => setShowAiImageModal(false)}
        />
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#111111]">Aus Mediathek wählen</h2>
                  <p className="text-sm text-[#7A7A7A] mt-1">
                    Wähle ein Medium aus deiner Bibliothek
                  </p>
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
                      <Loader2 className="w-8 h-8 animate-spin text-[#49D69E] mx-auto mb-2" />
                      <p className="text-sm text-[#7A7A7A]">Mediathek wird geladen...</p>
                    </div>
                  </div>
                ) : mediaLibrary.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-sm">
                      <div className="w-16 h-16 bg-[#F4FCFE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-[#7A7A7A] mb-2">Noch keine Medien vorhanden</p>
                      <p className="text-xs text-[#999]">Erstelle Bilder mit KI oder lade deine eigenen hoch</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaLibrary.map(media => (
                    <div
                      key={media.id}
                      onClick={() => handleMediaLibrarySelect(media)}
                      className={`relative aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedLibraryMedia?.id === media.id
                          ? 'ring-4 ring-[#49D69E] shadow-lg'
                          : 'hover:shadow-md border border-[rgba(73,183,227,0.18)]'
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
                            <div className="bg-black/50 rounded-full p-3">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                      )}
                      
                      {/* Format Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                          {media.format}
                        </span>
                      </div>

                      {/* AI Badge */}
                      {media.source === 'ai_generated' && (
                        <div className="absolute top-2 right-2">
                          <div className="px-2 py-1 bg-[rgba(124,108,242,0.15)] text-[var(--vektrus-ai-violet)] text-xs font-medium rounded-[var(--vektrus-radius-sm)] flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>KI</span>
                          </div>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {selectedLibraryMedia?.id === media.id && (
                        <div className="absolute inset-0 bg-[#49D69E]/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#49D69E] rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-white" />
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
                <div className="w-80 border-l border-[rgba(73,183,227,0.18)] p-6">
                  <h3 className="font-semibold text-[#111111] mb-4">Vorschau</h3>

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
                  
                  <div className="space-y-2 text-sm">
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
            <div className="p-6 border-t border-[rgba(73,183,227,0.18)] flex items-center justify-between">
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="px-5 py-2.5 border-2 border-[rgba(73,183,227,0.18)] hover:border-gray-300 text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-semibold transition-all duration-200 hover:scale-[1.02]"
              >
                Abbrechen
              </button>
              
              <button
                onClick={() => selectedLibraryMedia && handleInsertFromLibrary(selectedLibraryMedia)}
                disabled={!selectedLibraryMedia}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-[var(--vektrus-radius-md)] font-semibold transition-all duration-200 ${
                  selectedLibraryMedia
                    ? 'bg-gradient-to-r from-[#49D69E] to-[#49B7E3] hover:shadow-lg text-white hover:scale-105'
                    : 'bg-[#B6EBF7]/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>Medium übernehmen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOptionsTab = () => (
    <div className="space-y-6">
      {/* Zeitplanung Section */}
      <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-lg)] p-5 border border-[rgba(73,183,227,0.18)] shadow-subtle">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-[#49B7E3] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-subtle">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111111]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Zeitplanung
            </h3>
            <p className="text-xs text-[#7A7A7A]">Wähle die optimale Veröffentlichungszeit</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Datum */}
          <div>
            <label className="text-sm font-semibold text-[#111111] block mb-2 flex items-center space-x-2">
              <span className="text-base">📅</span>
              <span>Datum</span>
            </label>
            <input
              type="date"
              value={formatLocalDate(editedSlot.date)}
              min={todayStr}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-').map(Number);
                const newDate = new Date(y, m - 1, d);
                setEditedSlot(prev => ({ ...prev, date: newDate }));
              }}
              className="w-full px-4 py-3.5 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-sm hover:border-[#B6EBF7] hover:shadow-md transition-all duration-300 cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Uhrzeit */}
          <div>
            <label className="text-sm font-semibold text-[#111111] block mb-2 flex items-center space-x-2">
              <span className="text-base">⏰</span>
              <span>Uhrzeit</span>
            </label>
            <div className="relative">
              <select
                value={editedSlot.time}
                onChange={(e) => setEditedSlot(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3.5 pr-10 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-sm hover:border-[#B6EBF7] hover:shadow-md transition-all duration-300 cursor-pointer appearance-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isCustomTime && (
                  <option value={editedSlot.time}>{editedSlot.time} Uhr</option>
                )}
                <optgroup label="Morgens" className="font-bold">
                  <option value="06:00">06:00 Uhr</option>
                  <option value="07:00">07:00 Uhr</option>
                  <option value="08:00">08:00 Uhr</option>
                  <option value="09:00">09:00 Uhr</option>
                  <option value="10:00">10:00 Uhr</option>
                </optgroup>
                <optgroup label="Mittags" className="font-bold">
                  <option value="11:00">11:00 Uhr</option>
                  <option value="12:00">12:00 Uhr</option>
                  <option value="13:00">13:00 Uhr</option>
                  <option value="14:00">14:00 Uhr</option>
                  <option value="15:00">15:00 Uhr</option>
                  <option value="16:00">16:00 Uhr</option>
                </optgroup>
                <optgroup label="Abends" className="font-bold">
                  <option value="17:00">17:00 Uhr</option>
                  <option value="18:00">18:00 Uhr</option>
                  <option value="19:00">19:00 Uhr</option>
                  <option value="20:00">20:00 Uhr</option>
                  <option value="21:00">21:00 Uhr</option>
                  <option value="22:00">22:00 Uhr</option>
                </optgroup>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#B6EBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#7A7A7A] flex items-center space-x-1">
              <svg className="w-3.5 h-3.5 text-[#49D69E]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Gewaehlte Zeit: {ensureDate(editedSlot.date).toLocaleDateString('de-DE')} um {editedSlot.time} Uhr</span>
            </p>
          </div>
        </div>
      </div>

      {/* Zielzuordnung */}
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <span className="text-base">🎯</span>
          <span>Ziel für diesen Post</span>
        </label>
        <select
          value={editedSlot.targetAudience || ''}
          onChange={(e) => setEditedSlot(prev => ({ ...prev, targetAudience: e.target.value }))}
          className="w-full px-4 py-3.5 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#49D69E]/50 focus:border-[#49D69E] shadow-sm hover:border-[#49D69E] hover:shadow-md transition-all duration-300 cursor-pointer"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <option value="">Standard-Zielgruppe</option>
          <option value="awareness">Awareness</option>
          <option value="conversion">Conversion</option>
          <option value="engagement">Engagement</option>
          <option value="retention">Kundenbindung</option>
        </select>
      </div>

      {/* Content Score */}
      {editedSlot.contentScore && (
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[#111111] text-sm">Content Score</h4>
            <span className={`text-sm font-bold ${editedSlot.contentScore.total >= 85 ? 'text-green-600' : editedSlot.contentScore.total >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
              {editedSlot.contentScore.total} / 100
            </span>
          </div>
          <div className="h-2 bg-[#F4FCFE] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full ${editedSlot.contentScore.total >= 85 ? 'bg-green-500' : editedSlot.contentScore.total >= 70 ? 'bg-blue-500' : 'bg-amber-400'}`}
              style={{ width: `${editedSlot.contentScore.total}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#7A7A7A]">
            <span>Lesbarkeit: {editedSlot.contentScore.readability}</span>
            <span>Hook: {editedSlot.contentScore.hookStrength}</span>
            <span>Hashtags: {editedSlot.contentScore.hashtagQuality}</span>
            <span>CTA: {editedSlot.contentScore.ctaClarity}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-[#B6EBF7] to-[#49B7E3] hover:shadow-lg text-white rounded-[var(--vektrus-radius-md)] font-semibold transition-all duration-200 hover:scale-[1.02]">
          <Copy className="w-4 h-4" />
          <span>Auf andere Plattform kopieren</span>
        </button>

        <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-[rgba(73,183,227,0.18)] hover:border-[#49D69E] text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-semibold transition-all duration-200 hover:bg-[#E8F7F1]/50">
          <Clock className="w-4 h-4" />
          <span>Für später einplanen</span>
        </button>

        <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-[#FA7E70] hover:bg-[#FA7E70] text-[#FA7E70] hover:text-white rounded-[var(--vektrus-radius-md)] font-semibold transition-all duration-200 hover:scale-[1.02]">
          <Trash2 className="w-4 h-4" />
          <span>Löschen</span>
        </button>
      </div>

      {/* Versions */}
      {editedSlot.version && (
        <div>
          <h4 className="font-medium text-[#111111] mb-3">📝 Versionen</h4>
          <div className="space-y-2">
            <div className="p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#111111]">✏️ Aktuelle Version</span>
                <span className="text-xs text-[#7A7A7A]">
                  {editedSlot.version.lastModified.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="p-3 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] hover:border-[#49D69E] transition-colors group">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#7A7A7A]">🤖 KI-Originalvorschlag</span>
                <button
                  onClick={() => setEditedSlot(prev => ({
                    ...prev,
                    body: prev.version?.original || prev.body || prev.content || '',
                    content: prev.version?.original || prev.body || prev.content || ''
                  }))}
                  className="text-xs bg-[#49D69E] hover:bg-[#49B7E3] text-white px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  Wiederherstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] animate-in fade-in-0 duration-200" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[501] p-3 pointer-events-none">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] pointer-events-auto animate-in fade-in-0 slide-in-from-bottom-8 duration-500 border border-[rgba(73,183,227,0.10)] overflow-hidden">
          {/* Header */}
          <div className="relative px-5 py-3 border-b border-[rgba(73,183,227,0.10)] bg-gradient-to-r from-[#F4FCFE] via-white to-[#F4FCFE] flex-shrink-0 rounded-t-[var(--vektrus-radius-lg)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7]/5 via-transparent to-[#B4E8E5]/5 opacity-50 rounded-t-[var(--vektrus-radius-lg)]"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] blur-md opacity-50"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-lg">
                    <Type className="w-4.5 h-4.5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Post bearbeiten
                  </h2>
                  <p className="text-xs text-[#7A7A7A] font-medium leading-tight">Erstelle deinen perfekten Post</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#7A7A7A] hover:text-[#FA7E70] hover:bg-[#FA7E70]/10 rounded-[var(--vektrus-radius-sm)] transition-all duration-300 hover:scale-110 hover:rotate-90 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

      {/* Tabs */}
      <div className="px-5 pt-2 border-b border-[rgba(73,183,227,0.10)] bg-[#F4FCFE]/50 flex-shrink-0">
        <div className="flex space-x-1">
          {[
            { id: 'content', label: 'Inhalt', icon: Type },
            { id: 'media', label: 'Medien', icon: Image },
            { id: 'options', label: 'Optionen', icon: Clock }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  relative flex items-center space-x-2 py-2 px-4 text-sm font-bold transition-all duration-300 rounded-t-[var(--vektrus-radius-md)]
                  ${activeTab === tab.id
                    ? 'text-[#B6EBF7] bg-white shadow-sm'
                    : 'text-[#7A7A7A] hover:text-[#111111] hover:bg-white/50'
                  }
                `}
              >
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#B6EBF7] to-[#B4E8E5] rounded-full"></div>
                )}
                <IconComponent className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-white to-gray-50/30">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'media' && renderMediaTab()}
        {activeTab === 'options' && renderOptionsTab()}
      </div>

      {/* Post Result Banner */}
      {postResult && (
        <div className={`px-5 py-3 flex items-center space-x-3 text-sm font-medium border-t ${
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

      {/* Footer Actions */}
      <div className="p-5 border-t border-[rgba(73,183,227,0.10)] bg-gradient-to-br from-gray-50 to-white flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving || isPosting}
            className="px-5 py-3.5 rounded-[var(--vektrus-radius-md)] border-2 border-gray-300 hover:bg-[#F4FCFE] hover:border-gray-400 text-sm font-bold text-[#111111] transition-all duration-300 disabled:opacity-50 hover:scale-[1.01] shadow-sm"
            aria-label="Abbrechen"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isPosting}
            className="flex items-center justify-center space-x-2 px-5 py-3.5 rounded-[var(--vektrus-radius-md)] border-2 border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-sm font-bold text-[#111111] transition-all duration-300 disabled:opacity-50 hover:scale-[1.01] shadow-sm"
            aria-label="Speichern"
          >
            <ButtonLoading isLoading={isSaving}>
              <>
                <Save className="w-4 h-4" />
                <span>Speichern</span>
              </>
            </ButtonLoading>
          </button>

          {/* Post Button with Dropdown */}
          <div className="relative flex-1" ref={postDropdownRef}>
            <div className="flex">
              <button
                onClick={() => handlePost(true)}
                disabled={isPosting || isSaving || accountConnected === false || editedSlot.status === 'published'}
                className="group flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-l-[var(--vektrus-radius-md)] font-bold transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] shadow-xl relative overflow-hidden"
                style={{
                  background: accountConnected === false || editedSlot.status === 'published'
                    ? '#9ca3af'
                    : '#b4e8e5',
                  color: accountConnected === false || editedSlot.status === 'published'
                    ? '#ffffff'
                    : '#111111',
                }}
                title={
                  accountConnected === false
                    ? `Verbinde zuerst deinen ${editedSlot.platform}-Account in den Einstellungen`
                    : editedSlot.status === 'published'
                      ? 'Dieser Post wurde bereits veröffentlicht'
                      : 'Jetzt auf Social Media posten'
                }
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isPosting ? (
                  <div className="flex items-center space-x-2 relative z-10">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Wird gepostet...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Jetzt posten</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPostDropdown(!showPostDropdown)}
                disabled={isPosting || isSaving || accountConnected === false || editedSlot.status === 'published'}
                className="flex items-center justify-center px-3 py-3.5 rounded-r-[var(--vektrus-radius-md)] font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-l border-[#111111]/10"
                style={{
                  background: accountConnected === false || editedSlot.status === 'published'
                    ? '#9ca3af'
                    : '#b4e8e5',
                  color: accountConnected === false || editedSlot.status === 'published'
                    ? '#ffffff'
                    : '#111111',
                }}
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showPostDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showPostDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-[var(--vektrus-radius-md)] shadow-2xl border-2 border-[rgba(73,183,227,0.18)] overflow-hidden z-50">
                <button
                  onClick={() => handlePost(true)}
                  disabled={isPosting}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-semibold text-[#111111] hover:bg-[#E8F7F1] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#49D69E]" />
                  <div className="text-left">
                    <div>Jetzt posten</div>
                    <div className="text-xs text-[#7A7A7A] font-normal">Sofort veroeffentlichen</div>
                  </div>
                </button>
                <div className="border-t border-[rgba(73,183,227,0.10)]" />
                <button
                  onClick={() => handlePost(false)}
                  disabled={isPosting}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-semibold text-[#111111] hover:bg-[#E5F5FB] transition-colors disabled:opacity-50"
                >
                  <CalendarClock className="w-4 h-4 text-[#49B7E3]" />
                  <div className="text-left">
                    <div>Zum geplanten Zeitpunkt posten</div>
                    <div className="text-xs text-[#7A7A7A] font-normal">
                      {editedSlot.date instanceof Date
                        ? editedSlot.date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
                        : new Date(editedSlot.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
                      } um {editedSlot.time} Uhr
                    </div>
                  </div>
                </button>
              </div>
            )}

            {accountConnected === false && (
              <div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-[#FEF2F0] border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-sm)] text-xs text-[#c0392b] flex items-center space-x-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Verbinde zuerst deinen {editedSlot.platform}-Account in den Einstellungen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Rewrite Modal */}
      {showAIRewrite && (
        <AIRewritePanel
          originalContent={editedSlot.body || editedSlot.content || ''}
          currentTone={editedSlot.tone}
          onApplyRewrite={handleApplyRewrite}
          onClose={() => setShowAIRewrite(false)}
        />
      )}
        </div>
      </div>
    </>
  );
};

export default ContentSlotEditor;