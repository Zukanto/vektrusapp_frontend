import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardSkeleton from './DashboardSkeleton';
import HeroHeader from './HeroHeader';
import KpiRow from './KpiRow';
import InsightRow from './InsightRow';
import ContentMixChart from './ContentMixChart';
import PlatformBreakdown from './PlatformBreakdown';
import TaskFeed from './TaskFeed';

const DashboardHome: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && data) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [loading, data]);

  /* --- Loading --------------------------------------------------- */
  if (loading) {
    return <DashboardSkeleton />;
  }

  /* --- Error ----------------------------------------------------- */
  if (error || !data) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#F4FCFE] items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[rgba(250,126,112,0.12)] flex items-center justify-center">
            <AlertCircle size={20} className="text-[#FA7E70]" />
          </div>
          <p className="text-[15px] text-[#FA7E70] font-medium mb-1">
            Dashboard nicht verfügbar
          </p>
          <p className="text-[13px] text-[#7A7A7A] mb-4">
            {error || 'Bitte versuche es erneut.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#49B7E3] hover:opacity-70 transition-opacity"
          >
            <RefreshCw size={14} />
            Erneut laden
          </button>
        </div>
      </div>
    );
  }

  /* --- Content --------------------------------------------------- */
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F4FCFE]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10 pt-8 pb-10">

          {/* ── Layer 1: North Star Hero ────────────────────────── */}
          <div className="mb-5">
            <HeroHeader greeting={data.greeting} briefing={data.briefing} visible={visible} />
          </div>

          <div className="mb-7">
            <KpiRow briefing={data.briefing} visible={visible} />
          </div>

          {/* ── Layer 2: Smart Insights ────────────────────────── */}
          <div className="mb-7">
            <InsightRow data={data} visible={visible} />
          </div>

          {/* ── Layer 3: Strategic Visualization ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-7">
            <div className="lg:col-span-5">
              <ContentMixChart items={data.contentMix} visible={visible} />
            </div>
            <div className="lg:col-span-7">
              <PlatformBreakdown stats={data.platformStats} visible={visible} />
            </div>
          </div>

          {/* ── Layer 4: Operational Task Feed ────────────────── */}
          <TaskFeed tasks={data.tasks} visible={visible} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
