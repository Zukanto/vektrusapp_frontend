import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ProcessingStep {
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface BrandProcessingProps {
  designCount: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

const BrandProcessing: React.FC<BrandProcessingProps> = ({ designCount, onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: ProcessingStep[] = [
    { label: 'Designs werden geladen', status: 'pending' },
    ...Array.from({ length: designCount }, (_, i) => ({
      label: `Design ${i + 1} analysiert`,
      status: 'pending' as const,
    })),
    { label: 'Logo analysieren', status: 'pending' },
    { label: 'Stil-DNA synthetisieren', status: 'pending' },
    { label: 'Brand Profile speichern', status: 'pending' },
  ];

  const computedSteps = steps.map((step, i) => ({
    ...step,
    status:
      i < activeStepIndex
        ? ('done' as const)
        : i === activeStepIndex
        ? ('active' as const)
        : ('pending' as const),
  }));

  useEffect(() => {
    const totalSteps = steps.length;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      setProgress((prev) => {
        const next = Math.min(prev + Math.round(100 / totalSteps), 99);
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const isProcessing = activeStepIndex < steps.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto px-4 py-12">
      {/* AI Glass Container with Gradient Blobs */}
      <div
        className={`ai-blob-container glass-panel w-full px-8 py-10 mb-0 ${isProcessing ? 'ai-active' : ''}`}
      >
        {/* Gradient Blobs — visible only during active processing */}
        <div className="ai-glow-blob blob-1" />
        <div className="ai-glow-blob blob-2" />
        <div className="ai-glow-blob blob-3" />

        {/* Content sits above the blobs */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="ai-orb mb-8" />

          <h2 className="text-2xl font-semibold text-[#111111] mb-2 text-center font-manrope">
            Dein Stil wird analysiert...
          </h2>
          <p className="text-sm text-[#7A7A7A] mb-8 text-center">
            Die KI erkennt Farben, Typografie und deinen visuellen Stil.
          </p>

          {/* Progress bar with Pulse Gradient */}
          <div className="w-full mb-2">
            <div className="w-full h-2 rounded-full bg-[rgba(73,183,227,0.18)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #49B7E3 0%, #7C6CF2 50%, #E8A0D6 100%)',
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[#7A7A7A] mb-10 self-end tabular-nums">{progress}%</p>

          {/* Step indicators */}
          <div className="w-full space-y-3">
            {computedSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5">
                  {step.status === 'done' ? (
                    <div className="w-5 h-5 rounded-full bg-[#49D69E] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : step.status === 'active' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--vektrus-ai-violet)] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--vektrus-ai-violet)] animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[rgba(73,183,227,0.18)]" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step.status === 'done'
                      ? 'text-[#49D69E]'
                      : step.status === 'active'
                      ? 'text-[var(--vektrus-ai-violet)] font-medium'
                      : 'text-[#7A7A7A]'
                  }`}
                >
                  {step.label}
                  {step.status === 'active' && '...'}
                </span>
              </div>
            ))}
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-10 text-xs text-[#7A7A7A] hover:text-[#FA7E70] transition-colors underline underline-offset-2"
            >
              Analyse abbrechen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandProcessing;
