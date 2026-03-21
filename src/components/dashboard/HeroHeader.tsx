import React from 'react';
import type { BriefingData } from '../../hooks/useDashboardData';

/* ---------- Status Chip ---------- */

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  good: { bg: 'rgba(73,214,158,0.12)', color: '#2BA872', dot: '#49D69E' },
  okay: { bg: 'rgba(244,190,157,0.15)', color: '#C4854A', dot: '#F4BE9D' },
  attention: { bg: 'rgba(250,126,112,0.12)', color: '#D4574A', dot: '#FA7E70' },
};

const StatusChip: React.FC<{ status: BriefingData['status']; label: string }> = ({ status, label }) => {
  const s = statusStyles[status] ?? statusStyles.okay;
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full flex-shrink-0"
      style={{ background: s.bg }}
    >
      <div className="w-[6px] h-[6px] rounded-full" style={{ background: s.dot }} />
      <span className="text-[12px] font-semibold leading-none" style={{ color: s.color }}>
        {label}
      </span>
    </div>
  );
};

/* ---------- Date Label ---------- */

function getWeekLabel(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);

  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.`;

  return `KW ${weekNumber} \u00B7 ${fmt(monday)} \u2013 ${fmt(sunday)}`;
}

/* ---------- Derived chip state ---------- */

function deriveChipState(briefing: BriefingData): { status: BriefingData['status']; label: string } {
  const { kpis, status, statusLabel } = briefing;

  // If the cache already says attention, trust it
  if (status === 'attention') return { status, label: statusLabel || 'Handlungsbedarf' };

  // Cross-check: if cache says "good" but KPIs show decline, downgrade to "okay"
  const hasDecline = kpis.reach.direction === 'down' || kpis.engagement.direction === 'down';
  const noPosts = kpis.posts.value === '0';

  if (status === 'good' && (hasDecline || noPosts)) {
    if (hasDecline && noPosts) return { status: 'attention', label: 'Leicht hinter Plan' };
    return { status: 'okay', label: hasDecline ? 'Gemischte Signale' : 'Noch keine Posts' };
  }

  // No data yet
  if (kpis.reach.value === '\u2013' && kpis.engagement.value === '\u2013') {
    return { status: 'okay', label: statusLabel || 'Wird eingerichtet' };
  }

  // Default: trust the cache
  return { status, label: statusLabel || 'Stabil' };
}

/* ---------- Hero Header ---------- */

interface HeroHeaderProps {
  greeting: string;
  briefing: BriefingData;
  visible: boolean;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ greeting, briefing, visible }) => {
  const weekLabel = briefing.weekLabel || getWeekLabel();
  const chip = deriveChipState(briefing);

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 250ms ease-out',
      }}
    >
      {/* Left: Greeting + Status */}
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        <h1 className="font-manrope font-bold text-[26px] leading-tight text-[#111111] truncate">
          {greeting}
        </h1>
        <StatusChip status={chip.status} label={chip.label} />
      </div>

      {/* Right: Date label */}
      <span className="text-[13px] text-[#7A7A7A] flex-shrink-0 whitespace-nowrap">
        {weekLabel}
      </span>
    </div>
  );
};

export default HeroHeader;
