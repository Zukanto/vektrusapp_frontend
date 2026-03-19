import React, { useRef, useEffect, useState } from 'react';
import { TourStep } from './tourSteps';
import { TourIcons } from './TourIcons';

const V = {
  blue: '#49B7E3',
  violet: '#7C6CF2',
  green: '#49D69E',
  white: '#FFFFFF',
  mintWhite: '#F4FCFE',
  anthrazit: '#111111',
  softGray: '#7A7A7A',
  border: '#E8EDF2',
  blueLight: '#B6EBF7',
};

interface TooltipCardProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  rect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  visible: boolean;
}

export function TooltipCard({
  step, stepIndex, totalSteps, rect, onNext, onPrev, onSkip, visible
}: TooltipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const isModal = step.type === 'modal';
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;
  const IconComp = TourIcons[step.icon];

  useEffect(() => {
    if (isModal || !rect || !cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const gap = 20;
    let top = 0;
    let left = 0;

    const position = step.position || 'bottom';

    if (position === 'right') {
      top = rect.top + rect.height / 2 - card.height / 2;
      left = rect.right + gap;
    } else if (position === 'left') {
      top = rect.top + rect.height / 2 - card.height / 2;
      left = rect.left - card.width - gap;
    } else if (position.includes('bottom')) {
      top = rect.bottom + gap;
      if (position.includes('right')) {
        left = rect.right - card.width;
      } else if (position.includes('left')) {
        left = rect.left;
      } else {
        left = rect.left + rect.width / 2 - card.width / 2;
      }
    } else if (position.includes('top')) {
      top = rect.top - card.height - gap;
      if (position.includes('right')) {
        left = rect.right - card.width;
      } else if (position.includes('left')) {
        left = rect.left;
      } else {
        left = rect.left + rect.width / 2 - card.width / 2;
      }
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    top = Math.max(16, Math.min(top, vh - card.height - 16));
    left = Math.max(16, Math.min(left, vw - card.width - 16));

    setPos({ top, left });
  }, [rect, step, isModal]);

  const cardStyle: React.CSSProperties = isModal
    ? {
        position: 'fixed', top: '50%', left: '50%',
        transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.92)',
        maxWidth: 440, width: '90vw',
      }
    : {
        position: 'fixed', top: pos.top, left: pos.left,
        maxWidth: 380, width: '90vw',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
      };

  return (
    <div
      ref={cardRef}
      style={{
        ...cardStyle,
        zIndex: 99999,
        background: V.white,
        border: `1px solid ${V.border}`,
        borderRadius: 16,
        padding: isModal ? '36px 32px 28px' : '24px 22px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'auto' : 'none',
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${V.blue}, ${V.violet})`,
        opacity: 0.8,
      }} />

      {!isLast && (
        <button
          onClick={onSkip}
          aria-label="Tour überspringen"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', color: V.softGray,
            cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
            opacity: 0.5, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      )}

      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: V.mintWhite,
        border: `1px solid ${V.blueLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: isModal ? 20 : 14,
        ...(isModal ? { margin: '0 auto 20px' } : {}),
      }}>
        {IconComp && <IconComp size={28} />}
      </div>

      <div style={{ textAlign: isModal ? 'center' : 'left' }}>
        {step.subtitle && (
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: V.blue, marginBottom: 8,
          }}>
            {step.subtitle}
          </div>
        )}
        <h3 style={{
          margin: 0, fontSize: isModal ? 22 : 17, fontWeight: 700,
          color: V.anthrazit, lineHeight: 1.3, marginBottom: 8,
        }}>
          {step.title}
        </h3>
        <p style={{
          margin: 0, fontSize: 14, lineHeight: 1.65, color: V.softGray,
        }}>
          {step.body}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: isModal ? 28 : 20, gap: 12,
      }}>
        {!isModal ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: V.softGray, fontWeight: 500 }}>
              {stepIndex + 1} / {totalSteps}
            </span>
            <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} style={{
                  width: i === stepIndex ? 18 : 6, height: 6, borderRadius: 3,
                  background: i === stepIndex
                    ? V.blue
                    : i < stepIndex
                      ? V.blueLight
                      : '#E0E0E0',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {!isFirst && !isModal && (
            <button
              onClick={onPrev}
              style={{
                background: 'none',
                border: `1px solid ${V.border}`,
                color: V.softGray, borderRadius: 10, padding: '8px 14px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.2s',
                fontFamily: "'Manrope', system-ui, sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = V.blue;
                e.currentTarget.style.color = V.anthrazit;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = V.border;
                e.currentTarget.style.color = V.softGray;
              }}
            >
              &#8592; Zurück
            </button>
          )}
          <button
            onClick={onNext}
            style={{
              background: isLast
                ? `linear-gradient(135deg, ${V.green}, ${V.green}DD)`
                : `linear-gradient(135deg, ${V.blue}, ${V.blue}DD)`,
              border: 'none', color: '#fff', borderRadius: 10,
              padding: isModal ? '10px 28px' : '8px 18px',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
              boxShadow: isLast
                ? `0 4px 16px ${V.green}30`
                : `0 4px 16px ${V.blue}30`,
              fontFamily: "'Manrope', system-ui, sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {step.cta || (isLast ? 'Abschließen' : 'Weiter')}
            {!isLast && <span>&#8594;</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
