import React, { useState } from 'react';
import { Instagram, Linkedin, Facebook, Music2, X, Save, Wand2, Hash, Image, Upload, Type, MessageSquare, Clock, Check, Sparkles, CalendarPlus, Zap, TrendingUp, Star, Lightbulb } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/toast';
import AIRewritePanel from '../planner/AIRewritePanel';
import AiImageGenerationModal from '../planner/AiImageGenerationModal';
import MediaUploadModal from '../media/MediaUploadModal';
import { useModuleColors } from '../../hooks/useModuleColors';
import { parseContent } from '../../lib/contentParser';

interface ContentplanSchedulerProps {
  message: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContentplanScheduler: React.FC<ContentplanSchedulerProps> = ({ message, onClose, onSuccess }) => {
  const { addToast } = useToast();
  const plannerColors = useModuleColors('planner');

  const parsed = parseContent(message);

  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');
  const [platform, setPlatform] = useState('instagram');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('09:00');
  const [contentType, setContentType] = useState(parsed.content_type || 'post');
  const [tone, setTone] = useState('professional');
  const [content, setContent] = useState(parsed.primary_text);
  const [hashtags, setHashtags] = useState<string[]>(parsed.hashtags.map(h => h.replace(/^#/, '')));
  const [cta, setCta] = useState(parsed.cta);
  const [mediaUrl, setMediaUrl] = useState('');
  const [showAIRewrite, setShowAIRewrite] = useState(false);
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Music2 className="w-4 h-4" />,
    }
  ];

  const contentTypes = [
    { id: 'post', label: 'Post', icon: MessageSquare },
    { id: 'story', label: 'Story', icon: Zap },
    { id: 'reel', label: 'Reel', icon: TrendingUp },
    { id: 'carousel', label: 'Carousel', icon: Image }
  ];

  const tones = [
    { id: 'professional', label: 'Professionell', icon: Star },
    { id: 'casual', label: 'Locker', icon: MessageSquare },
    { id: 'inspiring', label: 'Inspirierend', icon: Sparkles },
    { id: 'educational', label: 'Lehrreich', icon: Lightbulb }
  ];

  const ctaOptions = [
    'Mehr erfahren', 'Jetzt buchen', 'Link in Bio', 'DM für Details',
    'Kommentiere unten', 'Teile deine Meinung', 'Folge für mehr', 'Speichere diesen Post'
  ];

  const generateHashtags = () => {
    const aiHashtags = [
      'business', 'entrepreneur', 'success', 'growth', 'motivation',
      'innovation', 'leadership', 'strategy', 'marketing', 'productivity'
    ];
    setHashtags(aiHashtags.slice(0, 5));
  };

  const handleApplyRewrite = (newContent: string, newTone: string) => {
    setContent(newContent);
    setTone(newTone);
    setShowAIRewrite(false);
  };

  const handleAIImageGenerate = (imageUrl: string) => {
    setMediaUrl(imageUrl);
    setShowAIImageModal(false);
    addToast({
      type: 'success',
      title: 'KI-Bild hinzugefügt',
      description: 'Dein generiertes Bild wurde erfolgreich hinzugefügt',
      duration: 3000
    });
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const imageUrl = URL.createObjectURL(files[0]);
      setMediaUrl(imageUrl);
      setShowUploadModal(false);
      addToast({
        type: 'success',
        title: 'Datei hochgeladen',
        description: `${files.length} Datei${files.length > 1 ? 'en' : ''} erfolgreich hochgeladen`,
        duration: 3000
      });
    }
  };

  const handleMediaLibrarySelect = (selectedMediaUrl: string) => {
    setMediaUrl(selectedMediaUrl);
    setShowMediaLibrary(false);
    addToast({
      type: 'success',
      title: 'Medium ausgewählt',
      description: 'Das Medium wurde erfolgreich hinzugefügt',
      duration: 3000
    });
  };

  const handleSchedule = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Nicht authentifiziert');
      }

      const scheduledDate = new Date(`${date}T${time}:00`);

      const contentJsonb: Record<string, any> = {
        primary_text: content,
        hashtags: hashtags,
        cta: cta,
        hook: content.substring(0, 50) || 'Neuer Post',
      };
      if (mediaUrl) {
        contentJsonb.media_urls = [mediaUrl];
      }

      const { error } = await supabase
        .from('pulse_generated_content')
        .insert({
          user_id: session.user.id,
          platform: platform,
          content: contentJsonb,
          scheduled_date: scheduledDate.toISOString(),
          status: 'draft',
          source: 'chat',
          content_type: contentType,
          post_number: 1
        });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Erfolgreich!',
        description: 'Post wurde zum Contentplan hinzugefügt',
        duration: 3000
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to schedule content:', err);
      addToast({
        type: 'error',
        title: 'Fehler',
        description: err.message || 'Konnte Post nicht hinzufügen',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContentTab = () => (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Plattformen</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`
                group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-300 overflow-hidden
                ${platform === p.id
                  ? 'border-[#B6EBF7] bg-gradient-to-br from-[#B6EBF7]/10 to-[#B4E8E5]/10 shadow-lg shadow-[#B6EBF7]/20 scale-[1.02]'
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/5 hover:scale-[1.01]'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-9 h-9 rounded-[var(--vektrus-radius-md)] flex items-center justify-center shadow-sm transition-all duration-300
                    ${platform === p.id
                      ? 'bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] text-white shadow-md'
                      : 'bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] group-hover:border-[#B6EBF7] group-hover:text-[#B6EBF7]'
                    }
                  `}>
                    {p.icon}
                  </div>
                  <span className="text-sm font-bold text-[#111111]">{p.name}</span>
                </div>
                {platform === p.id && (
                  <div className="w-6 h-6 bg-[#49D69E] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <Type className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Content-Typ</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {contentTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`
                  group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-center transition-all duration-300
                  ${contentType === type.id
                    ? 'border-[#B6EBF7] bg-gradient-to-br from-[#B6EBF7]/10 to-[#B4E8E5]/10 shadow-lg shadow-[#B6EBF7]/20 scale-105'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/5'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-[var(--vektrus-radius-md)] mx-auto mb-2 flex items-center justify-center transition-all duration-300
                  ${contentType === type.id
                    ? 'bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] text-white shadow-md'
                    : 'bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] group-hover:border-[#B6EBF7] group-hover:text-[#B6EBF7]'
                  }
                `}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#111111]">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

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
            className="group flex items-center space-x-2 text-sm font-bold text-white px-4 py-2 rounded-[var(--vektrus-radius-md)] transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg"
            style={{
              background: '#9D4EDD',
            }}
          >
            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>KI Umschreiben</span>
          </button>
        </div>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-4 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] resize-none transition-all duration-300 bg-white text-[#111111] placeholder:text-[#7A7A7A]/60 shadow-sm hover:border-[#B6EBF7]"
            placeholder="Schreibe deinen Post-Inhalt..."
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <div className="absolute bottom-3 right-3 text-xs text-[#7A7A7A] font-medium bg-white px-2 py-1 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)]">
            {content.length} Zeichen
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#F4BE9D] to-[#B6EBF7] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Tonalität</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tones.map(t => {
            const IconComponent = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`
                  group relative p-4 rounded-[var(--vektrus-radius-md)] border-2 text-left transition-all duration-300
                  ${tone === t.id
                    ? 'border-[#B6EBF7] bg-gradient-to-br from-[#B6EBF7]/10 to-[#B4E8E5]/10 shadow-lg shadow-[#B6EBF7]/20 scale-[1.02]'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/5'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-[var(--vektrus-radius-md)] flex items-center justify-center transition-all duration-300
                    ${tone === t.id
                      ? 'bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] text-white shadow-md'
                      : 'bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] group-hover:border-[#B6EBF7] group-hover:text-[#B6EBF7]'
                    }
                  `}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#111111]">{t.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-3 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Call-to-Action</span>
        </label>
        <select
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          className="w-full p-3.5 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] transition-all duration-300 bg-white text-[#111111] font-medium shadow-sm hover:border-[#B6EBF7] cursor-pointer"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <option value="">CTA wählen (optional)</option>
          {ctaOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

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
          {hashtags.map((hashtag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#B6EBF7] to-[#B4E8E5] text-white rounded-[var(--vektrus-radius-sm)] text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 animate-in zoom-in-50"
            >
              #{hashtag}
              <button
                onClick={() => setHashtags(prev => prev.filter((_, i) => i !== index))}
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
                if (value && !hashtags.includes(value)) {
                  setHashtags(prev => [...prev, value]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
        <p className="text-xs text-[#7A7A7A] mt-2 ml-1">Drücke Enter zum Hinzufügen</p>
      </div>

      {/* Zeitplanung - Schönes Design wie in ContentSlotEditor */}
      <div className="bg-gradient-to-br from-[#F4FCFE] to-white rounded-[var(--vektrus-radius-lg)] p-5 border-2 border-[#B6EBF7]/30 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-md)] flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Zeitplanung
            </h3>
            <p className="text-xs text-[#7A7A7A]">Wann soll dieser Post veröffentlicht werden?</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Datum */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-2 flex items-center space-x-1.5">
              <span className="text-sm">📅</span>
              <span>Datum</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-sm hover:border-[#B6EBF7] hover:shadow-md transition-all duration-300 cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Uhrzeit */}
          <div>
            <label className="text-xs font-semibold text-[#7A7A7A] block mb-2 flex items-center space-x-1.5">
              <span className="text-sm">⏰</span>
              <span>Uhrzeit</span>
            </label>
            <div className="relative">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-sm text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] shadow-sm hover:border-[#B6EBF7] hover:shadow-md transition-all duration-300 cursor-pointer appearance-none"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <optgroup label="🌅 Morgens">
                  <option value="06:00">06:00 Uhr</option>
                  <option value="07:00">07:00 Uhr</option>
                  <option value="08:00">08:00 Uhr</option>
                  <option value="09:00">09:00 Uhr</option>
                  <option value="10:00">10:00 Uhr</option>
                </optgroup>
                <optgroup label="☀️ Mittags">
                  <option value="11:00">11:00 Uhr</option>
                  <option value="12:00">12:00 Uhr</option>
                  <option value="13:00">13:00 Uhr</option>
                  <option value="14:00">14:00 Uhr</option>
                  <option value="15:00">15:00 Uhr</option>
                  <option value="16:00">16:00 Uhr</option>
                </optgroup>
                <optgroup label="🌙 Abends">
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
              Geplant für {new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} • {time} Uhr
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-[#111111] block mb-4 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
            <Image className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Medien hinzufügen</span>
        </label>

        {mediaUrl ? (
          <div className="mb-4">
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-[var(--vektrus-radius-md)] overflow-hidden border-2 border-[rgba(73,183,227,0.18)] shadow-lg">
              <img
                src={mediaUrl}
                alt="Post Media"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setMediaUrl('')}
                className="absolute top-3 right-3 p-2 bg-white hover:bg-[#FA7E70] hover:text-white rounded-[var(--vektrus-radius-md)] transition-all duration-300 shadow-lg hover:scale-110 border border-[rgba(73,183,227,0.18)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="group w-full flex items-center justify-center space-x-2 py-4 px-5 text-white rounded-[var(--vektrus-radius-md)] font-bold transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-modal"
              style={{ background: '#4169E1' }}
            >
              <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              <span>Datei hochladen</span>
            </button>

            <button
              onClick={() => setShowAIImageModal(true)}
              className="group w-full flex items-center justify-center space-x-2 py-4 px-5 text-white rounded-[var(--vektrus-radius-md)] font-bold transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-modal relative overflow-hidden"
              style={{ background: '#9D4EDD' }}
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
        )}

        <div className="mt-5 p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#B87EE6]/10 rounded-[var(--vektrus-radius-md)] border border-[#9D4EDD]/30">
          <p className="text-sm text-[#111111] text-center font-medium">
            <Sparkles className="w-4 h-4 inline mr-1" style={{ color: '#9D4EDD' }} />
            Lasse dir ein Bild von der KI erstellen – mit Beschreibung oder inspirierenden Bildern
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 animate-in fade-in-0 duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal flex flex-col max-h-[95vh] animate-in fade-in-0 slide-in-from-bottom-8 duration-500 border border-[rgba(73,183,227,0.10)] overflow-hidden">
        <div className="relative px-5 py-3 border-b border-[rgba(73,183,227,0.10)] bg-gradient-to-r from-[#F4FCFE] via-white to-[#F4FCFE] flex-shrink-0 rounded-t-[var(--vektrus-radius-lg)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7]/5 via-transparent to-[#B4E8E5]/5 opacity-50 rounded-t-[var(--vektrus-radius-lg)]"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] blur-md opacity-50"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-[#B6EBF7] to-[#B4E8E5] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center shadow-lg">
                  <CalendarPlus className="w-4.5 h-4.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111111] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Zum Contentplan hinzufügen
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

        <div className="px-5 pt-2 border-b border-[rgba(73,183,227,0.10)] bg-[#F4FCFE]/50 flex-shrink-0">
          <div className="flex space-x-1">
            {[
              { id: 'content', label: 'Inhalt', icon: Type },
              { id: 'media', label: 'Medien', icon: Image }
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

        <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-white to-gray-50/30">
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'media' && renderMediaTab()}
        </div>

        <div className="p-5 border-t border-[rgba(73,183,227,0.10)] bg-gradient-to-br from-gray-50 to-white flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3.5 rounded-[var(--vektrus-radius-md)] border-2 border-gray-300 hover:bg-[#F4FCFE] hover:border-gray-400 text-sm font-bold text-[#111111] transition-all duration-300 disabled:opacity-50 hover:scale-[1.01] shadow-sm"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSchedule}
              disabled={isSubmitting}
              className="group flex-1 flex items-center justify-center space-x-2 text-white py-3.5 rounded-[var(--vektrus-radius-md)] font-bold transition-all duration-300 hover:shadow-modal disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #3B9FB5 0%, #49D69E 100%)',
                backgroundSize: '200% 100%',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Save className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10">{isSubmitting ? 'Wird hinzugefügt...' : 'Speichern & Planen'}</span>
            </button>
          </div>
        </div>

        {showAIRewrite && (
          <AIRewritePanel
            originalContent={content}
            currentTone={tone}
            onApplyRewrite={handleApplyRewrite}
            onClose={() => setShowAIRewrite(false)}
          />
        )}
      </div>

      {showAIImageModal && (
        <AiImageGenerationModal
          onGenerate={handleAIImageGenerate}
          onClose={() => setShowAIImageModal(false)}
        />
      )}

      {showUploadModal && (
        <MediaUploadModal
          onUpload={handleFileUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showMediaLibrary && (
        <MediaLibraryModal
          onSelect={handleMediaLibrarySelect}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );
};

// Simple Media Library Modal Component
interface MediaLibraryModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ onSelect, onClose }) => {
  const sampleMedia = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#111111]">Mediathek</h2>
              <p className="text-sm text-[#7A7A7A] mt-1">Wähle ein Medium aus deiner Bibliothek</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-4">
            {sampleMedia.map((url, index) => (
              <button
                key={index}
                onClick={() => onSelect(url)}
                className="group relative aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden border-2 border-[rgba(73,183,227,0.18)] hover:border-[#4169E1] transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[rgba(73,183,227,0.18)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[rgba(73,183,227,0.18)] hover:border-[#4169E1] text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentplanScheduler;
