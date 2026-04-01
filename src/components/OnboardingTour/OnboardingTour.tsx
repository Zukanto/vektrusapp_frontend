import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ONBOARDING_STEPS } from './tourSteps';
import { SpotlightOverlay } from './SpotlightOverlay';
import { TooltipCard } from './TooltipCard';
import { useTourEngine } from './useTourEngine';
import { supabase } from '../../lib/supabase';

export function OnboardingTour() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');
  const [showToast, setShowToast] = useState(false);

  const handleComplete = () => {
    setShowToast(true);
    localStorage.setItem('vektrus_tour_completed', 'true');

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase.from('users').update({ onboarding_completed: true }).eq('id', session.user.id);
        }
      } catch (err) {
        console.error('Tour save failed:', err);
      }
    })();

    setTimeout(() => setShowToast(false), 5000);
  };

  const tour = useTourEngine({
    steps: ONBOARDING_STEPS,
    onComplete: handleComplete,
  });

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data: user } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .maybeSingle();

        if (user && !user.onboarding_completed) {
          setTimeout(() => tour.start(), 1000);
        }
      } catch {
        const done = localStorage.getItem('vektrus_tour_completed');
        if (!done) setTimeout(() => tour.start(), 1000);
      }
    };
    check();
  }, []);

  return (
    <>
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

      {!tour.active && !isStudio && (
        <button
          onClick={tour.start}
          aria-label="Product Tour starten"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9000,
            width: 48, height: 48, borderRadius: 14,
            background: '#FFFFFF',
            border: '1px solid #E8EDF2',
            color: '#7A7A7A',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #49B7E3, #7C6CF2)';
            e.currentTarget.style.borderColor = '#49B7E3';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'scale(1.06)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(73, 183, 227, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E8EDF2';
            e.currentTarget.style.color = '#7A7A7A';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
          </svg>
        </button>
      )}

      {showToast && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 9001,
          background: '#FFFFFF',
          border: '1px solid rgba(73, 214, 158, 0.3)',
          borderRadius: 14, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          animation: 'vektrusTourSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(73, 214, 158, 0.1)',
            border: '1px solid rgba(73, 214, 158, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#49D69E" strokeWidth="2.5" strokeLinecap="round">
              <path d="m9 11 3 3L22 4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>Tour abgeschlossen</div>
            <div style={{ fontSize: 11, color: '#7A7A7A' }}>Klicke jederzeit auf ? um sie zu wiederholen</div>
          </div>
        </div>
      )}

      {/* Keyframe vektrusTourSlideUp in index.css */}
    </>
  );
}
