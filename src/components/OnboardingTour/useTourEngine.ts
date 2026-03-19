import { useState, useEffect, useCallback } from 'react';
import { TourStep } from './tourSteps';

interface UseTourEngineOptions {
  steps: TourStep[];
  onComplete?: () => void;
}

export function useTourEngine({ steps, onComplete }: UseTourEngineOptions) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  const step = steps[currentStep];

  const start = useCallback(() => {
    setCurrentStep(0);
    setActive(true);
    setVisible(false);
    setTimeout(() => setVisible(true), 50);
  }, []);

  const end = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setActive(false);
      setTargetRect(null);
      onComplete?.();
    }, 350);
  }, [onComplete]);

  const goToStep = useCallback((idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentStep(idx);
      setTimeout(() => setVisible(true), 80);
    }, 250);
  }, []);

  const next = useCallback(() => {
    if (currentStep >= steps.length - 1) { end(); return; }
    goToStep(currentStep + 1);
  }, [currentStep, steps.length, end, goToStep]);

  const prev = useCallback(() => {
    if (currentStep > 0) goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  useEffect(() => {
    if (!active || !step) return;
    if (step.type === 'modal') { setTargetRect(null); return; }
    if (!step.selector) return;

    const findAndMeasure = () => {
      const el = document.querySelector(step.selector!);
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect(new DOMRect(r.left, r.top, r.width, r.height));
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    findAndMeasure();
    const interval = setInterval(findAndMeasure, 500);
    window.addEventListener('resize', findAndMeasure);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', findAndMeasure);
    };
  }, [active, currentStep, step]);

  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, next, prev, end]);

  return {
    active, visible, step, currentStep, targetRect,
    totalSteps: steps.length,
    start, end, next, prev,
  };
}
