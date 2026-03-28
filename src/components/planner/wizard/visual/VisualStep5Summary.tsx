import React from 'react';
import { Image, ChevronRight } from 'lucide-react';
import { VisualWizardData, formatDate } from './types';

interface VisualStep5SummaryProps {
  data: VisualWizardData;
  onJumpToStep: (step: number) => void;
}

const toneLabels: Record<string, string> = {
  professional: 'Professionell',
  casual: 'Locker',
  inspirational: 'Inspirierend',
  humorous: 'Humorvoll',
  informative: 'Informativ',
};

const goalLabels: Record<string, string> = {
  reach: 'Reichweite',
  engagement: 'Engagement',
  community: 'Community',
  leads: 'Leads',
};

const languageLabels: Record<string, string> = {
  DE: 'Deutsch',
  EN: 'Englisch',
  BOTH: 'Deutsch & Englisch',
};

const VisualStep5Summary: React.FC<VisualStep5SummaryProps> = ({ data, onJumpToStep }) => {
  const validImages = data.images.filter(i => i.publicUrl && !i.error);
  const totalPosts = validImages.length * data.platforms.length;

  const summaryRows = [
    {
      label: 'Plattformen',
      value: data.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', '),
      step: 1,
    },
    {
      label: 'Zeitraum',
      value: `${formatDate(data.timeframe.startDate)} - ${formatDate(data.timeframe.endDate)}`,
      step: 2,
    },
    {
      label: 'Ziel',
      value: goalLabels[data.goal] || data.goal,
      step: 3,
    },
    {
      label: 'Tonalität',
      value: toneLabels[data.tone] || data.tone,
      step: 3,
    },
    {
      label: 'Sprache',
      value: languageLabels[data.language] || data.language,
      step: 3,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3
          className="text-2xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Zusammenfassung
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Prüfe deine Einstellungen und starte die Generierung.
        </p>
      </div>

      <div>
        <button
          onClick={() => onJumpToStep(0)}
          className="w-full group"
        >
          <div className="flex items-center justify-between px-5 py-3 bg-white rounded-t-[var(--vektrus-radius-lg)] border-2 border-b border-[rgba(73,183,227,0.18)] hover:bg-[#F4FCFE] transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#49D69E]/15 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                <Image className="w-4 h-4 text-[#49D69E]" />
              </div>
              <span className="text-sm font-medium text-[#111111]">
                {validImages.length} {validImages.length === 1 ? 'Bild' : 'Bilder'} hochgeladen
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#49B7E3] transition-colors" />
          </div>
        </button>

        <div className="px-5 py-3 bg-white border-x-2 border-[rgba(73,183,227,0.18)] space-y-2.5">
          <div className="flex gap-2 overflow-x-auto">
            {validImages.slice(0, 6).map((img) => (
              <div key={img.id} className="w-14 h-14 flex-shrink-0 rounded-[var(--vektrus-radius-sm)] overflow-hidden bg-[#F4FCFE]">
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {validImages.length > 6 && (
              <div className="w-14 h-14 flex-shrink-0 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] flex items-center justify-center">
                <span className="text-xs font-bold text-[#7A7A7A]">+{validImages.length - 6}</span>
              </div>
            )}
          </div>
          {validImages.some(i => i.description || i.additionalNotes) && (
            <div className="space-y-1">
              {validImages.map((img, idx) => ({ img, pos: idx + 1 })).filter(({ img }) => img.description || img.additionalNotes).slice(0, 4).map(({ img, pos }) => (
                <div key={img.id} className="flex items-center gap-2 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="text-[#ABABAB] flex-shrink-0 w-4 text-right">{pos}.</span>
                  {img.description && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[rgba(124,108,242,0.06)] text-[var(--vektrus-ai-violet)] font-medium flex-shrink-0">
                      {img.description}
                    </span>
                  )}
                  {img.additionalNotes && (
                    <span className="text-[#7A7A7A] truncate">
                      {img.additionalNotes}
                    </span>
                  )}
                </div>
              ))}
              {validImages.filter(i => i.description || i.additionalNotes).length > 4 && (
                <span className="text-xs text-[#ABABAB]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  +{validImages.filter(i => i.description || i.additionalNotes).length - 4} weitere mit Hinweisen
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-b-[var(--vektrus-radius-lg)] border-2 border-t border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.10)] overflow-hidden">
          {summaryRows.map((row, i) => (
            <button
              key={i}
              onClick={() => onJumpToStep(row.step)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F4FCFE] transition-colors text-left group"
            >
              <span className="text-sm text-[#7A7A7A] w-28 flex-shrink-0">{row.label}</span>
              <span className="text-sm font-medium text-[#111111] flex-1 truncate">{row.value}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#49B7E3] transition-colors flex-shrink-0 ml-2" />
            </button>
          ))}
          <div className="px-5 py-3.5 bg-[#F4FCFE]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#111111]">Gesamt</span>
              <span className="text-sm font-bold text-[#49B7E3]">{totalPosts} Posts werden generiert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualStep5Summary;
