import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// ── Tour Steps ──

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const tourSteps: TourStep[] = [
  {
    id: 'script',
    title: 'Dein Drehbuch',
    description:
      'Hook, Voiceover-Skript, Caption und Hashtags — alles editierbar. Klick einfach in ein Feld und passe es an.',
    target: 'studio-script-panel',
    position: 'right',
  },
  {
    id: 'scenes',
    title: 'Deine Szenen',
    description:
      'Szenen bearbeiten, per Drag & Drop umordnen, neue hinzufügen oder löschen. Die Gesamtdauer aktualisiert sich automatisch.',
    target: 'studio-scene-list',
    position: 'right',
  },
  {
    id: 'preview',
    title: 'Reel-Vorschau',
    description:
      'Spiel dein Reel als animierte Vorschau ab — Szene für Szene mit exaktem Timing. So spürst du ob der Rhythmus stimmt.',
    target: 'studio-preview-button',
    position: 'bottom',
  },
  {
    id: 'inspector',
    title: 'KI-Inspektor',
    description:
      'Klick eine Szene an um sie hier im Detail zu bearbeiten. Und: B-Roll-Video direkt aus der Szenen-Beschreibung generieren.',
    target: 'studio-inspector-panel',
    position: 'left',
  },
  {
    id: 'dock',
    title: 'Studio Navigation',
    description:
      'Wechsel zwischen Storyboard, B-Roll Studio, Thumbnails und deinen Videos — alles in einem Produktionswerkzeug.',
    target: 'studio-dock',
    position: 'top',
  },
  {
    id: 'planner',
    title: 'In den Planner',
    description:
      'Wenn dein Konzept fertig ist, übernimm es mit einem Klick direkt in den Content Planner.',
    target: 'studio-planner-btn',
    position: 'left',
  },
];

const TOOLTIP_WIDTH = 320;
const GAP = 16;

// ── Storage Key ──
export const TOUR_STORAGE_KEY = 'studio-tour-completed';

// ── Component ──

interface StudioTourProps {
  onComplete: () => void;
}

const StudioTour: React.FC<StudioTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const prevElementRef = useRef<HTMLElement | null>(null);
  const prevStylesRef = useRef<{ position: string; zIndex: string } | null>(null);

  const step = tourSteps[currentStep];

  // ── Restore previously highlighted element ──
  const restoreElement = useCallback(() => {
    if (prevElementRef.current && prevStylesRef.current) {
      prevElementRef.current.style.position = prevStylesRef.current.position;
      prevElementRef.current.style.zIndex = prevStylesRef.current.zIndex;
    }
    prevElementRef.current = null;
    prevStylesRef.current = null;
  }, []);

  // ── Highlight current target element ──
  const highlightElement = useCallback(() => {
    restoreElement();

    const el = document.querySelector(
      `[data-tour="${step.target}"]`
    ) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    // Store original inline styles
    prevStylesRef.current = {
      position: el.style.position,
      zIndex: el.style.zIndex,
    };
    prevElementRef.current = el;

    // Only add position if element is not already positioned (avoid breaking fixed/absolute)
    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') {
      el.style.position = 'relative';
    }
    el.style.zIndex = '70';

    setTargetRect(el.getBoundingClientRect());
  }, [step.target, restoreElement]);

  useEffect(() => {
    highlightElement();

    const handleResize = () => highlightElement();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [highlightElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => restoreElement();
  }, [restoreElement]);

  // ── Tooltip positioning with edge clamping ──
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { position: 'fixed', opacity: 0, pointerEvents: 'none' };

    const vw = window.innerWidth;
    const pad = 16;

    switch (step.position) {
      case 'right':
        return {
          position: 'fixed',
          left: Math.min(targetRect.right + GAP, vw - TOOLTIP_WIDTH - pad),
          top: Math.max(pad, targetRect.top + targetRect.height / 2 - 80),
          width: TOOLTIP_WIDTH,
        };
      case 'left':
        return {
          position: 'fixed',
          left: Math.max(pad, targetRect.left - GAP - TOOLTIP_WIDTH),
          top: Math.max(pad, targetRect.top + targetRect.height / 2 - 80),
          width: TOOLTIP_WIDTH,
        };
      case 'top':
        return {
          position: 'fixed',
          left: Math.max(
            pad,
            Math.min(targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2, vw - TOOLTIP_WIDTH - pad)
          ),
          top: Math.max(pad, targetRect.top - GAP - 180),
          width: TOOLTIP_WIDTH,
        };
      case 'bottom':
        return {
          position: 'fixed',
          left: Math.max(
            pad,
            Math.min(targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2, vw - TOOLTIP_WIDTH - pad)
          ),
          top: targetRect.bottom + GAP,
          width: TOOLTIP_WIDTH,
        };
    }
  };

  // ── Navigation ──
  const handleComplete = useCallback(() => {
    restoreElement();
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    onComplete();
  }, [restoreElement, onComplete]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const isLast = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Full-page overlay */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={handleComplete}
      />

      {/* Tooltip panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="z-[70] rounded-2xl p-5 border border-[rgba(255,255,255,0.1)]"
          style={{
            ...getTooltipStyle(),
            backgroundColor: '#1A1A1E',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Step counter + close */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-[#49B7E3]">
              {currentStep + 1} / {tourSteps.length}
            </span>
            <button
              onClick={handleComplete}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#FAFAFA]/30 hover:text-[#FAFAFA]/60 hover:bg-[#FAFAFA]/5 transition-colors cursor-pointer bg-transparent border-none"
              title="Tour beenden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content */}
          <h3 className="font-manrope font-bold text-[15px] text-[#FAFAFA] mb-1.5">
            {step.title}
          </h3>
          <p className="text-[13px] text-[#FAFAFA]/50 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleComplete}
              className="text-[12px] text-[#FAFAFA]/30 hover:text-[#FAFAFA]/50 transition-colors bg-transparent border-none cursor-pointer"
            >
              Überspringen
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#FAFAFA]/50 hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Zurück
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#49B7E3] hover:bg-[#3aa5d1] transition-colors cursor-pointer border-none"
              >
                {isLast ? 'Fertig' : 'Weiter'}
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default StudioTour;
