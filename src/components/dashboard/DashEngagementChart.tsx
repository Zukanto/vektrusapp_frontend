import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { engagementHistory } from './dashboardData';

const platforms = ['Alle', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'];

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-md)] px-4 py-3 text-sm"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="font-semibold mb-1" style={{ color: '#111111' }}>{label}</div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: '#49B7E3' }} />
        <span style={{ color: '#7A7A7A' }}>Engagement Rate:</span>
        <span className="font-semibold" style={{ color: '#49B7E3' }}>{payload[0].value}%</span>
      </div>
    </div>
  );
};

const DashEngagementChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Alle');

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3
          className="font-semibold text-lg"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
        >
          Engagement-Verlauf
        </h3>
        <div className="flex items-center gap-1">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className="px-3 py-1 text-[13px] font-medium rounded-[var(--vektrus-radius-sm)] transition-all duration-150"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: activeTab === p ? '#49B7E3' : '#7A7A7A',
                background: activeTab === p ? '#F0FAFF' : 'transparent',
                borderBottom: activeTab === p ? '2px solid #49B7E3' : '2px solid transparent',
                borderRadius: activeTab === p ? '6px 6px 0 0' : '6px',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={engagementHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="erGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#49B7E3" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#49B7E3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#E8E8E8" strokeOpacity={0.6} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fill: '#7A7A7A' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fill: '#7A7A7A' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 7]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#49B7E3', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="engagement"
            stroke="#49B7E3"
            strokeWidth={2}
            fill="url(#erGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#fff', stroke: '#49B7E3', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashEngagementChart;
