import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, AlertTriangle, XCircle, Target, Rocket, Lightbulb } from 'lucide-react';
import { CarouselSlide } from './types';

interface CarouselSlideNavigatorProps {
  slides: CarouselSlide[];
  compact?: boolean;
}

const SLIDE_TYPE_CONFIG = {
  hook: { label: 'Hook', bg: '#F3E8FF', color: '#7C6CF2', dot: '#7C6CF2' },
  value: { label: 'Value', bg: '#E8F4FE', color: '#49B7E3', dot: '#49B7E3' },
  cta: { label: 'CTA', bg: '#E8FFF3', color: '#49D69E', dot: '#49D69E' },
};

const DesignStatusMap: Record<string, { shimmer: boolean; failed: boolean }> = {
  pending: { shimmer: true, failed: false },
  success: { shimmer: false, failed: false },
  failed: { shimmer: false, failed: true },
};

const CarouselSlideNavigator: React.FC<CarouselSlideNavigatorProps> = ({ slides, compact = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) return null;

  const slide = slides[currentSlide];
  const total = slides.length;
  const typeConfig = SLIDE_TYPE_CONFIG[slide.type] ?? SLIDE_TYPE_CONFIG.value;
  const statusInfo = DesignStatusMap[slide.design_status] ?? { shimmer: false, failed: false };

  const successCount = slides.filter(s => s.design_status === 'success').length;
  const allSuccess = successCount === total;
  const noneSuccess = successCount === 0;
  const someSuccess = !allSuccess && !noneSuccess;

  const overallDesignStatus = () => {
    if (allSuccess) return { label: `Alle ${total} Slides generiert`, color: '#49D69E', icon: <CheckCircle className="w-3.5 h-3.5" /> };
    if (noneSuccess && slides.every(s => s.design_status === 'pending')) return { label: 'Designs werden generiert...', color: '#7C6CF2', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, pulse: true };
    if (someSuccess) return { label: `${successCount} von ${total} Slides generiert`, color: '#F4BE9D', icon: <AlertTriangle className="w-3.5 h-3.5" /> };
    return { label: 'Design-Generierung fehlgeschlagen', color: '#FA7E70', icon: <XCircle className="w-3.5 h-3.5" /> };
  };

  const overall = overallDesignStatus();

  return (
    <div className="rounded-[var(--vektrus-radius-md)] overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Slide navigation header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(73,183,227,0.18)]">
        <button
          onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
          disabled={currentSlide === 0}
          className="p-1 rounded-[var(--vektrus-radius-sm)] transition-colors"
          style={{ color: currentSlide === 0 ? '#E0E0E0' : '#49B7E3', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold text-[#7A7A7A]">
          SLIDE {currentSlide + 1}/{total}
        </span>

        <button
          onClick={() => setCurrentSlide(prev => Math.min(total - 1, prev + 1))}
          disabled={currentSlide === total - 1}
          className="p-1 rounded-[var(--vektrus-radius-sm)] transition-colors"
          style={{ color: currentSlide === total - 1 ? '#E0E0E0' : '#49B7E3', cursor: currentSlide === total - 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Slide image */}
      <div className="px-3 pt-3">
        <div className={`relative rounded-[var(--vektrus-radius-sm)] overflow-hidden bg-[#B6EBF7]/20 mx-auto ${compact ? 'w-full max-w-[200px]' : 'w-full max-w-[260px]'}`} style={{ aspectRatio: '1' }}>
          {statusInfo.shimmer ? (
            <div className="w-full h-full animate-pulse" style={{ background: 'linear-gradient(90deg, #EEE8FF 0%, #D8D0FF 50%, #EEE8FF 100%)', backgroundSize: '200% 100%' }} />
          ) : statusInfo.failed ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <AlertTriangle className="w-5 h-5 text-[#FA7E70]" />
              <span className="text-xs text-[#7A7A7A]">Design fehlgeschlagen</span>
            </div>
          ) : slide.design_image_url ? (
            <img
              src={slide.design_image_url}
              alt={`Slide ${slide.slide_number}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: typeConfig.bg }}>
                <span style={{ color: typeConfig.color }}>
                  {slide.type === 'hook' ? <Target className="w-3.5 h-3.5" /> : slide.type === 'cta' ? <Rocket className="w-3.5 h-3.5" /> : <Lightbulb className="w-3.5 h-3.5" />}
                </span>
              </div>
              <span className="text-xs text-gray-400">Kein Design</span>
            </div>
          )}
        </div>
      </div>

      {/* Slide info */}
      <div className="px-3 pt-2 pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold"
            style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
          >
            {typeConfig.label}
          </span>
        </div>
        <p className="text-xs font-semibold text-[#111111] leading-snug line-clamp-2">{slide.headline}</p>
        {slide.body && (
          <p className="text-[11px] text-[#7A7A7A] mt-0.5 leading-snug line-clamp-2">{slide.body}</p>
        )}
      </div>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-1 pb-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className="rounded-full transition-all duration-200"
            style={{
              width: i === currentSlide ? 10 : 8,
              height: i === currentSlide ? 10 : 8,
              backgroundColor: i === currentSlide ? '#49B7E3' : '#E0E0E0',
            }}
          />
        ))}
      </div>

      {/* Overall design status */}
      <div
        className="px-3 py-1.5 text-[11px] font-medium flex items-center gap-1"
        style={{
          borderTop: '1px solid #E5E7EB',
          color: overall.color,
          animation: (overall as any).pulse ? 'pulse 2s infinite' : undefined,
        }}
      >
        <span>{overall.icon}</span>
        <span>{overall.label}</span>
      </div>
    </div>
  );
};

export const CarouselExpandedList: React.FC<{ slides: CarouselSlide[]; currentSlide: number; onSelect: (i: number) => void }> = ({ slides, currentSlide, onSelect }) => {
  const SLIDE_TYPE_CONFIG = {
    hook: { label: 'Hook', bg: '#F3E8FF', color: '#7C6CF2' },
    value: { label: 'Value', bg: '#E8F4FE', color: '#49B7E3' },
    cta: { label: 'CTA', bg: '#E8FFF3', color: '#49D69E' },
  };

  return (
    <div className="mt-3 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold text-[#7A7A7A] bg-[#F4FCFE] border-b border-[rgba(73,183,227,0.18)]">Slides</div>
      <div className="divide-y divide-[rgba(73,183,227,0.10)]">
        {slides.map((slide, i) => {
          const tc = SLIDE_TYPE_CONFIG[slide.type] ?? SLIDE_TYPE_CONFIG.value;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F4FCFE]"
              style={{ backgroundColor: i === currentSlide ? '#F4FCFE' : undefined }}
            >
              <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}.</span>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[9px] font-semibold flex-shrink-0"
                style={{ backgroundColor: tc.bg, color: tc.color }}
              >
                {tc.label}
              </span>
              <span className="text-xs text-[#111111] truncate">{slide.headline}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CarouselSlideNavigator;
