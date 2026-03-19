import { useEffect } from 'react';
import { PLANNER_STEPS } from './tourSteps';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TooltipCard } from './TooltipCard';
import { useTourEngine } from './useTourEngine';

export function PlannerTutorial() {
  const handleComplete = () => {
    localStorage.setItem('vektrus_planner_tutorial_completed', 'true');
  };

  const tour = useTourEngine({
    steps: PLANNER_STEPS,
    onComplete: handleComplete,
  });

  useEffect(() => {
    const done = localStorage.getItem('vektrus_planner_tutorial_completed');
    if (!done) {
      const timer = setTimeout(() => tour.start(), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {!tour.active && (
        <button
          onClick={tour.start}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#F4FCFE',
            border: '1px solid #B6EBF7',
            color: '#49B7E3',
            borderRadius: 10,
            padding: '7px 14px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Manrope', system-ui, sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#49B7E3';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#49B7E3';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#F4FCFE';
            e.currentTarget.style.color = '#49B7E3';
            e.currentTarget.style.borderColor = '#B6EBF7';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
          Tutorial
        </button>
      )}

      {tour.active && (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99997,
            pointerEvents: tour.step.type === 'modal' ? 'auto' : 'none',
          }} />

          <SpotlightOverlay rect={tour.targetRect} visible={tour.visible && tour.step.type === 'spotlight'} />

          {tour.step.type === 'modal' && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 99998,
              background: 'rgba(244, 252, 254, 0.88)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              opacity: tour.visible ? 1 : 0, transition: 'opacity 0.4s ease',
            }} />
          )}

          <TooltipCard
            step={tour.step}
            stepIndex={tour.currentStep}
            totalSteps={tour.totalSteps}
            rect={tour.targetRect}
            onNext={tour.next}
            onPrev={tour.prev}
            onSkip={tour.end}
            visible={tour.visible}
          />
        </>
      )}
    </>
  );
}
