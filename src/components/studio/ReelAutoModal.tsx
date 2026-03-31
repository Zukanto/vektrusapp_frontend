import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader, Check, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { callN8n } from '../../lib/n8n';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useConnectedPlatforms } from '../../hooks/useConnectedPlatforms';
import PlatformIcon from '../ui/PlatformIcon';

type Phase = 'form' | 'generating' | 'done' | 'error';

const PLATFORM_OPTIONS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube_shorts', label: 'YouTube Shorts' },
];

const GENERATING_PHASES = [
  'Branche und Marke werden analysiert...',
  'Reel-Themen werden recherchiert...',
  'Konzepte werden entwickelt...',
  'Szenen werden geplant...',
  'Voiceover-Skripte werden formuliert...',
  'Konzepte werden finalisiert...',
];

interface ReelAutoModalProps {
  onClose: () => void;
  onConceptsGenerated: (conceptIds: string[]) => void;
}

const ReelAutoModal: React.FC<ReelAutoModalProps> = ({ onClose, onConceptsGenerated }) => {
  const { user } = useAuth();
  const { connectedPlatforms } = useConnectedPlatforms();

  const [platforms, setPlatforms] = useState<string[]>([]);
  const [showFace, setShowFace] = useState(true);
  const [reelCount, setReelCount] = useState(3);
  const [phase, setPhase] = useState<Phase>('form');
  const [error, setError] = useState('');
  const [phaseIdx, setPhaseIdx] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Cycle generating phase text
  useEffect(() => {
    if (phase !== 'generating') return;
    const timer = setInterval(() => {
      setPhaseIdx(i => (i + 1) % GENERATING_PHASES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const togglePlatform = (id: string) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!user?.id || platforms.length === 0) return;
    setPhase('generating');
    setError('');
    setPhaseIdx(0);

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

      const pulseId = response.pulse_id;

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 90;

      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const { data } = await supabase
            .from('pulse_configurations')
            .select('status')
            .eq('id', pulseId)
            .single();

          if (data?.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);

            // Load generated concepts
            const { data: concepts } = await supabase
              .from('pulse_generated_content')
              .select('id')
              .eq('pulse_config_id', pulseId)
              .eq('source', 'pulse_reels');

            const ids = (concepts || []).map((c: any) => c.id);
            setPhase('done');
            onConceptsGenerated(ids);
          } else if (data?.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setError('Die Generierung ist fehlgeschlagen. Bitte versuche es erneut.');
            setPhase('error');
          } else if (attempts >= maxAttempts) {
            if (pollRef.current) clearInterval(pollRef.current);
            setError('Die Generierung dauert zu lange. Bitte versuche es später erneut.');
            setPhase('error');
          }
        } catch {
          // continue polling
        }
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
      setPhase('error');
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
        onClick={phase === 'form' ? onClose : undefined}
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
          {phase === 'form' && (
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
          {phase === 'form' && (
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

              {/* CTA */}
              <button
                onClick={handleGenerate}
                disabled={platforms.length === 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer chat-ai-action-btn"
                style={{
                  background: platforms.length > 0
                    ? 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)'
                    : '#1A1A1E',
                  color: platforms.length > 0 ? 'white' : 'rgba(250,250,250,0.2)',
                  boxShadow: platforms.length > 0
                    ? '0 0 20px rgba(124,108,242,0.15), 0 4px 12px rgba(0,0,0,0.3)'
                    : 'none',
                }}
              >
                <Sparkles className="w-4 h-4" />
                Ideen generieren
              </button>
            </div>
          )}

          {phase === 'generating' && (
            <div className="flex flex-col items-center py-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{
                  background: 'linear-gradient(135deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
                }}
              >
                <Clapperboard className="w-7 h-7 text-white" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={phaseIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium text-[#FAFAFA]/70 mb-1"
                >
                  {GENERATING_PHASES[phaseIdx]}
                </motion.p>
              </AnimatePresence>

              <p className="text-[11px] text-[#FAFAFA]/25">
                Das kann 30–60 Sekunden dauern.
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs mt-5">
                <div className="w-full bg-[#FAFAFA]/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 40%, #E8A0D6 70%, #F4BE9D 100%)',
                    }}
                    initial={{ width: '5%' }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 45, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#49D69E]/15 flex items-center justify-center mb-4">
                <Check className="w-7 h-7 text-[#49D69E]" />
              </div>
              <h3 className="text-base font-manrope font-bold text-[#FAFAFA] mb-1">
                Reel-Konzepte erstellt
              </h3>
              <p className="text-sm text-[#FAFAFA]/40 mb-5">
                Deine neuen Ideen sind in der Übersicht verfügbar.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#49B7E3] text-white hover:bg-[#3aa5d1] transition-colors cursor-pointer"
              >
                Zur Übersicht
              </button>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FA7E70]/15 flex items-center justify-center mb-4">
                <X className="w-7 h-7 text-[#FA7E70]" />
              </div>
              <h3 className="text-base font-manrope font-bold text-[#FAFAFA] mb-1">
                Generierung fehlgeschlagen
              </h3>
              <p className="text-sm text-[#FAFAFA]/40 mb-5 max-w-sm">
                {error}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('form'); setError(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#FAFAFA]/60 hover:text-[#FAFAFA] border border-[#FAFAFA]/10 hover:border-[#FAFAFA]/20 transition-colors cursor-pointer bg-transparent"
                >
                  Zurück
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#7C6CF2] text-white hover:bg-[#6b5ce0] transition-colors cursor-pointer"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReelAutoModal;
