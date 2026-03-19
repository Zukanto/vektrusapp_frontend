import React from 'react';
import { Zap, ChartBar as BarChart3, Calendar, MessageSquare, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NextStep } from '../../hooks/useDashboardData';

const iconMap: Record<string, React.FC<any>> = {
  Zap,
  BarChart3,
  Calendar,
  MessageSquare,
  Link: LinkIcon,
};

const ActionCard: React.FC<{ step: NextStep; visible: boolean; delay: number }> = ({ step, visible, delay }) => {
  const navigate = useNavigate();
  const Icon = iconMap[step.icon] || Zap;

  return (
    <div
      onClick={() => navigate(step.route)}
      className="bg-white rounded-[var(--vektrus-radius-md)] flex items-center gap-4 cursor-pointer shadow-subtle hover:shadow-card hover:-translate-y-px transition-all duration-200"
      style={{
        padding: '20px 24px',
        opacity: visible ? 1 : 0,
        filter: visible ? 'none' : 'blur(2px)',
        transition: 'box-shadow 200ms ease-out, transform 200ms ease-out, opacity 300ms ease-out, filter 300ms ease-out',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-[var(--vektrus-radius-sm)]"
        style={{
          width: 44,
          height: 44,
          background: 'rgba(182,235,247,0.22)',
        }}
      >
        <Icon size={22} style={{ color: '#49B7E3' }} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] text-[#111111]">
          {step.title}
        </div>
        <div className="text-[13px] mt-0.5 truncate text-[#7A7A7A]">
          {step.description}
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); navigate(step.route); }}
        className="flex-shrink-0 font-semibold text-[13px] rounded-[var(--vektrus-radius-sm)] px-[18px] py-2 border-[1.5px] border-[#49B7E3] text-[#49B7E3] bg-transparent hover:bg-[#49B7E3] hover:text-white transition-all duration-150 whitespace-nowrap"
      >
        {step.buttonLabel}
      </button>
    </div>
  );
};

const ActionCards: React.FC<{ visible: boolean; steps: NextStep[] }> = ({ visible, steps }) => {
  return (
    <div className="flex flex-col">
      <h2
        className="font-semibold mb-4"
        style={{
          fontFamily: 'Manrope, system-ui, sans-serif',
          fontSize: 18,
          color: '#111111',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease-out 200ms',
        }}
      >
        Deine nächsten Schritte
      </h2>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <ActionCard
            key={step.title}
            step={step}
            visible={visible}
            delay={300 + i * 100}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
