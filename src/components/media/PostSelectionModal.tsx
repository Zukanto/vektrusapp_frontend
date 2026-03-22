import React, { useState } from 'react';
import { X, Calendar, Clock, ArrowRight, Plus, Instagram, Linkedin, Music2, Facebook, Twitter, Globe } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  platform: string;
  date: Date;
  time: string;
  status: 'planned' | 'draft' | 'ai_suggestion';
}

interface PostSelectionModalProps {
  onSelectPost: (postId: string) => void;
  onCreateNewPost: () => void;
  onClose: () => void;
  mediaName: string;
}

const PostSelectionModal: React.FC<PostSelectionModalProps> = ({
  onSelectPost,
  onCreateNewPost,
  onClose,
  mediaName
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>('');

  // Mock posts - würde normalerweise von Context/Props kommen
  const availablePosts: Post[] = [
    {
      id: '1',
      title: 'Behind the Scenes Content',
      platform: 'instagram',
      date: new Date(2024, 0, 22),
      time: '18:00',
      status: 'planned'
    },
    {
      id: '2',
      title: 'Produkt-Showcase Reel',
      platform: 'tiktok',
      date: new Date(2024, 0, 24),
      time: '19:00',
      status: 'draft'
    },
    {
      id: '3',
      title: 'Weekly Business Tips',
      platform: 'linkedin',
      date: new Date(2024, 0, 25),
      time: '09:00',
      status: 'ai_suggestion'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'tiktok': return <Music2 {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      default: return <Globe {...iconProps} />;
    }
  };

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-[var(--vektrus-success)]/12 text-[var(--vektrus-success)]';
      case 'draft':
        return 'bg-[var(--vektrus-warning)]/15 text-[var(--vektrus-warning-dark)]';
      case 'ai_suggestion':
        return 'bg-[var(--vektrus-ai-violet)]/10 text-[var(--vektrus-ai-violet)]';
      default:
        return 'bg-[var(--vektrus-blue-light)]/20 text-[var(--vektrus-gray)]';
    }
  };

  const getStatusLabel = (status: Post['status']) => {
    switch (status) {
      case 'planned':
        return 'Geplant';
      case 'draft':
        return 'Entwurf';
      case 'ai_suggestion':
        return 'KI-Vorschlag';
      default:
        return 'Unbekannt';
    }
  };

  const handleConfirm = () => {
    if (selectedPostId) {
      onSelectPost(selectedPostId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-md max-h-[90vh] overflow-hidden" style={{ boxShadow: 'var(--vektrus-shadow-modal)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--vektrus-border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope font-bold text-[18px] text-[var(--vektrus-anthrazit)]">Medium einfügen</h2>
              <p className="text-[13px] text-[var(--vektrus-gray)] mt-1">
                Wähle einen Post für &ldquo;{mediaName}&rdquo;
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[50vh]">
          {availablePosts.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-[var(--vektrus-gray)] uppercase tracking-wide mb-3">
                Verfügbare Posts
              </h3>

              {availablePosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`p-3.5 border rounded-[var(--vektrus-radius-sm)] cursor-pointer transition-all duration-200 ${
                    selectedPostId === post.id
                      ? 'border-[var(--vektrus-blue)] bg-[var(--vektrus-blue)]/5 shadow-subtle'
                      : 'border-[var(--vektrus-border-default)] hover:border-[var(--vektrus-border-strong)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-[var(--vektrus-blue)] mt-0.5">{getPlatformIcon(post.platform)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--vektrus-anthrazit)] text-[13px] truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-[12px] text-[var(--vektrus-gray)]">
                            <Calendar className="w-3 h-3" />
                            <span>{post.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-[var(--vektrus-gray)]">
                            <Clock className="w-3 h-3" />
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <div className="mt-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusColor(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedPostId === post.id && (
                      <div className="w-5 h-5 bg-[var(--vektrus-blue)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[var(--vektrus-mint)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-5 h-5 text-[var(--vektrus-gray)]" />
              </div>
              <h3 className="font-manrope font-semibold text-[16px] text-[var(--vektrus-anthrazit)] mb-1">Keine Posts gefunden</h3>
              <p className="text-[13px] text-[var(--vektrus-gray)]">
                Es gibt noch keine geplanten Posts für diese Woche.
              </p>
            </div>
          )}

          {/* Create New Post Option */}
          <div className="mt-5 pt-4 border-t border-[var(--vektrus-border-subtle)]">
            <button
              onClick={onCreateNewPost}
              className="w-full flex items-center justify-center gap-2 p-3.5 border border-dashed border-[var(--vektrus-border-default)] hover:border-[var(--vektrus-blue-light)] hover:bg-[var(--vektrus-mint)] text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Neuen Post erstellen</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--vektrus-border-default)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[var(--vektrus-border-default)] text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:border-[var(--vektrus-border-strong)] rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-colors"
          >
            Abbrechen
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedPostId}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-all duration-200 ${
              selectedPostId
                ? 'bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white shadow-subtle hover:shadow-card'
                : 'bg-[var(--vektrus-blue)]/10 text-[var(--vektrus-gray)] cursor-not-allowed'
            }`}
          >
            <span>Medium einfügen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSelectionModal;