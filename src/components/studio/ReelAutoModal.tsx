import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { callN8n } from '../../lib/n8n';
import { useAuth } from '../../hooks/useAuth';
import { useConnectedPlatforms } from '../../hooks/useConnectedPlatforms';
import PlatformIcon from '../ui/PlatformIcon';

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
];

interface ReelAutoModalProps {
  onClose: () => void;
  /** Called after webhook fires successfully — modal closes, parent takes over */
  onGenerationStarted: (pulseId: string) => void;
}

const ReelAutoModal: React.FC<ReelAutoModalProps> = ({ onClose, onGenerationStarted }) => {
  const { user } = useAuth();
  const { connectedPlatforms } = useConnectedPlatforms();

  const [platforms, setPlatforms] = useState<string[]>([]);
  const [showFace, setShowFace] = useState(true);
  const [reelCount, setReelCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default platforms from connected accounts
  useEffect(() => {
    if (connectedPlatforms.length > 0) {
      const reelPlatforms = connectedPlatforms.filter(p =>
        ['instagram', 'tiktok', 'youtube_shorts'].includes(p)
      );
      setPlatforms(reelPlatforms.length > 0 ? reelPlatforms : ['instagram']);
    } else {
      setPlatforms(['instagram']);
    }
  }, [connectedPlatforms]);

  const togglePlatform = (id: string) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!user?.id || platforms.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await callN8n('vektrus-pulse-reels', {
        user_id: user.id,
        reel_configuration: {
          platforms,
          theme: 'auto',
          reel_count: reelCount,
          difficulty: 'einfach',
          show_face: showFace,
          language: 'DE',
        },
      });

      if (!response?.success || !response?.pulse_id) {
        throw new Error('Generierung konnte nicht gestartet werden');
      }

      // Hand off to parent — modal closes, parent shows overlay
      onGenerationStarted(response.pulse_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={!submitting ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#121214',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-manrope font-bold text-[#FAFAFA]">
                KI-Reel-Ideen
              </h2>
              <p className="text-[11px] text-[#FAFAFA]/40">
                Basierend auf deiner Marke und Branche
              </p>
            </div>
          </div>
          {!submitting && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#FAFAFA]/30 hover:text-[#FAFAFA]/60 transition-colors rounded-lg hover:bg-[#FAFAFA]/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-5">
            {/* Platforms */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2.5">
                Plattformen
              </label>
              <div className="flex gap-2">
                {PLATFORM_OPTIONS.map(p => {
                  const selected = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      disabled={submitting}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                        selected
                          ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                          : 'bg-[#1A1A1E] text-[#FAFAFA]/50 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      <PlatformIcon platform={p.id} size={16} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show face */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1E]">
              <div>
                <p className="text-sm font-medium text-[#FAFAFA]/80">
                  Gesicht zeigen
                </p>
                <p className="text-[11px] text-[#FAFAFA]/30 mt-0.5">
                  {showFace
                    ? 'Talking-Head und kamerabasierte Formate'
                    : 'Formate die ohne Gesicht funktionieren'}
                </p>
              </div>
              <button
                onClick={() => setShowFace(!showFace)}
                disabled={submitting}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  showFace ? 'bg-[#49B7E3]' : 'bg-[#FAFAFA]/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    showFace ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Count */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#FAFAFA]/40 mb-2.5">
                Anzahl Ideen
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setReelCount(n)}
                    disabled={submitting}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                      reelCount === n
                        ? 'bg-[#49B7E3]/15 text-[#49B7E3] border-[#49B7E3]/40'
                        : 'bg-[#1A1A1E] text-[#FAFAFA]/50 border-transparent hover:border-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[#FA7E70]/10 border border-[#FA7E70]/20">
                <p className="text-xs text-[#FA7E70]/80">{error}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleGenerate}
              disabled={platforms.length === 0 || submitting}
              className="reel-ideas-btn w-full flex items-center justify-center gap-2 px-5 py-3 text-sm cursor-pointer"
              style={
                platforms.length === 0
                  ? { background: '#1A1A1E', color: 'rgba(250,250,250,0.2)', boxShadow: 'none' }
                  : undefined
              }
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Wird gestartet...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Ideen generieren
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReelAutoModal;
