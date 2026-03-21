import React from 'react';
import { Zap, PenLine, Image, ArrowRight, X } from 'lucide-react';

interface PulseEntryModalProps {
  onSelect: (mode: 'theme' | 'visual') => void;
  onClose: () => void;
}

const modes = [
  {
    id: 'theme' as const,
    icon: PenLine,
    title: 'Themen-basiert',
    description: 'Beschreibe dein Thema und Pulse erstellt passende Posts für deine Plattformen.',
  },
  {
    id: 'visual' as const,
    icon: Image,
    title: 'Bilder zu Posts',
    description: 'Lade Bilder hoch und Pulse schreibt den perfekten Post-Text, Hashtags und CTAs dazu.',
  },
];

const PulseEntryModal: React.FC<PulseEntryModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(244, 252, 254, 0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal border border-[rgba(73,183,227,0.12)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(73,183,227,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 pulse-gradient-icon rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111] font-manrope">Pulse starten</h2>
              <p className="text-xs text-[#7A7A7A]">Content generieren lassen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Mode cards */}
        <div className="p-5 space-y-3">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onSelect(mode.id)}
                className="group w-full flex items-center gap-4 p-4 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.12)] bg-white text-left transition-all duration-200 hover:border-[#49B7E3]/30 hover:bg-[#F4FCFE] hover:shadow-card"
              >
                <div className="w-11 h-11 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0 pulse-gradient-icon">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#111111] mb-0.5">{mode.title}</h3>
                  <p className="text-xs text-[#7A7A7A] leading-relaxed">{mode.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#49B7E3] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PulseEntryModal;
