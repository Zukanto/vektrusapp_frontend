import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { InsightCard } from './insightsHelpers';
import type { ChartDataPoint } from '../../hooks/useAnalyticsData';

const PLATFORMS = ['Alle', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'];
const PLATFORM_KEY_MAP: Record<string, string> = {
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  Facebook: 'facebook',
  TikTok: 'tiktok',
};

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
      <div style={{ fontSize: 12, color: '#7A7A7A', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#49B7E3', fontFamily: 'Manrope, system-ui, sans-serif' }}>
        {payload[0]?.value?.toFixed(1)}%
      </div>
      <div style={{ fontSize: 12, color: '#7A7A7A', marginTop: 2 }}>Engagement Rate</div>
    </div>
  );
};

interface EngagementChartProps {
  data: ChartDataPoint[];
  loadPlatformData: (platform: string) => Promise<ChartDataPoint[]>;
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data, loadPlatformData }) => {
  const [activePlatform, setActivePlatform] = useState('Alle');
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data);
  const [platformLoading, setPlatformLoading] = useState(false);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  const handlePlatformChange = async (platform: string) => {
    setActivePlatform(platform);
    if (platform === 'Alle') {
      setChartData(data);
      return;
    }
    const key = PLATFORM_KEY_MAP[platform];
    if (!key) return;
    setPlatformLoading(true);
    const result = await loadPlatformData(key);
    setChartData(result);
    setPlatformLoading(false);
  };

  const maxEng = chartData.length > 0 ? Math.ceil(Math.max(...chartData.map(d => d.engagement)) + 1) : 7;

  return (
    <InsightCard>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2
          className="font-semibold"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
        >
          Engagement-Verlauf
        </h2>
        <div className="flex gap-1">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => handlePlatformChange(p)}
              className="px-3 py-1.5 text-[13px] rounded-[var(--vektrus-radius-sm)] transition-all duration-150"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: activePlatform === p ? 600 : 400,
                color: activePlatform === p ? '#49B7E3' : '#7A7A7A',
                borderBottom: activePlatform === p ? '2px solid #49B7E3' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 240 }}>
          <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#7A7A7A' }}>
            {platformLoading ? 'Daten werden geladen...' : 'Keine Daten für diesen Zeitraum verfügbar'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#49B7E3" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#49B7E3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: '#7A7A7A', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#7A7A7A', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}
              tickFormatter={v => v + '%'}
              axisLine={false}
              tickLine={false}
              domain={[0, maxEng]}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(122,122,122,0.12)" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#49B7E3"
              strokeWidth={2}
              fill="url(#engGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#fff', stroke: '#49B7E3', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </InsightCard>
  );
};

export default EngagementChart;
