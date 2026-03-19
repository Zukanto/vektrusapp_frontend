import React from 'react';
import { ChartBar as BarChart3, Download, Calendar, ChevronDown } from 'lucide-react';
import ModuleWrapper from '../ui/ModuleWrapper';
import { BetaHint } from '../ui/BetaHint';
import InsightsKpiCards from './InsightsKpiCards';
import EngagementChart from './EngagementChart';
import PostingHeatmap from './PostingHeatmap';
import ContentDecay from './ContentDecay';
import InsightsTopPosts from './InsightsTopPosts';
import InsightsFormatComparison from './InsightsFormatComparison';
import InsightsPlatformComparison from './InsightsPlatformComparison';
import InsightsFollowerGrowth from './InsightsFollowerGrowth';
import InsightsPostsTable from './InsightsPostsTable';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

const TIME_OPTIONS = [
  { value: '7', label: 'Letzte 7 Tage' },
  { value: '30', label: 'Letzte 30 Tage' },
  { value: '90', label: 'Letzte 90 Tage' },
  { value: '180', label: 'Letzte 180 Tage' },
];

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'Alle Plattformen' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

const FORMAT_OPTIONS = [
  { value: 'all', label: 'Alle Formate' },
  { value: 'single_image', label: 'Single Image' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'text_only', label: 'Text-Only' },
  { value: 'reel_video', label: 'Reel/Video' },
];

const FilterDropdown: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}> = ({ value, options, onChange, icon }) => {
  const isDefault = value === options[0].value;
  return (
    <div className="relative inline-flex items-center">
      {icon && (
        <span className="absolute left-3 pointer-events-none" style={{ color: '#7A7A7A' }}>
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none rounded-[var(--vektrus-radius-sm)] pr-8 transition-all"
        style={{
          paddingLeft: icon ? 32 : 14,
          paddingTop: 8,
          paddingBottom: 8,
          paddingRight: 32,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#111111',
          background: 'white',
          border: `1.5px solid ${isDefault ? 'rgba(73,183,227,0.18)' : '#49B7E3'}`,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 pointer-events-none" style={{ color: '#7A7A7A' }} />
    </div>
  );
};

const InsightsPage: React.FC = () => {
  const analytics = useAnalyticsData();
  const { filters, setFilters, loading, hasData } = analytics;

  const hasActiveFilters = filters.platform !== 'all' || filters.format !== 'all';
  const resetFilters = () => setFilters(prev => ({ ...prev, platform: 'all', format: 'all' }));

  if (loading) {
    return (
      <ModuleWrapper module="insights" showTopAccent={true}>
        <div className="h-full flex items-center justify-center" style={{ background: '#F4FCFE' }}>
          <div className="text-center">
            <div
              className="mx-auto mb-4 rounded-full"
              style={{
                width: 48,
                height: 48,
                background: 'rgba(73, 183, 227, 0.15)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: '#7A7A7A' }}>
              Analytics werden geladen...
            </p>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  if (!hasData) {
    return (
      <ModuleWrapper module="insights" showTopAccent={true}>
        <div className="h-full flex items-center justify-center" style={{ background: '#F4FCFE' }}>
          <div className="text-center" style={{ padding: '80px 40px' }}>
            <BarChart3 size={48} style={{ color: '#B6EBF7', margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 24, color: '#111111', marginBottom: 8 }}>
              Noch keine Analytics verfügbar
            </h2>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: '#7A7A7A', maxWidth: 400, margin: '0 auto' }}>
              Deine Performance-Daten werden automatisch gesammelt sobald du Posts veröffentlichst.
              Analytics werden täglich um 06:00 Uhr aktualisiert.
            </p>
          </div>
        </div>
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper module="insights" showTopAccent={true}>
      <div className="h-full flex flex-col" style={{ background: '#F4FCFE' }}>
        <div className="bg-white border-b border-[rgba(73,183,227,0.10)] flex-shrink-0">
          <div className="mx-auto" style={{ maxWidth: 1280, padding: '28px 40px 20px' }}>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
              <div>
                <h1
                  className="font-bold flex items-center gap-3"
                  style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 28, color: '#111111', lineHeight: 1.2 }}
                >
                  <BarChart3 size={26} style={{ color: '#49B7E3' }} />
                  Deine Social Media Insights
                </h1>
                <p className="mt-1.5" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: '#7A7A7A' }}>
                  Verstehe deine Performance und optimiere deine Content-Strategie
                </p>
              </div>
              <button
                className="flex items-center gap-2 rounded-[var(--vektrus-radius-sm)] font-semibold transition-all duration-150 flex-shrink-0"
                style={{
                  padding: '9px 18px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 13,
                  border: '1.5px solid #49B7E3',
                  color: '#49B7E3',
                  background: 'transparent',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#49B7E3'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#49B7E3'; }}
              >
                <Download size={14} />
                Insights exportieren
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FilterDropdown
                value={filters.timeRange}
                options={TIME_OPTIONS}
                onChange={v => setFilters(prev => ({ ...prev, timeRange: v as any }))}
                icon={<Calendar size={14} />}
              />
              <FilterDropdown
                value={filters.platform}
                options={PLATFORM_OPTIONS}
                onChange={v => setFilters(prev => ({ ...prev, platform: v }))}
              />
              <FilterDropdown
                value={filters.format}
                options={FORMAT_OPTIONS}
                onChange={v => setFilters(prev => ({ ...prev, format: v }))}
              />

              {hasActiveFilters && (
                <div className="flex items-center gap-2 ml-2">
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
                    Aktive Filter:
                  </span>
                  {filters.platform !== 'all' && (
                    <span className="px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[12px] font-medium" style={{ background: 'rgba(73,183,227,0.18)', color: '#49B7E3' }}>
                      {PLATFORM_OPTIONS.find(o => o.value === filters.platform)?.label}
                    </span>
                  )}
                  {filters.format !== 'all' && (
                    <span className="px-2 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[12px] font-medium" style={{ background: 'rgba(73,183,227,0.18)', color: '#49B7E3' }}>
                      {FORMAT_OPTIONS.find(o => o.value === filters.format)?.label}
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-[12px] transition-colors"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#111111')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A7A7A')}
                  >
                    Zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto" style={{ maxWidth: 1280, padding: '28px 40px 48px' }}>
            <div className="flex flex-col gap-6">
              <InsightsKpiCards data={analytics.kpis} />
              <EngagementChart
                data={analytics.engagementChartData}
                loadPlatformData={analytics.loadPlatformDailyMetrics}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <PostingHeatmap data={analytics.bestTimes} />
                </div>
                <div className="lg:col-span-5">
                  <ContentDecay data={analytics.contentDecay} />
                </div>
              </div>
              <InsightsTopPosts
                topPosts={analytics.topPosts}
                recyclingPosts={analytics.recyclingPosts}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightsFormatComparison data={analytics.formatComparison} />
                <InsightsPlatformComparison data={analytics.platformComparison} />
              </div>
              <InsightsFollowerGrowth data={analytics.followerStats} />
              <InsightsPostsTable data={analytics.allPosts} />
            </div>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default InsightsPage;
