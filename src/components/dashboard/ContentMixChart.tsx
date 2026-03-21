import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ContentMixItem } from '../../hooks/useDashboardData';

/* ── SVG Donut ─────────────────────────────────────────────────── */

const DONUT_SIZE = 140;
const STROKE_WIDTH = 28;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DonutProps {
  items: ContentMixItem[];
  total: number;
}

const Donut: React.FC<DonutProps> = ({ items, total }) => {
  let offset = 0;

  return (
    <svg
      width={DONUT_SIZE}
      height={DONUT_SIZE}
      viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      className="flex-shrink-0"
    >
      {/* Background ring */}
      <circle
        cx={DONUT_SIZE / 2}
        cy={DONUT_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(182,235,247,0.18)"
        strokeWidth={STROKE_WIDTH}
      />
      {/* Segments */}
      {items.map((item) => {
        const pct = item.count / total;
        const dash = pct * CIRCUMFERENCE;
        const gap = CIRCUMFERENCE - dash;
        const currentOffset = offset;
        offset += dash;

        return (
          <circle
            key={item.label}
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={item.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="butt"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        );
      })}
      {/* Center label */}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-manrope"
        style={{ fontSize: 22, fontWeight: 800, fill: '#111111' }}
      >
        {total}
      </text>
      <text
        x="50%"
        y="64%"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 10, fill: '#7A7A7A' }}
      >
        Posts
      </text>
    </svg>
  );
};

/* ── Legend ─────────────────────────────────────────────────────── */

const Legend: React.FC<{ items: ContentMixItem[]; total: number }> = ({ items, total }) => (
  <div className="flex flex-col gap-2">
    {items.map((item) => {
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return (
        <div key={item.label} className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
          <span className="text-[13px] text-[#111111] font-medium flex-1">{item.label}</span>
          <span className="text-[12px] text-[#7A7A7A] tabular-nums">{item.count}</span>
          <span className="text-[11px] text-[#7A7A7A] w-8 text-right tabular-nums">{pct}%</span>
        </div>
      );
    })}
  </div>
);

/* ── Interpretation ────────────────────────────────────────────── */

function buildInterpretation(items: ContentMixItem[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return `Dein gesamter Content geht an ${items[0].label}. Weitere Kanäle können neue Zielgruppen erschließen.`;

  const top = items[0];
  const total = items.reduce((s, i) => s + i.count, 0);
  const topPct = Math.round((top.count / total) * 100);

  if (topPct >= 70) return `${topPct}% deiner Posts gehen an ${top.label}. Teste weitere Kanäle für mehr Reichweite.`;
  if (items.length === 2) return `Deine Posts verteilen sich auf ${items[0].label} und ${items[1].label}.`;
  return `${top.label} ist dein Hauptkanal (${topPct}%), gefolgt von ${items[1].label}.`;
}

/* ── Empty state ───────────────────────────────────────────────── */

const EmptyMix: React.FC = () => (
  <div className="flex items-center gap-6 flex-1">
    {/* Ghost donut ring */}
    <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} className="flex-shrink-0">
      <circle
        cx={DONUT_SIZE / 2}
        cy={DONUT_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(182,235,247,0.18)"
        strokeWidth={STROKE_WIDTH}
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="font-manrope" style={{ fontSize: 22, fontWeight: 800, fill: 'rgba(17,17,17,0.12)' }}>0</text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: 'rgba(122,122,122,0.4)' }}>Posts</text>
    </svg>
    <div>
      <p className="text-[13px] font-medium text-[#111111] mb-1">Noch keine Verteilung</p>
      <p className="text-[12px] text-[#7A7A7A] leading-relaxed max-w-[180px]">Erstelle deinen ersten Content-Plan, um zu sehen wohin dein Content geht.</p>
    </div>
  </div>
);

/* ── Main component ────────────────────────────────────────────── */

interface ContentMixChartProps {
  items: ContentMixItem[];
  visible: boolean;
}

const ContentMixChart: React.FC<ContentMixChartProps> = ({ items, visible }) => {
  const total = items.reduce((s, i) => s + i.count, 0);
  const interpretation = buildInterpretation(items);

  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle h-full flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 300ms ease-out 100ms, transform 300ms ease-out 100ms',
      }}
    >
      <h3 className="font-manrope font-semibold text-[15px] text-[#111111] mb-5">
        Kanalverteilung
      </h3>

      {total === 0 ? (
        <EmptyMix />
      ) : (
        <>
          <div className="flex items-center gap-6 mb-5">
            <Donut items={items} total={total} />
            <Legend items={items} total={total} />
          </div>

          {interpretation && (
            <div className="flex items-start gap-2 pt-4 border-t border-[var(--vektrus-border-subtle)]">
              <Sparkles size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--vektrus-ai-violet)' }} />
              <p className="text-[12px] leading-relaxed text-[#7A7A7A]">{interpretation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContentMixChart;
