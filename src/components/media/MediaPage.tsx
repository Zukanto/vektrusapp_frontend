import React, { useState, useEffect } from 'react';
import { Search, Upload, Sparkles, Grid3X3, List, Filter, MoreVertical, Download, PenLine, Trash2, Star, Tag, Eye, Calendar, FileImage, Video, Image as ImageIcon, Play, TriangleAlert as AlertTriangle, X } from 'lucide-react';
import AiImageGenerationModal from '../planner/AiImageGenerationModal';
import MediaUploadModal from './MediaUploadModal';
import MediaDetailSidebar from './MediaDetailSidebar';
import ModuleWrapper from '../ui/ModuleWrapper';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useMediaInsert } from '../../hooks/useMediaInsert';

interface MediaItem {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  public_url: string;
  storage_path: string;
  generated_by: string;
  generation_prompt: string | null;
  source: string;
  file_size: number | null;
  created_at: string;
  name?: string;
  type?: 'image' | 'video';
  format?: string;
  url?: string;
  size?: number;
  dimensions?: { width: number; height: number };
  tags?: string[];
  isFavorite?: boolean;
  usedIn?: Array<{
    platform: string;
    postTitle: string;
    date: Date;
  }>;
  aiPrompt?: string;
}

interface MediaPageProps {
  onModuleChange?: (module: string) => void;
}

const MediaPage: React.FC<MediaPageProps> = ({ onModuleChange }) => {
  const { user } = useAuth();
  const { setSelectedMedia, setTriggerPostCreation } = useMediaInsert();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos' | 'ai' | 'uploads' | 'used' | 'unused'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedMediaLocal, setSelectedMediaLocal] = useState<MediaItem | null>(null);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadMedia = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading media:', error);
      } else {
        setMediaItems(data || []);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [user]);

  const filteredItems = mediaItems.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = item.filename.toLowerCase().includes(query);
      const matchesPrompt = item.generation_prompt?.toLowerCase().includes(query);
      if (!matchesName && !matchesPrompt) return false;
    }

    // Type filter
    switch (filterType) {
      case 'images':
        return item.file_type.startsWith('image/');
      case 'videos':
        return item.file_type.startsWith('video/');
      case 'ai':
        return item.source === 'ai_generated';
      case 'uploads':
        return item.source === 'upload';
      case 'used':
        return false;
      case 'unused':
        return true;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return a.filename.localeCompare(b.filename);
      case 'size':
        return (b.file_size || 0) - (a.file_size || 0);
      default:
        return 0;
    }
  });

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMediaLocal(media);
    setShowDetailSidebar(true);
  };


  const handleDownloadMedia = async (media: MediaItem) => {
    try {
      const response = await fetch(media.public_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = media.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download fehlgeschlagen:', error);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    const mediaToDelete = mediaItems.find(item => item.id === mediaId);
    if (!mediaToDelete) return;

    setDeleteConfirmId(mediaId);
  };

  const confirmDeleteMedia = async () => {
    const mediaId = deleteConfirmId;
    if (!mediaId) return;

    const mediaToDelete = mediaItems.find(item => item.id === mediaId);
    if (!mediaToDelete) {
      setDeleteConfirmId(null);
      return;
    }

    setDeleteConfirmId(null);

    try {
      const isVideo = mediaToDelete.file_type.startsWith('video/');
      const bucket = isVideo ? 'temp-videos' : 'user-images';

      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([mediaToDelete.storage_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', mediaId);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return;
      }

      setMediaItems(prev => prev.filter(item => item.id !== mediaId));

      if (selectedMediaLocal?.id === mediaId) {
        setShowDetailSidebar(false);
        setSelectedMediaLocal(null);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleNavigateToPlanner = (_mediaFileId: string, imageUrl: string) => {
    setSelectedMedia({
      id: _mediaFileId || crypto.randomUUID(),
      user_id: user?.id || '',
      filename: `ai-${Date.now()}.png`,
      file_type: 'image/png',
      public_url: imageUrl,
      storage_path: '',
      generated_by: 'ai-image',
      generation_prompt: null,
      source: 'ai_generated',
      file_size: null,
      created_at: new Date().toISOString(),
    } as any);
    setTriggerPostCreation(true);
    setShowAiModal(false);

    if (onModuleChange) {
      onModuleChange('planner');
    }
  };

  const handleAiImageGenerated = async (_imageUrl: string) => {
    await loadMedia();
    setShowAiModal(false);
  };

  const handleMediaUploaded = async (files: File[]) => {
    if (!user?.id || files.length === 0) return;

    setShowUploadModal(false);

    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`${file.name}: Nur Bilder und Videos erlaubt`);
        continue;
      }

      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`${file.name}: Datei zu groß`);
        continue;
      }

      try {
        const isVideo = file.type.startsWith('video/');
        const bucket = isVideo ? 'temp-videos' : 'user-images';

        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Fehler beim Hochladen von ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            user_id: user.id,
            filename: fileName,
            file_type: file.type,
            public_url: urlData.publicUrl,
            storage_path: filePath,
            generated_by: 'upload',
            source: 'upload',
            file_size: file.size
          });

        if (dbError) {
          console.error('Database error:', dbError);
          alert(`Fehler beim Speichern von ${file.name}`);
          continue;
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Fehler beim Hochladen von ${file.name}`);
      }
    }

    await loadMedia();
  };

  const formatFileSize = (sizeInBytes: number | null) => {
    if (!sizeInBytes) return '0 KB';
    if (sizeInBytes < 1024) return `${sizeInBytes} Bytes`;
    if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getUsageText = (item: MediaItem) => {
    return 'Nicht verwendet';
  };

  const getFileFormat = (fileType: string) => {
    const parts = fileType.split('/');
    return parts[1]?.toUpperCase() || 'FILE';
  };

  const getMediaDimensions = (item: MediaItem) => {
    return '1080×1080';
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-12 h-12 text-[#49B7E3]" />
        </div>
        <h3 className="text-xl font-semibold text-[#111111] mb-3">Noch keine Medien?</h3>
        <p className="text-[#7A7A7A] mb-6 leading-relaxed">
          Starte mit einem Upload oder erstelle dein erstes KI-Bild. 
          Alle Medien werden hier zentral verwaltet und können sofort in Posts verwendet werden.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
          >
            <Upload className="w-5 h-5" />
            <span>Erste Datei hochladen</span>
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-[var(--vektrus-ai-violet)] hover:opacity-90 text-white rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span>KI-Bild erstellen</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredItems.map(item => (
        <div
          key={item.id}
          onClick={() => handleMediaSelect(item)}
          className="group relative bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden cursor-pointer hover:shadow-elevated hover:scale-[1.02] transition-all duration-200"
        >
          {/* Media Preview */}
          <div className="aspect-square relative overflow-hidden">
            {item.file_type.startsWith('video/') ? (
              <>
                <video
                  src={`${item.public_url}#t=0.1`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-[#111111] ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={item.public_url}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            )}

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMediaSelect(item);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-[var(--vektrus-radius-sm)] transition-colors"
                title="Ansehen"
              >
                <Eye className="w-4 h-4 text-[#111111]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadMedia(item);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-[var(--vektrus-radius-sm)] transition-colors"
                title="Herunterladen"
              >
                <Download className="w-4 h-4 text-[#111111]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(item.id);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-[var(--vektrus-radius-sm)] transition-colors"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4 text-[#FA7E70]" />
              </button>
            </div>

            {/* Format Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                {getFileFormat(item.file_type)}
              </span>
            </div>

            {/* AI Badge */}
            {item.source === 'ai_generated' && (
              <div className="absolute top-2 right-2">
                <div className="px-2 py-1 bg-[var(--vektrus-ai-violet)]/15 text-[var(--vektrus-ai-violet)] text-xs font-medium rounded-[var(--vektrus-radius-sm)] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>KI</span>
                </div>
              </div>
            )}
          </div>

          {/* Media Info */}
          <div className="p-3">
            <h4 className="font-medium text-[#111111] text-sm truncate mb-1">
              {item.filename}
            </h4>
            <div className="flex items-center justify-between text-xs text-[#7A7A7A]">
              <span>{formatFileSize(item.file_size)}</span>
              <span>{getMediaDimensions(item)}</span>
            </div>
            <div className="text-xs text-[#7A7A7A] mt-1">
              {getUsageText(item)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-[rgba(73,183,227,0.18)] bg-[#F4FCFE] text-sm font-medium text-[#7A7A7A]">
        <div className="col-span-4">Name</div>
        <div className="col-span-2">Typ</div>
        <div className="col-span-2">Größe</div>
        <div className="col-span-2">Erstellt</div>
        <div className="col-span-2">Verwendet</div>
      </div>

      {filteredItems.map(item => (
        <div
          key={item.id}
          onClick={() => handleMediaSelect(item)}
          className="grid grid-cols-12 gap-4 p-4 border-b border-[rgba(73,183,227,0.18)] last:border-b-0 hover:bg-[#F4FCFE] cursor-pointer transition-colors group"
        >
          <div className="col-span-4 flex items-center space-x-3">
            <div className="w-12 h-12 rounded-[var(--vektrus-radius-sm)] overflow-hidden flex-shrink-0 relative">
              {item.file_type.startsWith('video/') ? (
                <>
                  <video
                    src={`${item.public_url}#t=0.1`}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <img src={item.public_url} alt={item.filename} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-[#111111] text-sm truncate">{item.filename}</h4>
                {item.source === 'ai_generated' && (
                  <div className="px-1.5 py-0.5 bg-[var(--vektrus-ai-violet)]/15 text-[var(--vektrus-ai-violet)] text-xs rounded-[var(--vektrus-radius-sm)] flex items-center space-x-1 flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>KI</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-[#7A7A7A] mt-1">
                {getMediaDimensions(item)}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center">
            <div className="flex items-center space-x-2">
              {item.file_type.startsWith('image/') ? (
                <FileImage className="w-4 h-4 text-[#7A7A7A]" />
              ) : (
                <Video className="w-4 h-4 text-[#7A7A7A]" />
              )}
              <span className="text-sm text-[#111111]">{getFileFormat(item.file_type)}</span>
            </div>
          </div>

          <div className="col-span-2 flex items-center">
            <span className="text-sm text-[#111111]">{formatFileSize(item.file_size)}</span>
          </div>

          <div className="col-span-2 flex items-center">
            <span className="text-sm text-[#7A7A7A]">
              {new Date(item.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>

          <div className="col-span-2 flex items-center justify-between">
            <span className="text-sm text-[#7A7A7A]">
              {getUsageText(item)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedia(item.id);
              }}
              className="p-1 text-[#7A7A7A] hover:text-[#FA7E70] opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const totalSize = mediaItems.reduce((acc, item) => acc + (item.file_size || 0), 0);
  const aiGeneratedCount = mediaItems.filter(item => item.source === 'ai_generated').length;
  const usedCount = 0;

  return (
    <ModuleWrapper module="media" showTopAccent={true}>
      <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">Mediathek</h1>
              <p className="text-[#7A7A7A]">Zentrale Verwaltung für alle deine Bilder und Videos</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
              >
                <Upload className="w-4 h-4" />
                <span>Medien hochladen</span>
              </button>
              
              <button
                onClick={() => setShowAiModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-[var(--vektrus-ai-violet)] hover:opacity-90 text-white rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>KI-Bild generieren</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Medien durchsuchen (Name, Tags, Verwendung)..."
                className="w-full pl-10 pr-4 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] bg-white"
              >
                <option value="all">Alle Medien</option>
                <option value="images">Nur Bilder</option>
                <option value="videos">Nur Videos</option>
                <option value="ai">KI-generiert</option>
                <option value="uploads">Hochgeladen</option>
                <option value="used">Verwendet</option>
                <option value="unused">Unverwendet</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] bg-white"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
                <option value="name">Name A-Z</option>
                <option value="size">Größe</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[#B6EBF7] text-[#111111]' 
                      : 'bg-white text-[#7A7A7A] hover:text-[#111111]'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#B6EBF7] text-[#111111]' 
                      : 'bg-white text-[#7A7A7A] hover:text-[#111111]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] px-6 py-3">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-[#7A7A7A]">
            <span>{filteredItems.length} von {mediaItems.length} Medien</span>
            <span>{formatFileSize(totalSize)} gesamt</span>
            <span>{aiGeneratedCount} KI-generiert</span>
            <span>{usedCount} verwendet</span>
          </div>
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Media Grid/List */}
          <div className={`transition-all duration-300 ${showDetailSidebar ? 'flex-1' : 'w-full'} overflow-y-auto p-6`}>
            <div className="max-w-[1240px] mx-auto">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#B6EBF7] border-t-[#49B7E3] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#7A7A7A]">Medien werden geladen...</p>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                searchQuery || filterType !== 'all' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F4FCFE] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-[#7A7A7A]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#111111] mb-2">Keine Medien gefunden</h3>
                    <p className="text-[#7A7A7A] mb-4">
                      Versuche andere Suchbegriffe oder Filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors"
                    >
                      Alle Medien anzeigen
                    </button>
                  </div>
                ) : (
                  renderEmptyState()
                )
              ) : (
                viewMode === 'grid' ? renderGridView() : renderListView()
              )}
            </div>
          </div>

          {/* Detail Sidebar */}
          {showDetailSidebar && selectedMediaLocal && (
            <MediaDetailSidebar
              media={selectedMediaLocal}
              onClose={() => setShowDetailSidebar(false)}
              onUpdate={(updatedMedia) => {
                setMediaItems(prev =>
                  prev.map(item =>
                    item.id === updatedMedia.id ? updatedMedia : item
                  )
                );
                setSelectedMediaLocal(updatedMedia);
              }}
              onDelete={() => handleDeleteMedia(selectedMediaLocal.id)}
              onToggleFavorite={() => {}}
              isFromPostEditor={false}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <MediaUploadModal
          onUpload={handleMediaUploaded}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {showAiModal && (
        <AiImageGenerationModal
          onGenerate={handleAiImageGenerated}
          onClose={() => setShowAiModal(false)}
          onNavigateToPlanner={handleNavigateToPlanner}
        />
      )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div
            className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-sm p-6 relative"
            style={{ boxShadow: 'var(--vektrus-shadow-modal)' }}
          >
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[#AEAEAE] hover:text-[#111111] hover:bg-[#F4FCFE] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[var(--vektrus-radius-md)] flex items-center justify-center bg-red-50">
                <AlertTriangle className="w-5 h-5 text-[#FA7E70]" />
              </div>
              <h3 className="text-base font-bold text-[#111111]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Datei löschen
              </h3>
            </div>

            <p className="text-sm text-[#7A7A7A] leading-relaxed mb-6">
              Möchtest du diese Datei wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] text-sm font-semibold text-[#111111] hover:bg-[#F4FCFE] transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteMedia}
                className="flex-1 px-4 py-2.5 rounded-[var(--vektrus-radius-md)] text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#FA7E70' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e86b5d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FA7E70')}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleWrapper>
  );
};

export default MediaPage;