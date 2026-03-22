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
    <div className="w-96 bg-white border-l border-[var(--vektrus-border-default)] flex flex-col h-full shadow-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--vektrus-border-default)]">
        <div className="flex items-center justify-between">
          <h2 className="font-manrope font-semibold text-[15px] text-[var(--vektrus-anthrazit)]">Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Preview */}
        <div>
          <div className="aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden bg-[var(--vektrus-mint)] relative shadow-subtle">
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
            <div className="absolute top-2.5 right-2.5">
              {media.source === 'ai_generated' ? (
                <div className="px-2 py-0.5 bg-white/85 text-[var(--vektrus-ai-violet)] text-[11px] font-semibold rounded backdrop-blur-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>KI-generiert</span>
                </div>
              ) : (
                <div className="px-2 py-0.5 bg-white/85 text-[var(--vektrus-gray)] text-[11px] font-semibold rounded backdrop-blur-sm flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Hochgeladen</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-1 mt-3">
            <button
              onClick={handleDownload}
              className="p-2 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-blue-light)]/30 rounded-lg transition-colors"
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
              className="p-2 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-blue-light)]/30 rounded-lg transition-colors"
              title="URL kopieren"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.open(media.public_url, '_blank')}
              className="p-2 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-blue-light)]/30 rounded-lg transition-colors"
              title="In neuem Tab öffnen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-3">
          <div>
            <span className="text-[12px] font-medium text-[var(--vektrus-gray)] uppercase tracking-wide">Dateiname</span>
            <p className="text-[13px] text-[var(--vektrus-anthrazit)] mt-1 break-all leading-relaxed">
              {media.filename}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <div>
              <span className="text-[12px] text-[var(--vektrus-gray)]">Format</span>
              <div className="text-[13px] font-medium text-[var(--vektrus-anthrazit)]">{getFileFormat(media.file_type)}</div>
            </div>
            <div>
              <span className="text-[12px] text-[var(--vektrus-gray)]">Größe</span>
              <div className="text-[13px] font-medium text-[var(--vektrus-anthrazit)]">{formatFileSize(media.file_size)}</div>
            </div>
            <div>
              <span className="text-[12px] text-[var(--vektrus-gray)]">Typ</span>
              <div className="text-[13px] font-medium text-[var(--vektrus-anthrazit)]">
                {media.file_type.startsWith('video/') ? 'Video' : 'Bild'}
              </div>
            </div>
            <div>
              <span className="text-[12px] text-[var(--vektrus-gray)]">Erstellt</span>
              <div className="text-[13px] font-medium text-[var(--vektrus-anthrazit)]">
                {new Date(media.created_at).toLocaleDateString('de-DE')}
              </div>
            </div>
          </div>
        </div>

        {/* AI Info */}
        {media.source === 'ai_generated' && media.generation_prompt && (
          <div className="bg-[var(--vektrus-ai-violet)]/5 rounded-[var(--vektrus-radius-sm)] p-4 border border-[var(--vektrus-ai-violet)]/15">
            <h4 className="font-medium text-[var(--vektrus-ai-violet)] text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>KI-Generierung</span>
            </h4>

            <p className="text-[13px] text-[var(--vektrus-anthrazit)] leading-relaxed italic">
              &ldquo;{media.generation_prompt}&rdquo;
            </p>

            <div className="text-[12px] text-[var(--vektrus-gray)] mt-2">
              Generiert mit {media.generated_by}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-[var(--vektrus-border-default)] space-y-2">
        <button
          onClick={handleInsertIntoPost}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] font-medium text-[14px] transition-colors shadow-subtle hover:shadow-card"
        >
          <Copy className="w-4 h-4" />
          <span>
            {isFromPostEditor ? 'In aktuellen Post einfügen' : 'In Post einfügen'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-[var(--vektrus-border-default)] text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:border-[var(--vektrus-border-strong)] rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-[var(--vektrus-error)]/20 text-[var(--vektrus-error)] hover:bg-[var(--vektrus-error)] hover:text-white hover:border-transparent rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Löschen</span>
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