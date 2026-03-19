import React from 'react';
import { Compass, UserCircle, MessageSquare, CalendarDays, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    title: 'Profil einrichten',
    description: 'Fülle Brand Voice, Zielgruppe und Kernbotschaften aus, damit deine KI dich kennt.',
    icon: <UserCircle className="w-5 h-5" />,
    color: 'bg-[#49D69E]',
  },
  {
    number: 2,
    title: 'Chat nutzen',
    description: 'Stelle Fragen, lass dir Strategien vorschlagen oder Content-Ideen generieren.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'bg-[#49B7E3]',
  },
  {
    number: 3,
    title: 'Wochenplan erstellen',
    description: 'Erstelle mit Pulse einen kompletten Content-Plan für deine Kanäle.',
    icon: <CalendarDays className="w-5 h-5" />,
    color: 'bg-[#49B7E3]',
  },
  {
    number: 4,
    title: 'Optimieren',
    description: 'Analysiere deine Performance und lass Vektrus datenbasierte Verbesserungen vorschlagen.',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-[#7C6CF2]',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Compass className="w-5 h-5 text-[#49B7E3]" />
        <h2 className="text-2xl font-semibold text-[#111111]">So funktioniert Vektrus</h2>
      </div>

      <div className="hidden md:flex items-start justify-between max-w-4xl mx-auto relative">
        <div className="absolute top-6 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-[rgba(73,183,227,0.18)]" />

        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center w-1/4 px-3 relative z-10">
            <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-subtle`}>
              {step.number}
            </div>
            <h3 className="font-semibold text-[#111111] text-sm mb-1.5">{step.title}</h3>
            <p className="text-xs text-[#7A7A7A] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="md:hidden flex flex-col gap-4 max-w-md mx-auto">
        {STEPS.map((step, idx) => (
          <div key={step.number} className="flex gap-4 items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-subtle`}>
                {step.number}
              </div>
              {idx < STEPS.length - 1 && <div className="w-0.5 h-8 border-l-2 border-dashed border-[rgba(73,183,227,0.18)] mt-2" />}
            </div>
            <div className="pt-1.5">
              <h3 className="font-semibold text-[#111111] text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-[#7A7A7A] leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
