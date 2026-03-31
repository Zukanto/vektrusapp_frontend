import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Brain, Clapperboard, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const phases = [
  { label: 'Analysiere deine Marke', iconKey: 'search', duration: 2200 },
  { label: 'Durchsuche aktuelle Trends', iconKey: 'brain', duration: 2400 },
  { label: 'Finde die besten Reel-Themen', iconKey: 'clapperboard', duration: 2000 },
  { label: 'Erstelle Konzepte', iconKey: 'pen', duration: 2600 },
  { label: 'Szenen werden geplant', iconKey: 'sparkles', duration: 2000 },
  { label: 'Voiceover-Skripte formulieren', iconKey: 'pen', duration: 2200 },
];

const PhaseIcon: React.FC<{ iconKey: string }> = ({ iconKey }) => {
  const iconMap: Record<string, React.ReactNode> = {
    search: <Search className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    brain: <Brain className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    clapperboard: <Clapperboard className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    pen: <PenLine className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
    sparkles: <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />,
  };
  return <>{iconMap[iconKey] || <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)]" />}</>;
};

/** Autonomous fake progress with decelerating curve */
function useFakeProgress() {
  const [percent, setPercent] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 88) return prev;
        let inc: number;
        if (prev < 20) inc = 0.8;
        else if (prev < 40) inc = 0.5;
        else if (prev < 60) inc = 0.3;
        else if (prev < 75) inc = 0.15;
        else if (prev < 85) inc = 0.06;
        else inc = 0.02;
        return Math.min(prev + inc, 88);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return Math.round(percent);
}

const SkeletonCard: React.FC<{ index: number; isActive: boolean }> = ({ index, isActive }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: index * 0.08, duration: 0.3 }}
    className={`relative rounded-xl border overflow-hidden transition-all duration-500 ${
      isActive
        ? 'bg-[#FAFAFA]/[0.06] border-[#49B7E3]/30 shadow-md'
        : 'bg-[#FAFAFA]/[0.02] border-[#FAFAFA]/[0.04]'
    }`}
  >
    {/* Shimmer sweep */}
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'overlay-shimmer 1.9s infinite',
        }}
      />
    </div>

    {/* Scanline on active */}
    {isActive && (
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #49B7E3, #7C6CF2)' }}>
        <div
          className="h-full bg-white/40 rounded-full"
          style={{ width: '40%', animation: 'scanline 1.4s ease-in-out infinite' }}
        />
      </div>
    )}

    <div className="relative flex items-center gap-3 p-3.5">
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isActive ? 'bg-[#49B7E3]/15' : 'bg-[#FAFAFA]/[0.04]'
      }`}>
        {isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#49B7E3]" />
          </motion.div>
        ) : (
          <div className="w-3.5 h-3.5 rounded bg-[#FAFAFA]/[0.06]" />
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        <div className={`h-2.5 rounded-full w-3/4 ${isActive ? 'bg-[#FAFAFA]/[0.08] animate-pulse' : 'bg-[#FAFAFA]/[0.04]'}`} />
        <div className={`h-2 rounded-full w-full ${isActive ? 'bg-[#FAFAFA]/[0.05] animate-pulse' : 'bg-[#FAFAFA]/[0.03]'}`} />
      </div>
    </div>
  </motion.div>
);

interface ReelGeneratingOverlayProps {
  fadingOut?: boolean;
  reelCount?: number;
}

const ReelGeneratingOverlay: React.FC<ReelGeneratingOverlayProps> = ({ fadingOut, reelCount = 3 }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const displayPercent = useFakeProgress();
  const [activeCard, setActiveCard] = useState(0);

  const currentPhase = phases[phaseIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex(i => (i + 1) % phases.length);
    }, currentPhase.duration);
    return () => clearInterval(timer);
  }, [phaseIndex, currentPhase.duration]);

  // Cycle active skeleton card
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard(i => (i + 1) % reelCount);
    }, 3000);
    return () => clearInterval(timer);
  }, [reelCount]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(9, 9, 11, 0.60)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Glass Panel with Blobs — matching GeneratingOverlay pattern */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`relative z-10 w-full max-w-md mx-4 rounded-2xl p-6 ai-blob-container ${fadingOut ? '' : 'ai-active'} flex flex-col`}
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* AI Gradient Blobs — same classes as GeneratingOverlay */}
        <div className="ai-glow-blob blob-1" />
        <div className="ai-glow-blob blob-2" />
        <div className="ai-glow-blob blob-3" />

        {/* Header: Phase text + Typing dots */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-2"
              >
                <PhaseIcon iconKey={currentPhase.iconKey} />
                <p className="text-sm font-semibold text-[#FAFAFA]/80">{currentPhase.label}...</p>
              </motion.div>
            </AnimatePresence>
            <p className="text-[11px] text-[#FAFAFA]/30 mt-0.5">
              Dein Content wird von Vektrus generiert
            </p>
          </div>
          <div className="ai-typing-dots flex-shrink-0 ml-4">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>

        {/* Progress bar with shimmer sweep */}
        <div className="w-full mb-5 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-[#FAFAFA]/30">Fortschritt</span>
            <motion.span
              key={displayPercent}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-bold text-[var(--vektrus-ai-violet)] tabular-nums"
            >
              {displayPercent}%
            </motion.span>
          </div>
          <div className="w-full bg-[#FAFAFA]/5 rounded-full h-1.5 overflow-hidden">
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
              {/* White shimmer sweep on bar */}
              <motion.div
                className="absolute inset-0 bg-white/30 rounded-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Skeleton cards */}
        <div className="space-y-2 relative z-10">
          {Array.from({ length: reelCount }).map((_, i) => (
            <SkeletonCard key={i} index={i} isActive={i === activeCard} />
          ))}
        </div>

        {/* Subtitle */}
        <p className="text-[10px] text-[#FAFAFA]/20 text-center mt-4 relative z-10">
          Das dauert etwa 30–60 Sekunden
        </p>
      </motion.div>
    </div>
  );
};

export default ReelGeneratingOverlay;
