import React, { useState, useEffect } from 'react';
import { Search, Upload, Sparkles, Grid3X3, List, Download, Trash2, Eye, FileImage, Video, Image as ImageIcon, Play, TriangleAlert as AlertTriangle, AlertCircle, RefreshCw, X } from 'lucide-react';
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
  const [loadError, setLoadError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadMedia = async () => {
    if (!user?.id) return;

    setLoading(true);
    setLoadError(false);

    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading media:', error);
        setLoadError(true);
      } else {
        setMediaItems(data || []);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      setLoadError(true);
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

  const getFileFormat = (fileType: string) => {
    const parts = fileType.split('/');
    return parts[1]?.toUpperCase() || 'FILE';
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[var(--vektrus-blue-light)]/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ImageIcon className="w-8 h-8 text-[var(--vektrus-blue)]" />
        </div>
        <h3 className="font-manrope font-semibold text-[18px] text-[var(--vektrus-anthrazit)] mb-2">Deine Mediathek ist leer</h3>
        <p className="text-[14px] text-[var(--vektrus-gray)] mb-6 leading-relaxed">
          Lade Bilder oder Videos hoch, oder erstelle ein KI-Bild. Alle Medien stehen dir dann direkt für Posts zur Verfügung.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] font-medium text-[14px] transition-colors shadow-subtle hover:shadow-card"
          >
            <Upload className="w-4 h-4" />
            <span>Medien hochladen</span>
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className="chat-ai-action-btn flex items-center justify-center gap-2 px-5 py-2.5 text-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-sm)] font-medium text-[14px]"
          >
            <Sparkles className="w-4 h-4" />
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
          className="group relative bg-white rounded-[var(--vektrus-radius-md)] border border-[var(--vektrus-border-default)] overflow-hidden cursor-pointer shadow-subtle hover:shadow-card transition-all duration-200"
        >
          {/* Media Preview */}
          <div className="aspect-square relative overflow-hidden bg-[var(--vektrus-mint)]">
            {item.file_type.startsWith('video/') ? (
              <>
                <video
                  src={`${item.public_url}#t=0.1`}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-subtle">
                    <Play className="w-5 h-5 text-[var(--vektrus-anthrazit)] ml-0.5" />
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

            {/* Hover Actions — bottom gradient scrim */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMediaSelect(item);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-subtle"
                title="Ansehen"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--vektrus-anthrazit)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadMedia(item);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-subtle"
                title="Herunterladen"
              >
                <Download className="w-3.5 h-3.5 text-[var(--vektrus-anthrazit)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(item.id);
                }}
                className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-subtle"
                title="Löschen"
              >
                <Trash2 className="w-3.5 h-3.5 text-[var(--vektrus-error)]" />
              </button>
            </div>

            {/* Format Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-1.5 py-0.5 bg-white/85 text-[var(--vektrus-gray)] text-[11px] font-semibold rounded backdrop-blur-sm">
                {getFileFormat(item.file_type)}
              </span>
            </div>

            {/* AI Badge */}
            {item.source === 'ai_generated' && (
              <div className="absolute top-2 right-2">
                <div className="px-1.5 py-0.5 bg-white/85 text-[var(--vektrus-ai-violet)] text-[11px] font-semibold rounded backdrop-blur-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>KI</span>
                </div>
              </div>
            )}
          </div>

          {/* Media Info */}
          <div className="px-3 py-2.5">
            <h4 className="font-medium text-[var(--vektrus-anthrazit)] text-[13px] leading-tight truncate">
              {item.filename}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-[var(--vektrus-gray)]">
              <span>{getFileFormat(item.file_type)}</span>
              <span className="text-[var(--vektrus-border-strong)]">&middot;</span>
              <span>{formatFileSize(item.file_size)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[var(--vektrus-border-default)] overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--vektrus-border-default)] bg-[var(--vektrus-mint)] text-[13px] font-medium text-[var(--vektrus-gray)]">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Typ</div>
        <div className="col-span-2">Größe</div>
        <div className="col-span-2">Erstellt</div>
        <div className="col-span-1"></div>
      </div>

      {filteredItems.map(item => (
        <div
          key={item.id}
          onClick={() => handleMediaSelect(item)}
          className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--vektrus-border-subtle)] last:border-b-0 hover:bg-[var(--vektrus-mint)] cursor-pointer transition-colors group"
        >
          <div className="col-span-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-[var(--vektrus-mint)]">
              {item.file_type.startsWith('video/') ? (
                <>
                  <video
                    src={`${item.public_url}#t=0.1`}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                    <Play className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              ) : (
                <img src={item.public_url} alt={item.filename} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-[var(--vektrus-anthrazit)] text-[13px] truncate">{item.filename}</h4>
                {item.source === 'ai_generated' && (
                  <div className="px-1.5 py-0.5 bg-[var(--vektrus-ai-violet)]/8 text-[var(--vektrus-ai-violet)] text-[11px] font-semibold rounded flex items-center gap-0.5 flex-shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>KI</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex items-center">
            <div className="flex items-center gap-2">
              {item.file_type.startsWith('image/') ? (
                <FileImage className="w-4 h-4 text-[var(--vektrus-gray)]" />
              ) : (
                <Video className="w-4 h-4 text-[var(--vektrus-gray)]" />
              )}
              <span className="text-[13px] text-[var(--vektrus-anthrazit)]">{getFileFormat(item.file_type)}</span>
            </div>
          </div>

          <div className="col-span-2 flex items-center">
            <span className="text-[13px] text-[var(--vektrus-anthrazit)]">{formatFileSize(item.file_size)}</span>
          </div>

          <div className="col-span-2 flex items-center">
            <span className="text-[13px] text-[var(--vektrus-gray)]">
              {new Date(item.created_at).toLocaleDateString('de-DE')}
            </span>
          </div>

          <div className="col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadMedia(item);
              }}
              className="p-1.5 rounded-md text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-blue-light)]/30 opacity-0 group-hover:opacity-100 transition-all"
              title="Herunterladen"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedia(item.id);
              }}
              className="p-1.5 rounded-md text-[var(--vektrus-gray)] hover:text-[var(--vektrus-error)] hover:bg-[var(--vektrus-error)]/8 opacity-0 group-hover:opacity-100 transition-all"
              title="Löschen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const totalSize = mediaItems.reduce((acc, item) => acc + (item.file_size || 0), 0);
  const aiGeneratedCount = mediaItems.filter(item => item.source === 'ai_generated').length;

  return (
    <ModuleWrapper module="media" showTopAccent={true}>
      <div className="h-full bg-[var(--vektrus-mint)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[var(--vektrus-border-default)] px-6 pt-6 pb-5">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-manrope font-bold text-[26px] leading-tight text-[var(--vektrus-anthrazit)]">Mediathek</h1>
              <p className="text-[14px] text-[var(--vektrus-gray)] mt-1">Deine zentrale Bibliothek für Bilder und Videos</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 shadow-subtle hover:shadow-card"
              >
                <Upload className="w-4 h-4" />
                <span>Medien hochladen</span>
              </button>

              <button
                onClick={() => setShowAiModal(true)}
                className="chat-ai-action-btn flex items-center space-x-2 px-5 py-2.5 text-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-sm)] font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>KI-Bild generieren</span>
              </button>
            </div>
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--vektrus-gray)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Medien durchsuchen..."
                className="w-full h-[44px] pl-10 pr-4 text-[14px] border border-[var(--vektrus-border-default)] rounded-[var(--vektrus-radius-sm)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)] focus:border-transparent transition-shadow"
              />
            </div>

            {/* Filter / Sort / View */}
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-[44px] px-3 text-[14px] border border-[var(--vektrus-border-default)] rounded-[var(--vektrus-radius-sm)] bg-white text-[var(--vektrus-anthrazit)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)] focus:border-transparent transition-shadow cursor-pointer"
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
                className="h-[44px] px-3 text-[14px] border border-[var(--vektrus-border-default)] rounded-[var(--vektrus-radius-sm)] bg-white text-[var(--vektrus-anthrazit)] focus:outline-none focus:ring-2 focus:ring-[var(--vektrus-blue-light)] focus:border-transparent transition-shadow cursor-pointer"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
                <option value="name">Name A-Z</option>
                <option value="size">Größe</option>
              </select>

              {/* View Toggle */}
              <div className="flex h-[44px] border border-[var(--vektrus-border-default)] rounded-[var(--vektrus-radius-sm)] overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-[44px] flex items-center justify-center transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--vektrus-blue)] text-white'
                      : 'bg-white text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)]'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-[44px] flex items-center justify-center border-l border-[var(--vektrus-border-default)] transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--vektrus-blue)] text-white'
                      : 'bg-white text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)]'
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
      <div className="bg-[var(--vektrus-mint)] border-b border-[var(--vektrus-border-subtle)] px-6 py-2.5">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[13px] text-[var(--vektrus-gray)]">
            <span>{filteredItems.length} von {mediaItems.length} Medien</span>
            <span className="hidden sm:inline">{formatFileSize(totalSize)} gesamt</span>
            <span className="hidden sm:inline">{aiGeneratedCount} KI-generiert</span>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[13px] font-medium text-[var(--vektrus-blue)] hover:opacity-70 transition-opacity"
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
                /* Skeleton Loading Grid */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-[var(--vektrus-radius-md)] border border-[var(--vektrus-border-default)] overflow-hidden shadow-subtle">
                      <div className="aspect-square bg-[var(--vektrus-mint)] animate-pulse" />
                      <div className="px-3 py-2.5 space-y-2">
                        <div className="h-3.5 bg-[var(--vektrus-mint)] rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-[var(--vektrus-mint)] rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                /* Error State */
                <div className="flex items-center justify-center py-20">
                  <div className="text-center max-w-sm">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[var(--vektrus-error)]/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[var(--vektrus-error)]" />
                    </div>
                    <h3 className="font-manrope font-semibold text-[16px] text-[var(--vektrus-anthrazit)] mb-1">Medien konnten nicht geladen werden</h3>
                    <p className="text-[13px] text-[var(--vektrus-gray)] mb-4">
                      Bitte versuche es erneut. Falls das Problem bestehen bleibt, prüfe deine Internetverbindung.
                    </p>
                    <button
                      onClick={loadMedia}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--vektrus-blue)] hover:opacity-70 transition-opacity"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Erneut laden
                    </button>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                searchQuery || filterType !== 'all' ? (
                  /* No Results State */
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center max-w-sm">
                      <div className="w-12 h-12 bg-[var(--vektrus-mint)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-5 h-5 text-[var(--vektrus-gray)]" />
                      </div>
                      <h3 className="font-manrope font-semibold text-[16px] text-[var(--vektrus-anthrazit)] mb-1">Keine Treffer</h3>
                      <p className="text-[13px] text-[var(--vektrus-gray)] mb-4">
                        Für diese Suche oder Filterauswahl wurden keine Medien gefunden.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('all');
                        }}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--vektrus-blue)] hover:opacity-70 transition-opacity"
                      >
                        Filter zurücksetzen
                      </button>
                    </div>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-sm p-6 relative" style={{ boxShadow: 'var(--vektrus-shadow-modal)' }}>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center bg-[var(--vektrus-error)]/8">
                <AlertTriangle className="w-5 h-5 text-[var(--vektrus-error)]" />
              </div>
              <h3 className="font-manrope font-bold text-[16px] text-[var(--vektrus-anthrazit)]">
                Datei löschen
              </h3>
            </div>

            <p className="text-[13px] text-[var(--vektrus-gray)] leading-relaxed mb-6">
              Möchtest du diese Datei wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] border border-[var(--vektrus-border-default)] text-[13px] font-semibold text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)] transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteMedia}
                className="flex-1 px-4 py-2.5 rounded-[var(--vektrus-radius-sm)] text-[13px] font-semibold text-white bg-[var(--vektrus-error)] hover:opacity-90 transition-opacity"
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