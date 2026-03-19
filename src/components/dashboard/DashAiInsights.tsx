import React from 'react';
import { Sparkles } from 'lucide-react';
import { aiInsight } from './dashboardData';

const DashAiInsights: React.FC = () => {
  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 h-full flex flex-col relative overflow-hidden border-gradient-ai ai-active"
      style={{
        boxShadow: 'var(--vektrus-shadow-subtle)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--vektrus-ai-violet-rgb),0.05) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="flex items-center justify-between mb-1 relative z-10">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-lg"
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
          >
            KI-Analyse
          </h3>
          <div className="w-6 h-6 rounded-full pulse-gradient-icon flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
        </div>
      </div>

      <div className="text-[13px] mb-4 relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
        {aiInsight.week} — {aiInsight.dateRange}
      </div>

      <div
        className="text-[15px] leading-relaxed flex-1 relative z-10"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111111', lineHeight: 1.65 }}
      >
        {aiInsight.text.split('\n\n').map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
        ))}
      </div>

      <div
        className="mt-4 pt-4 text-[12px] relative z-10"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#7A7A7A',
          borderTop: '1px solid #F0F0F0',
        }}
      >
        Aktualisiert: {aiInsight.updatedAt}
      </div>
    </div>
  );
};

export default DashAiInsights;
