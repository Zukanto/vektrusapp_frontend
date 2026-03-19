import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { BriefingData } from '../../hooks/useDashboardData';

function useCountUp(target: number, duration = 800, decimals = 0, delay = 0) {
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

function parseKpiNumeric(value: string): { num: number; suffix: string; decimals: number } {
  if (!value || value === '\u2013') return { num: 0, suffix: '', decimals: 0 };
  const match = value.match(/^([\d.]+)\s*(%|K|M)?$/i);
  if (!match) return { num: 0, suffix: value, decimals: 0 };
  const num = parseFloat(match[1]);
  const suffix = match[2] || '';
  const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
  return { num, suffix, decimals };
}

const StatusBadge: React.FC<{ status: 'good' | 'okay' | 'attention'; label: string; visible: boolean }> = ({ status, label, visible }) => {
  const styles = {
    good: { bg: 'rgba(73,214,158,0.12)', color: '#2BA872', dot: '#49D69E' },
    okay: { bg: 'rgba(244,190,157,0.15)', color: '#C4854A', dot: '#F4BE9D' },
    attention: { bg: 'rgba(250,126,112,0.12)', color: '#D4574A', dot: '#FA7E70' },
  }[status];

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
      style={{
        background: styles.bg,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 200ms ease-out 300ms, transform 200ms ease-out 300ms',
      }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: styles.dot }} />
      <span
        className="font-semibold text-[13px]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', color: styles.color }}
      >
        {label}
      </span>
    </div>
  );
};

const KpiItem: React.FC<{
  label: string;
  displayValue: string;
  trend: string;
  direction: 'up' | 'down' | 'neutral';
  trendVisible: boolean;
}> = ({ label, displayValue, trend, direction, trendVisible }) => {
  const trendColor =
    direction === 'up' ? '#49D69E' : direction === 'down' ? '#FA7E70' : '#7A7A7A';
  const TrendIcon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="flex flex-col min-w-[110px]">
      <span
        className="font-extrabold leading-none"
        style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 28, color: '#111111' }}
      >
        {displayValue}
      </span>
      <span
        className="mt-1 text-[13px]"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
      >
        {label}
      </span>
      {trend && (
        <div
          className="flex items-center gap-1 mt-1"
          style={{
            opacity: trendVisible ? 1 : 0,
            transition: 'opacity 200ms ease-out',
          }}
        >
          <TrendIcon size={12} style={{ color: trendColor }} strokeWidth={2.5} />
          <span
            className="text-[12px] font-medium"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', color: trendColor }}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

const BriefingCard: React.FC<{ visible: boolean; briefing: BriefingData }> = ({ visible, briefing }) => {
  const [trendVisible, setTrendVisible] = useState(false);

  const reach = parseKpiNumeric(briefing.kpis.reach.value);
  const engagement = parseKpiNumeric(briefing.kpis.engagement.value);
  const posts = parseKpiNumeric(briefing.kpis.posts.value);

  const reachVal = useCountUp(reach.num, 800, reach.decimals, 400);
  const erVal = useCountUp(engagement.num, 800, engagement.decimals, 400);
  const postsVal = useCountUp(posts.num, 800, 0, 400);

  useEffect(() => {
    const t = setTimeout(() => setTrendVisible(true), 1300);
    return () => clearTimeout(t);
  }, []);

  const formatKpiDisplay = (val: number, parsed: { num: number; suffix: string; decimals: number }, raw: string) => {
    if (raw === '\u2013' || parsed.num === 0 && raw !== '0') return raw;
    return `${val.toFixed(parsed.decimals)}${parsed.suffix}`;
  };

  return (
    <div
      className="relative overflow-hidden bg-white rounded-[var(--vektrus-radius-xl)]"
      style={{
        padding: '32px 36px',
        boxShadow: 'var(--vektrus-shadow-card)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 300ms ease-out 100ms, transform 300ms ease-out 100ms',
      }}
    >
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(var(--vektrus-ai-violet-rgb),0.04) 0%, transparent 70%)',
          transform: 'translate(20%, -50%)',
        }}
      />
      <div
        className="absolute top-6 bottom-6 left-0 rounded-r"
        style={{
          width: 4,
          background: 'linear-gradient(180deg, var(--vektrus-ai-violet), #49B7E3)',
        }}
      />

      <div className="flex items-start justify-between mb-5">
        <div className="flex flex-col gap-3">
          <StatusBadge status={briefing.status} label={briefing.statusLabel} visible={visible} />
          <div className="flex items-center gap-2">
            <span
              className="font-semibold text-[20px]"
              style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
            >
              Dein Social Media Briefing
            </span>
            <Sparkles size={18} style={{ color: 'var(--vektrus-ai-violet)' }} />
          </div>
        </div>
        {briefing.weekLabel && (
          <span
            className="text-sm mt-1 flex-shrink-0"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
          >
            {briefing.weekLabel}
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 15,
          lineHeight: 1.7,
          color: '#111111',
          maxWidth: 720,
          marginBottom: 24,
        }}
      >
        {briefing.text.split('\n\n').map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-6 pt-6"
        style={{ borderTop: '1px solid #F0F0F0' }}
      >
        <KpiItem
          label="Reichweite"
          displayValue={formatKpiDisplay(reachVal, reach, briefing.kpis.reach.value)}
          trend={briefing.kpis.reach.trend}
          direction={briefing.kpis.reach.direction}
          trendVisible={trendVisible}
        />
        <div className="w-px self-stretch" style={{ background: '#F0F0F0' }} />
        <KpiItem
          label="Engagement Rate"
          displayValue={formatKpiDisplay(erVal, engagement, briefing.kpis.engagement.value)}
          trend={briefing.kpis.engagement.trend}
          direction={briefing.kpis.engagement.direction}
          trendVisible={trendVisible}
        />
        <div className="w-px self-stretch" style={{ background: '#F0F0F0' }} />
        <KpiItem
          label="Posts veröffentlicht"
          displayValue={formatKpiDisplay(postsVal, posts, briefing.kpis.posts.value)}
          trend={briefing.kpis.posts.trend}
          direction={briefing.kpis.posts.direction}
          trendVisible={trendVisible}
        />
        <div className="ml-auto flex items-end">
          <div className="flex flex-col items-end gap-2">
            {briefing.updatedAt && (
              <span
                className="text-[12px]"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
              >
                {briefing.updatedAt}
              </span>
            )}
            <button
              className="flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#49B7E3' }}
            >
              Details ansehen
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefingCard;
