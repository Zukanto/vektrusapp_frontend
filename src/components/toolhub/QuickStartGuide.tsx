import React from 'react';
import { Play, UserCircle, MessageSquare, CalendarDays, BarChart3, ArrowRight } from 'lucide-react';

interface QuickStartGuideProps {
  onModuleChange?: (module: string) => void;
}

const STEPS = [
  {
    icon: <UserCircle className="w-5 h-5" />,
    title: 'Profil einrichten',
    description: 'Brand Voice, Zielgruppe und Accounts hinterlegen.',
    action: 'Profil öffnen',
    moduleId: 'profile',
    color: 'from-[#49D69E] to-[#3BC088]',
    bgLight: 'bg-[#49D69E]/10',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'KI-Chat ausprobieren',
    description: 'Frage die KI nach Strategien, Ideen oder Optimierungen.',
    action: 'Chat starten',
    moduleId: 'chat',
    color: 'from-[#49B7E3] to-[#3A9BC7]',
    bgLight: 'bg-[#49B7E3]/10',
  },
  {
    icon: <CalendarDays className="w-5 h-5" />,
    title: 'Ersten Wochenplan erstellen',
    description: 'Nutze Pulse für einen automatischen Content-Plan.',
    action: 'Planner öffnen',
    moduleId: 'planner',
    color: 'from-[#49B7E3] to-[#3A9BC7]',
    bgLight: 'bg-[#49B7E3]/10',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Performance analysieren',
    description: 'Verstehe deine Insights und optimiere deine Strategie.',
    action: 'Insights öffnen',
    moduleId: 'insights',
    color: 'from-[#7C6CF2] to-[#6B5CE0]',
    bgLight: 'bg-[rgba(124,108,242,0.08)]',
  },
];

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onModuleChange }) => {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Play className="w-5 h-5 text-[#49D69E]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Schnellstart-Guide</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, index) => (
          <button
            key={index}
            onClick={() => onModuleChange?.(step.moduleId)}
            className="group relative bg-white rounded-[var(--vektrus-radius-lg)] border border-[rgba(73,183,227,0.10)] shadow-subtle p-5 text-left hover:shadow-card hover:border-[rgba(73,183,227,0.18)] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-[var(--vektrus-radius-md)] bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-subtle`}>
                {step.icon}
              </div>
              <span className="text-xs font-bold text-[#7A7A7A] uppercase tracking-wider">
                Schritt {index + 1}
              </span>
            </div>

            <h3 className="font-semibold text-[#111111] text-sm mb-1.5 leading-tight">
              {step.title}
            </h3>
            <p className="text-xs text-[#7A7A7A] leading-relaxed mb-4">
              {step.description}
            </p>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#49B7E3] group-hover:text-[#3AA0CC] transition-colors">
              {step.action}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
