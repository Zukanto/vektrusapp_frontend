import { supabase } from '../lib/supabase';

export interface PostRequest {
  content: string;
  platforms: string[];
  publishNow: boolean;
  scheduledFor?: string;
  timezone?: string;
  mediaItems?: MediaItem[];
  pulse_content_id?: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface PostResponse {
  success: boolean;
  post_id?: string;
  status: 'published' | 'scheduled' | 'failed';
  platforms: string[];
  platforms_skipped?: string[];
  message: string;
  warnings?: string[];
  error?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  MISSING_CONTENT: 'Bitte fuege einen Text hinzu',
  PLATFORMS_NOT_CONNECTED: 'Verbinde zuerst deinen Account in den Einstellungen',
  INSUFFICIENT_CREDITS: 'Du hast keine Credits mehr. Upgrade dein Abo.',
  USER_NOT_FOUND: 'Session abgelaufen. Bitte melde dich erneut an.',
  ACCOUNT_INACTIVE: 'Dein Account ist deaktiviert.',
  TOKEN_EXPIRED: 'Bitte melde dich erneut an.',
  RATE_LIMIT: 'Bitte warte einen Moment und versuche es erneut.',
  LATE_API_ERROR: 'Posting fehlgeschlagen. Bitte versuche es erneut.',
};

export function getPostErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  return error.message || 'Ein Fehler ist aufgetreten';
}

export async function checkAccountAvailable(platform: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data: accounts } = await supabase
    .from('late_accounts')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('platform', platform)
    .eq('is_active', true)
    .limit(1);

  return !!accounts && accounts.length > 0;
}

export async function checkAccountsForPlatforms(
  platforms: string[]
): Promise<Record<string, boolean>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return platforms.reduce((acc, p) => ({ ...acc, [p]: false }), {});
  }

  const { data: accounts } = await supabase
    .from('late_accounts')
    .select('platform')
    .eq('user_id', session.user.id)
    .eq('is_active', true);

  const connectedPlatforms = new Set(accounts?.map(a => a.platform) || []);
  return platforms.reduce(
    (acc, p) => ({ ...acc, [p]: connectedPlatforms.has(p) }),
    {} as Record<string, boolean>
  );
}

export async function postToSocialMedia(
  post: {
    id: string;
    platform: string;
    content?: string;
    body?: string;
    hashtags?: string[];
    scheduled_date?: Date | string;
    media?: { type?: string; url?: string };
  },
  publishNow: boolean
): Promise<PostResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw { code: 'TOKEN_EXPIRED', message: 'Nicht eingeloggt' };
  }

  const textContent = post.body || post.content || '';
  const hashtags = post.hashtags?.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') || '';
  const fullContent = `${textContent}${hashtags ? '\n\n' + hashtags : ''}`;

  if (!fullContent.trim()) {
    throw { code: 'MISSING_CONTENT', message: 'Post-Text ist leer' };
  }

  const requestBody: PostRequest = {
    content: fullContent,
    platforms: [post.platform],
    publishNow,
    pulse_content_id: post.id,
  };

  if (!publishNow && post.scheduled_date) {
    const scheduledDate = post.scheduled_date instanceof Date
      ? post.scheduled_date.toISOString()
      : post.scheduled_date;
    requestBody.scheduledFor = scheduledDate;
    requestBody.timezone = 'Europe/Berlin';
  }

  if (post.media?.url) {
    const isVideo = post.media.url.includes('.mp4') || post.media.type === 'video';
    requestBody.mediaItems = [{
      url: post.media.url,
      type: isVideo ? 'video' : 'image',
    }];
  }

  const response = await fetch('https://n8n.vektrus.ai/webhook/vektrus-post', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorData: { code?: string; message?: string } = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}` };
    }
    throw errorData;
  }

  return await response.json();
}
