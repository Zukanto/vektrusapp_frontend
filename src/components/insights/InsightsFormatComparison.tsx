import React from 'react';
import { InsightCard, SectionTitle, formatNumber } from './insightsHelpers';
import type { FormatItem } from '../../hooks/useAnalyticsData';

function performanceColor(perf: number): string {
  if (perf >= 80) return '#49D69E';
  if (perf >= 50) return '#49B7E3';
  if (perf >= 30) return '#F4BE9D';
  return '#FA7E70';
}

const InsightsFormatComparison: React.FC<{ data: FormatItem[] }> = ({ data }) => {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.performance - a.performance);

  return (
    <InsightCard>
      <SectionTitle title="Content-Format Vergleich" subtitle="Was funktioniert am besten?" />

      <div className="flex flex-col gap-5">
        {sorted.map((item, i) => (
          <div key={item.format}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span
                  className="font-semibold"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: '#111111' }}
                >
                  {item.format}
                </span>
                <span
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}
                >
                  ({item.posts} Posts)
                </span>
              </div>
              <span
                className="font-bold"
                style={{
                  fontFamily: 'Manrope, system-ui, sans-serif',
                  fontSize: 16,
                  color: performanceColor(item.performance),
                }}
              >
                {item.performance}%
              </span>
            </div>

            <div
              className="w-full rounded-[var(--vektrus-radius-sm)] overflow-hidden"
              style={{ height: 8, background: '#F0F0F0' }}
            >
              <div
                className="h-full rounded"
                style={{
                  width: `${item.performance}%`,
                  background: performanceColor(item.performance),
                  transition: 'width 600ms ease-out',
                }}
              />
            </div>

            <div
              className="flex gap-4 mt-2"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}
            >
              <span>Ø Reichweite: <strong style={{ color: '#111111' }}>{formatNumber(item.avgReach)}</strong></span>
              <span>Ø Engagement: <strong style={{ color: '#111111' }}>{item.avgEngagement}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </InsightCard>
  );
};

export default InsightsFormatComparison;
