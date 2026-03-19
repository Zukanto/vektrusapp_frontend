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

export interface ActivityItem {
  type: string;
  date: string;
  title: string;
  detail: string;
  platform: string | null;
}

export interface DashboardData {
  greeting: string;
  briefing: BriefingData;
  nextSteps: NextStep[];
  activity: ActivityItem[];
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
  text: 'Dein Dashboard wird gerade eingerichtet. Deine Analytics-Daten werden innerhalb von 24 Stunden verfuegbar sein. In der Zwischenzeit kannst du den Chat nutzen oder deinen ersten Content-Plan erstellen.',
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
  { icon: 'MessageSquare', title: 'Chat oeffnen', description: 'Frag Vektrus alles ueber Social Media', buttonLabel: 'Oeffnen', route: '/chat' },
  { icon: 'Link', title: 'Konten verbinden', description: 'Verbinde deine Social-Media-Accounts', buttonLabel: 'Verbinden', route: '/profile' },
];

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
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

        const [cacheResult, userResult, postsResult, pulseResult] = await Promise.all([
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
            .from('post_analytics')
            .select('platform, content_text, published_at, engagement_rate, likes, reach')
            .eq('user_id', userId)
            .gte('published_at', sevenDaysAgo)
            .order('published_at', { ascending: false })
            .limit(5),
          supabase
            .from('pulse_generated_content')
            .select('platform, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const cache = cacheResult.data;
        const firstName = userResult.data?.first_name || userResult.data?.company_name || 'there';
        const recentPosts = postsResult.data || [];
        const recentPulse = pulseResult.data || [];

        const greetingPrefix = getGreetingPrefix();

        if (!cache) {
          setData({
            greeting: `${greetingPrefix}, ${firstName}`,
            briefing: emptyBriefing,
            nextSteps: emptyNextSteps,
            activity: [],
          });
          setLoading(false);
          return;
        }

        const activity: ActivityItem[] = [];

        if (cache.analytics_count > 0) {
          const updatedDate = new Date(cache.updated_at);
          activity.push({
            type: 'analytics_update',
            date: `${formatRelativeDate(updatedDate)}, ${formatTime(updatedDate)}`,
            title: 'Analytics aktualisiert',
            detail: `${cache.analytics_count} Posts analysiert`,
            platform: null,
          });
        }

        recentPosts.forEach((post: any) => {
          const d = new Date(post.published_at);
          activity.push({
            type: 'post_published',
            date: `${formatRelativeDate(d)}, ${formatTime(d)}`,
            title: 'Post veroeffentlicht',
            detail: ((post.content_text || '') as string).substring(0, 60) + ((post.content_text || '').length > 60 ? '...' : ''),
            platform: post.platform,
          });
        });

        recentPulse.forEach((item: any) => {
          const d = new Date(item.created_at);
          activity.push({
            type: 'content_generated',
            date: `${formatRelativeDate(d)}, ${formatTime(d)}`,
            title: 'Content erstellt',
            detail: `Post fuer ${capitalize(item.platform || 'Social Media')}`,
            platform: item.platform,
          });
        });

        const finalActivity = activity.slice(0, 6);

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
              : 'Noch keine Analytics verfuegbar',
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
          activity: finalActivity,
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
