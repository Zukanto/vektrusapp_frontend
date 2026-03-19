import React, { useState } from 'react';
import { X, Download, Trash2, Copy, Sparkles, ExternalLink, Upload } from 'lucide-react';
import PostSelectionModal from './PostSelectionModal';
import { useToast } from '../ui/toast';
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
}

interface MediaDetailSidebarProps {
  media: MediaItem;
  onClose: () => void;
  onUpdate: (media: MediaItem) => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isFromPostEditor?: boolean;
  onInsertIntoPost?: (mediaUrl: string) => void;
}

const MediaDetailSidebar: React.FC<MediaDetailSidebarProps> = ({
  media,
  onClose,
  onUpdate,
  onDelete,
  onToggleFavorite,
  isFromPostEditor = false,
  onInsertIntoPost
}) => {
  const { addToast } = useToast();
  const { setSelectedMedia, setTriggerPostCreation } = useMediaInsert();
  const [showPostSelection, setShowPostSelection] = useState(false);

  const handleDownload = async () => {
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

      addToast({
        type: 'success',
        title: 'Download gestartet',
        description: 'Das Medium wird heruntergeladen.',
        duration: 2000
      });
    } catch (error) {
      console.error('Download fehlgeschlagen:', error);
      addToast({
        type: 'error',
        title: 'Download fehlgeschlagen',
        description: 'Das Medium konnte nicht heruntergeladen werden.',
        duration: 3000
      });
    }
  };

  const handleInsertIntoPost = () => {
    if (isFromPostEditor && onInsertIntoPost) {
      onInsertIntoPost(media.public_url);
      addToast({
        type: 'success',
        title: 'Medium eingefügt',
        description: 'Das Medium wurde erfolgreich in den Post eingefügt.',
        duration: 3000
      });
      onClose();
    } else {
      setShowPostSelection(true);
    }
  };

  const handlePostSelection = (postId: string) => {
    setSelectedMedia(media);
    setTriggerPostCreation(true);

    window.dispatchEvent(new CustomEvent('navigate-to-planner-with-media', {
      detail: { postId, media }
    }));

    addToast({
      type: 'success',
      title: 'Zum Planner wechseln',
      description: 'Öffne den Post-Editor...',
      duration: 2000
    });

    setShowPostSelection(false);
    onClose();
  };

  const handleCreateNewPost = () => {
    setSelectedMedia(media);
    setTriggerPostCreation(true);

    window.dispatchEvent(new CustomEvent('navigate-to-planner-with-media', {
      detail: { createNew: true, media }
    }));

    addToast({
      type: 'success',
      title: 'Zum Planner wechseln',
      description: 'Erstelle neuen Post mit dem ausgewählten Bild...',
      duration: 2000
    });

    setShowPostSelection(false);
    onClose();
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

  return (
    <div className="w-96 bg-white border-l border-[rgba(73,183,227,0.18)] flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111111]">Medien-Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Preview */}
        <div className="relative">
          <div className="aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden bg-[#F4FCFE] relative">
            {media.file_type.startsWith('video/') ? (
              <video
                src={media.public_url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={media.public_url}
                alt={media.filename}
                className="w-full h-full object-cover"
              />
            )}

            {/* Source Badge */}
            <div className="absolute top-3 right-3">
              {media.source === 'ai_generated' ? (
                <div className="px-3 py-1 bg-[var(--vektrus-ai-violet)]/15 text-[var(--vektrus-ai-violet)] text-xs font-medium rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>KI-generiert</span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-[#B6EBF7] text-[#111111] text-xs font-medium rounded-full flex items-center space-x-1">
                  <Upload className="w-3 h-3" />
                  <span>Hochgeladen</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <button
              onClick={handleDownload}
              className="p-2 bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#F4FCFE] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] transition-colors"
              title="Herunterladen"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(media.public_url);
                addToast({
                  type: 'success',
                  title: 'URL kopiert',
                  description: 'Die Bild-URL wurde in die Zwischenablage kopiert.',
                  duration: 2000
                });
              }}
              className="p-2 bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#F4FCFE] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] transition-colors"
              title="URL kopieren"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.open(media.public_url, '_blank')}
              className="p-2 bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#F4FCFE] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] transition-colors"
              title="In neuem Tab öffnen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#111111] mb-2 block">Dateiname</label>
            <p className="text-sm text-[#111111] font-mono bg-[#F4FCFE] p-2 rounded-[var(--vektrus-radius-sm)] border break-all">
              {media.filename}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#7A7A7A]">Format:</span>
              <div className="font-medium text-[#111111]">{getFileFormat(media.file_type)}</div>
            </div>
            <div>
              <span className="text-[#7A7A7A]">Größe:</span>
              <div className="font-medium text-[#111111]">{formatFileSize(media.file_size)}</div>
            </div>
            <div>
              <span className="text-[#7A7A7A]">Typ:</span>
              <div className="font-medium text-[#111111]">
                {media.file_type.startsWith('video/') ? 'Video' : 'Bild'}
              </div>
            </div>
            <div>
              <span className="text-[#7A7A7A]">Erstellt:</span>
              <div className="font-medium text-[#111111]">
                {new Date(media.created_at).toLocaleDateString('de-DE')}
              </div>
            </div>
          </div>
        </div>

        {/* AI Info */}
        {media.source === 'ai_generated' && media.generation_prompt && (
          <div className="bg-[var(--vektrus-ai-violet)]/10 rounded-[var(--vektrus-radius-sm)] p-4 border border-[var(--vektrus-ai-violet)]">
            <h4 className="font-medium text-[var(--vektrus-ai-violet)] mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>KI-Generierung</span>
            </h4>

            <div className="mb-2">
              <span className="text-xs text-[var(--vektrus-ai-violet)] font-medium">Prompt:</span>
              <p className="text-sm text-[var(--vektrus-ai-violet)] mt-1 italic">"{media.generation_prompt}"</p>
            </div>

            <div className="text-xs text-[var(--vektrus-ai-violet)]/70">
              Generiert mit: {media.generated_by}
            </div>
          </div>
        )}

        {/* Storage Info */}
        <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-4 border border-[rgba(73,183,227,0.18)]">
          <h4 className="font-medium text-[#111111] mb-2 text-sm">Storage-Informationen</h4>
          <div className="space-y-1 text-xs text-[#7A7A7A]">
            <div className="flex justify-between">
              <span>Bucket:</span>
              <span className="font-mono">{media.file_type.startsWith('video/') ? 'temp-videos' : 'user-images'}</span>
            </div>
            <div className="flex justify-between">
              <span>Pfad:</span>
              <span className="font-mono truncate ml-2">{media.storage_path}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[rgba(73,183,227,0.18)] space-y-3">
        <button
          onClick={handleInsertIntoPost}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span>
            {isFromPostEditor ? 'In aktuellen Post einfügen' : 'In Post einfügen'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#F4FCFE] text-[#7A7A7A] hover:bg-[#F4FCFE] hover:text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Download</span>
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center space-x-2 py-2 px-3 bg-[#FA7E70]/10 text-[#FA7E70] hover:bg-[#FA7E70] hover:text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Löschen</span>
          </button>
        </div>
      </div>

      {/* Post Selection Modal */}
      {showPostSelection && (
        <PostSelectionModal
          onSelectPost={handlePostSelection}
          onCreateNewPost={handleCreateNewPost}
          onClose={() => setShowPostSelection(false)}
          mediaName={media.filename}
        />
      )}
    </div>
  );
};

export default MediaDetailSidebar;