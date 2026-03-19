import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AnalyticsFilters {
  timeRange: '7' | '30' | '90' | '180';
  platform: string;
  format: string;
}

interface PostAnalytics {
  id: string;
  user_id: string;
  late_post_id: string | null;
  platform: string;
  content_text: string | null;
  content_format: string | null;
  published_at: string | null;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  views: number;
  engagement_rate: number;
  engagement_tier: string | null;
  thumbnail_url: string | null;
  media_type: string | null;
  platform_post_url: string | null;
  period: string | null;
  is_external: boolean;
}

interface AnalyticsCache {
  best_times: BestTimeSlot[];
  content_decay: DecayBucket[];
  platform_breakdown: any[];
}

interface BestTimeSlot {
  day_of_week: number;
  hour: number;
  avg_engagement: number;
  post_count: number;
}

interface DecayBucket {
  bucket_order: number;
  bucket_label: string;
  avg_pct_of_final: number;
  post_count: number;
}

interface DailyMetric {
  date: string;
  platform: string | null;
  post_count: number;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  views: number;
}

interface FollowerEntry {
  late_account_id: string;
  platform: string;
  username: string | null;
  date: string;
  followers: number;
  growth: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  linkedin: '#0077B5',
  facebook: '#1877F2',
  tiktok: '#000000',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
};

const FORMAT_LABELS: Record<string, { label: string; icon: string }> = {
  carousel: { label: 'Carousel', icon: '🎠' },
  single_image: { label: 'Single Image', icon: '📸' },
  text_only: { label: 'Text-Only', icon: '📝' },
  reel: { label: 'Reel/Video', icon: '🎬' },
  video: { label: 'Reel/Video', icon: '🎬' },
  story_teaser: { label: 'Story', icon: '📱' },
  story_standalone: { label: 'Story', icon: '📱' },
};

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) return { value: current > 0 ? '+100%' : '0%', direction: current > 0 ? 'up' as const : 'neutral' as const };
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    value: (pct > 0 ? '+' : '') + pct + '%',
    direction: pct > 0 ? 'up' as const : pct < 0 ? 'down' as const : 'neutral' as const,
  };
}

export interface KpiData {
  reach: { value: string; trend: string; direction: 'up' | 'down' | 'neutral' };
  engagement: { value: string; trend: string; direction: 'up' | 'down' | 'neutral' };
  impressions: { value: string; trend: string; direction: 'up' | 'down' | 'neutral' };
  posts: { value: string; trend: string; direction: 'up' | 'down' | 'neutral' };
}

export interface TopPost {
  platform: string;
  format: string;
  content: string;
  date: string;
  reach: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  tier: string;
  thumbnail: string | null;
  post_url: string | null;
  original_date_label?: string;
  recycle_reason?: string;
}

export interface FormatItem {
  format: string;
  icon: string;
  posts: number;
  avgReach: number;
  avgEngagement: number;
  performance: number;
}

export interface PlatformItem {
  platform: string;
  platformKey: string;
  color: string;
  posts: number;
  reachShare: number;
  reach: number;
  engagement: number;
  strengths: string[];
}

export interface FollowerAccount {
  platform: string;
  platformKey: string;
  color: string;
  current: number;
  growth: string;
}

export interface FollowerChartPoint {
  date: string;
  [platform: string]: string | number;
}

export interface TablePost {
  platform: string;
  format: string;
  content: string;
  date: string;
  published_at: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  tier: string;
}

export interface ChartDataPoint {
  date: string;
  engagement: number;
  reach: number;
  likes: number;
  impressions: number;
}

export interface HeatmapSlot {
  day: number;
  hour: number;
  engagement: number;
  posts: number;
}

export interface DecayItem {
  label: string;
  percentage: number;
}

export function useAnalyticsData() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '30',
    platform: 'all',
    format: 'all',
  });
  const [rawPosts, setRawPosts] = useState<PostAnalytics[]>([]);
  const [cache, setCache] = useState<AnalyticsCache | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [followerRaw, setFollowerRaw] = useState<FollowerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - parseInt(filters.timeRange));
    return {
      from: from.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    };
  }, [filters.timeRange]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [postsResult, cacheResult, dailyResult, followerResult] = await Promise.all([
          supabase
            .from('post_analytics')
            .select('*')
            .gte('published_at', dateRange.from)
            .order('published_at', { ascending: false }),
          supabase
            .from('analytics_cache')
            .select('*')
            .maybeSingle(),
          supabase
            .from('daily_metrics')
            .select('*')
            .is('platform', null)
            .gte('date', dateRange.from)
            .order('date', { ascending: true }),
          supabase
            .from('follower_daily')
            .select('*')
            .gte('date', dateRange.from)
            .order('date', { ascending: true }),
        ]);

        if (cancelled) return;
        setRawPosts((postsResult.data as PostAnalytics[]) || []);
        setCache((cacheResult.data as AnalyticsCache) || null);
        setDailyMetrics((dailyResult.data as DailyMetric[]) || []);
        setFollowerRaw((followerResult.data as FollowerEntry[]) || []);
      } catch (err) {
        if (!cancelled) setError('Analytics konnten nicht geladen werden');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [dateRange.from, dateRange.to]);

  const filteredPosts = useMemo(() => {
    let posts = rawPosts;
    if (filters.platform !== 'all') {
      posts = posts.filter(p => p.platform === filters.platform);
    }
    if (filters.format !== 'all') {
      posts = posts.filter(p => p.content_format === filters.format);
    }
    return posts;
  }, [rawPosts, filters.platform, filters.format]);

  const kpis = useMemo<KpiData | null>(() => {
    const posts = filteredPosts;
    if (posts.length === 0) return null;

    const totalReach = posts.reduce((s, p) => s + (p.reach || 0), 0);
    const totalImpressions = posts.reduce((s, p) => s + (p.impressions || 0), 0);
    const avgEngagement = posts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / posts.length;

    const days = parseInt(filters.timeRange);
    const prevFrom = new Date(new Date(dateRange.from).getTime() - days * 86400000).toISOString().split('T')[0];
    const prevPosts = rawPosts.filter(p => {
      const d = p.published_at?.split('T')[0];
      return d && d >= prevFrom && d < dateRange.from;
    }).filter(p => {
      if (filters.platform !== 'all' && p.platform !== filters.platform) return false;
      if (filters.format !== 'all' && p.content_format !== filters.format) return false;
      return true;
    });

    const prevReach = prevPosts.reduce((s, p) => s + (p.reach || 0), 0);
    const prevImpressions = prevPosts.reduce((s, p) => s + (p.impressions || 0), 0);
    const prevAvgEng = prevPosts.length > 0
      ? prevPosts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / prevPosts.length
      : 0;

    const engDiff = parseFloat((avgEngagement - prevAvgEng).toFixed(1));

    return {
      reach: { value: formatNum(totalReach), ...calcTrend(totalReach, prevReach) },
      engagement: {
        value: avgEngagement.toFixed(1) + '%',
        trend: (engDiff > 0 ? '+' : '') + engDiff + '%',
        direction: engDiff > 0 ? 'up' : engDiff < 0 ? 'down' : 'neutral',
      },
      impressions: { value: formatNum(totalImpressions), ...calcTrend(totalImpressions, prevImpressions) },
      posts: {
        value: String(posts.length),
        trend: posts.length === prevPosts.length ? 'gleich' : calcTrend(posts.length, prevPosts.length).value,
        direction: posts.length > prevPosts.length ? 'up' : posts.length < prevPosts.length ? 'down' : 'neutral',
      },
    };
  }, [filteredPosts, rawPosts, filters, dateRange]);

  const topPosts = useMemo<TopPost[]>(() => {
    return [...filteredPosts]
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 3)
      .map(p => ({
        platform: p.platform,
        format: p.content_format || 'single_image',
        content: p.content_text || '',
        date: p.published_at ? new Date(p.published_at).toLocaleDateString('de-DE') : '',
        reach: p.reach || 0,
        engagement_rate: p.engagement_rate || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        tier: p.engagement_tier || 'medium',
        thumbnail: p.thumbnail_url,
        post_url: p.platform_post_url,
      }));
  }, [filteredPosts]);

  const recyclingPosts = useMemo<TopPost[]>(() => {
    const avgER = filteredPosts.length > 0
      ? filteredPosts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / filteredPosts.length
      : 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    return rawPosts
      .filter(p => p.published_at && p.published_at < thirtyDaysAgo && (p.engagement_tier === 'high' || (p.engagement_rate || 0) > avgER))
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 3)
      .map(p => {
        const daysAgo = Math.round((Date.now() - new Date(p.published_at!).getTime()) / 86400000);
        return {
          platform: p.platform,
          format: p.content_format || 'single_image',
          content: p.content_text || '',
          date: new Date(p.published_at!).toLocaleDateString('de-DE'),
          reach: p.reach || 0,
          engagement_rate: p.engagement_rate || 0,
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          tier: p.engagement_tier || 'medium',
          thumbnail: p.thumbnail_url,
          post_url: p.platform_post_url,
          original_date_label: `vor ${daysAgo} Tagen`,
          recycle_reason: p.engagement_tier === 'high'
            ? 'Überdurchschnittlich performt — ideal zum Auffrischen'
            : 'Gute Performance — lange genug her für Repost',
        };
      });
  }, [rawPosts, filteredPosts]);

  const formatComparison = useMemo<FormatItem[]>(() => {
    const posts = filteredPosts;
    if (posts.length === 0) return [];

    const groups: Record<string, { posts: number; totalReach: number; totalER: number }> = {};
    posts.forEach(p => {
      const fmt = p.content_format || 'single_image';
      if (!groups[fmt]) groups[fmt] = { posts: 0, totalReach: 0, totalER: 0 };
      groups[fmt].posts += 1;
      groups[fmt].totalReach += p.reach || 0;
      groups[fmt].totalER += p.engagement_rate || 0;
    });

    const items = Object.entries(groups)
      .map(([fmt, data]) => ({
        format: FORMAT_LABELS[fmt]?.label || fmt,
        icon: FORMAT_LABELS[fmt]?.icon || '📄',
        posts: data.posts,
        avgReach: Math.round(data.totalReach / data.posts),
        avgEngagement: Math.round((data.totalER / data.posts) * 10) / 10,
        performance: 0,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);

    if (items.length > 0) {
      const bestER = items[0].avgEngagement;
      items.forEach(f => {
        f.performance = bestER > 0 ? Math.round((f.avgEngagement / bestER) * 100) : 0;
      });
    }
    return items;
  }, [filteredPosts]);

  const platformComparison = useMemo<PlatformItem[]>(() => {
    const posts = filteredPosts;
    if (posts.length === 0) return [];

    const totalReach = posts.reduce((s, p) => s + (p.reach || 0), 0);
    const avgER = posts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / posts.length;

    const groups: Record<string, { posts: number; totalReach: number; totalEngagement: number; totalComments: number }> = {};
    posts.forEach(p => {
      const plat = p.platform || 'unknown';
      if (!groups[plat]) groups[plat] = { posts: 0, totalReach: 0, totalEngagement: 0, totalComments: 0 };
      groups[plat].posts += 1;
      groups[plat].totalReach += p.reach || 0;
      groups[plat].totalEngagement += (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
      groups[plat].totalComments += p.comments || 0;
    });

    return Object.entries(groups)
      .map(([plat, data]) => {
        const strengths: string[] = [];
        const platPosts = posts.filter(p => p.platform === plat);
        const platAvgER = platPosts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / data.posts;
        if (data.totalReach / data.posts > totalReach / posts.length) strengths.push('Reichweite');
        if (platAvgER > avgER) strengths.push('Engagement');
        if (data.totalComments / data.posts > 2) strengths.push('Community');
        if (plat === 'linkedin') strengths.push('B2B');
        if (plat === 'tiktok') strengths.push('Viral Potential');
        if (plat === 'instagram') strengths.push('Visual Content');
        const final = strengths.slice(0, 3);
        if (final.length === 0) final.push('Content');

        return {
          platform: plat.charAt(0).toUpperCase() + plat.slice(1),
          platformKey: plat,
          color: PLATFORM_COLORS[plat] || '#7A7A7A',
          posts: data.posts,
          reachShare: totalReach > 0 ? Math.round((data.totalReach / totalReach) * 100) : 0,
          reach: data.totalReach,
          engagement: data.totalEngagement,
          strengths: final,
        };
      })
      .sort((a, b) => b.reach - a.reach);
  }, [filteredPosts]);

  const allPosts = useMemo<TablePost[]>(() => {
    return [...filteredPosts]
      .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
      .map(p => ({
        platform: p.platform,
        format: p.content_format || 'single_image',
        content: p.content_text || '',
        date: p.published_at ? new Date(p.published_at).toLocaleDateString('de-DE') : '',
        published_at: p.published_at || '',
        reach: p.reach || 0,
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        engagement: p.engagement_rate || 0,
        tier: p.engagement_tier || 'medium',
      }));
  }, [filteredPosts]);

  const engagementChartData = useMemo<ChartDataPoint[]>(() => {
    if (dailyMetrics.length === 0) return [];
    return dailyMetrics.map(day => {
      const totalEng = (day.likes || 0) + (day.comments || 0) + (day.shares || 0);
      const reach = day.reach || day.impressions || 1;
      const er = reach > 0 ? Math.round((totalEng / reach) * 10000) / 100 : 0;
      return {
        date: new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        engagement: er,
        reach: day.reach || 0,
        likes: day.likes || 0,
        impressions: day.impressions || 0,
      };
    });
  }, [dailyMetrics]);

  const bestTimes = useMemo<HeatmapSlot[]>(() => {
    if (!cache?.best_times || !Array.isArray(cache.best_times)) return [];
    return cache.best_times.map(slot => ({
      day: slot.day_of_week === 0 ? 7 : slot.day_of_week,
      hour: (slot.hour + 1) % 24,
      engagement: Math.round(slot.avg_engagement),
      posts: slot.post_count,
    }));
  }, [cache]);

  const contentDecay = useMemo<DecayItem[]>(() => {
    if (!cache?.content_decay || !Array.isArray(cache.content_decay)) return [];
    return cache.content_decay
      .sort((a: DecayBucket, b: DecayBucket) => a.bucket_order - b.bucket_order)
      .map((b: DecayBucket) => ({
        label: b.bucket_label,
        percentage: Math.round(b.avg_pct_of_final * 10) / 10,
      }));
  }, [cache]);

  const followerStats = useMemo<{ accounts: FollowerAccount[]; chartData: FollowerChartPoint[] }>(() => {
    if (followerRaw.length === 0) return { accounts: [], chartData: [] };

    const accountGroups: Record<string, { platform: string; username: string | null; entries: FollowerEntry[] }> = {};
    followerRaw.forEach(d => {
      const key = d.late_account_id;
      if (!accountGroups[key]) {
        accountGroups[key] = { platform: d.platform, username: d.username, entries: [] };
      }
      accountGroups[key].entries.push(d);
    });

    const accounts = Object.values(accountGroups).map(acc => {
      const sorted = [...acc.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const current = sorted[0]?.followers || 0;
      const weekAgo = sorted.find(d => new Date(d.date).getTime() <= Date.now() - 7 * 86400000);
      const weekGrowth = weekAgo ? current - weekAgo.followers : 0;
      return {
        platform: acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1),
        platformKey: acc.platform,
        color: PLATFORM_COLORS[acc.platform] || '#7A7A7A',
        current,
        growth: `${weekGrowth >= 0 ? '+' : ''}${weekGrowth} diese Woche`,
      };
    });

    const dateMap: Record<string, FollowerChartPoint> = {};
    followerRaw.forEach(d => {
      const dateStr = new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      if (!dateMap[d.date]) dateMap[d.date] = { date: dateStr };
      dateMap[d.date][d.platform] = d.followers;
    });

    const chartData = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    return { accounts, chartData };
  }, [followerRaw]);

  const loadPlatformDailyMetrics = useCallback(async (platform: string): Promise<ChartDataPoint[]> => {
    const { data } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('platform', platform)
      .gte('date', dateRange.from)
      .order('date', { ascending: true });

    if (!data) return [];
    return data.map((day: any) => {
      const totalEng = (day.likes || 0) + (day.comments || 0) + (day.shares || 0);
      const reach = day.reach || day.impressions || 1;
      const er = reach > 0 ? Math.round((totalEng / reach) * 10000) / 100 : 0;
      return {
        date: new Date(day.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        engagement: er,
        reach: day.reach || 0,
        likes: day.likes || 0,
        impressions: day.impressions || 0,
      };
    });
  }, [dateRange.from]);

  return {
    filters,
    setFilters,
    loading,
    error,
    kpis,
    topPosts,
    recyclingPosts,
    formatComparison,
    platformComparison,
    allPosts,
    engagementChartData,
    bestTimes,
    contentDecay,
    followerStats,
    hasData: rawPosts.length > 0,
    loadPlatformDailyMetrics,
  };
}
