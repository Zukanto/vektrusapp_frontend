import React from 'react';
import { PieChart, Pie, Cell, Tooltip, TooltipProps, ResponsiveContainer } from 'recharts';
import { platformBreakdown } from './dashboardData';

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-md)] px-4 py-3 text-sm"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="font-semibold mb-1" style={{ color: '#111111' }}>{d.platform}</div>
      <div style={{ color: '#7A7A7A' }}>{d.posts} Posts · Ø {d.avgER}% ER</div>
    </div>
  );
};

const sortedPlatforms = [...platformBreakdown].sort((a, b) => b.avgER - a.avgER);
const totalPosts = platformBreakdown.reduce((s, p) => s + p.posts, 0);

const DashPlatformBreakdown: React.FC = () => {
  return (
    <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 h-full flex flex-col" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3
        className="font-semibold text-lg mb-5"
        style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
      >
        Plattform-Breakdown
      </h3>

      <div className="relative flex items-center justify-center mb-5" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={platformBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={70}
              paddingAngle={3}
              dataKey="posts"
              strokeWidth={0}
            >
              {platformBreakdown.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-extrabold text-2xl leading-none"
            style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
          >
            {totalPosts}
          </span>
          <span className="text-xs mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
            Posts
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {sortedPlatforms.map((p) => (
          <div key={p.platform} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span
              className="font-medium text-sm flex-1"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111111' }}
            >
              {p.platform}
            </span>
            <span className="text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
              {p.posts} Posts
            </span>
            <span
              className="text-sm font-semibold w-14 text-right"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111111' }}
            >
              Ø {p.avgER}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashPlatformBreakdown;
