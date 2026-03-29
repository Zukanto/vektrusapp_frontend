export interface ParsedContent {
  primary_text: string;
  hashtags: string[];
  cta: string;
  content_type: string;
  hook: string;
  estimated_engagement: 'high' | 'medium' | 'low';
  reasoning?: string;
  emoji_suggestions?: string[];
  media_urls?: string[];
  image_url?: string;
  design_image_url?: string;
  design_status?: string;
  design_status_message?: string;
  content_format?: string;
  carousel_slides?: any[];
}

/** Normalizes hook to string — Reel content has hook as {text, type, delivery} object */
function normalizeHook(hook: any): string {
  if (!hook) return '';
  if (typeof hook === 'string') return hook;
  if (typeof hook === 'object' && hook.text) return hook.text;
  return '';
}

export const parseContent = (raw: any): ParsedContent => {
  if (!raw) {
    return {
      primary_text: '',
      hashtags: [],
      cta: '',
      content_type: 'general',
      hook: '',
      estimated_engagement: 'medium'
    };
  }

  if (typeof raw === 'object' && raw.primary_text !== undefined) {
    return {
      primary_text: raw.primary_text || '',
      hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
      cta: raw.cta || '',
      content_type: raw.content_type || 'general',
      hook: normalizeHook(raw.hook),
      estimated_engagement: raw.estimated_engagement || 'medium',
      reasoning: raw.reasoning,
      emoji_suggestions: raw.emoji_suggestions,
      media_urls: raw.media_urls,
      image_url: raw.image_url,
      design_image_url: raw.design_image_url || raw.composited_image_url,
      design_status: raw.design_status,
      design_status_message: raw.design_status_message,
      content_format: raw.content_format,
      carousel_slides: Array.isArray(raw.carousel_slides) ? raw.carousel_slides : undefined,
    };
  }

  if (typeof raw === 'string') {
    let parsed: any = raw;

    for (let i = 0; i < 3; i++) {
      if (typeof parsed !== 'string') break;

      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        break;
      }
    }

    if (typeof parsed === 'object' && parsed !== null && parsed.primary_text !== undefined) {
      return {
        primary_text: parsed.primary_text || '',
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        cta: parsed.cta || '',
        content_type: parsed.content_type || 'general',
        hook: normalizeHook(parsed.hook),
        estimated_engagement: parsed.estimated_engagement || 'medium',
        reasoning: parsed.reasoning,
        emoji_suggestions: parsed.emoji_suggestions,
        media_urls: parsed.media_urls,
        image_url: parsed.image_url,
        design_image_url: parsed.design_image_url || parsed.composited_image_url,
        design_status: parsed.design_status,
        design_status_message: parsed.design_status_message,
        content_format: parsed.content_format,
        carousel_slides: Array.isArray(parsed.carousel_slides) ? parsed.carousel_slides : undefined,
      };
    }

    return {
      primary_text: String(raw),
      hashtags: [],
      cta: '',
      content_type: 'general',
      hook: '',
      estimated_engagement: 'medium'
    };
  }

  return {
    primary_text: String(raw),
    hashtags: [],
    cta: '',
    content_type: 'general',
    hook: '',
    estimated_engagement: 'medium'
  };
};

export const formatContentForCopy = (content: ParsedContent): string => {
  const parts: string[] = [];

  if (content.primary_text) {
    parts.push(content.primary_text);
  }

  if (content.hashtags && content.hashtags.length > 0) {
    const hashtagString = content.hashtags
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
    parts.push(hashtagString);
  }

  return parts.join('\n\n');
};

export const getContentTypeBadgeText = (contentType: string): string => {
  const types: Record<string, string> = {
    'educational': '📚 Educational',
    'entertaining': '🎉 Entertaining',
    'promotional': '📢 Promotional',
    'behind_the_scenes': '🎬 Behind the Scenes',
    'general': '📝 General'
  };
  return types[contentType] || types['general'];
};

export const getEngagementColor = (engagement: string): string => {
  const colors: Record<string, string> = {
    'high': 'bg-[#49D69E]',
    'medium': 'bg-[#F4BE9D]',
    'low': 'bg-gray-400'
  };
  return colors[engagement] || colors['medium'];
};

export const getEngagementText = (engagement: string): string => {
  const texts: Record<string, string> = {
    'high': 'Hohes',
    'medium': 'Mittleres',
    'low': 'Niedriges'
  };
  return texts[engagement] || texts['medium'];
};
