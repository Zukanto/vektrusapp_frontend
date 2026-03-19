import React from 'react';
import { Clock } from 'lucide-react';
import type { ActivityItem } from '../../hooks/useDashboardData';

const dotColor: Record<string, string> = {
  analytics_update: '#B6EBF7',
  post_published: '#49B7E3',
  content_generated: '#7C6CF2',
  error: '#FA7E70',
};

const PlatformPill: React.FC<{ platform: string }> = ({ platform }) => {
  const config: Record<string, { color: string; label: string }> = {
    linkedin: { color: '#0077B5', label: 'LinkedIn' },
    instagram: { color: '#E1306C', label: 'Instagram' },
    facebook: { color: '#1877F2', label: 'Facebook' },
    tiktok: { color: '#111111', label: 'TikTok' },
  };
  const c = config[platform];
  if (!c) return null;
  return (
    <span
      className="inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] ml-1"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        color: c.color,
        background: `${c.color}18`,
      }}
    >
      {c.label}
    </span>
  );
};

const ActivityTimeline: React.FC<{ visible: boolean; items: ActivityItem[] }> = ({ visible, items }) => {
  return (
    <div
      className="bg-white rounded-[var(--vektrus-radius-lg)] h-full flex flex-col"
      style={{
        padding: 24,
        boxShadow: 'var(--vektrus-shadow-subtle)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 300ms ease-out 250ms, transform 300ms ease-out 250ms',
      }}
    >
      <h2
        className="font-semibold mb-5"
        style={{
          fontFamily: 'Manrope, system-ui, sans-serif',
          fontSize: 18,
          color: '#111111',
        }}
      >
        Letzte Aktivität
      </h2>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] flex items-center justify-center mb-3 text-[#49B7E3]">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#111111] mb-1">Noch keine Aktivität</p>
          <p className="text-xs text-[#7A7A7A]">Erstelle deinen ersten Content-Plan, um loszulegen.</p>
        </div>
      ) : (
        <div className="relative pl-6 flex-1">
          <div
            className="absolute left-[7px] top-2 bottom-2 rounded-full"
            style={{
              width: 2,
              background: 'linear-gradient(180deg, #B6EBF7 0%, #F0F0F0 100%)',
            }}
          />

          {items.map((item, i) => {
            const delay = 350 + i * 80;
            return (
              <div
                key={i}
                className={`relative ${i < items.length - 1 ? 'pb-5' : ''}`}
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity 250ms ease-out ${delay}ms`,
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    left: -20,
                    top: 5,
                    width: 10,
                    height: 10,
                    border: `2px solid ${dotColor[item.type] || '#49B7E3'}`,
                    background: i === 0 ? (dotColor[item.type] || '#49B7E3') : 'white',
                  }}
                />

                <div
                  className="text-[11px] font-medium uppercase tracking-[0.3px]"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
                >
                  {item.date}
                </div>

                <div className="flex items-center flex-wrap mt-1">
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111111' }}
                  >
                    {item.title}
                  </span>
                  {item.platform && <PlatformPill platform={item.platform} />}
                </div>

                {item.detail && (
                  <div
                    className="text-[13px] mt-0.5 italic"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#7A7A7A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 280,
                    }}
                  >
                    {item.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
