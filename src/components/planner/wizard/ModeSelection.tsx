import React from 'react';
import { PenTool, Image, ArrowRight, Clapperboard } from 'lucide-react';
import { motion } from 'framer-motion';

export type PulseMode = 'theme' | 'visual' | 'reels';

interface ModeSelectionProps {
  onSelect: (mode: PulseMode) => void;
}

const modes = [
  {
    id: 'theme' as PulseMode,
    icon: PenTool,
    title: 'Themen-basiert',
    subtitle: 'Content aus Themen generieren',
    description: 'Beschreibe, worüber du posten möchtest, und Vektrus erstellt passende Posts für deine Plattformen.',
    color: '#49B7E3',
    gradient: 'from-[#49B7E3] to-[#B6EBF7]',
    bgHover: 'hover:border-[#49B7E3]/40 hover:bg-[#49B7E3]/4',
  },
  {
    id: 'visual' as PulseMode,
    icon: Image,
    title: 'Bilder zu Posts',
    subtitle: 'Posts aus deinen Bildern erstellen',
    description: 'Lade Bilder hoch und Vektrus schreibt den perfekten Post-Text, Hashtags und CTAs dazu.',
    color: '#49D69E',
    gradient: 'from-[#49D69E] to-[#B4E8E5]',
    bgHover: 'hover:border-[#49D69E]/40 hover:bg-[#49D69E]/4',
  },
  {
    id: 'reels' as PulseMode,
    icon: Clapperboard,
    title: 'Reels',
    subtitle: 'Reel-Konzepte mit KI erstellen',
    description: 'KI erstellt fertige Reel-Konzepte mit Szenenplan, Hook und Voiceover-Skript.',
    color: '#7C6CF2',
    gradient: 'from-[#7C6CF2] to-[#B6A8F7]',
    bgHover: 'hover:border-[#7C6CF2]/40 hover:bg-[#7C6CF2]/4',
    badge: 'NEU',
  },
];

const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h3
          className="text-2xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Wie möchtest du Content erstellen?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Wähle deinen Ausgangspunkt — Vektrus erledigt den Rest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modes.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => onSelect(mode.id)}
              className={`group relative p-6 rounded-[var(--vektrus-radius-lg)] border-2 border-[rgba(73,183,227,0.18)] bg-white text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${mode.bgHover}`}
            >
              {'badge' in mode && mode.badge && (
                <span
                  className="absolute top-3 right-3 text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: 'var(--vektrus-blue)' }}
                >
                  {mode.badge}
                </span>
              )}
              <div
                className={`w-14 h-14 rounded-[var(--vektrus-radius-lg)] bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow`}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h4 className="text-lg font-bold text-[#111111] mb-1">
                {mode.title}
              </h4>
              <p className="text-sm font-medium text-[#7A7A7A] mb-3">
                {mode.subtitle}
              </p>
              <p className="text-xs text-[#7A7A7A] leading-relaxed mb-5">
                {mode.description}
              </p>

              <div className="flex items-center space-x-2 text-sm font-semibold transition-colors"
                style={{ color: mode.color }}
              >
                <span>Auswählen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelection;
