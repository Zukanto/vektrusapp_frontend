import React, { useEffect, useState, useRef } from 'react';
import { TriangleAlert as AlertTriangle, RefreshCw, CircleCheck as CheckCircle, X, Calendar, Clock, Zap, Sparkles, Search, Brain, Timer, PenLine, Hash, PackageCheck, Palette, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratingOverlayProps {
  hasImages: boolean;
  error: string | null;
  onRetry: () => void;
  progress: {
    current: number;
    total: number;
    status: string;
    designProgress?: string;
  };
  onDismiss?: () => void;
  onClose?: () => void;
  onViewResults?: () => void;
}

const PhaseIcon: React.FC<{ iconKey: string }> = ({ iconKey }) => {
  const iconMap: Record<string, React.ReactNode> = {
    search: <Search className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    brain: <Brain className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    timer: <Timer className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    pen: <PenLine className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    hash: <Hash className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    sparkles: <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    palette: <Palette className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    image: <ImageIcon className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  };
  return <>{iconMap[iconKey] || <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />}</>;
};

const phases = [
  { label: 'Unternehmen wird analysiert', iconKey: 'search', duration: 2200 },
  { label: 'Content-Strategie entwickeln', iconKey: 'brain', duration: 2000 },
  { label: 'Posting-Zeiten optimieren', iconKey: 'timer', duration: 1800 },
  { label: 'Texte werden formuliert', iconKey: 'pen', duration: 2000 },
  { label: 'Hashtags recherchiert', iconKey: 'hash', duration: 1600 },
  { label: 'Posts werden finalisiert', iconKey: 'sparkles', duration: 2400 },
];

const imagePhases = [
  { label: 'Bilder werden generiert', iconKey: 'palette', duration: 3000 },
  { label: 'Bildkomposition optimieren', iconKey: 'image', duration: 2500 },
];

function usePsychologicalProgress(realPercent: number, isTerminal: boolean) {
  const [displayPercent, setDisplayPercent] = useState(3);
  const currentRef = useRef(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isTerminal) {
      currentRef.current = 100;
      setDisplayPercent(100);
      return;
    }

    // Autonomous fake progress that runs at all times, capped at 88%
    // Real poll data can push it higher, but never beyond 95%
    const fakeTarget = Math.max(realPercent > 0 ? Math.min(realPercent, 95) : 0, currentRef.current);

    intervalRef.current = setInterval(() => {
      const current = currentRef.current;

      // Slow-down curve: fast at start, crawls near 88%
      let increment: number;
      if (current < 20) increment = 0.9;
      else if (current < 40) increment = 0.6;
      else if (current < 60) increment = 0.35;
      else if (current < 75) increment = 0.18;
      else if (current < 85) increment = 0.08;
      else increment = 0.02;

      // Once real data arrives, allow jumping to it
      const naturalNext = current + increment;
      const realBoosted = realPercent > 0 ? Math.min(realPercent, 95) : 0;
      const next = Math.min(Math.max(naturalNext, fakeTarget), Math.max(naturalNext, realBoosted), 88);

      currentRef.current = next;
      setDisplayPercent(Math.round(next));

      // Stop autonomous crawl at 88% – wait for real data or terminal
      if (next >= 88 && realPercent === 0) {
        clearInterval(intervalRef.current!);
      }
    }, 120);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [realPercent, isTerminal]);

  return displayPercent;
}

const SkeletonCard: React.FC<{ index: number; isCompleted?: boolean; isActive?: boolean }> = ({
  index,
  isCompleted,
  isActive,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
    className={`relative rounded-[var(--vektrus-radius-md)] border overflow-hidden shadow-sm transition-all duration-500 ${
      isCompleted
        ? 'bg-gradient-to-r from-[#F0FBF6] to-white border-[#49D69E]/30'
        : isActive
        ? 'bg-white border-[#49B7E3]/40 shadow-md'
        : 'bg-white border-[rgba(73,183,227,0.10)]'
    }`}
  >
    {!isCompleted && (
      <div className="absolute inset-0 overflow-hidden rounded-[var(--vektrus-radius-md)] pointer-events-none">
        <div
          className="absolute inset-0 -translate-x-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
            animation: 'shimmer 1.9s infinite',
          }}
        />
      </div>
    )}

    {isActive && (
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#49B7E3] to-[#49D69E]">
        <div
          className="h-full bg-white/50 rounded-full"
          style={{
            width: '40%',
            animation: 'scanline 1.4s ease-in-out infinite',
          }}
        />
      </div>
    )}

    <div className="relative flex items-start space-x-3 p-3.5">
      <div
        className={`w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex-shrink-0 flex items-center justify-center transition-all duration-500 ${
          isCompleted ? 'bg-[#49D69E]/15' : isActive ? 'bg-[#49B7E3]/10' : 'bg-[#F4FCFE]'
        }`}
      >
        {isCompleted ? (
          <CheckCircle className="w-4 h-4 text-[#49D69E]" />
        ) : isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#49B7E3]" />
          </motion.div>
        ) : (
          <div className="w-3.5 h-3.5 rounded-[var(--vektrus-radius-sm)] bg-[#B6EBF7]/20" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
        <div
          className={`h-2.5 rounded-full w-3/4 transition-all duration-500 ${
            isCompleted ? 'bg-[#B6EBF7]/20' : 'bg-[#B6EBF7]/20 animate-pulse'
          }`}
        />
        <div
          className={`h-2 rounded-full w-full transition-all duration-500 ${
            isCompleted ? 'bg-[#F4FCFE]' : 'bg-[#F4FCFE] animate-pulse'
          }`}
          style={{ animationDelay: '150ms' }}
        />
        <div
          className={`h-2 rounded-full w-2/3 transition-all duration-500 ${
            isCompleted ? 'bg-[#F4FCFE]' : 'bg-[#F4FCFE] animate-pulse'
          }`}
          style={{ animationDelay: '300ms' }}
        />
        <div className="flex items-center space-x-1.5 pt-0.5">
          <div
            className={`h-1.5 rounded-full w-14 transition-all duration-500 ${
              isCompleted ? 'bg-[#49D69E]/25' : 'bg-[#F4FCFE] animate-pulse'
            }`}
          />
          <div
            className={`h-1.5 rounded-full w-10 transition-all duration-500 ${
              isCompleted ? 'bg-[#49B7E3]/25' : 'bg-[#F4FCFE] animate-pulse'
            }`}
            style={{ animationDelay: '200ms' }}
          />
        </div>
      </div>

      {isCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 300 }}
          className="flex-shrink-0 w-5 h-5 bg-[#49D69E] rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </div>
  </motion.div>
);

const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({
  hasImages,
  error,
  onRetry,
  progress,
  onDismiss,
  onClose,
  onViewResults,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [optimisticComplete, setOptimisticComplete] = useState(false);

  const allPhases = hasImages ? [...phases, ...imagePhases] : phases;
  const isTerminal = ['completed', 'partial', 'failed', 'timeout'].includes(progress.status);

  const hasPollData = progress.total > 0 && progress.status !== 'starting';
  const realPercent = hasPollData
    ? Math.min(Math.round((progress.current / progress.total) * 100), 100)
    : 0;

  const displayPercent = usePsychologicalProgress(realPercent, isTerminal || optimisticComplete);

  useEffect(() => {
    if (isTerminal || error) return;
    const timer = setInterval(() => {
      setPhaseIndex(i => (i + 1) % allPhases.length);
    }, allPhases[phaseIndex]?.duration ?? 2200);
    return () => clearInterval(timer);
  }, [phaseIndex, allPhases.length, isTerminal, error]);

  useEffect(() => {
    if (progress.status === 'completed' || progress.status === 'partial') {
      setOptimisticComplete(true);
    }
  }, [progress.status]);

  if (error && progress.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 bg-[#FA7E70]/15 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-[#FA7E70]" />
        </motion.div>
        <h3 className="text-xl font-bold text-[#111111] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Generierung fehlgeschlagen
        </h3>
        <p className="text-sm text-[#7A7A7A] mb-6 max-w-md leading-relaxed">{error}</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#49B7E3] to-[#B6EBF7] text-white rounded-[var(--vektrus-radius-md)] font-medium transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Erneut versuchen</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-3 text-sm text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] transition-colors"
            >
              Schließen
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error && progress.status === 'timeout') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-20 h-20 bg-[#F4BE9D]/20 rounded-full flex items-center justify-center mb-6"
        >
          <Clock className="w-10 h-10 text-[#F4BE9D]" />
        </motion.div>
        <h3 className="text-xl font-bold text-[#111111] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Generierung dauert länger als erwartet
        </h3>
        <p className="text-sm text-[#7A7A7A] mb-6 max-w-md leading-relaxed">{error}</p>
        <div className="flex items-center space-x-3">
          {onViewResults && (
            <button
              onClick={onViewResults}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#49B7E3] to-[#B6EBF7] text-white rounded-[var(--vektrus-radius-md)] font-medium transition-all hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span>Zum Kalender</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-3 text-sm text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] transition-colors"
            >
              Schließen
            </button>
          )}
        </div>
      </div>
    );
  }

  if (progress.status === 'partial') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-[#F4BE9D] to-[#F8D4BC] rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <AlertTriangle className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {progress.current} {progress.current === 1 ? 'Post' : 'Posts'} erstellt
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-[#7A7A7A] mb-8"
        >
          Einige Posts konnten nicht generiert werden.
        </motion.p>
        {onViewResults && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={onViewResults}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#49B7E3] to-[#B6EBF7] text-white rounded-[var(--vektrus-radius-md)] font-semibold transition-all hover:scale-105 hover:shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            <span>Verfügbare Posts ansehen</span>
          </motion.button>
        )}
      </div>
    );
  }

  if (progress.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-[#49D69E] to-[#B4E8E5] rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {progress.current} {progress.current === 1 ? 'Post' : 'Posts'} erfolgreich erstellt!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-[#7A7A7A] mb-8"
        >
          Dein Content ist bereit zur Planung.
        </motion.p>
        {onViewResults && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={onViewResults}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#49B7E3] to-[#B6EBF7] text-white rounded-[var(--vektrus-radius-md)] font-semibold transition-all hover:scale-105 hover:shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            <span>Content ansehen</span>
          </motion.button>
        )}
      </div>
    );
  }

  const totalSkeletons = hasPollData && progress.total > 0 ? Math.min(progress.total, 5) : 4;
  const completedCount = hasPollData ? Math.min(progress.current, totalSkeletons) : 0;
  const activeIndex = completedCount < totalSkeletons ? completedCount : -1;

  const currentPhase = allPhases[phaseIndex];
  const isAlmostDone = hasPollData && progress.current >= progress.total && progress.total > 0;

  const statusText = (() => {
    if (progress.status === 'starting') return 'Verbindung wird hergestellt...';
    if (isAlmostDone && !progress.designProgress) return 'Fast fertig, Daten werden gespeichert...';
    if (hasPollData && progress.current > 0 && progress.designProgress) {
      return `${progress.current} Posts erstellt — ${progress.designProgress}`;
    }
    if (hasPollData && progress.current > 0) return `${progress.current} von ${progress.total} Posts generiert`;
    return currentPhase.label + '...';
  })();

  return (
    <div className="flex flex-col px-6 py-5 ai-blob-container ai-active glass-ai-layer rounded-[var(--vektrus-radius-lg)]">
      {/* AI Gradient Blobs — subtle depth layer during generation */}
      <div className="ai-glow-blob blob-1" />
      <div className="ai-glow-blob blob-2" />
      <div className="ai-glow-blob blob-3" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
              className="flex items-center space-x-2"
            >
              {!hasPollData && (
                <PhaseIcon iconKey={currentPhase.iconKey} />
              )}
              <p className="text-sm font-semibold text-[#111111] truncate">{statusText}</p>
            </motion.div>
          </AnimatePresence>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            {progress.designProgress
              ? 'Designs werden im Hintergrund erstellt. Das kann 3-5 Minuten dauern.'
              : isAlmostDone
              ? 'Noch einen Moment Geduld...'
              : hasImages
              ? 'Posts und Bilder werden erstellt...'
              : 'Dein Content wird von Vektrus generiert'}
          </p>
        </div>

        <div className="ai-typing-dots flex-shrink-0 ml-4">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>

      {/* Psychological progress bar */}
      <div className="w-full mb-5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#7A7A7A]">Fortschritt</span>
          <motion.span
            key={displayPercent}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="text-xs font-bold text-[var(--vektrus-ai-violet)] tabular-nums"
          >
            {displayPercent}%
          </motion.span>
        </div>
        <div className="w-full bg-[#F4FCFE] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 40%, #E8A0D6 70%, #F4BE9D 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ width: '3%' }}
            animate={{ width: `${displayPercent}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
            />
          </motion.div>
        </div>
        {hasPollData && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-[#7A7A7A]">{progress.current} erstellt</span>
            <span className="text-[10px] text-[#7A7A7A]">{progress.total} gesamt</span>
          </div>
        )}
      </div>

      {/* Skeleton cards */}
      <div className="space-y-2.5 mb-5 relative z-10">
        {Array.from({ length: totalSkeletons }).map((_, i) => (
          <SkeletonCard
            key={i}
            index={i}
            isCompleted={i < completedCount}
            isActive={i === activeIndex}
          />
        ))}
        {hasPollData && progress.total > 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-[#7A7A7A] pl-1"
          >
            + {progress.total - 5} weitere Posts werden generiert
          </motion.p>
        )}
      </div>

      {/* Phase steps */}
      {!hasPollData && (
        <div className="mb-5 flex items-center space-x-1.5 overflow-hidden relative z-10">
          {allPhases.map((p, i) => (
            <motion.div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i < phaseIndex
                  ? 'bg-[#49D69E]'
                  : i === phaseIndex
                  ? 'bg-[#49B7E3]'
                  : 'bg-[#B6EBF7]/20'
              }`}
              animate={{ flex: i === phaseIndex ? 2 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      )}

      {/* Dismiss banner */}
      {onDismiss && progress.status === 'generating' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-[var(--vektrus-radius-md)] bg-[#49B7E3]/8 border border-[#49B7E3]/20 relative z-10"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Zap className="w-3.5 h-3.5 text-[#49B7E3] flex-shrink-0" />
            <p className="text-xs text-[#49B7E3] font-medium leading-snug">
              Du kannst dieses Fenster schließen – Pulse läuft im Hintergrund weiter.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center space-x-1 ml-3 flex-shrink-0 px-2.5 py-1.5 text-xs font-medium text-[#49B7E3] hover:bg-[#49B7E3]/15 rounded-[var(--vektrus-radius-sm)] transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Schließen</span>
          </button>
        </motion.div>
      )}

    </div>
  );
};

export default GeneratingOverlay;
