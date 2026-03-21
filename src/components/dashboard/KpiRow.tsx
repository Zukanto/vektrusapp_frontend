import React, { useEffect, useRef, useState } from 'react';
import { Eye, TrendingUp, TrendingDown, Minus, Send, Award, BarChart3 } from 'lucide-react';
import type { BriefingData, BriefingKpi } from '../../hooks/useDashboardData';

/* ---------- CountUp hook ---------- */

function useCountUp(target: number, duration = 700, decimals = 0, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (target === 0 || isNaN(target)) {
      setValue(target);
      return;
    }
    const t = setTimeout(() => {
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
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, decimals, delay]);

  return value;
}

/* ---------- Parse KPI string into numeric parts ---------- */

function parseKpiNumeric(value: string): { num: number; suffix: string; decimals: number } {
  if (!value || value === '\u2013') return { num: 0, suffix: '', decimals: 0 };
  const match = value.match(/^([\d.]+)\s*(%|K|M)?$/i);
  if (!match) return { num: 0, suffix: value, decimals: 0 };
  const num = parseFloat(match[1]);
  const suffix = match[2] || '';
  const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
  return { num, suffix, decimals };
}

/* ---------- Trend indicator ---------- */

const trendColorMap = {
  up: '#49D69E',
  down: '#FA7E70',
  neutral: '#7A7A7A',
} as const;

const TrendIndicator: React.FC<{ trend: string; direction: BriefingKpi['direction']; visible: boolean }> = ({
  trend,
  direction,
  visible,
}) => {
  if (!trend) return null;
  const color = trendColorMap[direction];
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div
      className="flex items-center gap-1 mt-1.5"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease-out' }}
    >
      <Icon size={12} color={color} strokeWidth={2.5} />
      <span className="text-[11px] font-medium" style={{ color }}>
        {trend}
      </span>
    </div>
  );
};

/* ---------- Single KPI Card ---------- */

interface KpiCardProps {
  icon: React.FC<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  kpi: BriefingKpi;
  visible: boolean;
  delay: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, label, kpi, visible, delay }) => {
  const parsed = parseKpiNumeric(kpi.value);
  const animated = useCountUp(parsed.num, 700, parsed.decimals, delay + 200);

  const [trendVisible, setTrendVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTrendVisible(true), delay + 900);
    return () => clearTimeout(t);
  }, [delay]);

  const displayValue =
    kpi.value === '\u2013' || (parsed.num === 0 && kpi.value !== '0')
      ? kpi.value
      : `${animated.toFixed(parsed.decimals)}${parsed.suffix}`;

  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-md)] p-5 shadow-subtle hover:shadow-card hover:-translate-y-px transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 300ms ease-out ${delay}ms, transform 300ms ease-out ${delay}ms, box-shadow 200ms ease-out`,
      }}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-[var(--vektrus-radius-sm)] bg-[rgba(182,235,247,0.20)] flex items-center justify-center mb-3">
        <Icon size={18} strokeWidth={2} className="text-[#49B7E3]" />
      </div>

      {/* Value */}
      <div className="font-manrope font-extrabold text-[24px] leading-none text-[#111111]">
        {displayValue}
      </div>

      {/* Label */}
      <div className="text-[12px] text-[#7A7A7A] mt-1.5 leading-snug">
        {label}
      </div>

      {/* Trend */}
      <TrendIndicator trend={kpi.trend} direction={kpi.direction} visible={trendVisible} />
    </div>
  );
};

/* ---------- KPI Row (4 cards) ---------- */

interface KpiRowProps {
  briefing: BriefingData;
  visible: boolean;
}

const KpiRow: React.FC<KpiRowProps> = ({ briefing, visible }) => {
  const bp = briefing.bestPlatform;
  const hasTopChannel = bp.name !== '\u2013' && bp.er;
  const erValue = bp.er ? bp.er.replace(/%$/, '') : '';

  // 4th card: show ER% as the primary number, platform name as context in the trend line
  const topChannelKpi: BriefingKpi = {
    value: hasTopChannel ? `${erValue}%` : '\u2013',
    trend: hasTopChannel ? bp.name : '',
    direction: hasTopChannel ? 'up' : 'neutral',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={Eye}
        label="Reichweite"
        kpi={briefing.kpis.reach}
        visible={visible}
        delay={100}
      />
      <KpiCard
        icon={BarChart3}
        label="Engagement"
        kpi={briefing.kpis.engagement}
        visible={visible}
        delay={200}
      />
      <KpiCard
        icon={Send}
        label="Veröffentlicht"
        kpi={briefing.kpis.posts}
        visible={visible}
        delay={300}
      />
      <KpiCard
        icon={Award}
        label="Top-Kanal"
        kpi={topChannelKpi}
        visible={visible}
        delay={400}
      />
    </div>
  );
};

export default KpiRow;
