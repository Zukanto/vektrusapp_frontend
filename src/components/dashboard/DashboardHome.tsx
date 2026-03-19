import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import BriefingCard from './BriefingCard';
import ActionCards from './ActionCards';
import ActivityTimeline from './ActivityTimeline';

const DashboardHome: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && data) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div
        className="flex flex-col h-full overflow-hidden items-center justify-center"
        style={{ background: '#F4FCFE', minHeight: '80vh' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 rounded-full animate-pulse"
            style={{
              width: 48,
              height: 48,
              background: 'rgba(73, 183, 227, 0.15)',
            }}
          />
          <p className="text-[15px] text-[#7A7A7A]">
            Dashboard wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="flex flex-col h-full overflow-hidden items-center justify-center"
        style={{ background: '#F4FCFE', minHeight: '80vh' }}
      >
        <div className="text-center max-w-md px-6">
          <div
            className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(250,126,112,0.12)' }}
          >
            <Bell size={20} style={{ color: '#FA7E70' }} />
          </div>
          <p className="text-[15px] text-[#FA7E70] font-medium mb-1">
            Dashboard nicht verfügbar
          </p>
          <p className="text-[13px] text-[#7A7A7A]">
            {error || 'Bitte versuche es erneut.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#F4FCFE' }}
    >
      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: 1280,
            padding: '32px 40px 40px',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              marginBottom: 28,
              opacity: visible ? 1 : 0,
              transition: 'opacity 200ms ease-out',
            }}
          >
            <h1
              className="font-bold"
              style={{
                fontFamily: 'Manrope, system-ui, sans-serif',
                fontSize: 28,
                color: '#111111',
                lineHeight: 1.2,
              }}
            >
              {data.greeting}
            </h1>
            <button className="p-2 rounded-[var(--vektrus-radius-sm)] text-[#7A7A7A] hover:bg-[#F4FCFE] transition-colors duration-200">
              <Bell size={20} strokeWidth={2} />
            </button>
          </div>

          <div style={{ marginBottom: 28 }}>
            <BriefingCard visible={visible} briefing={data.briefing} />
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            style={{ alignItems: 'start' }}
          >
            <div className="lg:col-span-7">
              <ActionCards visible={visible} steps={data.nextSteps} />
            </div>
            <div className="lg:col-span-5">
              <ActivityTimeline visible={visible} items={data.activity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
