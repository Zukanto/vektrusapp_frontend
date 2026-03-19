import React, { useState } from 'react';
import { Eye, TrendingUp, ChartBar as BarChart2, FileText, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '../../hooks/useAnalyticsData';

interface KpiCardProps {
  overline: string;
  value: string;
  trend: string;
  direction: 'up' | 'down' | 'neutral';
  trendLabel: string;
  Icon: React.FC<any>;
  delay: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ overline, value, trend, direction, trendLabel, Icon, delay }) => {
  const [hovered, setHovered] = useState(false);

  const trendColor = direction === 'up' ? '#49D69E' : direction === 'down' ? '#FA7E70' : '#7A7A7A';
  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const trendText = direction === 'up' ? `↑ ${trend} vs. Vorperiode` : direction === 'down' ? `↓ ${trend} vs. Vorperiode` : `→ ${trend} wie Vorperiode`;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative bg-white rounded-[var(--vektrus-radius-lg)] overflow-hidden"
      style={{
        padding: '20px 24px',
        boxShadow: hovered ? 'var(--vektrus-shadow-card)' : 'var(--vektrus-shadow-subtle)',
        transition: 'box-shadow 200ms ease-out',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 rounded-t-[var(--vektrus-radius-lg)]"
        style={{ height: 3, background: 'linear-gradient(90deg, #B6EBF7, #49B7E3)' }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div
            className="uppercase font-semibold mb-3"
            style={{
              fontFamily: 'Manrope, system-ui, sans-serif',
              fontSize: 11,
              color: '#7A7A7A',
              letterSpacing: '0.5px',
            }}
          >
            {overline}
          </div>
          <div
            className="font-extrabold leading-none"
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 32, color: '#111111' }}
          >
            {value}
          </div>
          <div
            className="flex items-center gap-1 mt-2"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 13,
              color: trendColor,
              fontWeight: 500,
            }}
          >
            <TrendIcon size={13} strokeWidth={2.5} style={{ color: trendColor }} />
            <span>{trendText}</span>
          </div>
        </div>
        <div
          className="rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, background: 'rgba(182,235,247,0.25)' }}
        >
          <Icon size={20} style={{ color: '#49B7E3' }} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

const InsightsKpiCards: React.FC<{ data: KpiData | null }> = ({ data }) => {
  if (!data) return null;

  const cards = [
    { overline: 'Gesamte Reichweite', ...data.reach, trendLabel: '', Icon: Eye },
    { overline: 'Ø Engagement Rate', ...data.engagement, trendLabel: '', Icon: TrendingUp },
    { overline: 'Impressionen', ...data.impressions, trendLabel: '', Icon: BarChart2 },
    { overline: 'Veröffentlichte Posts', ...data.posts, trendLabel: '', Icon: FileText },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <KpiCard key={c.overline} {...c} delay={i * 80} />
      ))}
    </div>
  );
};

export default InsightsKpiCards;
