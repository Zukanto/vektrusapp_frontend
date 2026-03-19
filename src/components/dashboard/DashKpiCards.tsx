import React, { useEffect, useRef, useState } from 'react';
import { Eye, Heart, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { kpiData } from './dashboardData';

function useCountUp(target: number, duration = 800, decimals = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, decimals]);

  return value;
}

function formatReach(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0077B5" />
    <path d="M7 10h2v7H7v-7zm1-3a1.1 1.1 0 1 1 0 2.2A1.1 1.1 0 0 1 8 7zm4 3h1.9v.96h.03C14.28 10.57 15.16 10 16.3 10c2.07 0 2.45 1.36 2.45 3.13V17h-2v-3.45c0-.82-.01-1.88-1.14-1.88-1.15 0-1.32.9-1.32 1.82V17H12v-7z" fill="white" />
  </svg>
);

interface KpiCardProps {
  label: string;
  value: string;
  trendValue: number;
  trendLabel: string;
  icon: React.ReactNode;
  subtext?: string;
  delay: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, trendValue, trendLabel, icon, subtext, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const trendColor =
    trendValue > 0 ? '#49D69E' : trendValue < 0 ? '#FA7E70' : '#7A7A7A';
  const TrendIcon = trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : Minus;

  return (
    <div
      className="relative bg-white rounded-[var(--vektrus-radius-lg)] overflow-hidden cursor-default shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? undefined : 'translateY(12px)',
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #B6EBF7, #49B7E3)' }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.5px]"
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#7A7A7A' }}
          >
            {label}
          </span>
          <div style={{ color: '#B6EBF7', opacity: 0.7 }}>{icon}</div>
        </div>
        <div
          className="text-[32px] font-extrabold mb-2 leading-none"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
        >
          {value}
        </div>
        {subtext && (
          <div className="text-sm mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#49B7E3' }}>
            {subtext}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <TrendIcon size={13} style={{ color: trendColor }} strokeWidth={2.5} />
          <span className="text-[13px] font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: trendColor }}>
            {trendValue > 0 ? '+' : ''}{trendValue !== 0 ? trendLabel : trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashKpiCards: React.FC = () => {
  const reach = useCountUp(34.2, 800, 1);
  const er = useCountUp(3.2, 800, 1);
  const posts = useCountUp(12, 800, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Gesamte Reichweite"
        value={`${reach.toFixed(1)}K`}
        trendValue={kpiData.reachTrend}
        trendLabel="+18% vs. letzte Woche"
        icon={<Eye size={20} />}
        delay={0}
      />
      <KpiCard
        label="Engagement Rate"
        value={`${er.toFixed(1)}%`}
        trendValue={kpiData.engagementTrend}
        trendLabel="+0.4% vs. letzte Woche"
        icon={<Heart size={20} />}
        delay={100}
      />
      <KpiCard
        label="Veröffentlichte Posts"
        value={String(Math.round(posts))}
        trendValue={kpiData.postsTrend}
        trendLabel="gleich wie letzte Woche"
        icon={<Send size={20} />}
        delay={200}
      />
      <KpiCard
        label="Beste Plattform"
        value="LinkedIn"
        trendValue={1}
        trendLabel="5.1% Ø Engagement"
        icon={<LinkedInIcon />}
        subtext="5.1% Ø Engagement"
        delay={300}
      />
    </div>
  );
};

export default DashKpiCards;
