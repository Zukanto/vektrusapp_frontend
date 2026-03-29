import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface PlannerPerformanceData {
  bestPlatform?: { name: string; avgEr: number };
  worstPlatform?: { name: string; avgEr: number };
  bestFormat?: string;
  avgErByPlatform: Record<string, number>;
  totalPostsLast30Days: number;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function usePlannerPerformance(): {
  performanceData: PlannerPerformanceData | null;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PlannerPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

        const { data: rows } = await supabase
          .from('post_analytics')
          .select('platform, engagement_rate, content_format')
          .eq('user_id', user.id)
          .gte('published_at', thirtyDaysAgo)
          .limit(100);

        if (!rows || rows.length === 0) {
          setPerformanceData(null);
          return;
        }

        const totalPostsLast30Days = rows.length;

        // Aggregate ER by platform
        const platformGroups: Record<string, number[]> = {};
        const formatCounts: Record<string, number> = {};

        for (const row of rows) {
          const p = (row.platform || 'other').toLowerCase();
          if (!platformGroups[p]) platformGroups[p] = [];
          if (row.engagement_rate != null) platformGroups[p].push(row.engagement_rate);

          const fmt = row.content_format;
          if (fmt) formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
        }

        const avgErByPlatform: Record<string, number> = {};
        let bestPlatform: { name: string; avgEr: number } | undefined;
        let worstPlatform: { name: string; avgEr: number } | undefined;

        for (const [p, ers] of Object.entries(platformGroups)) {
          if (ers.length === 0) continue;
          const avg = parseFloat((ers.reduce((a, b) => a + b, 0) / ers.length).toFixed(1));
          const name = capitalize(p);
          avgErByPlatform[name] = avg;

          if (!bestPlatform || avg > bestPlatform.avgEr) {
            bestPlatform = { name, avgEr: avg };
          }
          if (!worstPlatform || avg < worstPlatform.avgEr) {
            worstPlatform = { name, avgEr: avg };
          }
        }

        // Best format by count
        const bestFormat = Object.entries(formatCounts).length > 0
          ? Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0][0]
          : undefined;

        setPerformanceData({
          bestPlatform,
          worstPlatform,
          bestFormat,
          avgErByPlatform,
          totalPostsLast30Days,
        });
      } catch (err) {
        console.error('Planner performance load error:', err);
        setPerformanceData(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return { performanceData, isLoading };
}
