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
        return 'bg-[#49D69E] text-white';
      case 'draft':
        return 'bg-[#F4BE9D] text-[#111111]';
      case 'ai_suggestion':
        return 'bg-[var(--vektrus-ai-violet)]/15 text-[var(--vektrus-ai-violet)]';
      default:
        return 'bg-[#B6EBF7]/20 text-[#7A7A7A]';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#111111] font-manrope">Medium einfügen</h2>
              <p className="text-sm text-[#7A7A7A] mt-1">
                Wähle einen Post für "{mediaName}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {availablePosts.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#111111] mb-3">
                Verfügbare Posts dieser Woche:
              </h3>
              
              {availablePosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`p-4 border-2 rounded-[var(--vektrus-radius-md)] cursor-pointer transition-all duration-200 ${
                    selectedPostId === post.id
                      ? 'border-[#B6EBF7] bg-[#B6EBF7]/20'
                      : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-[#49B7E3]">{getPlatformIcon(post.platform)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#111111] text-sm truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-[#7A7A7A]">
                            <Calendar className="w-3 h-3" />
                            <span>{post.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-[#7A7A7A]">
                            <Clock className="w-3 h-3" />
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedPostId === post.id && (
                      <div className="w-5 h-5 bg-[#49B7E3] rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-[#7A7A7A] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[#111111] mb-2">Keine Posts gefunden</h3>
              <p className="text-sm text-[#7A7A7A] mb-4">
                Es gibt noch keine geplanten Posts für diese Woche.
              </p>
            </div>
          )}

          {/* Create New Post Option */}
          <div className="mt-6 pt-4 border-t border-[rgba(73,183,227,0.18)]">
            <button
              onClick={onCreateNewPost}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Neuen Post mit diesem Medium erstellen</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[rgba(73,183,227,0.18)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[rgba(73,183,227,0.18)] hover:border-[#49B7E3] text-[#7A7A7A] hover:text-[#111111] rounded-[10px] font-medium transition-colors"
          >
            Abbrechen
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!selectedPostId}
            className={`flex items-center space-x-2 px-6 py-2 rounded-[10px] font-medium transition-all duration-200 ${
              selectedPostId
                ? 'bg-[#49B7E3] hover:bg-[#3a9fd1] text-white shadow-card hover:shadow-elevated'
                : 'bg-[rgba(73,183,227,0.12)] text-[#7A7A7A] cursor-not-allowed'
            }`}
          >
            <span>Medium einfügen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostSelectionModal;