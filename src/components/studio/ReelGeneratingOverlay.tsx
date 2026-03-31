import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_TEXTS = [
  'Analysiere deine Marke...',
  'Durchsuche aktuelle Trends...',
  'Finde die besten Reel-Themen...',
  'Erstelle Konzepte...',
];

interface ReelGeneratingOverlayProps {
  /** When true, blobs fade out for transition to review */
  fadingOut?: boolean;
}

const ReelGeneratingOverlay: React.FC<ReelGeneratingOverlayProps> = ({ fadingOut }) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx(i => (i + 1) % STEP_TEXTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

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

      {/* Gradient Blobs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-[600ms]"
        style={{ opacity: fadingOut ? 0 : 1 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: '420px',
            height: '420px',
            top: '8%',
            left: '10%',
            background: 'rgba(73, 183, 227, 0.10)',
            filter: 'blur(80px)',
            animation: 'ai-blob-drift-1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '380px',
            height: '380px',
            bottom: '10%',
            right: '12%',
            background: 'rgba(139, 92, 246, 0.08)',
            filter: 'blur(75px)',
            animation: 'ai-blob-drift-2 7s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '280px',
            height: '280px',
            top: '45%',
            left: '40%',
            background: 'rgba(232, 160, 214, 0.06)',
            filter: 'blur(65px)',
            animation: 'ai-blob-drift-3 6.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Glass Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8 flex flex-col items-center text-center"
        style={{
          backgroundColor: 'rgba(18, 18, 20, 0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Sparkles Icon with pulse */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'linear-gradient(135deg, #49B7E3 0%, #8B5CF6 50%, #E8A0D6 100%)',
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>

        {/* Step Texts — Crossfade */}
        <div className="h-6 mb-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-semibold text-[#FAFAFA]/80"
            >
              {STEP_TEXTS[stepIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <p className="text-[11px] text-[#FAFAFA]/30 mb-6">
          Das dauert etwa 30 Sekunden
        </p>

        {/* Progress bar — Pulse Gradient */}
        <div className="w-full max-w-xs">
          <div className="w-full bg-[#FAFAFA]/5 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 40%, #E8A0D6 70%, #F4BE9D 100%)',
              }}
              initial={{ width: '3%' }}
              animate={{ width: '88%' }}
              transition={{ duration: 50, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Typing dots */}
        <div className="ai-typing-dots mt-5">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </motion.div>
    </div>
  );
};

export default ReelGeneratingOverlay;
