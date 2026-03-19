import React from 'react';
import { Info } from 'lucide-react';
import { InsightCard } from './insightsHelpers';
import type { DecayItem } from '../../hooks/useAnalyticsData';

const ContentDecay: React.FC<{ data: DecayItem[] }> = ({ data }) => {
  if (data.length === 0) return null;

  const maxPct = Math.max(...data.map(d => d.percentage));
  const earlyTotal = data.slice(0, 3).reduce((s, d) => s + d.percentage, 0);

  const barColor = (pct: number) => {
    const ratio = pct / maxPct;
    if (ratio > 0.8) return '#49B7E3';
    if (ratio > 0.5) return '#7FC8E8';
    if (ratio > 0.3) return '#A8D8F0';
    return '#B6EBF7';
  };

  return (
    <InsightCard style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
        >
          Content-Lebensdauer
        </h2>
        <div className="relative group cursor-help">
          <Info size={16} style={{ color: '#7A7A7A' }} />
          <div
            className="absolute right-0 top-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'white',
              border: '1px solid #F0F0F0',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--vektrus-shadow-card)',
              width: 200,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: '#7A7A7A',
            }}
          >
            Wie schnell baut sich Engagement auf
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-3">
            <div
              style={{
                width: 52,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 12,
                color: '#7A7A7A',
                flexShrink: 0,
                textAlign: 'right',
              }}
            >
              {d.label}
            </div>
            <div className="flex-1 relative" style={{ height: 20 }}>
              <div
                className="h-full rounded"
                style={{
                  width: `${(d.percentage / maxPct) * 100}%`,
                  background: barColor(d.percentage),
                  transition: 'width 600ms ease-out',
                  minWidth: 4,
                }}
              />
            </div>
            <div
              style={{
                width: 44,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 12,
                color: '#111111',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {d.percentage}%
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 flex items-center gap-2 px-3 py-2 rounded-[var(--vektrus-radius-sm)]"
        style={{
          background: 'rgba(73,183,227,0.06)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#111111',
        }}
      >
        <span>⚡</span>
        <span>
          <strong>{Math.round(earlyTotal)}%</strong> deines Engagements passiert in den ersten 24 Stunden
        </span>
      </div>
    </InsightCard>
  );
};

export default ContentDecay;
