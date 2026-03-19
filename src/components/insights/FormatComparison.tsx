import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface FormatComparisonProps {
  filters: any;
}

interface FormatData {
  type: 'post' | 'reel' | 'carousel' | 'story';
  label: string;
  icon: string;
  count: number;
  avgReach: number;
  avgEngagement: number;
  performance: number; // 0-100 score
  trend: 'up' | 'down' | 'stable';
}

const FormatComparison: React.FC<FormatComparisonProps> = ({ filters }) => {
  const formatData: FormatData[] = [
    {
      type: 'reel',
      label: 'Reels',
      icon: '🎥',
      count: 4,
      avgReach: 15200,
      avgEngagement: 6.8,
      performance: 95,
      trend: 'up'
    },
    {
      type: 'carousel',
      label: 'Carousels',
      icon: '🔄',
      count: 3,
      avgReach: 8900,
      avgEngagement: 5.2,
      performance: 78,
      trend: 'up'
    },
    {
      type: 'post',
      label: 'Posts',
      icon: '📝',
      count: 6,
      avgReach: 6400,
      avgEngagement: 3.8,
      performance: 65,
      trend: 'stable'
    },
    {
      type: 'story',
      label: 'Stories',
      icon: '📖',
      count: 8,
      avgReach: 3200,
      avgEngagement: 2.1,
      performance: 45,
      trend: 'down'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return 'bg-[#49D69E]';
    if (performance >= 60) return 'bg-[#B4E8E5]';
    if (performance >= 40) return 'bg-[#F4BE9D]';
    return 'bg-[#FA7E70]';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-[#49D69E]" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-[#FA7E70] rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-[#F4BE9D] rounded-full"></div>;
    }
  };

  const bestFormat = formatData.reduce((best, current) => 
    current.performance > best.performance ? current : best
  );

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#111111] flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-[#49B7E3]" />
          <span>Content-Format Vergleich</span>
        </h3>
        <div className="text-sm text-[#7A7A7A]">
          Welche Formate funktionieren am besten?
        </div>
      </div>

      {/* Format Bars */}
      <div className="space-y-4 mb-6">
        {formatData.map((format, index) => (
          <div key={format.type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{format.icon}</span>
                <div>
                  <span className="font-medium text-[#111111]">{format.label}</span>
                  <span className="text-sm text-[#7A7A7A] ml-2">({format.count} Posts)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getTrendIcon(format.trend)}
                <div className="text-right">
                  <div className="text-sm font-bold text-[#111111]">{format.performance}%</div>
                  <div className="text-xs text-[#7A7A7A]">Performance</div>
                </div>
              </div>
            </div>
            
            {/* Performance Bar */}
            <div className="w-full bg-[#B6EBF7]/20 rounded-full h-3 relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${getPerformanceColor(format.performance)}`}
                style={{ 
                  width: `${format.performance}%`,
                  animationDelay: `${index * 200}ms`
                }}
              />
            </div>
            
            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4 text-xs text-[#7A7A7A] mt-2">
              <div className="flex items-center justify-between">
                <span>Ø Reichweite:</span>
                <span className="font-medium text-[#111111]">{formatNumber(format.avgReach)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ø Engagement:</span>
                <span className="font-medium text-[#111111]">{format.avgEngagement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best Format Highlight */}
      <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-4 border border-[#B6EBF7]">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-[#111111] mb-1 flex items-center space-x-2">
              <span>🏆</span>
              <span>Dein Top-Format: {bestFormat.label}</span>
            </h4>
            <p className="text-sm text-[#7A7A7A]">
              {bestFormat.performance}% Performance-Score • {bestFormat.avgEngagement}% Engagement-Rate
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-planner'))}
            className="px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm"
          >
            Mehr {bestFormat.label} planen
          </button>
        </div>
      </div>

      {/* Format Insights */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
          <div className="font-medium text-[#111111] mb-1">💡 Empfehlung</div>
          <div className="text-[#7A7A7A]">
            Setze mehr auf {bestFormat.label} - sie performen {bestFormat.performance - 50}% über dem Durchschnitt
          </div>
        </div>
        
        <div className="p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
          <div className="font-medium text-[#111111] mb-1">📈 Trend</div>
          <div className="text-[#7A7A7A]">
            Video-Content (Reels) zeigt konstant steigende Performance
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatComparison;