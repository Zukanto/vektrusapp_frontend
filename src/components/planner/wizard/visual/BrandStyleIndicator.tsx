import React from 'react';
import { Palette, Lightbulb } from 'lucide-react';

interface BrandProfile {
  id: string;
  tonality: Record<string, string> | null;
  slogan: string | null;
  colors: any;
  prompt_guidelines?: string | null;
}

interface BrandStyleIndicatorProps {
  brandProfile: BrandProfile | null;
  imageGenerationEnabled?: boolean;
  onNavigateToBrandStudio: () => void;
}

const tonalityLabels = [
  { key: 'addressing', label: 'Ansprache' },
  { key: 'formality', label: 'Formalität' },
  { key: 'emotional_tone', label: 'Ton' },
  { key: 'headline_style', label: 'Headline-Stil' },
  { key: 'language_mix', label: 'Sprache' },
];

function getColorDots(colors: any): string[] {
  if (!colors) return [];
  if (Array.isArray(colors)) {
    return colors
      .slice(0, 5)
      .map((c: any) => (typeof c === 'string' ? c : c?.hex))
      .filter(Boolean);
  }
  return [colors.primary, colors.secondary, colors.accent].filter(Boolean);
}

const BrandStyleIndicator: React.FC<BrandStyleIndicatorProps> = ({
  brandProfile,
  imageGenerationEnabled = false,
  onNavigateToBrandStudio,
}) => {
  if (brandProfile?.id) {
    const activeTraits = tonalityLabels
      .filter(t => brandProfile.tonality?.[t.key]?.trim())
      .map(t => ({ label: t.label, value: brandProfile.tonality![t.key] }));

    const colorDots = getColorDots(brandProfile.colors);
    const hasPromptGuidelines = !!brandProfile.prompt_guidelines;

    return (
      <div className="bg-[#F4FCFE] border border-[#49B7E3]/20 rounded-[var(--vektrus-radius-md)] p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--vektrus-radius-sm)] bg-[#49B7E3]/10 flex items-center justify-center flex-shrink-0">
              <Palette className="w-4 h-4 text-[#49B7E3]" />
            </div>
            <span
              className="text-sm font-semibold text-[#111111]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Dein Brand-Stil wird automatisch angewendet
            </span>
          </div>
          {colorDots.length > 0 && (
            <div className="flex gap-1 ml-2 flex-shrink-0">
              {colorDots.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {activeTraits.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 pl-9">
            {activeTraits.map((trait, i) => (
              <span key={i} className="text-xs text-[#7A7A7A]">
                {trait.label}:{' '}
                <span className="text-[#111111] font-medium">{trait.value}</span>
              </span>
            ))}
          </div>
        )}

        {brandProfile.slogan && (
          <p className="mt-1.5 pl-9 text-xs text-[#7A7A7A] italic">
            „{brandProfile.slogan}"
          </p>
        )}

        {hasPromptGuidelines && imageGenerationEnabled && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#49B7E3]/10 pl-9">
            <span className="text-xs">🖼️</span>
            <span className="text-xs text-[#7C6CF2]">
              Auch Bilder werden im Brand-Stil generiert
            </span>
          </div>
        )}

        <button
          onClick={onNavigateToBrandStudio}
          className="mt-2.5 pl-9 text-xs text-[#49B7E3] hover:underline cursor-pointer block"
        >
          Verwalten →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-[var(--vektrus-radius-sm)] bg-[#F4FCFE] flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-[#7A7A7A]" />
        </div>
        <span
          className="text-sm font-medium text-[#7A7A7A]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Brand-Stil noch nicht eingerichtet
        </span>
      </div>
      <p className="mt-1.5 pl-9 text-xs text-[#7A7A7A]">
        Erstelle dein Brand Profile im Brand Studio für konsistente Posts und Bilder in deinem Stil.
      </p>
      <button
        onClick={onNavigateToBrandStudio}
        className="mt-2 pl-9 text-xs text-[#49B7E3] hover:underline cursor-pointer block"
      >
        Brand Studio öffnen →
      </button>
    </div>
  );
};

export default BrandStyleIndicator;
