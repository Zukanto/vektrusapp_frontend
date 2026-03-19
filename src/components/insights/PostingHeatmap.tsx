import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { InsightCard } from './insightsHelpers';
import type { HeatmapSlot } from '../../hooks/useAnalyticsData';

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const HOURS = [6, 9, 12, 15, 18, 21];

function getColor(engagement: number, maxEngagement: number): string {
  if (engagement === 0) return '#F0F0F0';
  const ratio = engagement / maxEngagement;
  if (ratio < 0.25) return '#B6EBF7';
  if (ratio < 0.5) return '#49B7E3';
  if (ratio < 0.75) return '#2A8AB4';
  return '#1A6B8F';
}

const PostingHeatmap: React.FC<{ data: HeatmapSlot[] }> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ day: number; hour: number; engagement: number; posts: number } | null>(null);

  const map: Record<string, { engagement: number; posts: number }> = {};
  let maxEngagement = 0;

  data.forEach(d => {
    const key = `${d.day}-${d.hour}`;
    map[key] = { engagement: d.engagement, posts: d.posts };
    if (d.engagement > maxEngagement) maxEngagement = d.engagement;
  });

  const best = data.length > 0
    ? data.reduce((a, b) => (a.engagement > b.engagement ? a : b), data[0])
    : null;
  const bestDayName = best ? DAYS[(best.day - 1) % 7] : '';

  return (
    <InsightCard>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
        >
          Beste Posting-Zeiten
        </h2>
        <div className="relative group">
          <Info size={16} style={{ color: '#7A7A7A', cursor: 'help' }} />
          <div
            className="absolute right-0 top-6 z-10 pointer-events-none"
            style={{
              background: 'white',
              border: '1px solid #F0F0F0',
              borderRadius: 8,
              padding: '8px 12px',
              boxShadow: 'var(--vektrus-shadow-card)',
              width: 220,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 12,
              color: '#7A7A7A',
              opacity: 0,
              transition: 'opacity 150ms',
            }}
            ref={el => {
              if (el) {
                el.parentElement?.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
                el.parentElement?.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
              }
            }}
          >
            Basierend auf historischem Engagement
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 360 }}>
          <div className="flex items-center mb-2 pl-8">
            {HOURS.map(h => (
              <div
                key={h}
                className="flex-1 text-center"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#7A7A7A' }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {DAYS.map((day, di) => (
            <div key={day} className="flex items-center mb-1">
              <div
                className="flex-shrink-0 text-right pr-2"
                style={{
                  width: 28,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  color: '#7A7A7A',
                }}
              >
                {day}
              </div>
              {HOURS.map(h => {
                const key = `${di + 1}-${h}`;
                const cell = map[key];
                const eng = cell?.engagement || 0;
                const posts = cell?.posts || 0;
                const isHovered = tooltip?.day === di + 1 && tooltip?.hour === h;

                return (
                  <div
                    key={h}
                    className="flex-1 mx-0.5 rounded-[var(--vektrus-radius-sm)] cursor-pointer transition-transform duration-100"
                    style={{
                      height: 28,
                      background: getColor(eng, maxEngagement),
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      position: 'relative',
                    }}
                    onMouseEnter={() => cell && setTooltip({ day: di + 1, hour: h, engagement: eng, posts })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="mt-3 px-3 py-2 rounded-[var(--vektrus-radius-sm)]"
          style={{
            background: '#F4FCFE',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            color: '#111111',
          }}
        >
          <span className="font-semibold">{DAYS[(tooltip.day - 1) % 7]} {tooltip.hour}:00</span>
          {' — '}Ø {tooltip.engagement} Engagement · {tooltip.posts} Posts
        </div>
      )}

      {best && (
        <div
          className="mt-4 flex items-center gap-2"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 500,
            color: '#111111',
          }}
        >
          <span>🏆</span>
          <span>Beste Zeit: <strong>{bestDayName}, {best.hour}:00 Uhr</strong> (Ø {best.engagement} Engagement)</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        {['Kein', 'Niedrig', 'Mittel', 'Hoch', 'Top'].map((label, i) => {
          const colors = ['#F0F0F0', '#B6EBF7', '#49B7E3', '#2A8AB4', '#1A6B8F'];
          return (
            <div key={label} className="flex items-center gap-1">
              <div className="rounded" style={{ width: 14, height: 14, background: colors[i] }} />
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, color: '#7A7A7A' }}>{label}</span>
            </div>
          );
        })}
      </div>
    </InsightCard>
  );
};

export default PostingHeatmap;
