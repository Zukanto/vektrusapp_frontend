import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BriefingKpi {
  value: string;
  trend: string;
  direction: 'up' | 'down' | 'neutral';
}

export interface BriefingData {
  status: 'good' | 'okay' | 'attention';
  statusLabel: string;
  weekLabel: string;
  text: string;
  updatedAt: string;
  kpis: {
    reach: BriefingKpi;
    engagement: BriefingKpi;
    posts: BriefingKpi;
  };
  bestPlatform: { name: string; er: string };
}

export interface NextStep {
  icon: string;
  title: string;
  description: string;
  buttonLabel: string;
  route: string;
}

export interface ContentMixItem {
  label: string;
  count: number;
  color: string;
}

export interface TopPost {
  platform: string;
  engagementRate: number;
  reach: number;
  contentFormat?: string;
  publishedAt: string;
  contentText?: string;
}

export interface PlatformStat {
  platform: string;
  posts: number;
  avgEr: number;
  totalReach: number;
  previousAvgEr?: number;
}

export interface TaskItem {
  type: 'approval' | 'connection' | 'brand';
  title: string;
  detail: string;
  platform: string | null;
  cta: { label: string; route: string };
  urgency: 'high' | 'medium' | 'low';
}

export interface DashboardData {
  greeting: string;
  briefing: BriefingData;
  nextSteps: NextStep[];
  contentMix: ContentMixItem[];
  platformStats: PlatformStat[];
  tasks: TaskItem[];
  topPost?: TopPost;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();
  if (isToday) return 'Heute';
  if (isYesterday) return 'Gestern';
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  return dayNames[date.getDay()];
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Guten Morgen';
  if (hour >= 12 && hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

const emptyBriefing: BriefingData = {
  status: 'okay',
  statusLabel: 'Wird eingerichtet',
  weekLabel: '',
  text: 'Dein Dashboard wird gerade eingerichtet. Deine Analytics-Daten werden innerhalb von 24 Stunden verfügbar sein. In der Zwischenzeit kannst du den Chat nutzen oder deinen ersten Content-Plan erstellen.',
  updatedAt: '',
  kpis: {
    reach: { value: '\u2013', trend: '', direction: 'neutral' },
    engagement: { value: '\u2013', trend: '', direction: 'neutral' },
    posts: { value: '0', trend: '', direction: 'neutral' },
  },
  bestPlatform: { name: '\u2013', er: '' },
};

const emptyNextSteps: NextStep[] = [
  { icon: 'Zap', title: 'Content generieren', description: 'Erstelle deinen ersten Content-Plan mit KI', buttonLabel: 'Starten', route: '/pulse' },
  { icon: 'MessageSquare', title: 'Chat öffnen', description: 'Frag Vektrus alles über Social Media', buttonLabel: 'Öffnen', route: '/chat' },
  { icon: 'Link', title: 'Konten verbinden', description: 'Verbinde deine Social-Media-Accounts', buttonLabel: 'Verbinden', route: '/profile' },
];

const platformColorMap: Record<string, string> = {
  instagram: '#E1306C',
  linkedin: '#0077B5',
  facebook: '#1877F2',
  tiktok: '#111111',
  twitter: '#1DA1F2',
};

function buildContentMix(rows: { platform: string }[]): ContentMixItem[] {
  if (!rows.length) return [];
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const p = (r.platform || 'other').toLowerCase();
    counts[p] = (counts[p] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([p, count]) => ({
      label: capitalize(p),
      count,
      color: platformColorMap[p] || '#7A7A7A',
    }));
}

function buildPlatformStats(
  rows: { platform: string; engagement_rate: number | null; reach: number | null }[],
  prevRows?: { platform: string; engagement_rate: number | null }[],
): PlatformStat[] {
  if (!rows.length) return [];
  const groups: Record<string, { ers: number[]; reaches: number[]; count: number }> = {};
  for (const r of rows) {
    const p = (r.platform || 'other').toLowerCase();
    if (!groups[p]) groups[p] = { ers: [], reaches: [], count: 0 };
    groups[p].count++;
    if (r.engagement_rate != null) groups[p].ers.push(r.engagement_rate);
    if (r.reach != null) groups[p].reaches.push(r.reach);
  }

  // Build previous period averages per platform
  const prevGroups: Record<string, { ers: number[]; count: number }> = {};
  if (prevRows) {
    for (const r of prevRows) {
      const p = (r.platform || 'other').toLowerCase();
      if (!prevGroups[p]) prevGroups[p] = { ers: [], count: 0 };
      prevGroups[p].count++;
      if (r.engagement_rate != null) prevGroups[p].ers.push(r.engagement_rate);
    }
  }

  return Object.entries(groups)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([p, g]) => {
      const prev = prevGroups[p];
      const prevAvgEr = prev && prev.ers.length >= 3
        ? parseFloat((prev.ers.reduce((a, b) => a + b, 0) / prev.ers.length).toFixed(1))
        : undefined;
      return {
        platform: capitalize(p),
        posts: g.count,
        avgEr: g.ers.length ? parseFloat((g.ers.reduce((a, b) => a + b, 0) / g.ers.length).toFixed(1)) : 0,
        totalReach: g.reaches.reduce((a, b) => a + b, 0),
        previousAvgEr: prevAvgEr,
      };
    });
}

function buildTasks(
  drafts: { id: string; platform: string; created_at: string }[],
  hasBrandProfile: boolean,
  hasPlatformStats: boolean,
): TaskItem[] {
  const tasks: TaskItem[] = [];

  // Connection task — highest priority, blocks all analytics
  if (!hasPlatformStats) {
    tasks.push({
      type: 'connection',
      title: 'Social-Media-Konten verbinden',
      detail: 'Verknüpfe deine Accounts, um Analytics und Publishing zu aktivieren.',
      platform: null,
      cta: { label: 'Verbinden', route: '/profile' },
      urgency: 'high',
    });
  }

  // Brand profile task — important for quality
  if (!hasBrandProfile) {
    tasks.push({
      type: 'brand',
      title: 'Brand Studio einrichten',
      detail: 'Lade Referenz-Designs hoch, damit Pulse deinen Markenstil kennt.',
      platform: null,
      cta: { label: 'Einrichten', route: '/brand' },
      urgency: 'medium',
    });
  }

  // Draft approval tasks — one per platform group
  if (drafts.length > 0) {
    const byPlatform: Record<string, number> = {};
    for (const d of drafts) {
      const p = (d.platform || 'other').toLowerCase();
      byPlatform[p] = (byPlatform[p] || 0) + 1;
    }

    if (drafts.length <= 3) {
      // Few drafts — show individual tasks
      for (const d of drafts) {
        const age = Date.now() - new Date(d.created_at).getTime();
        const isOld = age > 3 * 86400000; // >3 days
        tasks.push({
          type: 'approval',
          title: `Entwurf freigeben`,
          detail: `${capitalize(d.platform || 'Post')} \u2013 wartet auf Freigabe`,
          platform: d.platform,
          cta: { label: 'Prüfen', route: '/planner' },
          urgency: isOld ? 'high' : 'medium',
        });
      }
    } else {
      // Many drafts — summarize
      tasks.push({
        type: 'approval',
        title: `${drafts.length} Entwürfe freigeben`,
        detail: 'Offene Posts im Planer warten auf deine Freigabe.',
        platform: null,
        cta: { label: 'Planer öffnen', route: '/planner' },
        urgency: drafts.some(d => Date.now() - new Date(d.created_at).getTime() > 3 * 86400000) ? 'high' : 'medium',
      });
    }
  }

  // Note: "generate content" is NOT a task — Layer 2 insights already
  // handle the "go to Pulse" prompt. Duplicating it here would be noise.

  // Sort: high > medium > low
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return tasks.slice(0, 5); // max 5 tasks
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setError('Nicht eingeloggt');
          return;
        }

        const userId = session.user.id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

        const [cacheResult, userResult, pulseResult, mixResult, analyticsResult, draftsResult, brandResult, topPostResult, prevAnalyticsResult] = await Promise.all([
          supabase
            .from('dashboard_cache')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('users')
            .select('company_name, first_name')
            .eq('auth_user_id', userId)
            .maybeSingle(),
          supabase
            .from('pulse_generated_content')
            .select('platform, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
          // Layer 3: content mix — platform distribution of generated content
          supabase
            .from('pulse_generated_content')
            .select('platform')
            .eq('user_id', userId)
            .gte('created_at', thirtyDaysAgo)
            .limit(100),
          // Layer 3: platform analytics — per-platform performance
          supabase
            .from('post_analytics')
            .select('platform, engagement_rate, reach')
            .eq('user_id', userId)
            .gte('published_at', thirtyDaysAgo)
            .limit(100),
          // Layer 4: draft posts awaiting approval
          supabase
            .from('pulse_generated_content')
            .select('id, platform, status, created_at')
            .eq('user_id', userId)
            .eq('status', 'draft')
            .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
            .order('created_at', { ascending: false })
            .limit(10),
          // Layer 4: brand profile existence check
          supabase
            .from('brand_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
          // Top post: best ER in last 30 days with text preview
          supabase
            .from('post_analytics')
            .select('platform, engagement_rate, reach, content_text, content_format, published_at')
            .eq('user_id', userId)
            .gte('published_at', thirtyDaysAgo)
            .not('engagement_rate', 'is', null)
            .order('engagement_rate', { ascending: false })
            .limit(1),
          // Previous period analytics (31-60 days) for ER trend comparison
          supabase
            .from('post_analytics')
            .select('platform, engagement_rate')
            .eq('user_id', userId)
            .gte('published_at', sixtyDaysAgo)
            .lt('published_at', thirtyDaysAgo)
            .limit(100),
        ]);

        const cache = cacheResult.data;
        const firstName = userResult.data?.first_name || userResult.data?.company_name || 'there';
        const recentPulse = pulseResult.data || [];

        const greetingPrefix = getGreetingPrefix();

        const mixRows = (mixResult.data || []) as { platform: string }[];
        const analyticsRows = (analyticsResult.data || []) as { platform: string; engagement_rate: number | null; reach: number | null }[];
        const draftRows = (draftsResult.data || []) as { id: string; platform: string; created_at: string }[];
        const hasBrandProfile = (brandResult.count ?? 0) > 0;
        const prevAnalyticsRows = (prevAnalyticsResult.data || []) as { platform: string; engagement_rate: number | null }[];
        const computedPlatformStats = buildPlatformStats(analyticsRows, prevAnalyticsRows);

        // Build top post
        const topPostRow = (topPostResult.data || [])[0] as { platform: string; engagement_rate: number; reach: number; content_text: string | null; content_format: string | null; published_at: string } | undefined;
        const topPost: TopPost | undefined = topPostRow && topPostRow.engagement_rate > 0
          ? {
              platform: capitalize(topPostRow.platform || 'other'),
              engagementRate: parseFloat(topPostRow.engagement_rate.toFixed(1)),
              reach: topPostRow.reach || 0,
              contentFormat: topPostRow.content_format || undefined,
              publishedAt: topPostRow.published_at,
              contentText: topPostRow.content_text || undefined,
            }
          : undefined;

        if (!cache) {
          setData({
            greeting: `${greetingPrefix}, ${firstName}`,
            briefing: emptyBriefing,
            nextSteps: emptyNextSteps,
            contentMix: buildContentMix(mixRows),
            platformStats: computedPlatformStats,
            tasks: buildTasks(draftRows, hasBrandProfile, computedPlatformStats.length > 0),
            topPost,
          });
          setLoading(false);
          return;
        }

        const scheduledPosts = recentPulse.filter((p: any) =>
          p.status === 'draft' || p.status === 'approved' || p.status === 'scheduled'
        );
        const hasUpcoming = scheduledPosts.length > 0;

        const nextSteps: NextStep[] = [
          {
            icon: 'Zap',
            title: 'Content generieren',
            description: hasUpcoming
              ? `${scheduledPosts.length} Posts in der Pipeline`
              : 'Du hast diese Woche noch keine Posts geplant',
            buttonLabel: 'Starten',
            route: '/pulse',
          },
          {
            icon: 'BarChart3',
            title: 'Analytics ansehen',
            description: cache.analytics_count > 0
              ? `${cache.analytics_count} Posts mit Performance-Daten`
              : 'Noch keine Analytics verfügbar',
            buttonLabel: 'Öffnen',
            route: '/insights',
          },
          {
            icon: 'Calendar',
            title: 'Content-Planer',
            description: hasUpcoming
              ? `${scheduledPosts.length} Posts geplant`
              : 'Noch keine Posts geplant',
            buttonLabel: 'Öffnen',
            route: '/planner',
          },
        ];

        const updatedAtDate = new Date(cache.updated_at);
        const updatedAtFormatted = `${formatRelativeDate(updatedAtDate)}, ${formatTime(updatedAtDate)} Uhr`;

        const parseDirection = (dir: string): 'up' | 'down' | 'neutral' => {
          if (dir === 'up' || dir === 'down' || dir === 'neutral') return dir;
          return 'neutral';
        };

        setData({
          greeting: `${greetingPrefix}, ${firstName}`,
          briefing: {
            status: (cache.status === 'good' || cache.status === 'okay' || cache.status === 'attention')
              ? cache.status as 'good' | 'okay' | 'attention'
              : 'okay',
            statusLabel: cache.status_label,
            weekLabel: cache.briefing_week || '',
            text: cache.briefing_text || '',
            updatedAt: `Aktualisiert: ${updatedAtFormatted}`,
            kpis: {
              reach: {
                value: cache.kpi_reach_value || '\u2013',
                trend: cache.kpi_reach_trend || '',
                direction: parseDirection(cache.kpi_reach_direction || 'neutral'),
              },
              engagement: {
                value: cache.kpi_engagement_value || '\u2013',
                trend: cache.kpi_engagement_trend || '',
                direction: parseDirection(cache.kpi_engagement_direction || 'neutral'),
              },
              posts: {
                value: cache.kpi_posts_value || '0',
                trend: cache.kpi_posts_trend || '',
                direction: parseDirection(cache.kpi_posts_direction || 'neutral'),
              },
            },
            bestPlatform: {
              name: cache.kpi_best_platform || '\u2013',
              er: cache.kpi_best_platform_er || '',
            },
          },
          nextSteps,
          contentMix: buildContentMix(mixRows),
          platformStats: computedPlatformStats,
          tasks: buildTasks(draftRows, hasBrandProfile, computedPlatformStats.length > 0),
          topPost,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Dashboard konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
}
