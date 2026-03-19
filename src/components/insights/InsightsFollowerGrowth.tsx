import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { InsightCard } from './insightsHelpers';
import type { FollowerAccount, FollowerChartPoint } from '../../hooks/useAnalyticsData';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[var(--vektrus-radius-md)]"
      style={{
        background: 'white',
        boxShadow: 'var(--vektrus-shadow-card)',
        padding: '12px 16px',
        border: '1px solid #F0F0F0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 12, color: '#7A7A7A', marginBottom: 8 }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <div className="rounded-full" style={{ width: 8, height: 8, background: entry.color }} />
          <span style={{ fontSize: 13, color: '#111111', fontWeight: 600 }}>{entry.value}</span>
          <span style={{ fontSize: 12, color: '#7A7A7A' }}>{entry.name} Follower</span>
        </div>
      ))}
    </div>
  );
};

interface FollowerGrowthProps {
  data: { accounts: FollowerAccount[]; chartData: FollowerChartPoint[] };
}

const InsightsFollowerGrowth: React.FC<FollowerGrowthProps> = ({ data }) => {
  const { accounts, chartData } = data;

  if (accounts.length === 0) return null;

  return (
    <InsightCard>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <h2
          className="font-semibold"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
        >
          Follower-Wachstum
        </h2>

        <div className="flex flex-col gap-2">
          {accounts.map(acc => (
            <div key={acc.platform} className="flex items-center gap-3">
              <div className="rounded-full" style={{ width: 10, height: 10, background: acc.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111', fontWeight: 600, minWidth: 80 }}>
                {acc.platform}
              </span>
              <span style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 16, fontWeight: 700, color: '#111111' }}>
                {acc.current}
              </span>
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
                {acc.growth}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#7A7A7A', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#7A7A7A', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(122,122,122,0.12)" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          {accounts.map(acc => (
            <Line
              key={acc.platformKey}
              type="monotone"
              dataKey={acc.platformKey}
              name={acc.platform}
              stroke={acc.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: acc.color, stroke: 'white', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {chartData.length < 14 && (
        <p
          className="mt-4 text-[13px]"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
        >
          Follower-Daten werden täglich aktualisiert. Detailliertere Trends werden nach 2-3 Wochen sichtbar.
        </p>
      )}
    </InsightCard>
  );
};

export default InsightsFollowerGrowth;
