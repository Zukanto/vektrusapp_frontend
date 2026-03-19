import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Save, Trash2, RefreshCw, Sparkles, Upload, Image, Calendar, Clock, Hash, Tag, Type, Palette, MessageSquare, Check, Plus, Wand2, FileText, BookOpen, Film, Layers } from 'lucide-react';
import { ContentSlot } from './types';
import AiImageGenerationModal from './AiImageGenerationModal';
import { CalendarService } from '../../services/calendarService';
import SocialIcon, { getPlatformColor } from '../ui/SocialIcon';

interface PostReviewModalProps {
  generatedPosts: ContentSlot[];
  onConfirm: (confirmedPosts: ContentSlot[]) => void;
  onClose: () => void;
}

const PostReviewModal: React.FC<PostReviewModalProps> = ({ 
  generatedPosts, 
  onConfirm, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState<ContentSlot[]>(generatedPosts);
  const [confirmedPosts, setConfirmedPosts] = useState<ContentSlot[]>([]);
  const [showAiImageModal, setShowAiImageModal] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateCurrentPost({
      media: { type: 'image', url, style: 'photo' }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Demo images for generated posts
  const demoImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
  ];

  // Add demo images to posts if they don't have media
  React.useEffect(() => {
    setPosts(prev => prev.map((post, index) => ({
      ...post,
      media: post.media || {
        type: 'image',
        url: demoImages[index % demoImages.length],
        style: 'photo'
      }
    })));
  }, []);

  const currentPost = posts[currentIndex];

  const contentTypes = [
    { id: 'post', label: 'Post', icon: <FileText className="w-4 h-4" /> },
    { id: 'story', label: 'Story', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'reel', label: 'Reel', icon: <Film className="w-4 h-4" /> },
    { id: 'carousel', label: 'Carousel', icon: <Layers className="w-4 h-4" /> }
  ];

  const ctaOptions = [
    'Mehr erfahren', 'Jetzt buchen', 'Link in Bio', 'DM für Details', 
    'Kommentiere unten', 'Teile deine Meinung', 'Folge für mehr', 'Speichere diesen Post'
  ];


  const updateCurrentPost = (updates: Partial<ContentSlot>) => {
    setPosts(prev => 
      prev.map((post, index) => 
        index === currentIndex ? { ...post, ...updates } : post
      )
    );
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRegenerateText = async () => {
    setIsGeneratingText(true);
    
    // Simulate AI text generation
    setTimeout(() => {
      const newContent = `Neu generierter Content für ${currentPost.platform}! 🚀\n\nDieser Text wurde basierend auf deinen Präferenzen und aktuellen Trends optimiert. Die KI hat dabei deine bisherige Performance und Zielgruppe berücksichtigt.\n\n#neustart #ki #optimiert`;
      
      updateCurrentPost({ 
        content: newContent,
        version: {
          original: currentPost.version?.original || currentPost.content,
          edited: newContent,
          lastModified: new Date()
        }
      });
      setIsGeneratingText(false);
    }, 2000);
  };

  const handleOptimizeText = () => {
    const optimizedContent = currentPost.content + '\n\n✨ KI-optimiert für bessere Performance!';
    updateCurrentPost({ 
      content: optimizedContent,
      version: {
        original: currentPost.version?.original || currentPost.content,
        edited: optimizedContent,
        lastModified: new Date()
      }
    });
  };

  const handleAddEmojis = () => {
    const emojifiedContent = currentPost.content.replace(/\./g, ' ✨').replace(/!/g, ' 🚀');
    updateCurrentPost({ content: emojifiedContent });
  };

  const handleGenerateHashtags = () => {
    const aiHashtags = [
      'business', 'entrepreneur', 'success', 'growth', 'motivation',
      'innovation', 'leadership', 'strategy', 'marketing', 'productivity'
    ];
    updateCurrentPost({ hashtags: aiHashtags.slice(0, 5) });
  };

  const handleAiImageGenerated = (imageUrl: string) => {
    updateCurrentPost({
      media: {
        type: 'image',
        url: imageUrl,
        style: 'photo'
      }
    });
    setShowAiImageModal(false);
  };

  const handleDiscard = () => {
    const newPosts = posts.filter((_, index) => index !== currentIndex);
    setPosts(newPosts);
    
    if (newPosts.length === 0) {
      onClose();
      return;
    }
    
    if (currentIndex >= newPosts.length) {
      setCurrentIndex(newPosts.length - 1);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      // Update status in Supabase
      await CalendarService.updatePost(currentPost.id, {
        status: 'draft'
      });

      const draftPost = { ...currentPost, status: 'draft' as const };
      setConfirmedPosts(prev => [...prev, draftPost]);

      // Move to next post or close if last
      if (currentIndex < posts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinish();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      // TODO: Show error toast if needed
    }
  };

  const handleSchedule = async () => {
    try {
      // Update status in Supabase
      await CalendarService.updatePost(currentPost.id, {
        status: 'scheduled'
      });

      const scheduledPost = { ...currentPost, status: 'scheduled' as const };
      setConfirmedPosts(prev => [...prev, scheduledPost]);

      // Visual feedback - post "slides into calendar"
      const postElement = document.querySelector('.post-preview');
      if (postElement) {
        postElement.classList.add('animate-pulse');
        setTimeout(() => {
          postElement.classList.remove('animate-pulse');
        }, 500);
      }

      // Move to next post or close if last
      if (currentIndex < posts.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleFinish();
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      // TODO: Show error toast if needed
    }
  };

  const handleFinish = () => {
    onConfirm(confirmedPosts);
  };

  const handleBatchAction = (action: 'accept' | 'discard') => {
    if (action === 'accept') {
      const allScheduled = posts.map(post => ({ ...post, status: 'planned' as const }));
      setConfirmedPosts(allScheduled);
      onConfirm(allScheduled);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-modal">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-manrope text-[#111111] flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[var(--vektrus-ai-violet)]" />
                <span>Deine generierten Postings</span>
              </h2>
              <p className="text-sm text-[#7A7A7A] mt-1">
                Überprüfe, bearbeite und plane deine Vorschläge ein.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleBatchAction('accept')}
                className="px-4 py-2 bg-[#49D69E] hover:bg-[#49D69E]/90 text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm shadow-card"
              >
                Alle übernehmen
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-b border-[rgba(73,183,227,0.18)] bg-[#F4FCFE]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigate('prev')}
                disabled={currentIndex === 0}
                className={`p-2 rounded-[var(--vektrus-radius-sm)] transition-colors ${
                  currentIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#7A7A7A] hover:text-[#111111] hover:bg-white'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-sm font-medium text-[#111111]">
                Post {currentIndex + 1} von {posts.length}
              </div>

              <button
                onClick={() => handleNavigate('next')}
                disabled={currentIndex === posts.length - 1}
                className={`p-2 rounded-[var(--vektrus-radius-sm)] transition-colors ${
                  currentIndex === posts.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#7A7A7A] hover:text-[#111111] hover:bg-white'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex items-center space-x-2">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-8 h-8 rounded-[var(--vektrus-radius-sm)] border-2 transition-all duration-200 flex items-center justify-center ${
                    index === currentIndex
                      ? 'border-[var(--vektrus-ai-violet)] bg-[rgba(124,108,242,0.1)]'
                      : confirmedPosts.some(cp => cp.id === post.id)
                      ? 'border-[#49D69E] bg-[rgba(73,214,158,0.1)]'
                      : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
                  }`}
                >
                  {confirmedPosts.some(cp => cp.id === post.id) ? (
                    <Check className="w-4 h-4 text-[#49D69E]" />
                  ) : (
                    <span className="text-xs font-bold text-[#7A7A7A]">{index + 1}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[60vh]">
          {/* Left Side - Preview & Content */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Platform Badge */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getPlatformColor(currentPost.platform)} rounded-[var(--vektrus-radius-sm)] flex items-center justify-center`}>
                  <SocialIcon platform={currentPost.platform} size={22} branded={false} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111] capitalize text-lg">
                    {currentPost.platform}
                  </h3>
                  <p className="text-sm text-[#7A7A7A]">
                    {currentPost.date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} • {currentPost.time} Uhr
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="px-3 py-1 bg-[rgba(124,108,242,0.1)] text-[var(--vektrus-ai-violet)] rounded-full text-xs font-medium flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>KI-generiert</span>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="post-preview">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-[#111111]">
                    <Type className="w-4 h-4 inline mr-2" />
                    Post-Inhalt
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRegenerateText}
                      disabled={isGeneratingText}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors ${
                        isGeneratingText
                          ? 'bg-[#B6EBF7]/20 text-gray-500 cursor-not-allowed'
                          : 'bg-[rgba(124,108,242,0.12)] hover:bg-[rgba(124,108,242,0.2)] text-[var(--vektrus-ai-violet)]'
                      }`}
                    >
                      {isGeneratingText ? (
                        <>
                          <div className="w-3 h-3 border border-[var(--vektrus-ai-violet)] border-t-transparent rounded-full animate-spin" />
                          <span>Generiert...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>Neu generieren</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleOptimizeText}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#F4FCFE] hover:bg-[#B6EBF7] text-[#111111] rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors border border-[rgba(73,183,227,0.2)]"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Optimieren</span>
                    </button>
                    <button
                      onClick={handleAddEmojis}
                      className="flex items-center space-x-1 px-3 py-1 bg-[#F4BE9D]/20 hover:bg-[#F4BE9D]/40 text-[#111111] rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors border border-[#F4BE9D]/30"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Emoji hinzufügen</span>
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button
                      onClick={() => setShowAiImageModal(true)}
                      className="flex items-center space-x-1 px-3 py-1 bg-[var(--vektrus-ai-violet)] hover:opacity-90 text-white rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-all shadow-subtle hover:shadow-card"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Text für Bild nutzen</span>
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    value={currentPost.content}
                    onChange={(e) => updateCurrentPost({ content: e.target.value })}
                    rows={8}
                    className="w-full p-4 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-ai-violet)]/30 focus:border-[var(--vektrus-ai-violet)]/50 resize-none"
                    placeholder="Post-Inhalt bearbeiten..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-[#7A7A7A]">
                    {currentPost.content.length} Zeichen
                  </div>
                </div>
                
                <p className="text-xs text-[#7A7A7A] mt-2">
                  Bearbeite den Text oder lass dir eine neue Variante erstellen.
                </p>
              </div>

              {/* Media Section */}
              <div>
                <label className="text-sm font-medium text-[#111111] block mb-3">
                  <Image className="w-4 h-4 inline mr-2" />
                  Medien
                </label>
                
                {currentPost.media?.url ? (
                  <div className="relative">
                    <div className="aspect-square bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] overflow-hidden border border-[rgba(73,183,227,0.18)] max-w-xs">
                      <img 
                        src={currentPost.media.url} 
                        alt="Post Media" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => updateCurrentPost({ media: undefined })}
                      className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-[#7A7A7A]" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Prominent CTA with post text integration */}
                    <button
                      onClick={() => setShowAiImageModal(true)}
                      className="w-full group relative overflow-hidden rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(124,108,242,0.25)] bg-[rgba(124,108,242,0.03)] hover:bg-[rgba(124,108,242,0.06)] transition-all duration-200 hover:shadow-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-sm)]">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-[#111111] mb-1 flex items-center space-x-2">
                              <span>KI-Bild aus Post-Text generieren</span>
                              <span className="px-2 py-0.5 bg-[#49D69E] text-white text-xs rounded-full font-medium">NEU</span>
                            </div>
                            <p className="text-xs text-[#7A7A7A]">
                              Dein Post-Text wird automatisch als Bildprompt verwendet
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--vektrus-ai-violet)] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgba(73,183,227,0.18)]"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-[#7A7A7A]">oder</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] transition-all duration-200"
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">Bild hochladen</span>
                      </button>

                      <button
                        onClick={() => setShowAiImageModal(true)}
                        className="flex flex-col items-center justify-center p-4 border border-[rgba(73,183,227,0.18)] hover:border-[rgba(124,108,242,0.3)] hover:bg-[rgba(124,108,242,0.03)] text-[#7A7A7A] hover:text-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-sm)] transition-all duration-200"
                      >
                        <Image className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium">Aus Mediathek</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Preview */}
              <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)]">
                <h4 className="font-medium text-[#111111] mb-3 flex items-center space-x-2">
                  <span className="text-sm text-[#7A7A7A]">Vorschau auf {currentPost.platform}</span>
                </h4>
                
                <div className="bg-white rounded-[var(--vektrus-radius-sm)] p-4 border border-[rgba(73,183,227,0.18)] max-w-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-[#B6EBF7] rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-medium text-[#111111] text-sm">Dein Account</div>
                      <div className="text-xs text-[#7A7A7A]">vor 2 Minuten</div>
                    </div>
                  </div>
                  
                  {currentPost.media?.url && (
                    <div className="aspect-square bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] overflow-hidden mb-3">
                      <img src={currentPost.media.url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="text-sm text-[#111111] leading-relaxed">
                    {currentPost.content.substring(0, 150)}
                    {currentPost.content.length > 150 && '...'}
                  </div>
                  
                  {currentPost.hashtags.length > 0 && (
                    <div className="mt-2 text-xs text-[#49B7E3]">
                      {currentPost.hashtags.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                      {currentPost.hashtags.length > 3 && ` +${currentPost.hashtags.length - 3}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Settings */}
          <div className="w-1/3 p-6 bg-[#F4FCFE] border-l border-[rgba(73,183,227,0.18)] overflow-y-auto">
            <div className="space-y-6">
              {/* Content Type */}
              <div>
                <label className="text-sm font-medium text-[#111111] block mb-3">
                  <Type className="w-4 h-4 inline mr-2" />
                  Content-Typ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => updateCurrentPost({ contentType: type.id as any })}
                      className={`p-3 rounded-[var(--vektrus-radius-sm)] border text-center transition-all duration-200 ${
                        currentPost.contentType === type.id
                          ? 'border-[var(--vektrus-ai-violet)] bg-[rgba(124,108,242,0.1)] text-[var(--vektrus-ai-violet)]'
                          : 'border-[rgba(73,183,227,0.18)] hover:border-[var(--vektrus-ai-violet)] text-[#7A7A7A]'
                      }`}
                    >
                      <div className="mb-1 flex justify-center">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <label className="text-sm font-medium text-[#111111] block mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Zeitplanung
                </label>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#7A7A7A] block mb-1">Datum</label>
                    <input
                      type="date"
                      value={currentPost.date.toISOString().split('T')[0]}
                      onChange={(e) => updateCurrentPost({ date: new Date(e.target.value) })}
                      className="w-full p-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-ai-violet)]/30 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-[#7A7A7A] block mb-1">Uhrzeit</label>
                    <input
                      type="time"
                      value={currentPost.time}
                      onChange={(e) => updateCurrentPost({ time: e.target.value })}
                      className="w-full p-2 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-ai-violet)]/30 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Hashtags & CTA */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-[#111111]">
                    <Hash className="w-4 h-4 inline mr-2" />
                    Hashtags
                  </label>
                  <button
                    onClick={handleGenerateHashtags}
                    className="flex items-center space-x-1 text-xs text-[var(--vektrus-ai-violet)] hover:text-[var(--vektrus-ai-violet)] transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Optimieren</span>
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] min-h-[60px] bg-white">
                  {currentPost.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-[#B6EBF7] text-[#111111] rounded-[var(--vektrus-radius-sm)] text-sm"
                    >
                      #{hashtag}
                      <button
                        onClick={() => updateCurrentPost({
                          hashtags: currentPost.hashtags.filter((_, i) => i !== index)
                        })}
                        className="ml-1 text-[#111111]/60 hover:text-[#111111]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Hashtag hinzufügen..."
                    className="flex-1 min-w-[120px] outline-none text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim().replace('#', '');
                        if (value && !currentPost.hashtags.includes(value)) {
                          updateCurrentPost({
                            hashtags: [...currentPost.hashtags, value]
                          });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div>
                <label className="text-sm font-medium text-[#111111] block mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Call-to-Action (optional)
                </label>
                <select
                  value={currentPost.cta || ''}
                  onChange={(e) => updateCurrentPost({ cta: e.target.value })}
                  className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-ai-violet)]/30 bg-white"
                >
                  <option value="">CTA wählen</option>
                  {ctaOptions.map(cta => (
                    <option key={cta} value={cta}>{cta}</option>
                  ))}
                </select>
              </div>

              {/* Labels/Tags */}
              <div>
                <label className="text-sm font-medium text-[#111111] block mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Labels/Kampagne (optional)
                </label>
                <input
                  type="text"
                  value={currentPost.campaign || ''}
                  onChange={(e) => updateCurrentPost({ campaign: e.target.value })}
                  placeholder="z.B. Kampagne Q1, Produktlaunch..."
                  className="w-full p-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-ai-violet)]/30"
                />
              </div>

              {/* Content Score */}
              {currentPost.contentScore && (
                <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[#111111] text-sm">Content Score</h4>
                    <span className={`text-sm font-bold ${currentPost.contentScore.total >= 85 ? 'text-green-600' : currentPost.contentScore.total >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {currentPost.contentScore.total} / 100
                    </span>
                  </div>
                  <div className="h-2 bg-[#F4FCFE] rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${currentPost.contentScore.total >= 85 ? 'bg-green-500' : currentPost.contentScore.total >= 70 ? 'bg-blue-500' : 'bg-amber-400'}`}
                      style={{ width: `${currentPost.contentScore.total}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-[#7A7A7A]">
                    <span>Lesbarkeit: {currentPost.contentScore.readability}</span>
                    <span>Hook: {currentPost.contentScore.hookStrength}</span>
                    <span>Hashtags: {currentPost.contentScore.hashtagQuality}</span>
                    <span>CTA: {currentPost.contentScore.ctaClarity}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[rgba(73,183,227,0.18)] bg-[#F4FCFE]">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDiscard}
              className="flex items-center space-x-2 px-4 py-2 text-[#FA7E70] hover:text-white hover:bg-[#FA7E70] border border-[#FA7E70] rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Verwerfen</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveAsDraft}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#F4BE9D]/20 hover:bg-[#F4BE9D]/40 text-[#111111] border border-[#F4BE9D]/40 rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Als Entwurf speichern</span>
              </button>

              <button
                onClick={handleSchedule}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#49D69E] hover:bg-[#49D69E]/90 text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 shadow-card hover:shadow-elevated text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Einplanen</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Image Generation Modal */}
        {showAiImageModal && (
          <AiImageGenerationModal
            onGenerate={handleAiImageGenerated}
            onClose={() => setShowAiImageModal(false)}
            initialPrompt={currentPost.content}
          />
        )}
      </div>
    </div>
  );
};

export default PostReviewModal;