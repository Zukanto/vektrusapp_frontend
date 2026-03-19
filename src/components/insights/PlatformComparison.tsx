import React from 'react';
import { Target, TrendingUp, Users, MousePointer } from 'lucide-react';

interface PlatformComparisonProps {
  filters: any;
}

interface PlatformData {
  platform: string;
  label: string;
  icon: string;
  color: string;
  metrics: {
    reach: number;
    engagement: number;
    clicks: number;
    leads: number;
    posts: number;
  };
  strengths: string[];
  performance: {
    awareness: number;
    engagement: number;
    leads: number;
    sales: number;
  };
}

const PlatformComparison: React.FC<PlatformComparisonProps> = ({ filters }) => {
  const platformData: PlatformData[] = [
    {
      platform: 'instagram',
      label: 'Instagram',
      icon: '📷',
      color: '#E1306C',
      metrics: {
        reach: 28500,
        engagement: 1847,
        clicks: 234,
        leads: 12,
        posts: 5
      },
      strengths: ['Reichweite', 'Visual Content', 'Community Building'],
      performance: {
        awareness: 85,
        engagement: 78,
        leads: 45,
        sales: 32
      }
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      icon: '💼',
      color: '#0077B5',
      metrics: {
        reach: 12300,
        engagement: 892,
        clicks: 456,
        leads: 28,
        posts: 3
      },
      strengths: ['Lead Generation', 'B2B Networking', 'Professional Content'],
      performance: {
        awareness: 65,
        engagement: 72,
        leads: 92,
        sales: 78
      }
    },
    {
      platform: 'tiktok',
      label: 'TikTok',
      icon: '🎵',
      color: '#000000',
      metrics: {
        reach: 45600,
        engagement: 2134,
        clicks: 123,
        leads: 8,
        posts: 2
      },
      strengths: ['Viral Potential', 'Young Audience', 'Creative Content'],
      performance: {
        awareness: 95,
        engagement: 88,
        leads: 25,
        sales: 18
      }
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGoalColor = (score: number) => {
    if (score >= 80) return 'text-[#49D69E]';
    if (score >= 60) return 'text-[#B4E8E5]';
    if (score >= 40) return 'text-[#F4BE9D]';
    return 'text-[#FA7E70]';
  };

  const getGoalBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#49D69E]';
    if (score >= 60) return 'bg-[#B4E8E5]';
    if (score >= 40) return 'bg-[#F4BE9D]';
    return 'bg-[#FA7E70]';
  };

  const getBestPlatformForGoal = (goal: keyof PlatformData['performance']) => {
    return platformData.reduce((best, current) => 
      current.performance[goal] > best.performance[goal] ? current : best
    );
  };

  const totalReach = platformData.reduce((sum, platform) => sum + platform.metrics.reach, 0);
  const totalEngagement = platformData.reduce((sum, platform) => sum + platform.metrics.engagement, 0);
  const totalLeads = platformData.reduce((sum, platform) => sum + platform.metrics.leads, 0);

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#111111] flex items-center space-x-2">
          <Target className="w-5 h-5 text-[#49B7E3]" />
          <span>Plattform-Vergleich</span>
        </h3>
        <div className="text-sm text-[#7A7A7A]">
          Wo performst du am besten?
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {platformData.map((platform, index) => (
          <div key={platform.platform} className="border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-5 hover:shadow-card transition-all duration-200">
            {/* Platform Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <h4 className="font-semibold text-[#111111]">{platform.label}</h4>
                  <p className="text-xs text-[#7A7A7A]">{platform.metrics.posts} Posts</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-[#111111]">
                  {Math.round((platform.metrics.reach / totalReach) * 100)}%
                </div>
                <div className="text-xs text-[#7A7A7A]">Anteil Reichweite</div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                <div className="text-sm font-bold text-[#111111]">{formatNumber(platform.metrics.reach)}</div>
                <div className="text-xs text-[#7A7A7A]">Reichweite</div>
              </div>
              <div className="text-center p-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                <div className="text-sm font-bold text-[#111111]">{formatNumber(platform.metrics.engagement)}</div>
                <div className="text-xs text-[#7A7A7A]">Engagement</div>
              </div>
            </div>

            {/* Performance Goals */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#111111] mb-2">Performance nach Ziel:</div>
              {Object.entries(platform.performance).map(([goal, score]) => (
                <div key={goal} className="flex items-center justify-between">
                  <span className="text-xs text-[#7A7A7A] capitalize">
                    {goal === 'awareness' ? 'Awareness' :
                     goal === 'engagement' ? 'Engagement' :
                     goal === 'leads' ? 'Leads' : 'Sales'}:
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-[#B6EBF7]/20 rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${getGoalBarColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${getGoalColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="mt-4 pt-3 border-t border-[rgba(73,183,227,0.10)]">
              <div className="text-xs font-medium text-[#111111] mb-2">Stärken:</div>
              <div className="flex flex-wrap gap-1">
                {platform.strengths.map(strength => (
                  <span key={strength} className="px-2 py-1 bg-[#F4FCFE] text-[#7A7A7A] rounded-[var(--vektrus-radius-sm)] text-xs">
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal-based Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['awareness', 'engagement', 'leads', 'sales'].map(goal => {
          const bestPlatform = getBestPlatformForGoal(goal as keyof PlatformData['performance']);
          const score = bestPlatform.performance[goal as keyof PlatformData['performance']];
          
          return (
            <div key={goal} className="p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
              <div className="text-center">
                <div className="text-lg mb-2">
                  {goal === 'awareness' ? '📢' :
                   goal === 'engagement' ? '❤️' :
                   goal === 'leads' ? '🎯' : '💰'}
                </div>
                <div className="font-medium text-[#111111] text-sm capitalize mb-1">
                  {goal === 'awareness' ? 'Awareness' :
                   goal === 'engagement' ? 'Engagement' :
                   goal === 'leads' ? 'Lead Generation' : 'Sales'}
                </div>
                <div className="text-xs text-[#7A7A7A] mb-2">Beste Plattform:</div>
                <div className="flex items-center justify-center space-x-2">
                  <span>{bestPlatform.icon}</span>
                  <span className="font-bold text-[#111111] text-sm">{bestPlatform.label}</span>
                </div>
                <div className={`text-sm font-bold mt-1 ${getGoalColor(score)}`}>
                  {score}% Performance
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="mt-6 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
        <h4 className="font-medium text-[#111111] mb-2">📊 Plattform-Insights Zusammenfassung</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-[#7A7A7A]">🎯 Für Reichweite:</span>
            <div className="font-medium text-[#111111]">TikTok nutzen (+95% Performance)</div>
          </div>
          <div>
            <span className="text-[#7A7A7A]">💼 Für Leads:</span>
            <div className="font-medium text-[#111111]">LinkedIn fokussieren (92% Performance)</div>
          </div>
          <div>
            <span className="text-[#7A7A7A]">❤️ Für Engagement:</span>
            <div className="font-medium text-[#111111]">TikTok & Instagram kombinieren</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformComparison;