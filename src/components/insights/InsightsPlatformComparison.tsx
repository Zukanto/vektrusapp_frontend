import React from 'react';
import { InsightCard, SectionTitle, formatNumber } from './insightsHelpers';
import type { PlatformItem } from '../../hooks/useAnalyticsData';

const InsightsPlatformComparison: React.FC<{ data: PlatformItem[] }> = ({ data }) => {
  if (data.length === 0) return null;

  const totalReach = data.reduce((s, p) => s + p.reach, 0);

  return (
    <InsightCard>
      <SectionTitle title="Plattform-Vergleich" subtitle="Wo performst du am besten?" />

      <div className="flex flex-col gap-4">
        {data.map(p => {
          const share = totalReach > 0 ? Math.round((p.reach / totalReach) * 100) : 0;
          return (
            <div
              key={p.platform}
              className="rounded-[var(--vektrus-radius-md)] p-4"
              style={{ border: '1.5px solid #F0F0F0' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{ width: 10, height: 10, background: p.color, marginTop: 3 }}
                  />
                  <div>
                    <div
                      className="font-semibold"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: '#111111' }}
                    >
                      {p.platform}
                    </div>
                    <div
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}
                    >
                      {p.posts} Posts
                    </div>
                  </div>
                </div>
                <div
                  className="font-bold text-right"
                  style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
                >
                  {share}%
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#7A7A7A', fontWeight: 400 }}>
                    Anteil Reach
                  </div>
                </div>
              </div>

              <div
                className="w-full rounded-[var(--vektrus-radius-sm)] mb-3"
                style={{ height: 4, background: '#F0F0F0', overflow: 'hidden' }}
              >
                <div
                  className="h-full rounded"
                  style={{ width: `${share}%`, background: p.color, transition: 'width 600ms ease-out' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div
                    className="font-bold"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 20, color: '#111111' }}
                  >
                    {formatNumber(p.reach)}
                  </div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>
                    Reichweite
                  </div>
                </div>
                <div>
                  <div
                    className="font-bold"
                    style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 20, color: '#111111' }}
                  >
                    {formatNumber(p.engagement)}
                  </div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>
                    Engagement
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.strengths.map(s => (
                  <span
                    key={s}
                    className="rounded px-2 py-0.5"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: 12,
                      background: '#B6EBF718',
                      color: '#7A7A7A',
                      border: '1px solid #B6EBF7',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </InsightCard>
  );
};

export default InsightsPlatformComparison;
