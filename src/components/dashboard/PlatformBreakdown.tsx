import React from 'react';
import { Instagram, Linkedin, Facebook, Music2, Twitter, Globe } from 'lucide-react';
import type { PlatformStat } from '../../hooks/useDashboardData';

/* ── Platform icon map ─────────────────────────────────────────── */

const platformConfig: Record<string, {
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
}> = {
  Instagram: { icon: Instagram, color: '#E1306C' },
  Linkedin: { icon: Linkedin, color: '#0077B5' },
  Facebook: { icon: Facebook, color: '#1877F2' },
  Tiktok: { icon: Music2, color: '#111111' },
  Twitter: { icon: Twitter, color: '#1DA1F2' },
};

function formatReach(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/* ── Platform row ──────────────────────────────────────────────── */

interface PlatformRowProps {
  stat: PlatformStat;
  maxReach: number;
  visible: boolean;
  delay: number;
}

const PlatformRow: React.FC<PlatformRowProps> = ({ stat, maxReach, visible, delay }) => {
  const cfg = platformConfig[stat.platform] || { icon: Globe, color: '#7A7A7A' };
  const Icon = cfg.icon;
  const barWidth = maxReach > 0 ? (stat.totalReach / maxReach) * 100 : 0;

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 250ms ease-out ${delay}ms`,
      }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0"
        style={{ background: `${cfg.color}12` }}
      >
        <Icon size={15} style={{ color: cfg.color }} />
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-[#111111]">{stat.platform}</span>
          <span className="text-[12px] text-[#7A7A7A] tabular-nums">{stat.posts} Posts</span>
        </div>
        <div className="h-1.5 rounded-full bg-[rgba(182,235,247,0.18)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%`, background: cfg.color }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-2">
        <div className="text-right">
          <div className="text-[13px] font-semibold text-[#111111] tabular-nums">
            {stat.avgEr > 0 ? `${stat.avgEr}%` : '\u2013'}
          </div>
          <div className="text-[10px] text-[#7A7A7A] leading-none">ER</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-semibold text-[#111111] tabular-nums">
            {stat.totalReach > 0 ? formatReach(stat.totalReach) : '\u2013'}
          </div>
          <div className="text-[10px] text-[#7A7A7A] leading-none">Reichweite</div>
        </div>
      </div>
    </div>
  );
};

/* ── Empty state ───────────────────────────────────────────────── */

const EmptyBreakdown: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <div className="w-10 h-10 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-3">
      <Globe size={18} className="text-[#49B7E3]" />
    </div>
    <p className="text-[13px] font-medium text-[#111111] mb-1">Keine Plattform-Daten</p>
    <p className="text-[12px] text-[#7A7A7A] max-w-[220px]">Verbinde deine Konten und veröffentliche Posts, um Performance-Daten zu sehen.</p>
  </div>
);

/* ── Main component ────────────────────────────────────────────── */

interface PlatformBreakdownProps {
  stats: PlatformStat[];
  visible: boolean;
}

const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({ stats, visible }) => {
  const maxReach = Math.max(...stats.map((s) => s.totalReach), 1);

  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 shadow-subtle h-full flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 300ms ease-out 200ms, transform 300ms ease-out 200ms',
      }}
    >
      <h3 className="font-manrope font-semibold text-[15px] text-[#111111] mb-3">
        Kanal-Ergebnisse
      </h3>

      {stats.length === 0 ? (
        <EmptyBreakdown />
      ) : (
        <div className="flex flex-col divide-y divide-[var(--vektrus-border-subtle)]">
          {stats.map((stat, i) => (
            <PlatformRow
              key={stat.platform}
              stat={stat}
              maxReach={maxReach}
              visible={visible}
              delay={250 + i * 80}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformBreakdown;
