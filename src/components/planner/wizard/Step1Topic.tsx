import React from 'react';
import { ShoppingBag, PartyPopper, Lightbulb, Film, Star, CalendarDays } from 'lucide-react';
import { PulseWizardData } from './types';

interface Step1TopicProps {
  data: PulseWizardData;
  onUpdate: (data: Partial<PulseWizardData>) => void;
}

const themes = [
  {
    id: 'product',
    label: 'Produkt / Service',
    subtitle: 'Angebote, Features, Neuheiten',
    icon: ShoppingBag,
    color: '#49B7E3'
  },
  {
    id: 'event',
    label: 'Event / Aktion',
    subtitle: 'Messen, Rabatte, Launches',
    icon: PartyPopper,
    color: '#F4BE9D'
  },
  {
    id: 'knowledge',
    label: 'Branchenwissen',
    subtitle: 'Tipps, Trends, How-Tos',
    icon: Lightbulb,
    color: '#49D69E'
  },
  {
    id: 'behind_the_scenes',
    label: 'Behind the Scenes',
    subtitle: 'Team, Prozesse, Einblicke',
    icon: Film,
    color: '#B6EBF7'
  },
  {
    id: 'customer_success',
    label: 'Kundenerfolg',
    subtitle: 'Testimonials, Case Studies',
    icon: Star,
    color: '#FA7E70'
  },
  {
    id: 'seasonal',
    label: 'Saisonales / Aktuelles',
    subtitle: 'Feiertage, Jahreszeiten, Trends',
    icon: CalendarDays,
    color: '#B4E8E5'
  }
];

const Step1Topic: React.FC<Step1TopicProps> = ({ data, onUpdate }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#111111] mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Worum soll es gehen?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Wähle ein Thema und beschreibe optional den konkreten Anlass.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map(theme => {
          const Icon = theme.icon;
          const isSelected = data.theme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onUpdate({ theme: theme.id })}
              className={`relative p-5 rounded-[var(--vektrus-radius-lg)] border-2 text-left transition-all duration-300 hover:scale-[1.02] border-gradient-ai ${
                isSelected
                  ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-lg border-transparent'
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] bg-white hover:shadow-md'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-3 transition-all duration-300 ${
                  isSelected ? 'shadow-md' : ''
                }`}
                style={{ backgroundColor: isSelected ? theme.color : '#F3F4F6' }}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#7A7A7A]'}`} />
              </div>
              <div className="font-semibold text-[#111111] text-sm mb-1">{theme.label}</div>
              <div className="text-xs text-[#7A7A7A]">{theme.subtitle}</div>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 pulse-gradient-icon rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-2">
          Beschreibe den Anlass (optional)
        </label>
        <p className="text-xs text-[#7A7A7A] mb-3">
          Je konkreter, desto besser wird dein Content
        </p>
        <div className="relative">
          <textarea
            value={data.topicDescription}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                onUpdate({ topicDescription: e.target.value });
              }
            }}
            rows={4}
            className="w-full p-4 border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7]/50 focus:border-[#B6EBF7] resize-none transition-all text-sm text-[#111111] placeholder-[#ABABAB]"
            placeholder="z.B. Wir stellen nächste Woche auf der EMO Messe in Hannover aus, Stand C42. Oder: Unser neues Produkt X500 ist jetzt verfügbar."
          />
          <div className="absolute bottom-3 right-3 text-xs text-[#7A7A7A]">
            {data.topicDescription.length}/500
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Topic;
