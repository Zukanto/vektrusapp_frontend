import React from 'react';
import { TrendingUp, Eye, Heart, MousePointer, FileText, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { DEMO_KPI_DATA } from '../../services/demoData';

interface PerformanceOverviewProps {
  filters: any;
}

interface KpiData {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'positive' | 'negative' | 'neutral';
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ filters }) => {
  const kpiData: KpiData[] = [
    {
      title: 'Gesamtreichweite',
      value: (DEMO_KPI_DATA.reach.current / 1000).toFixed(1) + 'K',
      change: DEMO_KPI_DATA.reach.change,
      changeLabel: 'vs. Vorwoche',
      icon: Eye,
      color: '#49B7E3',
      trend: DEMO_KPI_DATA.reach.trend
    },
    {
      title: 'Engagement-Rate',
      value: `${DEMO_KPI_DATA.engagement.current}%`,
      change: DEMO_KPI_DATA.engagement.change,
      changeLabel: 'vs. Vorwoche',
      icon: Heart,
      color: '#49D69E',
      trend: DEMO_KPI_DATA.engagement.trend
    },
    {
      title: 'Klicks/Links',
      value: '1.8K',
      change: 28.3,
      changeLabel: 'vs. Vorwoche',
      icon: MousePointer,
      color: '#49D69E',
      trend: 'positive'
    },
    {
      title: 'Posts veröffentlicht',
      value: DEMO_KPI_DATA.posts.current.toString(),
      change: DEMO_KPI_DATA.posts.change,
      changeLabel: 'vs. letzten Monat',
      icon: FileText,
      color: '#49D69E',
      trend: DEMO_KPI_DATA.posts.trend
    }
  ];

  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-[#49D69E]" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-[#FA7E70]" />;
      default:
        return <Minus className="w-4 h-4 text-[#F4BE9D]" />;
    }
  };

  const getTrendColor = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return 'text-[#49D69E]';
      case 'negative':
        return 'text-[#FA7E70]';
      default:
        return 'text-[#F4BE9D]';
    }
  };

  const formatChange = (change: number) => {
    if (change === 0) return '±0%';
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111]">
          📊 Performance Übersicht
        </h2>
        <div className="text-sm text-[#7A7A7A]">
          {filters.timeRange === '7d' ? 'Letzte 7 Tage' : 
           filters.timeRange === '30d' ? 'Letzte 30 Tage' : 
           'Benutzerdefinierter Zeitraum'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const IconComponent = kpi.icon;
          
          return (
            <div
              key={index}
              className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)] shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-[var(--vektrus-radius-md)] flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: kpi.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#7A7A7A] text-sm">{kpi.title}</h3>
                  </div>
                </div>
                {getTrendIcon(kpi.trend)}
              </div>
              
              <div className="space-y-2">
                <p className="text-3xl font-bold text-[#111111] group-hover:scale-105 transition-transform">
                  {kpi.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                    {formatChange(kpi.change)}
                  </span>
                  <span className="text-xs text-[#7A7A7A]">{kpi.changeLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Trend Chart Placeholder */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111111]">
            📈 Performance-Verlauf
          </h3>
          <div className="flex items-center space-x-2 text-sm text-[#7A7A7A]">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[#49B7E3] rounded-full"></div>
              <span>Reichweite</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[#49D69E] rounded-full"></div>
              <span>Engagement</span>
            </div>
          </div>
        </div>
        
        {/* Simplified Chart Visualization */}
        <div className="h-64 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7] flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-[#49B7E3] mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#111111] mb-2">Performance-Chart</h4>
            <p className="text-sm text-[#7A7A7A] max-w-md">
              Hier würde ein interaktives Diagramm deinen Performance-Verlauf über den gewählten Zeitraum zeigen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;