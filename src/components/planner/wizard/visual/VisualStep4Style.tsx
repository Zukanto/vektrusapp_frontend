import React from 'react';
import { TrendingUp, MessageCircle, Target, Users, Briefcase, Smile, Sparkles, Laugh, Globe, Wand2 } from 'lucide-react';
import { VisualWizardData } from './types';
import BrandStyleIndicator from './BrandStyleIndicator';

interface BrandProfile {
  id: string;
  tonality: Record<string, string> | null;
  slogan: string | null;
  colors: any;
}

interface VisualStep4StyleProps {
  data: VisualWizardData;
  onUpdate: (partial: Partial<VisualWizardData>) => void;
  brandProfile?: BrandProfile | null;
  onNavigateToBrandStudio?: () => void;
  hasBrandDefaults?: boolean;
}

const tones = [
  { id: 'professional', label: 'Professionell', subtitle: 'Seriös und kompetent', icon: Briefcase, color: '#49B7E3' },
  { id: 'casual', label: 'Locker', subtitle: 'Authentisch und nahbar', icon: Smile, color: '#49D69E' },
  { id: 'inspirational', label: 'Inspirierend', subtitle: 'Motivierend und visionär', icon: Sparkles, color: '#F4BE9D' },
  { id: 'humorous', label: 'Humorvoll', subtitle: 'Witzig und unterhaltsam', icon: Laugh, color: '#B4E8E5' },
  { id: 'informative', label: 'Informativ', subtitle: 'Informativ und lehrreich', icon: Globe, color: '#B6EBF7' },
];

const goals = [
  { id: 'reach', label: 'Reichweite', subtitle: 'Mehr Menschen erreichen', icon: TrendingUp, color: '#49B7E3' },
  { id: 'engagement', label: 'Engagement', subtitle: 'Likes, Kommentare, Shares', icon: MessageCircle, color: '#49D69E' },
  { id: 'community', label: 'Community', subtitle: 'Follower binden', icon: Users, color: '#B6EBF7' },
  { id: 'leads', label: 'Leads', subtitle: 'Anfragen generieren', icon: Target, color: '#F4BE9D' },
];

const languages = [
  { id: 'DE', label: 'Deutsch' },
  { id: 'EN', label: 'Englisch' },
  { id: 'BOTH', label: 'Beides' },
];

const VisualStep4Style: React.FC<VisualStep4StyleProps> = ({
  data,
  onUpdate,
  brandProfile,
  onNavigateToBrandStudio,
  hasBrandDefaults,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h3
          className="text-2xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Wie sollen die Posts klingen?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Wähle Ton, Ziel und Sprache für deine Posts.
        </p>
      </div>

      {hasBrandDefaults && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--vektrus-radius-md)] border border-[#B6EBF7] bg-[#F4FCFE]">
          <Wand2 className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />
          <span className="text-sm text-[#7A7A7A]">
            Vorausgefüllt aus deinem Brand Profile — du kannst die Auswahl jederzeit anpassen.
          </span>
        </div>
      )}

      <BrandStyleIndicator
        brandProfile={brandProfile ?? null}
        onNavigateToBrandStudio={onNavigateToBrandStudio ?? (() => {})}
      />

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Tonalität</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tones.map(t => {
            const Icon = t.icon;
            const selected = data.tone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onUpdate({ tone: t.id })}
                className={`p-4 rounded-[var(--vektrus-radius-lg)] border-2 text-center transition-all duration-300 hover:scale-[1.02] border-gradient-ai ${
                  selected
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-lg border-transparent'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] bg-white hover:shadow-md'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-[var(--vektrus-radius-md)] flex items-center justify-center mx-auto mb-2.5 transition-all ${
                    selected ? 'shadow-md' : ''
                  }`}
                  style={{ backgroundColor: selected ? t.color : '#F3F4F6' }}
                >
                  <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-[#7A7A7A]'}`} />
                </div>
                <div className="font-semibold text-[#111111] text-sm mb-0.5">{t.label}</div>
                <div className="text-xs text-[#7A7A7A]">{t.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Hauptziel</label>
        <div className="grid grid-cols-2 gap-4">
          {goals.map(g => {
            const Icon = g.icon;
            const selected = data.goal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onUpdate({ goal: g.id })}
                className={`p-5 rounded-[var(--vektrus-radius-lg)] border-2 text-left transition-all duration-300 hover:scale-[1.01] border-gradient-ai ${
                  selected
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-lg border-transparent'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-[var(--vektrus-radius-md)] flex items-center justify-center transition-all ${
                      selected ? 'shadow-md' : ''
                    }`}
                    style={{ backgroundColor: selected ? g.color : '#F3F4F6' }}
                  >
                    <Icon className={`w-5 h-5 ${selected ? 'text-white' : 'text-[#7A7A7A]'}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#111111] text-sm">{g.label}</div>
                    <div className="text-xs text-[#7A7A7A]">{g.subtitle}</div>
                  </div>
                </div>
                {selected && (
                  <div className="mt-2 flex items-center space-x-1.5">
                    <div className="w-4 h-4 pulse-gradient-icon rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--vektrus-ai-violet)' }}>Ausgewählt</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Sprache</label>
        <div className="flex space-x-3">
          {languages.map(l => {
            const selected = data.language === l.id;
            return (
              <button
                key={l.id}
                onClick={() => onUpdate({ language: l.id })}
                className={`px-5 py-2.5 rounded-[var(--vektrus-radius-md)] border-2 text-sm font-medium transition-all duration-300 border-gradient-ai ${
                  selected
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] text-[#111111] border-transparent'
                    : 'border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[#B6EBF7]'
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisualStep4Style;
