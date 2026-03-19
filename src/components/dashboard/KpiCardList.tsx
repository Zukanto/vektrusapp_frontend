import React from 'react';
import KpiCard from './KpiCard';
import { TrendingUp, Users, Heart, Eye } from 'lucide-react';
import { DEMO_KPI_DATA } from '../../services/demoData';

const KpiCardList: React.FC = () => {
  const kpis = [
    {
      title: 'Reichweite',
      value: DEMO_KPI_DATA.reach.current.toLocaleString('de-DE'),
      description: `+${DEMO_KPI_DATA.reach.change}% vs. letzte Woche`,
      icon: Eye,
      trend: DEMO_KPI_DATA.reach.trend,
      color: '#49D69E'
    },
    {
      title: 'Engagement Rate',
      value: `${DEMO_KPI_DATA.engagement.current}%`,
      description: `+${DEMO_KPI_DATA.engagement.change}% vs. letzte Woche`,
      icon: Heart,
      trend: DEMO_KPI_DATA.engagement.trend,
      color: '#49D69E'
    },
    {
      title: 'Follower',
      value: DEMO_KPI_DATA.followers.current.toLocaleString('de-DE'),
      description: `+${DEMO_KPI_DATA.followers.change}% Wachstum`,
      icon: Users,
      trend: DEMO_KPI_DATA.followers.trend,
      color: '#49D69E'
    },
    {
      title: 'Posts',
      value: DEMO_KPI_DATA.posts.current.toString(),
      description: `+${DEMO_KPI_DATA.posts.change}% mehr als letzten Monat`,
      icon: TrendingUp,
      trend: DEMO_KPI_DATA.posts.trend,
      color: '#49D69E'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#111111]">Performance Übersicht</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
};

export default KpiCardList;